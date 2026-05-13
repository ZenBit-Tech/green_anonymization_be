import PIIEntities from '../db/entities/PIIEntities.entity';
import PiiEntityModel from '../domain/models/pii-entity.model';

export default class PiiEntityMapper {
  static toDomain(piiEntity: PIIEntities): PiiEntityModel {
    return PiiEntityModel.create({ ...piiEntity });
  }
}
