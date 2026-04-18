import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import UserService from '@modules/user/user.service';
import ComplianceSelection from '@common/db/entities/compliance-selection.entity';

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
  constructor(
    @InjectRepository(ComplianceSelection)
    private readonly complianceSelectionRepository: Repository<ComplianceSelection>,
    private readonly userService: UserService,
  ) {}

  // eslint-disable-next-line class-methods-use-this
  async getFrameworks() {
    try {
      return COMPLIANCE_FRAMEWORKS.filter((framework) => framework.isActive);
    } catch {
      throw new InternalServerErrorException(COMPLIANCE_FETCH_FAILED_MESSAGE);
    }
  }

  async selectFrameworkByEmail(
    email: string,
    frameworkCode: string,
  ): Promise<ComplianceSelection> {
    try {
      const framework = COMPLIANCE_FRAMEWORKS.find(
        (item) => item.code === frameworkCode && item.isActive,
      );

      if (!framework) {
        throw new NotFoundException(FRAMEWORK_NOT_FOUND_MESSAGE);
      }

      const user = await this.userService.findByEmail(email);

      if (!user) {
        throw new NotFoundException(USER_NOT_FOUND_MESSAGE);
      }

      const existingSelection =
        await this.complianceSelectionRepository.findOne({
          where: { userId: user.uuid },
        });

      if (existingSelection) {
        existingSelection.frameworkCode = framework.code;

        return await this.complianceSelectionRepository.save(existingSelection);
      }

      const selection = this.complianceSelectionRepository.create({
        userId: user.uuid,
        frameworkCode: framework.code,
      });

      return await this.complianceSelectionRepository.save(selection);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        COMPLIANCE_SELECTION_FAILED_MESSAGE,
      );
    }
  }

  async getSelectionByEmail(email: string) {
    try {
      const user = await this.userService.findByEmail(email);

      if (!user) {
        throw new NotFoundException(USER_NOT_FOUND_MESSAGE);
      }

      const selection = await this.complianceSelectionRepository.findOne({
        where: { userId: user.uuid },
      });

      if (!selection) {
        throw new NotFoundException(COMPLIANCE_SELECTION_NOT_FOUND);
      }

      const framework = COMPLIANCE_FRAMEWORKS.find(
        (item) => item.code === selection.frameworkCode,
      );

      return {
        ...selection,
        framework: framework ?? null,
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
