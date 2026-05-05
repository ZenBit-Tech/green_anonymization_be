import { execSync } from 'child_process';
import { writeFileSync, appendFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';

config({ path: join(__dirname, '../.env.test') });

const LOG_FILE = join(__dirname, 'integration-testing.log');
const ALL_SERVICE_HEALTH_CHECKS_MAX_ATTEMPTS = 10;
const ALL_SERVICE_HEALTH_CHECKS_RETRY_DELAY_MS = 4000;

interface ServiceHealth {
  name: string;
  healthy: boolean;
  error?: string;
}

function log(message: string): void {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  // eslint-disable-next-line no-console
  console.log(logMessage);
  appendFileSync(LOG_FILE, logMessage.concat('\n'));
}

function executeCommand(command: string, description: string): boolean {
  try {
    log(`Command Execution: ${description}`);
    execSync(command, { stdio: 'inherit' });
    log(`Command Execution: ${description} completed successfully`);
    return true;
  } catch (error) {
    log(`Command Execution: ${description} failed with error: ${error}`);
    return false;
  }
}

async function checkAllServiceHealth(): Promise<ServiceHealth[]> {
  const healthChecks: ServiceHealth[] = [];

  log('Starting health checks for services...');

  const checkServiceHealth = (
    serviceName: string,
    port: string,
    endpoint: string = 'health',
  ): void => {
    try {
      log(`Checking ${serviceName} health...`);
      execSync(`curl -f http://127.0.0.1:${port}/${endpoint} 2>/dev/null`, {
        stdio: 'pipe',
      });
      healthChecks.push({ name: serviceName, healthy: true });
      log(`${serviceName} is healthy`);
    } catch (error) {
      healthChecks.push({
        name: serviceName,
        healthy: false,
        error: `Failed to connect to ${serviceName}`,
      });
      log(`${serviceName} health check failed`);
    }
  };

  const ollamaPort = process.env.OLLAMA_PORT;
  const presidioAnonymizerPort = process.env.PRESIDIO_ANONYMIZER_PORT;
  const presidioAnalyzerPort = process.env.PRESIDIO_ANALYZER_PORT;

  if (!ollamaPort || !presidioAnonymizerPort || !presidioAnalyzerPort) {
    log('Error: One or more required test environment variables are not set');
    healthChecks.push({
      name: 'Environment Variables',
      healthy: false,
      error: 'Missing required test environment variables for service ports',
    });
    return healthChecks;
  }

  for (
    let attempt = 1;
    attempt <= ALL_SERVICE_HEALTH_CHECKS_MAX_ATTEMPTS;
    attempt += 1
  ) {
    healthChecks.length = 0;
    log(
      `Health check attempt ${attempt}/${ALL_SERVICE_HEALTH_CHECKS_MAX_ATTEMPTS}`,
    );

    checkServiceHealth('Ollama', ollamaPort, 'api/tags');
    checkServiceHealth('Presidio Anonymizer', presidioAnonymizerPort);
    checkServiceHealth('Presidio Analyzer', presidioAnalyzerPort);

    if (healthChecks.every((check) => check.healthy)) {
      log('All services are healthy');
      break;
    }

    if (attempt < ALL_SERVICE_HEALTH_CHECKS_MAX_ATTEMPTS) {
      log(
        `Not all services are healthy. Retrying in ${ALL_SERVICE_HEALTH_CHECKS_RETRY_DELAY_MS / 1000}s...`,
      );
      // eslint-disable-next-line no-await-in-loop
      await new Promise((res) => {
        setTimeout(res, ALL_SERVICE_HEALTH_CHECKS_RETRY_DELAY_MS);
      });
    } else {
      const unhealthy = healthChecks.filter((check) => !check.healthy);
      log(
        `Max attempts (${ALL_SERVICE_HEALTH_CHECKS_MAX_ATTEMPTS}) exceeded. Failed services: ${unhealthy.map((s) => s.name).join(', ')}`,
      );
      unhealthy.forEach((svc) => log(`  - ${svc.name}: ${svc.error}`));
    }
  }

  return healthChecks;
}

async function startInfrastructure(): Promise<boolean> {
  log('Starting infrastructure with Docker Compose...');
  if (
    !executeCommand(
      'docker-compose --env-file .env.test -f compose.test.yml up -d',
      'Docker Compose startup',
    )
  ) {
    log('Error: Failed to start infrastructure with Docker Compose');
    return false;
  }
  log('Infrastructure startup completed');
  return true;
}

async function shutdownInfrastructure(): Promise<void> {
  log('Shutting down infrastructure...');
  if (
    !executeCommand(
      'docker-compose -f compose.test.yml down',
      'Docker Compose shutdown',
    )
  ) {
    log('Warning: Docker Compose shutdown had issues, but continuing...');
  }
  log('Infrastructure shutdown completed');
}

async function runIntegrationTests(): Promise<void> {
  log('Running integration tests...');
  try {
    const output = execSync('npx jest --config ./test/jest-integration.json', {
      stdio: 'pipe',
      encoding: 'utf-8',
    });
    log(output);
    log('Integration tests completed successfully');
  } catch (error) {
    let errorOutput = '';
    if (error instanceof Error) {
      const execError = error as NodeJS.ErrnoException & {
        stdout?: string;
        stderr?: string;
      };
      errorOutput = execError.stdout || execError.stderr || error.message;
    } else {
      errorOutput = String(error);
    }
    log(`Integration tests output:\n${errorOutput}`);
    log(`Integration tests failed with error: ${error}`);
    throw error;
  }
}

async function main(): Promise<void> {
  try {
    writeFileSync(LOG_FILE, '');
    log('Integration testing entrypoint started');

    const infrastructureStarted = await startInfrastructure();

    if (!infrastructureStarted) {
      await shutdownInfrastructure();
      process.exit(1);
    }

    const healthChecks = await checkAllServiceHealth();
    const unhealthyServices = healthChecks.filter((check) => !check.healthy);
    if (unhealthyServices.length > 0) {
      log('Aborting integration testing due to failed health checks');
      await shutdownInfrastructure();
      process.exit(1);
    }

    await runIntegrationTests();

    await shutdownInfrastructure();

    log('Integration testing entrypoint completed successfully');
    process.exit(0);
  } catch (error) {
    log(`Unexpected error: ${error}`);
    await shutdownInfrastructure();
    process.exit(1);
  }
}

main().catch((error) => {
  log(`Fatal error in main: ${error}`);
  process.exit(1);
});
