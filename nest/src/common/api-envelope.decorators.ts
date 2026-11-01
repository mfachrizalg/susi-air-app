import { applyDecorators, type Type } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiProperty,
  getSchemaPath,
} from '@nestjs/swagger';

export class EnvelopeDoc {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: 200 })
  statusCode!: number;

  @ApiProperty({ example: 'OK' })
  message!: string;
}

/** Documents the success envelope. `array: true` means `data` is a list of `model`. */
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
