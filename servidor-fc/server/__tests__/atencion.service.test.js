jest.mock('../src/libs/sequelize', () => ({
  models: {
    Aps: {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      findByPk: jest.fn(),
    },
  },
}));

const AtencionService = require('../src/services/historiaclinica.services/atencion.service');
const { models } = require('../src/libs/sequelize');

const service = new AtencionService();

beforeEach(() => {
  jest.clearAllMocks();
});

describe('AtencionService.find', () => {
  test('retorna todas las atenciones', async () => {
    models.Aps.findAll.mockResolvedValue([{ id_aps: 1 }]);
    expect(await service.find()).toHaveLength(1);
  });
});

describe('AtencionService.create', () => {
  test('crea una atencion', async () => {
    const data = { motivo: 'Control' };
    models.Aps.create.mockResolvedValue({ id_aps: 1, ...data });
    expect(await service.create(data)).toEqual({ id_aps: 1, ...data });
  });
});

describe('AtencionService.findByHistoria', () => {
  test('retorna atenciones por id_historia', async () => {
    models.Aps.findAll.mockResolvedValue([{ id_aps: 1, id_historia: 5 }]);
    const result = await service.findByHistoria(5);
    expect(models.Aps.findAll).toHaveBeenCalledWith({ where: { id_historia: 5 } });
    expect(result).toHaveLength(1);
  });
});

describe('AtencionService.findById', () => {
  test('retorna atencion por id_aps', async () => {
    models.Aps.findOne.mockResolvedValue({ id_aps: 1 });
    const result = await service.findById(1);
    expect(models.Aps.findOne).toHaveBeenCalledWith({ where: { id_aps: 1 } });
    expect(result).toBeDefined();
  });
});

describe('AtencionService.findFirstByHistoria', () => {
  test('retorna la primera atencion ordenada por fecha', async () => {
    models.Aps.findOne.mockResolvedValue({ id_aps: 1, fecha_atencion: '2024-01-01' });
    const result = await service.findFirstByHistoria(5);
    expect(models.Aps.findOne).toHaveBeenCalledWith({
      where: { id_historia: 5 },
      order: [['fecha_atencion', 'ASC']],
    });
    expect(result).toBeDefined();
  });
});

describe('AtencionService.update', () => {
  test('actualiza atencion', async () => {
    const instance = { update: jest.fn().mockResolvedValue([1]) };
    models.Aps.findOne.mockResolvedValue(instance);
    await service.update(1, { motivo: 'Actualizado' });
    expect(instance.update).toHaveBeenCalledWith({ motivo: 'Actualizado' });
  });
});

describe('AtencionService.delete', () => {
  test('elimina atencion', async () => {
    const instance = { destroy: jest.fn().mockResolvedValue(true) };
    models.Aps.findOne.mockResolvedValue(instance);
    expect(await service.delete(1)).toEqual({ deleted: true });
  });
});
