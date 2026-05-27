jest.mock('../src/libs/sequelize', () => ({
  models: {
    Examen: {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
    },
  },
}));

const ExamenService = require('../src/services/historiaclinica.services/examen.service');
const { models } = require('../src/libs/sequelize');

const service = new ExamenService();

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ExamenService.find', () => {
  test('retorna todos los examenes', async () => {
    models.Examen.findAll.mockResolvedValue([{ id_examen: 1 }]);
    expect(await service.find()).toHaveLength(1);
  });
});

describe('ExamenService.create', () => {
  test('crea un examen', async () => {
    models.Examen.create.mockResolvedValue({ id_examen: 1, tipo: 'Sangre' });
    expect(await service.create({ tipo: 'Sangre' })).toEqual({ id_examen: 1, tipo: 'Sangre' });
  });

  test('lanza error si create falla', async () => {
    models.Examen.create.mockRejectedValue(new Error('DB error'));
    await expect(service.create({})).rejects.toThrow('Error al crear examen');
  });
});

describe('ExamenService.findById', () => {
  test('retorna examen por id_examen', async () => {
    models.Examen.findOne.mockResolvedValue({ id_examen: 1 });
    const result = await service.findById(1);
    expect(models.Examen.findOne).toHaveBeenCalledWith({ where: { id_examen: 1 } });
    expect(result).toBeDefined();
  });
});

describe('ExamenService.findByHistoria', () => {
  test('retorna examenes por id_historia', async () => {
    models.Examen.findAll.mockResolvedValue([{ id_examen: 1, id_historia: 5 }]);
    const result = await service.findByHistoria(5);
    expect(models.Examen.findAll).toHaveBeenCalledWith({ where: { id_historia: 5 } });
    expect(result).toHaveLength(1);
  });
});

describe('ExamenService.update', () => {
  test('actualiza examen', async () => {
    const instance = { update: jest.fn().mockResolvedValue([1]) };
    models.Examen.findOne.mockResolvedValue(instance);
    await service.update(1, { resultado: 'Normal' });
    expect(instance.update).toHaveBeenCalledWith({ resultado: 'Normal' });
  });
});

describe('ExamenService.delete', () => {
  test('elimina examen', async () => {
    const instance = { destroy: jest.fn().mockResolvedValue(true) };
    models.Examen.findOne.mockResolvedValue(instance);
    expect(await service.delete(1)).toEqual({ deleted: true });
  });
});
