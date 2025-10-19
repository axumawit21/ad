import { Module } from '@nestjs/common';
import { IngestService } from './ingest.service';
import { IngestController } from './ingest.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Book, BookSchema } from '../modules/books/schemas/book.schema';
import { BooksModule } from '../modules/books/books.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Book.name, schema: BookSchema }]), BooksModule],
  providers: [IngestService],
  controllers: [IngestController]
})
export class IngestModule {}
