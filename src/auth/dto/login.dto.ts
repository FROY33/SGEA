import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class LoginDto {

    @IsNotEmpty()
    @IsEmail({}, {message : 'El correo no tiene un formato valido '})
    email!: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(8, { message: 'La contraseña debe tener minimo 8 caracteres '})
    password!: string;

}