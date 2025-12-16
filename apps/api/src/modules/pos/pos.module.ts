import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PosController } from './pos.controller';
import { PosService } from './pos.service';
import { PosSession, PosTransaction } from './entities/pos.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PosSession, PosTransaction])],
  controllers: [PosController],
  providers: [PosService],
  exports: [PosService],
})
export class PosModule {}
