const mockFindAll = jest.fn();
const mockFindByPk = jest.fn();
const mockCreate = jest.fn();
const mockDestroy = jest.fn();
const mockUpdate = jest.fn();
const mockFindOne = jest.fn();
const mockCount = jest.fn();

const createMockInstance = () => ({
  update: jest.fn().mockResolvedValue([1]),
  destroy: jest.fn().mockResolvedValue(true),
});

jest.mock('../src/libs/sequelize', () => ({
  models: {
    Enfermedad: { findAll: mockFindAll, findOne: mockFindOne, create: mockCreate },
    Especialidad: { findAll: mockFindAll, findByPk: mockFindByPk, create: mockCreate },
    TipoEspecialidad: { findAll: mockFindAll, findByPk: mockFindByPk, create: mockCreate },
    TipoTerapia: { findAll: mockFindAll, findByPk: mockFindByPk, create: mockCreate },
    Historia: { findAll: mockFindAll, findByPk: mockFindByPk, create: mockCreate },
    PersonalSalud: { findAll: mockFindAll, findByPk: mockFindByPk, create: mockCreate },
    Aps: { count: mockCount, findAll: mockFindAll },
    Terapias: { count: mockCount },
    Usuario: { findOne: mockFindOne },
  },
}));

const EnfermedadesService = require('../src/services/historiaclinica.services/enfermedades.service');
const EspecialidadService = require('../src/services/historiaclinica.services/especialidad.service');
const TipoEspecialidadService = require('../src/services/historiaclinica.services/tipo_especialidad.service');
const TipoTerapiaService = require('../src/services/historiaclinica.services/tipo_terapia.service');
const HistoriaService = require('../src/services/historiaclinica.services/historia.service');
const PersonalSaludService = require('../src/services/historiaclinica.services/personalsalud.service');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('EnfermedadesService', () => {
  const service = new EnfermedadesService();

  test('find() retorna todas las enfermedades', async () => {
    const data = [{ id_enfermedad: 1, nombre: 'Diabetes' }];
    mockFindAll.mockResolvedValue(data);
    expect(await service.find()).toEqual(data);
  });

  test('findById() retorna enfermedad por id', async () => {
    const data = { id_enfermedad: 1, nombre: 'Diabetes' };
    mockFindOne.mockResolvedValue(data);
    const result = await service.findById(1);
    expect(mockFindOne).toHaveBeenCalledWith({ where: { id_enfermedad: 1 } });
    expect(result).toEqual(data);
  });

  test('findByHistoria() retorna enfermedades por historia', async () => {
    mockFindAll.mockResolvedValue([{ id_enfermedad: 1 }]);
    const result = await service.findByHistoria(5);
    expect(mockFindAll).toHaveBeenCalledWith({ where: { id_historia: 5 } });
    expect(result).toHaveLength(1);
  });

  test('create() crea enfermedad', async () => {
    const data = { nombre: 'Hipertensión' };
    mockCreate.mockResolvedValue({ id_enfermedad: 1, ...data });
    expect(await service.create(data)).toEqual({ id_enfermedad: 1, ...data });
  });

  test('update() actualiza enfermedad', async () => {
    const instance = createMockInstance();
    mockFindOne.mockResolvedValue(instance);
    await service.update(1, { nombre: 'Actualizado' });
    expect(instance.update).toHaveBeenCalledWith({ nombre: 'Actualizado' });
  });

  test('delete() elimina enfermedad', async () => {
    const instance = createMockInstance();
    mockFindOne.mockResolvedValue(instance);
    expect(await service.delete(1)).toEqual({ deleted: true });
    expect(instance.destroy).toHaveBeenCalled();
  });
});

describe('EspecialidadService', () => {
  const service = new EspecialidadService();

  test('CRUD basico funciona', async () => {
    mockFindAll.mockResolvedValue([{ id_especialidad: 1 }]);
    mockFindByPk.mockResolvedValue({ id_especialidad: 1, update: jest.fn().mockResolvedValue([1]), destroy: jest.fn().mockResolvedValue(true) });
    mockCreate.mockResolvedValue({ id_especialidad: 1 });

    expect(await service.find()).toHaveLength(1);
    expect(await service.findOne(1)).toBeDefined();
    expect(await service.create({ nombre: 'Cardiología' })).toBeDefined();
    expect(await service.update(1, { nombre: 'X' })).toEqual([1]);
    expect(await service.delete(1)).toEqual({ deleted: true });
  });
});

describe('TipoEspecialidadService', () => {
  const service = new TipoEspecialidadService();
  test('CRUD basico', async () => {
    mockFindAll.mockResolvedValue([]);
    mockFindByPk.mockResolvedValue(createMockInstance());
    mockCreate.mockResolvedValue({ id_tipo_especialidad: 1 });

    expect(await service.find()).toEqual([]);
    expect(await service.findOne(1)).toBeDefined();
    expect(await service.create({ nombre: 'Tipo' })).toBeDefined();
  });
});

describe('TipoTerapiaService', () => {
  const service = new TipoTerapiaService();
  test('CRUD basico', async () => {
    mockFindAll.mockResolvedValue([]);
    mockFindByPk.mockResolvedValue(createMockInstance());
    mockCreate.mockResolvedValue({ id_tipo_terapia: 1 });
    expect(await service.find()).toEqual([]);
    expect(await service.findOne(1)).toBeDefined();
    expect(await service.create({ nombre: 'Física' })).toBeDefined();
    expect(await service.delete(1)).toEqual({ deleted: true });
  });
});

describe('HistoriaService', () => {
  const service = new HistoriaService();

  test('CRUD basico', async () => {
    const instance = createMockInstance();
    mockFindAll.mockResolvedValue([{ id_historia: 1 }]);
    mockFindByPk.mockResolvedValue(instance);
    mockCreate.mockResolvedValue({ id_historia: 1 });

    expect(await service.find()).toHaveLength(1);
    expect(await service.findOne(1)).toBe(instance);
    expect(await service.create({})).toEqual({ id_historia: 1 });
    expect(await service.update(1, {})).toEqual([1]);
    expect(await service.delete(1)).toEqual({ deleted: true });
  });
});

describe('PersonalSaludService', () => {
  const service = new PersonalSaludService();

  test('CRUD basico', async () => {
    const instance = createMockInstance();
    mockFindAll.mockResolvedValue([{ id_personal_salud: 1 }]);
    mockFindByPk.mockResolvedValue(instance);
    mockCreate.mockResolvedValue({ id_personal_salud: 1 });

    expect(await service.find()).toHaveLength(1);
    expect(await service.findOne(1)).toBe(instance);
    expect(await service.create({})).toEqual({ id_personal_salud: 1 });
    expect(await service.update(1, {})).toEqual([1]);
    expect(await service.delete(1)).toEqual({ deleted: true });
  });

  describe('getEstadisticas', () => {
    test('retorna estadísticas del personal de salud', async () => {
      const mockPersonal = { id_personal_salud: 1, nombre: 'Dr. Test' };
      mockFindByPk.mockResolvedValue(mockPersonal);
      mockCount.mockResolvedValue(5);
      mockFindOne.mockResolvedValue({ createdAt: new Date('2020-01-01') });

      const result = await service.getEstadisticas(1);

      expect(result).toHaveProperty('pacientes_atendidos', 5);
      expect(result).toHaveProperty('terapias_realizadas', 5);
      expect(result).toHaveProperty('anos_experiencia');
      expect(result.anos_experiencia).toBeGreaterThanOrEqual(6);
    });

    test('lanza error si el personal no existe', async () => {
      mockFindByPk.mockResolvedValue(null);
      await expect(service.getEstadisticas(999)).rejects.toThrow('Personal de salud no encontrado');
    });
  });
});
