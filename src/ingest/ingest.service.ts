import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Book } from '../modules/books/schemas/book.schema'; // adjust path if needed

const pdfParseImport = require('pdf-parse');
const pdfParse = pdfParseImport.default || pdfParseImport;

@Injectable()
export class IngestService {
  constructor(
    @InjectModel(Book.name) private readonly bookModel: Model<Book>,
  ) {}

  async processPDF(data: { filePath?: string; fileUrl?: string; bookId: string }) {
    try {
      let pdfBuffer: Buffer;

      // Fetch or read PDF
      if (data.fileUrl) {
        console.log('Fetching PDF from URL:', data.fileUrl);
        const response = await axios.get(data.fileUrl, { responseType: 'arraybuffer' });
        pdfBuffer = Buffer.from(response.data);
      } else if (data.filePath) {
        console.log('Reading PDF from path:', data.filePath);
        if (!fs.existsSync(data.filePath)) {
          throw new Error(`File not found at path: ${data.filePath}`);
        }
        pdfBuffer = fs.readFileSync(data.filePath);
      } else {
        throw new Error('No filePath or fileUrl provided');
      }

      // Parse text
      const parseFn = (pdfParse as any).default || pdfParse;
      const pdfData = await parseFn(pdfBuffer);
      const text = pdfData.text || '';
      console.log(`✅ PDF parsed successfully. Text length: ${text.length}`);

      // Split into chunks
      const chunks = this.chunkText(text, 500);
      console.log(`✅ Created ${chunks.length} chunks`);

      // Generate embeddings
      const embeddings: Array<{ id: string; embedding: any; text: string }> = [];
      for (const chunk of chunks) {
        const embedding = await this.getEmbedding(chunk);
        embeddings.push({
          id: uuidv4(),
          embedding,
          text: chunk,
        });
      }

      // ✅ Store in MongoDB
      await this.bookModel.findByIdAndUpdate(
        data.bookId,
        { $set: { embeddings } },
        { new: true },
      );

      console.log(`✅ Stored ${embeddings.length} embeddings in MongoDB`);
      return { message: 'Embeddings generated and stored successfully', embeddingsCount: embeddings.length };
    } catch (error) {
      console.error('❌ Error processing PDF:', error);
      throw new InternalServerErrorException(
        `Error processing PDF: ${error.message || error}`,
      );
    }
  }

  private chunkText(text: string, size = 500): string[] {
    const words = text.split(' ');
    const chunks: string[] = [];
    for (let i = 0; i < words.length; i += size) {
      chunks.push(words.slice(i, i + size).join(' '));
    }
    return chunks;
  }

  private async getEmbedding(text: string) {
    const response = await axios.post('http://localhost:11434/api/embeddings', {
      model: 'mxbai-embed-large',
      prompt: text,
    });
    return response.data.embedding;
  }
}
