import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  ParseUUIDPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
  SerializeOptions,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiFoundResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import ExampleUserService from './example.user.service';
import CreateUserDto from './dto/createExampleUser.dto';
import ReturnExampleUserDto from './dto/returnExampleUser.dto';

@ApiTags('example-users')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('example-users')
export default class ExampleUserController {
  constructor(private readonly userService: ExampleUserService) {}

  @ApiOperation({ summary: 'Create a new ExampleUser from given email' })
  @ApiCreatedResponse({
    description: 'ExampleUser successfully created',
    type: ReturnExampleUserDto,
  })
  @ApiBadRequestResponse({ description: 'Email is required' })
  @SerializeOptions({ type: ReturnExampleUserDto })
  @Post()
  async create(@Body() body: CreateUserDto): Promise<ReturnExampleUserDto> {
    return this.userService.create(body.email);
  }

  @ApiOperation({ summary: 'Get all ExampleUsers' })
  @ApiOkResponse({
    description: 'ExampleUsers retrieved successfully',
    type: ReturnExampleUserDto,
    isArray: true,
  })
  @SerializeOptions({ type: ReturnExampleUserDto })
  @Get()
  async getAll(): Promise<ReturnExampleUserDto[]> {
    return this.userService.findAll();
  }

  @ApiOperation({ summary: 'Get ExampleUser by their uuid' })
  @ApiFoundResponse({
    description: 'ExampleUser found successfully',
    type: ReturnExampleUserDto,
  })
  @ApiNotFoundResponse({
    description: 'ExampleUser with specified uuid not found',
  })
  @ApiBadRequestResponse({ description: 'Invalid uuid parameter' })
  @SerializeOptions({ type: ReturnExampleUserDto })
  @Get(':uuid')
  async getByUuid(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
  ): Promise<ReturnExampleUserDto> {
    return this.userService.findOne(uuid);
  }
}
