import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { SupabaseService } from '../supabase/supabase.service';
import { ConflictException, InternalServerErrorException } from '@nestjs/common';

// Mock de Supabase
const mockSupabaseClient = {
  auth: {
    admin: {
      createUser: jest.fn(),
      getUserById: jest.fn(),
      deleteUser: jest.fn(),
    },
  },
  from: jest.fn().mockReturnThis(),
  upsert: jest.fn(),
};

const mockSupabaseService = {
  getClient: jest.fn().mockReturnValue(mockSupabaseClient),
};

describe('AuthService - register', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: SupabaseService, useValue: mockSupabaseService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks(); // limpiar mocks entre cada test
  });

  // Caso 1: registro exitoso
  it('debe retornar mensaje de éxito al registrar correctamente', async () => {
    mockSupabaseClient.auth.admin.createUser.mockResolvedValue({
      data: { user: { id: 'uuid-123' } },
      error: null,
    });

    mockSupabaseClient.auth.admin.getUserById.mockResolvedValue({
      data: { user: { id: 'uuid-123' } },
    });

    mockSupabaseClient.from.mockReturnValue({
      upsert: jest.fn().mockResolvedValue({ error: null }),
    });

    const result = await service.register({
      email: 'test@correo.com',
      password: '12345678',
      username: 'testuser',
    });

    expect(result).toEqual({
      message: 'Registro exitoso. Revisa tu correo para verificar tu cuenta.',
    });
  });

  // Caso 2: correo duplicado
  it('debe lanzar ConflictException si el correo ya existe', async () => {
    mockSupabaseClient.auth.admin.createUser.mockResolvedValue({
      data: null,
      error: { message: 'User already been registered' },
    });

    await expect(
      service.register({
        email: 'existente@correo.com',
        password: '12345678',
        username: 'testuser',
      }),
    ).rejects.toThrow(ConflictException);
  });

  // Caso 3: error al verificar usuario
  it('debe lanzar InternalServerErrorException si getUserById no encuentra el usuario', async () => {
    mockSupabaseClient.auth.admin.createUser.mockResolvedValue({
      data: { user: { id: 'uuid-123' } },
      error: null,
    });

    mockSupabaseClient.auth.admin.getUserById.mockResolvedValue({
      data: { user: null },
    });

    mockSupabaseClient.auth.admin.deleteUser.mockResolvedValue({ error: null });

    await expect(
      service.register({
        email: 'test@correo.com',
        password: '12345678',
        username: 'testuser',
      }),
    ).rejects.toThrow(InternalServerErrorException);
  });

  // Caso 4: error al guardar perfil
  it('debe lanzar InternalServerErrorException y hacer rollback si falla el upsert', async () => {
    mockSupabaseClient.auth.admin.createUser.mockResolvedValue({
      data: { user: { id: 'uuid-123' } },
      error: null,
    });

    mockSupabaseClient.auth.admin.getUserById.mockResolvedValue({
      data: { user: { id: 'uuid-123' } },
    });

    mockSupabaseClient.from.mockReturnValue({
      upsert: jest.fn().mockResolvedValue({ error: { message: 'DB error' } }),
    });

    mockSupabaseClient.auth.admin.deleteUser.mockResolvedValue({ error: null });

    await expect(
      service.register({
        email: 'test@correo.com',
        password: '12345678',
        username: 'testuser',
      }),
    ).rejects.toThrow(InternalServerErrorException);

    // Verificar que se ejecutó el rollback
    expect(mockSupabaseClient.auth.admin.deleteUser).toHaveBeenCalledWith('uuid-123');
  });
});