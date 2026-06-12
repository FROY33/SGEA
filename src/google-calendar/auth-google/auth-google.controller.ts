import { Controller, Get, Query, Res, UnauthorizedException } from '@nestjs/common';
import type { Response } from 'express';
import { google } from 'googleapis';
import { SupabaseService } from '../../supabase/supabase.service.js';

@Controller('auth/google')
export class AuthGoogleController {
  constructor(private readonly supabaseService: SupabaseService) {}

  private buildOAuthClient() {
    return new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALLBACK_URL, // ej: http://localhost:3000/auth/google/callback
    );
  }

  // Paso 1: el usuario hace click en "Conectar Google Calendar"
  // GET /auth/google/connect?userId=<uuid>
  @Get('connect')
  conectar(@Query('userId') userId: string, @Res() res: Response) {
    const oauth2Client = this.buildOAuthClient();

    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',   // para recibir refresh_token
      prompt: 'consent',        // fuerza el reenvío del refresh_token
      scope: ['https://www.googleapis.com/auth/calendar.events'],
      state: userId,            // pasamos el userId para recuperarlo en el callback
    });

    return res.redirect(url);
  }

  // Paso 2: Google redirige aquí con el code
  // GET /auth/google/callback?code=...&state=<userId>
  @Get('callback')
async callback(
  @Query('code') code: string,
  @Query('state') userId: string,
  @Res() res: Response,
) {
  console.log('--- CALLBACK INICIO ---');
  console.log('code:', code?.substring(0, 15), '...');
  console.log('userId:', userId);

  if (!code || !userId) throw new UnauthorizedException('Faltan parámetros');

  try {
    const oauth2Client = this.buildOAuthClient();
    console.log('GOOGLE_CALLBACK_URL usado:', process.env.GOOGLE_CALLBACK_URL);

    const { tokens } = await oauth2Client.getToken(code);
    console.log('tokens obtenidos - access:', !!tokens.access_token, 'refresh:', !!tokens.refresh_token);

    const supabase = this.supabaseService.getClient();
    console.log('cliente supabase creado');

    const { data, error } = await supabase
      .from('perfil_usuario')
      .update({
        google_access_token:  tokens.access_token,
        google_refresh_token: tokens.refresh_token,
        google_token_expiry:  tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
      })
      .eq('usuario_id', userId)
      .select();

    console.log('update data:', JSON.stringify(data));
    console.log('update error:', JSON.stringify(error));

    if (error) throw new UnauthorizedException('No se pudo guardar el token');

    return res.redirect(`${process.env.FRONTEND_URL}/calendar-connected.html`);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    const errorName = err instanceof Error ? err.name : 'UnknownError';
    const responseData =
      err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: unknown } }).response?.data
        : undefined;
    const stack = err instanceof Error ? err.stack : undefined;

    console.error('!!! ERROR EN CALLBACK !!!');
    console.error('Tipo:', errorName);
    console.error('Mensaje:', errorMessage);
    console.error('Response data:', JSON.stringify(responseData));
    console.error('Stack:', stack);
    throw err;
  }
}
}