import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lesson } from './schemas/lesson.schema';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

@Injectable()
export class LessonsService {
  constructor(@InjectModel(Lesson.name) private lessonModel: Model<Lesson>) {}

  async create(createLessonDto: CreateLessonDto): Promise<Lesson> {
    const newLesson = new this.lessonModel(createLessonDto);
    return newLesson.save();
  }

  async findAll(): Promise<Lesson[]> {
    return this.lessonModel.find().populate('user').exec();
  }

  async findOne(id: string): Promise<Lesson> {
    const lesson = await this.lessonModel.findById(id).populate('user').exec();
    if (!lesson) throw new NotFoundException(`Lesson with ID ${id} not found`);
    return lesson;
  }

  async update(id: string, updateLessonDto: UpdateLessonDto): Promise<Lesson> {
    const updatedLesson = await this.lessonModel
      .findByIdAndUpdate(id, updateLessonDto, { new: true })
      .populate('user')
      .exec();
    if (!updatedLesson) throw new NotFoundException(`Lesson with ID ${id} not found`);
    return updatedLesson;
  }

  async remove(id: string): Promise<Lesson> {
    const deletedLesson = await this.lessonModel.findByIdAndDelete(id).exec();
    if (!deletedLesson) throw new NotFoundException(`Lesson with ID ${id} not found`);
    return deletedLesson;
  }
}
