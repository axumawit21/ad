import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BookDocument = Book & Document;

@Schema({ timestamps: true })
export class Book extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  grade: string; // e.g., "Grade 9", "Grade 10"

  @Prop({ required: true })
  fileUrl: string; // URL or path to uploaded file

  @Prop({ default: [] })
  embeddings: number[][]; // To store vector embeddings for RAG
}

export const BookSchema = SchemaFactory.createForClass(Book);
