import { Module } from '@nestjs/common';
import { SagaController } from './saga.controller';
import { SagaService } from './saga.service';
import { HorariosModule } from '../horarios/horarios.module';
import { InventarioModule } from '../inventario/inventario.module';
import { PagosModule } from '../pagos/pagos.module';
import { CitasModule } from '../citas/citas.module';

@Module({
  imports: [HorariosModule, InventarioModule, PagosModule, CitasModule],
  controllers: [SagaController],
  providers: [SagaService],
})
export class SagaModule {}
