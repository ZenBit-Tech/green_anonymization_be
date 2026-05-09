import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  NoSuchKey,
} from '@aws-sdk/client-s3';

@Injectable()
export default class S3Service {
  private readonly client: S3Client | null;

  private readonly bucket: string;

  constructor(private readonly config: ConfigService) {
    const region = this.config.get<string>('AWS_S3_REGION');
    const accessKeyId = this.config.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.config.get<string>('AWS_SECRET_ACCESS_KEY');
    this.bucket = this.config.get<string>('AWS_S3_BUCKET') ?? '';

    if (region && accessKeyId && secretAccessKey && this.bucket) {
      this.client = new S3Client({
        region,
        credentials: { accessKeyId, secretAccessKey },
      });
    } else {
      this.client = null;
    }
  }

  async uploadText(key: string, text: string): Promise<void> {
    const client = this.requireClient();
    try {
      await client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: text,
          ContentType: 'text/plain; charset=utf-8',
        }),
      );
    } catch (err) {
      throw new InternalServerErrorException(
        `Failed to upload object to S3: ${(err as Error).message}`,
      );
    }
  }

  async getText(key: string): Promise<string> {
    const client = this.requireClient();
    try {
      const response = await client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
      if (!response.Body) {
        throw new NotFoundException(`S3 object has no body: ${key}`);
      }
      return await response.Body.transformToString('utf-8');
    } catch (err) {
      if (
        err instanceof NoSuchKey ||
        (err as { name?: string }).name === 'NoSuchKey'
      ) {
        throw new NotFoundException(`S3 object not found: ${key}`);
      }
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(
        `Failed to read object from S3: ${(err as Error).message}`,
      );
    }
  }

  private requireClient(): S3Client {
    if (!this.client) {
      throw new InternalServerErrorException(
        'S3 is not configured. Missing one of: AWS_S3_BUCKET, AWS_S3_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY',
      );
    }
    return this.client;
  }
}
