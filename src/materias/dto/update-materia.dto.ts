// dto/update-materia.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateMateriaDto } from './create-materia.dto';

// Cubre: nombre, calificacion_profesor, dificultad, autonomia
export class UpdateMateriaDto extends PartialType(CreateMateriaDto) {}