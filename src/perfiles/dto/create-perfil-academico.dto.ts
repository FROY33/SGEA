import { IsString, IsNotEmpty, IsInt, IsNumber, Min, Max, MaxLength } from 'class-validator';

export class CreatePerfilAcademicoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  institucion: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  carrera: string;

  @IsInt()
  @Min(1)
  @Max(12)
  semestre: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(10)
  promedio_general: number;
}
