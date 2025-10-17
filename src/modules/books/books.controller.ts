import { Controller, Post, Body, UploadedFile, UseInterceptors, Get, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { extname } from 'path';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads', // folder to save uploaded files
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
    }),
  )
  async uploadBook(
    @UploadedFile() file: Express.Multer.File,
    @Body() createBookDto: CreateBookDto,
  ) {
    // Save the local file path as fileUrl
    createBookDto.fileUrl = file.path; 
    return this.booksService.create(createBookDto);
  }

  @Get()
  async getBooks(@Query('grade') grade: string) {
    if (grade) {
      return this.booksService.findByGrade(grade);
    }
    return this.booksService.findAll();
  }
}
