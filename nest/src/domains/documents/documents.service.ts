import { Inject, Injectable } from '@nestjs/common';
import { type AppConfig, CONFIG } from '../../config.js';
import { DataService } from '../../data/data.service.js';
import { documentStatus } from './document.rules.js';
import { DocumentsDto } from './documents.dto.js';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly data: DataService,
    @Inject(CONFIG) private readonly config: AppConfig,
  ) {}

  list(): DocumentsDto {
    const warningDays = this.data.warningDays;
    return {
      warningDays,
      documents: this.data.documents.map((doc) => ({
        id: doc.id,
        label: doc.label,
        expiryDate: doc.expiryDate,
        ...documentStatus(doc.expiryDate, this.config.today, warningDays),
      })),
    };
  }
}
