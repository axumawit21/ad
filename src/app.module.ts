import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './modules/users/users.module';
import { LessonsModule } from './modules/lessons/lessons.module';
import { ProgressModule } from './modules/progress/progress.module';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from './auth/auth.module';
import { BooksModule } from './modules/books/books.module';

import { UploadModule } from './upload/upload.module';
import { IngestModule } from './ingest/ingest.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [DatabaseModule, UsersModule, LessonsModule, ProgressModule, MongooseModule.forRoot('mongodb://localhost:27017/adaptive'), AuthModule, BooksModule, UploadModule, IngestModule, ChatModule],
 
  

})
export class AppModule {}
