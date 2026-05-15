import DocumentModel from '@common/domain/models/document.model';
import Documents from '@common/db/entities/documents.entity';

export default class DocumentMapper {
  static typeOrmToDomain(document: Documents): DocumentModel {
    return DocumentModel.create({ ...document });
  }
}
