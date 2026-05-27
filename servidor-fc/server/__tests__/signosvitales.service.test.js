jest.mock('../src/libs/sequelize', () => ({
  models: {
    SignosVitales: {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
    },
  },
}));

const SignosVitalesServices = require('../src/services/historiaclinica.services/signosvitales.services');
const { models } = require('../src/libs/sequelize');

const service = new SignosVitalesServices();

beforeEach(() => {
  jest.clearAllMocks();
});

describe('SignosVitalesServices.find', () => {
  test('retorna todos los signos vitales', async () => {
    models.SignosVitales.findAll.mockResolvedValue([{ id_signos_vitales: 1 }]);
    expect(await service.find()).toHaveLength(1);
  });
});

describe('SignosVitalesServices.createSignosVitales', () => {
  test('crea signos vitales exitosamente', async () => {
    const data = { presion_arterial: '120/80', frecuencia_cardiaca: 72 };
    models.SignosVitales.create.mockResolvedValue({ id_signos_vitales: 1, ...data });
    const result = await service.createSignosVitales(data);
    expect(result).toEqual({ id_signos_vitales: 1, ...data });
  });

  test('lanza error si create falla', async () => {
    models.SignosVitales.create.mockRejectedValue(new Error('DB error'));
    await expect(service.createSignosVitales({})).rejects.toThrow('Error al crear signos vitales');
  });
});

describe('SignosVitalesServices.findById', () => {
  test('retorna signos vitales por id_signos_vitales', async () => {
    models.SignosVitales.findOne.mockResolvedValue({ id_signos_vitales: 1 });
    const result = await service.findById(1);
    expect(models.SignosVitales.findOne).toHaveBeenCalledWith({ where: { id_signos_vitales: 1 } });
    expect(result).toBeDefined();
  });
});

describe('SignosVitalesServices.findByHistoria', () => {
  test('retorna signos vitales por id_historia', async () => {
    models.SignosVitales.findAll.mockResolvedValue([{ id_signos_vitales: 1, id_historia: 5 }]);
    const result = await service.findByHistoria(5);
    expect(models.SignosVitales.findAll).toHaveBeenCalledWith({ where: { id_historia: 5 } });
    expect(result).toHaveLength(1);
  });
});

describe('SignosVitalesServices.findByAps', () => {
  test('retorna signos vitales por id_aps', async () => {
    models.SignosVitales.findAll.mockResolvedValue([{ id_signos_vitales: 1, id_aps: 10 }]);
    const result = await service.findByAps(10);
    expect(models.SignosVitales.findAll).toHaveBeenCalledWith({ where: { id_aps: 10 } });
    expect(result).toHaveLength(1);
  });
});

describe('SignosVitalesServices CRUD', () => {
  test('update() actualiza', async () => {
    const instance = { update: jest.fn().mockResolvedValue([1]) };
    models.SignosVitales.findOne.mockResolvedValue(instance);
    await service.update(1, { presion_arterial: '130/80' });
    expect(instance.update).toHaveBeenCalledWith({ presion_arterial: '130/80' });
  });

  test('delete() elimina', async () => {
    const instance = { destroy: jest.fn().mockResolvedValue(true) };
    models.SignosVitales.findOne.mockResolvedValue(instance);
    expect(await service.delete(1)).toEqual({ deleted: true });
  });
});
