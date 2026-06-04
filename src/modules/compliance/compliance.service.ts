import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import UserService from '@modules/user/user.service';
import {
  ComplianceFramework,
  ComplianceFrameworkConfig,
} from '@/common/constants';
import { COMPLIANCE_FRAMEWORKS } from './constants/complianceFrameworks';

const FRAMEWORK_NOT_FOUND_MESSAGE = 'Compliance framework not found';
const COMPLIANCE_FETCH_FAILED_MESSAGE = 'Failed to fetch compliance frameworks';
const COMPLIANCE_SELECTION_FAILED_MESSAGE =
  'Failed to select compliance framework';
const COMPLIANCE_SELECTION_NOT_FOUND = 'Compliance selection not found';
const COMPLIANCE_GET_SELECTION_FAILED_MESSAGE =
  'Failed to fetch compliance selection';
const USER_NOT_FOUND_MESSAGE = 'User not found';

@Injectable()
export default class ComplianceService {
  constructor(private readonly userService: UserService) {}

  // eslint-disable-next-line class-methods-use-this
  async getFrameworks() {
    try {
      return Object.values(COMPLIANCE_FRAMEWORKS).filter(
        (framework) => framework.isActive,
      );
    } catch {
      throw new InternalServerErrorException(COMPLIANCE_FETCH_FAILED_MESSAGE);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async getFrameworkByCode(
    _code: string,
  ): Promise<ComplianceFrameworkConfig | undefined> {
    try {
      return COMPLIANCE_FRAMEWORKS.find(
        (framework) => framework.code === _code,
      );
    } catch {
      throw new InternalServerErrorException(COMPLIANCE_FETCH_FAILED_MESSAGE);
    }
  }

  async selectFrameworkByEmail(
    email: string,
    frameworkCode: string,
  ): Promise<{
    userId: string;
    frameworkCode: string;
    framework: ComplianceFramework;
  }> {
    try {
      const framework = Object.values(COMPLIANCE_FRAMEWORKS).find(
        (item): item is ComplianceFramework =>
          item.code === frameworkCode && item.isActive,
      );

      if (!framework) {
        throw new NotFoundException(FRAMEWORK_NOT_FOUND_MESSAGE);
      }

      const userUuid = await this.userService.setDefaultFramework(
        email,
        framework.code,
      );

      return {
        userId: userUuid,
        frameworkCode: framework.code,
        framework,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        COMPLIANCE_SELECTION_FAILED_MESSAGE,
      );
    }
  }

  async getSelectionByEmail(email: string): Promise<{
    userId: string;
    frameworkCode: string;
    framework: ComplianceFramework;
  }> {
    try {
      const user = await this.userService.findByEmail(email);
      if (!user) {
        throw new NotFoundException(USER_NOT_FOUND_MESSAGE);
      }

      if (!user.defaultFramework) {
        throw new NotFoundException(COMPLIANCE_SELECTION_NOT_FOUND);
      }

      const framework = Object.values(COMPLIANCE_FRAMEWORKS).find(
        (item): item is ComplianceFramework =>
          item.code === user.defaultFramework,
      );

      if (!framework) {
        throw new NotFoundException(COMPLIANCE_SELECTION_NOT_FOUND);
      }

      return {
        userId: user.uuid,
        frameworkCode: user.defaultFramework,
        framework,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        COMPLIANCE_GET_SELECTION_FAILED_MESSAGE,
      );
    }
  }
}
