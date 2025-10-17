// upload.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Book } from '../modules/books/schemas/book.schema';

@Injectable()
export class UploadService {
  constructor(@InjectModel(Book.name) private bookModel: Model<Book>) {}

  async findAll() {
    return this.bookModel.find();
  }
}
