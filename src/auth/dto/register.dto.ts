import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";

export class RegisterDto {
    @IsEmail({}, { message: 'El correo no tiene un formato valido' })
    email!: string;

    @IsString()
    @MinLength(8, { message: 'La contraseña debe tener mínimo 8 caracteres' } )
    password!: string;

    @IsString()
    @MinLength(3, { message: 'El nombre de usuario debe tener minimo 3 caracteres'} )
    @MaxLength(30, { message: 'El nombre de usuario debe tener maximo 30 caracteres' })
    username!: string;
}
