import { Controller, Post, Body } from '@nestjs/common';
import { IngestService } from './ingest.service';

@Controller('ingest')
export class IngestController {
  constructor(private readonly ingestService: IngestService) {}

 @Post('test-pdf')
  async testPDF(@Body() body: { filePath?: string; fileUrl?: string }) {
    return this.ingestService.processPDF(body);
  }
}
