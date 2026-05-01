import { EntityType } from '@common/constants';

export default function mapEntityType(value: string): EntityType {
  if (Object.values(EntityType).includes(value as EntityType)) {
    return value as EntityType;
  }
  return EntityType.OTHER;
}
