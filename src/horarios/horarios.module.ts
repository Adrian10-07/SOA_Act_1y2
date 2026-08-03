import { Module } from '@nestjs/common';
import { HorariosService } from './horarios.service';

@Module({
  providers: [HorariosService],
  exports: [HorariosService],
})
export class HorariosModule {}
