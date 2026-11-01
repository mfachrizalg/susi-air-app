import { applyDecorators, type Type } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiProperty,
  getSchemaPath,
} from '@nestjs/swagger';

export class EnvelopeDoc {
  @ApiProperty({ example: 'success' })
  status!: string;

  @ApiProperty({ example: 'Request processed successfully' })
  message!: string;
}

export function ApiEnvelope(model: Type<unknown>, { array = false } = {}) {
  const data = array
    ? { type: 'array', items: { $ref: getSchemaPath(model) } }
    : { $ref: getSchemaPath(model) };
  return applyDecorators(
    ApiExtraModels(EnvelopeDoc, model),
    ApiOkResponse({
      schema: {
        allOf: [{ $ref: getSchemaPath(EnvelopeDoc) }, { properties: { data } }],
      },
    }),
  );
}
