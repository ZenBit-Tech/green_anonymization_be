import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import JwtAuthGuard from '@modules/auth/guards/jwt-auth.guard';
import UserEmail from '@/common/utils/decorators/user-email.decorator';

import ComplianceService from './compliance.service';
import SelectComplianceDto from './dto/selectCompliance.dto';
import ReturnComplianceFrameworkDto from './dto/returnComplianceFramework.dto';
import ReturnComplianceSelectionDto from './dto/returnComplianceSelection.dto';

@ApiTags('Compliance')
@Controller('compliance')
export default class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Get('frameworks')
  @ApiOperation({ summary: 'Get available compliance frameworks' })
  @ApiOkResponse({
    description: 'List of available compliance frameworks',
    type: [ReturnComplianceFrameworkDto],
  })
  async getFrameworks(): Promise<ReturnComplianceFrameworkDto[]> {
    return this.complianceService.getFrameworks();
  }

  @Post('selection')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Select compliance framework for a user' })
  @ApiCreatedResponse({
    description: 'Compliance framework selected successfully',
    type: ReturnComplianceSelectionDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid request body',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiNotFoundResponse({
    description: 'Compliance framework not found',
  })
  async selectFramework(
    @UserEmail() email: string,
    @Body() dto: SelectComplianceDto,
  ): Promise<ReturnComplianceSelectionDto> {
    const result = await this.complianceService.selectFrameworkByEmail(
      email,
      dto.frameworkCode,
    );

    return {
      userId: result.userId,
      frameworkCode: result.frameworkCode,
      framework: result.framework as ReturnComplianceFrameworkDto,
    };
  }

  @Get('selection')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get selected compliance framework for current user',
  })
  @ApiOkResponse({
    description: 'Selected compliance framework',
    type: ReturnComplianceSelectionDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiNotFoundResponse({
    description: 'Compliance selection not found',
  })
  async getSelection(
    @UserEmail() email: string,
  ): Promise<ReturnComplianceSelectionDto> {
    const result = await this.complianceService.getSelectionByEmail(email);

    return {
      userId: result.userId,
      frameworkCode: result.frameworkCode,
      framework: result.framework as ReturnComplianceFrameworkDto,
    };
  }
}
