import PIIEntityDto from '@modules/processing/dto/piiEntity.dto';
import PIIEntities from '@common/db/entities/PIIEntities.entity';
import PiiEntityModel from '@common/domain/models/pii-entity.model';

export default class PiiEntityMapper {
  static typeOrmToDomain(piiEntity: PIIEntities): PiiEntityModel {
    return PiiEntityModel.create({ ...piiEntity });
  }

  static dtoToDomain(piiEntityDto: PIIEntityDto): PiiEntityModel {
    return PiiEntityModel.create({ ...piiEntityDto });
  }
}
