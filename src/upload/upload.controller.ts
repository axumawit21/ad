import { Controller, Post, UseInterceptors,  UploadedFile, Get, Param, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import * as path from 'path';
import * as fs from 'fs';
import type { Response } from 'express';

import { diskStorage } from 'multer';

@Controller('upload')
export class UploadController {
    constructor(private readonly uploadService: UploadService) {}
    @Post('upload')
@UseInterceptors(FileInterceptor('file', {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
}))
uploadFile(@UploadedFile() file: Express.Multer.File) {
  const fileUrl = `http://localhost:3000/uploads/${file.filename}`;
  return {
    message: 'File uploaded successfully!',
    fileUrl,
  };
}

@Get(':filename')
  getBook(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = path.join(__dirname, '..', '..', 'uploads', filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).send('File not found');
    }

    // This lets the browser open PDFs inline
    res.setHeader('Content-Type', 'application/pdf');
    return res.sendFile(filePath);
  }

   
}
