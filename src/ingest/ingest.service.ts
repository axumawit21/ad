import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import * as fs from 'fs';

import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import * as pdfParseImport from 'pdf-parse';
const pdfParse = (pdfParseImport as any).default || pdfParseImport;


@Injectable()
export class IngestService {
  private readonly logger = new Logger(IngestService.name);
  async processPDF(filePath: string) {
    try {
       if (!fs.existsSync(filePath)) {
 throw new InternalServerErrorException(`File not found: ${filePath}`);
 }
 console.log(`Processing PDF: ${filePath}`);

      const pdfBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(pdfBuffer);

       console.log(`PDF parsed successfully. Text length: ${pdfData.text.length}`);

      const chunks = this.chunkText(pdfData.text);

       console.log(`Created ${chunks.length} chunks`);

      const embeddings: Array<{ id: string; embedding: any; text: string }> = [];
      for (const chunk of chunks) {
        const embedding = await this.getEmbedding(chunk);
        embeddings.push({ id: uuidv4(), embedding, text: chunk });
      }

      console.log(`Generated ${embeddings.length} embeddings`);

      return embeddings;
    } catch (error) {

      console.error('Error processing PDF:', error);
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
      model: 'mxbai-embed-large', // you can change the model if needed
      prompt: text,
    });
    return response.data.embedding;
  }

   catch (err) {
      console.error('Embedding generation failed:', err.message);
      return null;
   }
}
