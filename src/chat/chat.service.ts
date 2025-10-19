import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';
import * as math from 'mathjs';
import { Book } from '../modules/books/schemas/book.schema';
   

@Injectable()
export class ChatService {
  constructor(@InjectModel(Book.name) private bookModel: Model<Book>) {}

  // 🔹 Handle student questions
  async askQuestion(grade: string, question: string) {
    try {
      // 1️⃣ Get embeddings from MongoDB for the selected grade
      const books = await this.bookModel.find({ grade });
      if (!books || books.length === 0) {
        throw new Error('No books found for this grade');
      }

      const allChunks = books.flatMap((b: any) => b.embeddings || []);

      // 2️⃣ Generate embedding for the student question
      const embeddingResponse = await axios.post('http://localhost:11434/api/embeddings', {
        model: 'mxbai-embed-large',
        prompt: question,
      });
      const questionEmbedding = embeddingResponse.data.embedding;

      // 3️⃣ Compare question embedding to all stored chunks (cosine similarity)
      const rankedChunks = allChunks
        .map((chunk: any) => ({
          ...chunk,
          similarity: this.cosineSimilarity(questionEmbedding, chunk.embedding),
        }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 5); // pick top 5 most relevant chunks

      // 4️⃣ Combine top chunks as context
      const context = rankedChunks.map((c) => c.text).join('\n');

      // 5️⃣ Send question + context to Ollama LLM
      const response = await axios.post('http://localhost:11434/api/generate', {
        model: 'llama3.2',
        prompt: `You are a helpful tutor. Use this context to answer the question.\n\nContext:\n${context}\n\nQuestion: ${question}`, stream: false,
      });
      

      // 6️⃣ Return the answer
      return { answer: response.data.response };
    } catch (error) {
      console.error('❌ Chat error:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = Number(math.dot(vecA, vecB));
  const normA = Number(math.norm(vecA));
  const normB = Number(math.norm(vecB));
  return dotProduct / (normA * normB);
}

}
