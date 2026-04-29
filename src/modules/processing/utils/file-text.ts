import { PDFParse } from 'pdf-parse';
import * as mammoth from 'mammoth';

const extractTextFromFile = async (
  file: Express.Multer.File,
): Promise<string> => {
  const mime = file.mimetype;

  switch (mime) {
    case 'text/plain':
      return file.buffer.toString('utf-8');

    case 'application/pdf': {
      const parser = new PDFParse({
        data: new Uint8Array(file.buffer),
      });

      const result = await parser.getText();
      return result.text;
    }

    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
      const result = await mammoth.extractRawText({
        buffer: file.buffer,
      });
      return result.value;
    }

    default:
      throw new Error(`Unsupported file type: ${mime}`);
  }
};

export default extractTextFromFile;
