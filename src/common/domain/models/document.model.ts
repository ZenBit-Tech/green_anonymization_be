export default class DocumentModel {
  id: string;

  userId: string;

  chosenCompliance: string;

  fileType?: string;

  fileName: string;

  filePath: string;

  verifiedAt?: Date;

  createdAt: Date;

  updatedAt: Date;

  constructor(
    id: string,
    userId: string,
    chosenCompliance: string,
    fileName: string,
    filePath: string,
    createdAt: Date,
    updatedAt: Date,
    fileType?: string,
    verifiedAt?: Date,
  ) {
    this.id = id;
    this.userId = userId;
    this.chosenCompliance = chosenCompliance;
    this.fileType = fileType;
    this.fileName = fileName;
    this.filePath = filePath;
    this.verifiedAt = verifiedAt;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(data: {
    id: string;
    userId: string;
    chosenCompliance: string;
    fileName: string;
    filePath: string;
    createdAt: Date;
    updatedAt: Date;
    fileType?: string;
    verifiedAt?: Date;
  }): DocumentModel {
    const {
      id,
      userId,
      chosenCompliance,
      fileName,
      filePath,
      createdAt,
      updatedAt,
      fileType,
      verifiedAt,
    } = data;
    return new DocumentModel(
      id,
      userId,
      chosenCompliance,
      fileName,
      filePath,
      createdAt,
      updatedAt,
      fileType,
      verifiedAt,
    );
  }
}
