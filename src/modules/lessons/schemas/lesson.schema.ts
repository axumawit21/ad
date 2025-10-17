import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

@Schema()
export class Lesson extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  user: User; // Each lesson belongs to a user

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);
