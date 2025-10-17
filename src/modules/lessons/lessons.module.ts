import { Module } from '@nestjs/common';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Lesson, LessonSchema } from './schemas/lesson.schema';
import { UsersModule } from '../users/users.module';

@Module({
  controllers: [LessonsController],
  providers: [LessonsService],
  imports: [MongooseModule.forFeature([{ name: Lesson.name, schema: LessonSchema }]), UsersModule],
})
export class LessonsModule {}
