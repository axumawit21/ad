import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// Import pdf-parse safely for both CommonJS and ESM cases
const pdfParseImport = require('pdf-parse');
const pdfParse = pdfParseImport.default || pdfParseImport;

@Injectable()
export class IngestService {
  async processPDF(data: { filePath?: string; fileUrl?: string }) {
    try {
      let pdfBuffer: Buffer;

      // Handle both fileUrl (remote) and filePath (local)
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

      // 🧩 Debug what pdfParse actually is
      console.log('pdfParse import type:', typeof pdfParse);
      console.log('pdfParse keys:', Object.keys(pdfParse || {}));

      // 🧠 Safely call pdf-parse (works for both ESM and CJS)
      const parseFn = (pdfParse as any).default || pdfParse;
      const pdfData = await parseFn(pdfBuffer);

      const text = pdfData.text || '';
      console.log(`✅ PDF parsed successfully. Text length: ${text.length}`);

      // Split text into chunks
      const chunks = this.chunkText(text, 500);
      console.log(`✅ Created ${chunks.length} chunks`);

      // Generate embeddings for each chunk
      const embeddings: Array<{ id: string; embedding: any; text: string }> = [];
      for (const chunk of chunks) {
        const embedding = await this.getEmbedding(chunk);
        embeddings.push({
          id: uuidv4(),
          embedding,
          text: chunk,
        });
      }

      console.log(`✅ Generated ${embeddings.length} embeddings`);
      return embeddings;
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
