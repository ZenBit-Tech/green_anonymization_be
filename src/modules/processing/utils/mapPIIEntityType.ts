import { PIIEntityType } from '@common/constants';

export default function mapPIIEntityType(value: string): PIIEntityType {
  if (Object.values(PIIEntityType).includes(value as PIIEntityType)) {
    console.log(value);
    return value as PIIEntityType;
  }
  return PIIEntityType.OTHER;
}
