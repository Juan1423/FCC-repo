jest.mock('../src/libs/sequelize', () => ({
  models: {
    Terapias: {
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByPk: jest.fn(),
      create: jest.fn(),
    },
  },
}));

const TerapiasService = require('../src/services/historiaclinica.services/terapias.service');
const { models } = require('../src/libs/sequelize');

const service = new TerapiasService();

beforeEach(() => {
  jest.clearAllMocks();
});

describe('TerapiasService.find', () => {
  test('retorna todas las terapias', async () => {
    models.Terapias.findAll.mockResolvedValue([{ id_terapia: 1 }]);
    expect(await service.find()).toHaveLength(1);
  });
});

describe('TerapiasService.findOne', () => {
  test('retorna terapia por ID', async () => {
    models.Terapias.findByPk.mockResolvedValue({ id_terapia: 1 });
    expect(await service.findOne(1)).toEqual({ id_terapia: 1 });
  });
});

describe('TerapiasService.findByPaciente', () => {
  test('retorna terapias por id_historia', async () => {
    models.Terapias.findAll.mockResolvedValue([{ id_terapia: 1, id_historia: 5 }]);
    const result = await service.findByPaciente(5);
    expect(models.Terapias.findAll).toHaveBeenCalledWith({ where: { id_historia: 5 } });
    expect(result).toHaveLength(1);
  });
});

describe('TerapiasService.findUltimaTerapia', () => {
  test('retorna la ultima terapia ordenada por fecha descendente', async () => {
    models.Terapias.findOne.mockResolvedValue({ id_terapia: 1, fecha_hora: '2024-06-01' });
    const result = await service.findUltimaTerapia(5);
    expect(models.Terapias.findOne).toHaveBeenCalledWith({
      where: { id_historia: 5 },
      order: [['fecha_hora', 'DESC']],
    });
    expect(result).toBeDefined();
  });

  test('retorna null si no hay terapias', async () => {
    models.Terapias.findOne.mockResolvedValue(null);
    expect(await service.findUltimaTerapia(999)).toBeNull();
  });
});

describe('TerapiasService CRUD', () => {
  test('create() crea terapia', async () => {
    models.Terapias.create.mockResolvedValue({ id_terapia: 1 });
    expect(await service.create({})).toEqual({ id_terapia: 1 });
  });

  test('update() actualiza terapia', async () => {
    const instance = { update: jest.fn().mockResolvedValue([1]) };
    models.Terapias.findByPk.mockResolvedValue(instance);
    await service.update(1, { notas: 'Actualizado' });
    expect(instance.update).toHaveBeenCalledWith({ notas: 'Actualizado' });
  });

  test('delete() elimina terapia', async () => {
    const instance = { destroy: jest.fn().mockResolvedValue(true) };
    models.Terapias.findByPk.mockResolvedValue(instance);
    expect(await service.delete(1)).toEqual({ deleted: true });
  });
});
