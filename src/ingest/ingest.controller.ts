import { Controller, Post, Body } from '@nestjs/common';
import { IngestService } from './ingest.service';

@Controller('ingest')
export class IngestController {
  constructor(private readonly ingestService: IngestService) {}

  @Post('test-pdf')
  async testPDF(@Body('filePath') filePath: string) {
    return this.ingestService.processPDF(filePath);
  }
}
