import { Controller, Get } from '@nestjs/common';
import { ResponseMessage } from './common/envelope.interceptor.js';
import { Public } from './common/public.decorator.js';

@Controller()
export class AppController {
  @Public()
  @Get()
  @ResponseMessage('Welcome to Susi Air API')
  health() {
    return {};
  }
}
