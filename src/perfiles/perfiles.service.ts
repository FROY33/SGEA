import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreatePerfilAcademicoDto } from './dto/create-perfil-academico.dto';

@Injectable()
export class PerfilesService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async crearOActualizar(usuarioId: string, dto: CreatePerfilAcademicoDto) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('perfil_usuario')
      .upsert(
        {
          usuario_id: usuarioId,
          institucion: dto.institucion,
          carrera: dto.carrera,
          semestre: dto.semestre,
          promedio_general: dto.promedio_general,
        },
        { onConflict: 'usuario_id' },
      )
      .select('usuario_id, institucion, carrera, semestre, promedio_general')
      .single();

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async obtenerPorUsuario(usuarioId: string) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('perfil_usuario')
      .select('usuario_id, institucion, carrera, semestre, promedio_general')
      .eq('usuario_id', usuarioId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundException('Perfil académico no encontrado');
      }
      throw new InternalServerErrorException(error.message);
    }
    return data;
  }
}
