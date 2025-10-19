import { Controller, Post, Body } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // 🧠 POST /chat/ask
  @Post('ask')
  async askQuestion(
    @Body() body: { grade: string; question: string },
  ) {
    const { grade, question } = body;
    return this.chatService.askQuestion(grade, question);
  }
}
