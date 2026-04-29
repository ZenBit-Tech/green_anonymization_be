import { EntityType } from '@common/constants';
import { BadRequestException } from '@nestjs/common';

export default function mapEntityType(value: string): EntityType {
  if (Object.values(EntityType).includes(value as EntityType)) {
    return value as EntityType;
  }

  throw new BadRequestException(`Unsupported entity type: ${value}`);
}
