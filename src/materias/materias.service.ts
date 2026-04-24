import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateMateriaDto } from './dto/create-materia.dto';
import { UpdateMateriaDto } from './dto/update-materia.dto';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class MateriasService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(dto: CreateMateriaDto, userId?: string) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('materias')
      .insert({
        usuario_id: userId || null,
        nombre: dto.nombre,
        calificacion_profesor: dto.calificacion_profesor ?? null,
        dificultad: dto.dificultad ?? null,
        autonomia: dto.autonomia ?? null,
      })
      .select()
      .single();

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async findAll() {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('materias')
      .select('*');

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async findOne(id: string) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('materias')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundException(`Materia con ID ${id} no encontrada`);
      }
      throw new InternalServerErrorException(error.message);
    }
    return data;
  }

  async update(id: string, updateMateriaDto: UpdateMateriaDto) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('materias')
      .update(updateMateriaDto)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async remove(id: string) {
    const supabase = this.supabaseService.getClient();
    const { error } = await supabase
      .from('materias')
      .delete()
      .eq('id', id);

    if (error) throw new InternalServerErrorException(error.message);
    return { message: `Materia con ID ${id} eliminada exitosamente` };
  }
}