import { Test, TestingModule } from '@nestjs/testing';
import { PerfilesService } from './perfiles.service';
import { SupabaseService } from '../supabase/supabase.service';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';

const mockSupabaseClient = {
  from: jest.fn(),
  storage: {
    from: jest.fn(),
  },
};

const mockSupabaseService = {
  getClient: jest.fn().mockReturnValue(mockSupabaseClient),
};

describe('PerfilesService', () => {
  let service: PerfilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PerfilesService,
        { provide: SupabaseService, useValue: mockSupabaseService },
      ],
    }).compile();

    service = module.get<PerfilesService>(PerfilesService);
    jest.clearAllMocks();
  });

  // ── getPerfil ──
  describe('getPerfil', () => {
    it('debe retornar el perfil del usuario', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { usuario_id: 'uuid-123', usuario: 'testuser' },
              error: null,
            }),
          }),
        }),
      });

      const result = await service.getPerfil('uuid-123');
      expect(result).toEqual({ usuario_id: 'uuid-123', usuario: 'testuser' });
    });

    it('debe lanzar NotFoundException si el perfil no existe', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Not found' },
            }),
          }),
        }),
      });

      await expect(service.getPerfil('uuid-123')).rejects.toThrow(NotFoundException);
    });
  });

  // ── updatePerfil ──
  describe('updatePerfil', () => {
    it('debe actualizar y retornar el perfil', async () => {
      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { usuario_id: 'uuid-123', carrera: 'Ingeniería en Software' },
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await service.updatePerfil('uuid-123', { carrera: 'Ingeniería en Software' });
      expect(result).toEqual({ usuario_id: 'uuid-123', carrera: 'Ingeniería en Software' });
    });

    it('debe lanzar InternalServerErrorException si falla el update', async () => {
      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'DB error' },
              }),
            }),
          }),
        }),
      });

      await expect(
        service.updatePerfil('uuid-123', { carrera: 'Ingeniería en Software' }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  // ── crearOActualizar ──
  describe('crearOActualizar', () => {
    it('debe crear o actualizar el perfil académico', async () => {
      mockSupabaseClient.from.mockReturnValue({
        upsert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { usuario_id: 'uuid-123', carrera: 'ISW', semestre: 5 },
              error: null,
            }),
          }),
        }),
      });

      const result = await service.crearOActualizar('uuid-123', {
        institucion: 'UAZ',
        carrera: 'ISW',
        semestre: 5,
        promedio_general: 9.2,
      });

      expect(result).toEqual({ usuario_id: 'uuid-123', carrera: 'ISW', semestre: 5 });
    });

    it('debe lanzar InternalServerErrorException si falla el upsert', async () => {
      mockSupabaseClient.from.mockReturnValue({
        upsert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'DB error' },
            }),
          }),
        }),
      });

      await expect(
        service.crearOActualizar('uuid-123', {
          institucion: 'UAZ',
          carrera: 'ISW',
          semestre: 5,
          promedio_general: 9.2,
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  // ── guardarEstresores ──
  describe('guardarEstresores', () => {
    it('debe guardar los estresores correctamente', async () => {
      mockSupabaseClient.from.mockReturnValue({
        upsert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            data: [{ usuario_id: 'uuid-123', factor_id: 1, peso: 3 }],
            error: null,
          }),
        }),
      });

      const result = await service.guardarEstresores('uuid-123', {
        factores: [
          { factor_id: 1, peso: 3 }, { factor_id: 2, peso: 4 },
          { factor_id: 3, peso: 2 }, { factor_id: 4, peso: 5 },
          { factor_id: 5, peso: 1 }, { factor_id: 6, peso: 3 },
          { factor_id: 7, peso: 4 }, { factor_id: 8, peso: 2 },
        ],
      });

      expect(result).toBeDefined();
    });

    it('debe lanzar InternalServerErrorException si falla el upsert', async () => {
      mockSupabaseClient.from.mockReturnValue({
        upsert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'DB error' },
          }),
        }),
      });

      await expect(
        service.guardarEstresores('uuid-123', {
          factores: [
            { factor_id: 1, peso: 3 }, { factor_id: 2, peso: 4 },
            { factor_id: 3, peso: 2 }, { factor_id: 4, peso: 5 },
            { factor_id: 5, peso: 1 }, { factor_id: 6, peso: 3 },
            { factor_id: 7, peso: 4 }, { factor_id: 8, peso: 2 },
          ],
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  // ── uploadAvatar ──
  describe('uploadAvatar', () => {
    it('debe subir el avatar y retornar la URL pública', async () => {
      mockSupabaseClient.storage.from.mockReturnValue({
        upload: jest.fn().mockResolvedValue({ error: null }),
        getPublicUrl: jest.fn().mockReturnValue({
          data: { publicUrl: 'https://supabase.co/storage/avatares/uuid-123/foto.jpeg' },
        }),
      });

      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      });

      const mockFile = {
        mimetype: 'image/jpeg',
        buffer: Buffer.from('fake-image'),
      } as Express.Multer.File;

      const result = await service.uploadAvatar('uuid-123', mockFile);
      expect(result).toHaveProperty('avatar_url');
    });

    it('debe lanzar InternalServerErrorException si falla la subida', async () => {
      mockSupabaseClient.storage.from.mockReturnValue({
        upload: jest.fn().mockResolvedValue({ error: { message: 'Upload error' } }),
        getPublicUrl: jest.fn(),
      });

      const mockFile = {
        mimetype: 'image/jpeg',
        buffer: Buffer.from('fake-image'),
      } as Express.Multer.File;

      await expect(service.uploadAvatar('uuid-123', mockFile)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});