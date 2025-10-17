import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Book, BookSchema } from '../modules/books/schemas/book.schema';

@Module({
  providers: [UploadService],
  controllers: [UploadController],
  exports: [UploadService],
  imports: [MongooseModule.forFeature([{ name: Book.name, schema: BookSchema }])],
})
export class UploadModule {}
