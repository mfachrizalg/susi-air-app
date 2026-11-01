import { ApiProperty } from '@nestjs/swagger';
import type { ExpiryStatus } from './document.rules.js';

export class DocumentDto {
  @ApiProperty({ example: 'doc_recurrent' })
  id!: string;

  @ApiProperty({ example: 'Next Recurrent Date' })
  label!: string;

  @ApiProperty({ format: 'date', example: '2026-10-14' })
  expiryDate!: string;

  @ApiProperty({
    example: 152,
    description: 'Days from today to the expiry date. Negative once expired.',
  })
  daysRemaining!: number;

  @ApiProperty({ enum: ['safe', 'soon', 'expired'] })
  status!: ExpiryStatus;
}

export class DocumentsDto {
  @ApiProperty({
    example: 30,
    description: 'Window for the soon status, in days.',
  })
  warningDays!: number;

  @ApiProperty({ type: [DocumentDto], description: 'In file order.' })
  documents!: DocumentDto[];
}
