import Documents from '../db/entities/documents.entity';
import DocumentModel from '../domain/models/document.model';

export default class DocumentMapper {
  static toDomain(document: Documents): DocumentModel {
    return DocumentModel.create({ ...document });
  }
}
