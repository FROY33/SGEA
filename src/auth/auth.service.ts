import { Injectable, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(private readonly supabaseService: SupabaseService) {}

  // Funcion para el registro
  async register(dto: RegisterDto) {
    const supabase = this.supabaseService.getClient();

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: dto.email,
      password: dto.password,
      email_confirm: false,
    });

    if (authError) {
      if (authError.message.includes('already been registered')) {
        throw new ConflictException('El correo ya está registrado');
      }
      throw new InternalServerErrorException('Error al crear el usuario');
    }

    // Verificar que el usuario existe en auth.users antes de insertar
    const { data: authUser } = await supabase.auth.admin.getUserById(authData.user.id);

    if (!authUser.user) {
      throw new InternalServerErrorException('Error al verificar el usuario creado');
    }

    // Insertar el perfil
    const { error: profileError } = await supabase
      .from('perfil_usuario')
      .upsert({
        usuario_id: authData.user.id,
        usuario: dto.username,
      });

    // Rollback en caso de fallo
    if (profileError) {
      // console.log(profileError);
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw new InternalServerErrorException('Error al guardar el perfil');
    }

    return {
      message: 'Registro exitoso. Revisa tu correo para verificar tu cuenta.',
    };
  }

}
