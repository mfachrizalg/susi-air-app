import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth } from '@nestjs/swagger';
import { ApiEnvelope } from '../../common/api-envelope.decorators.js';
import { DocumentsDto } from './documents.dto.js';
import { DocumentsService } from './documents.service.js';

@ApiCookieAuth()
@ApiBearerAuth()
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documents: DocumentsService) {}

  @Get()
  @ApiEnvelope(DocumentsDto)
  list(): DocumentsDto {
    return this.documents.list();
  }
}
