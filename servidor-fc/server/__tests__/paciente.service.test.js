const mockModel = {
  findAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
};

jest.mock('../src/libs/sequelize', () => ({
  models: {
    Paciente: mockModel,
  },
}));

const PacienteService = require('../src/services/historiaclinica.services/paciente.service');
const service = new PacienteService();

beforeEach(() => {
  jest.clearAllMocks();
});

describe('PacienteService.find', () => {
  test('retorna todos los pacientes', async () => {
    const mockData = [{ id: 1, nombre: 'Paciente 1' }, { id: 2, nombre: 'Paciente 2' }];
    mockModel.findAll.mockResolvedValue(mockData);

    const result = await service.find();

    expect(result).toEqual(mockData);
    expect(mockModel.findAll).toHaveBeenCalledTimes(1);
  });

  test('retorna arreglo vacío si no hay pacientes', async () => {
    mockModel.findAll.mockResolvedValue([]);

    const result = await service.find();

    expect(result).toEqual([]);
  });
});

describe('PacienteService.findOne', () => {
  test('retorna paciente por ID', async () => {
    const mockData = { id: 1, nombre: 'Paciente 1' };
    mockModel.findByPk.mockResolvedValue(mockData);

    const result = await service.findOne(1);

    expect(result).toEqual(mockData);
    expect(mockModel.findByPk).toHaveBeenCalledWith(1);
  });

  test('retorna null si no existe', async () => {
    mockModel.findByPk.mockResolvedValue(null);

    const result = await service.findOne(999);

    expect(result).toBeNull();
  });
});

describe('PacienteService.create', () => {
  test('crea un paciente y retorna el registro', async () => {
    const data = { nombre: 'Nuevo', apellido: 'Paciente' };
    const mockCreated = { id: 1, ...data };
    mockModel.create.mockResolvedValue(mockCreated);

    const result = await service.create(data);

    expect(result).toEqual(mockCreated);
    expect(mockModel.create).toHaveBeenCalledWith(data);
  });
});

describe('PacienteService.update', () => {
  test('actualiza un paciente existente', async () => {
    const mockInstance = {
      update: jest.fn().mockResolvedValue([1]),
    };
    mockModel.findByPk.mockResolvedValue(mockInstance);

    const result = await service.update(1, { nombre: 'Actualizado' });

    expect(mockInstance.update).toHaveBeenCalledWith({ nombre: 'Actualizado' });
    expect(result).toEqual([1]);
  });

  test('lanza error si el paciente no existe', async () => {
    mockModel.findByPk.mockResolvedValue(null);

    await expect(service.update(999, { nombre: 'Test' })).rejects.toThrow();
  });
});

describe('PacienteService.delete', () => {
  test('elimina un paciente existente', async () => {
    const mockInstance = {
      destroy: jest.fn().mockResolvedValue(true),
    };
    mockModel.findByPk.mockResolvedValue(mockInstance);

    const result = await service.delete(1);

    expect(mockInstance.destroy).toHaveBeenCalled();
    expect(result).toEqual({ deleted: true });
  });

  test('lanza error si el paciente no existe', async () => {
    mockModel.findByPk.mockResolvedValue(null);

    await expect(service.delete(999)).rejects.toThrow();
  });
});
