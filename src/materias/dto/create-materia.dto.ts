
import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max } from 'class-validator';

export class CreateMateriaDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  calificacion_profesor?: number;

  @IsInt()
  @Min(1)
  @Max(5)
  dificultad?: number;

  @IsInt()
  @Min(1)
  @Max(5)
  autonomia?: number;
}