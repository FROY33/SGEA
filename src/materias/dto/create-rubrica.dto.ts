// dto/create-rubrica.dto.ts
import { IsNotEmpty, IsString, IsNumber, Min, Max, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRubricaDto {
    @IsString()
    @IsNotEmpty()
    tipo_actividad!: string;

    @IsNumber()
    @Min(0)
    @Max(100)
    porcentaje!: number;
}

