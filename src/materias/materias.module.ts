import { Module } from '@nestjs/common';
import { MateriasController } from './materias.controller';
import { MateriasService } from './materias.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [MateriasController],
  providers: [MateriasService],
  exports: [MateriasService]
})
export class MateriasModule { }
