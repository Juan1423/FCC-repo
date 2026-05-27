jest.mock('../src/libs/sequelize', () => ({
  models: {
    Auditoria: {
      findAll: jest.fn(),
      findByPk: jest.fn(),
      create: jest.fn(),
    },
    Usuario: {
      findAll: jest.fn(),
      findByPk: jest.fn(),
    },
  },
}));

const AuditoriaService = require('../src/services/historiaclinica.services/auditoria.service');
const { models } = require('../src/libs/sequelize');

const service = new AuditoriaService();

beforeEach(() => {
  jest.clearAllMocks();
});

describe('AuditoriaService.find', () => {
  test('retorna todas las auditorias con include de usuario', async () => {
    const mockData = [{
      id_auditoria: 1,
      usuario_auditoria: { nombre_usuario: 'Admin', apellido_usuario: 'Test', correo_usuario: 'admin@test.com' },
    }];
    models.Auditoria.findAll.mockResolvedValue(mockData);

    const result = await service.find();

    expect(models.Auditoria.findAll).toHaveBeenCalledWith({
      include: [{
        model: models.Usuario,
        as: 'usuario_auditoria',
        attributes: ['nombre_usuario', 'apellido_usuario', 'correo_usuario'],
      }],
    });
    expect(result).toEqual(mockData);
  });
});

describe('AuditoriaService.findOne', () => {
  test('retorna auditoria por ID', async () => {
    models.Auditoria.findByPk.mockResolvedValue({ id_auditoria: 1, accion: 'login' });
    expect(await service.findOne(1)).toEqual({ id_auditoria: 1, accion: 'login' });
  });
});

describe('AuditoriaService.create', () => {
  test('crea una auditoria exitosamente', async () => {
    const data = { id_usuario: 1, modulo: 'Pacientes', operacion: 'CREATE', detalle: 'Creó paciente' };
    models.Auditoria.create.mockResolvedValue({ id_auditoria: 1, ...data });
    const result = await service.create(data);
    expect(result).toEqual({ id_auditoria: 1, ...data });
  });

  test('lanza error si create falla', async () => {
    models.Auditoria.create.mockRejectedValue(new Error('DB error'));
    await expect(service.create({})).rejects.toThrow('DB error');
  });
});

describe('AuditoriaService CRUD', () => {
  test('update() actualiza', async () => {
    const instance = { update: jest.fn().mockResolvedValue([1]) };
    models.Auditoria.findByPk.mockResolvedValue(instance);
    await service.update(1, { detalle: 'Actualizado' });
    expect(instance.update).toHaveBeenCalledWith({ detalle: 'Actualizado' });
  });

  test('delete() elimina', async () => {
    const instance = { destroy: jest.fn().mockResolvedValue(true) };
    models.Auditoria.findByPk.mockResolvedValue(instance);
    expect(await service.delete(1)).toEqual({ deleted: true });
  });
});
