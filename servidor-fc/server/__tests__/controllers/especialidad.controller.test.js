const mockService = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

jest.mock('../../src/services/historiaclinica.services/especialidad.service', () => {
  return jest.fn().mockImplementation(() => mockService);
});

const request = require('supertest');
const { createTestApp } = require('../../test-utils/createTestApp');
const especialidadRouter = require('../../src/routes/historiaclinica.routes/especialidad.routes');

const app = createTestApp('/api/fcc/especialidad', especialidadRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/fcc/especialidad', () => {
  test('retorna lista de especialidades', async () => {
    mockService.find.mockResolvedValue([{ id_especialidad: 1, nombre: 'Cardiología' }]);

    const res = await request(app).get('/api/fcc/especialidad');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].nombre).toBe('Cardiología');
  });

  test('retorna 500 si el service falla', async () => {
    mockService.find.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/fcc/especialidad');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/fcc/especialidad/:id', () => {
  test('retorna especialidad por ID', async () => {
    mockService.findOne.mockResolvedValue({ id_especialidad: 1, nombre: 'Cardiología' });

    const res = await request(app).get('/api/fcc/especialidad/1');

    expect(res.status).toBe(200);
    expect(res.body.nombre).toBe('Cardiología');
  });

  test('retorna 500 si el service falla', async () => {
    mockService.findOne.mockRejectedValue(new Error('Not found'));

    const res = await request(app).get('/api/fcc/especialidad/999');

    expect(res.status).toBe(500);
  });
});

describe('POST /api/fcc/especialidad', () => {
  test('crea una especialidad', async () => {
    const newData = { nombre: 'Neurología' };
    mockService.create.mockResolvedValue({ id_especialidad: 1, ...newData });

    const res = await request(app).post('/api/fcc/especialidad').send(newData);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.nombre).toBe('Neurología');
  });

  test('retorna 500 si el create falla', async () => {
    mockService.create.mockRejectedValue(new Error('Error'));

    const res = await request(app).post('/api/fcc/especialidad').send({ nombre: 'Test' });

    expect(res.status).toBe(500);
  });
});

describe('PUT /api/fcc/especialidad/:id', () => {
  test('actualiza una especialidad', async () => {
    mockService.update.mockResolvedValue([1]);

    const res = await request(app).put('/api/fcc/especialidad/1').send({ nombre: 'Actualizado' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual([1]);
  });
});

describe('DELETE /api/fcc/especialidad/:id', () => {
  test('elimina una especialidad', async () => {
    mockService.delete.mockResolvedValue({ deleted: true });

    const res = await request(app).delete('/api/fcc/especialidad/1');

    expect(res.status).toBe(200);
    expect(res.body.deleted).toBe(true);
  });
});
