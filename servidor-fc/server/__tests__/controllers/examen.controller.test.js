const mockService = {
  find: jest.fn(),
  findById: jest.fn(),
  findByHistoria: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

jest.mock('../../src/services/historiaclinica.services/examen.service', () => {
  return jest.fn().mockImplementation(() => mockService);
});

const request = require('supertest');
const { createTestApp } = require('../../test-utils/createTestApp');
const examenRouter = require('../../src/routes/historiaclinica.routes/examen.routes');

const app = createTestApp('/api/fcc/examen', examenRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/fcc/examen', () => {
  test('retorna lista de examenes', async () => {
    mockService.find.mockResolvedValue([{ id_examen: 1, tipo: 'Sangre' }]);
    const res = await request(app).get('/api/fcc/examen');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});

describe('GET /api/fcc/examen/:id', () => {
  test('retorna examen por ID', async () => {
    mockService.findById.mockResolvedValue({ id_examen: 1, tipo: 'Rayos X' });
    const res = await request(app).get('/api/fcc/examen/1');
    expect(res.status).toBe(200);
    expect(res.body.tipo).toBe('Rayos X');
  });

  test('retorna 404 si no existe', async () => {
    mockService.findById.mockResolvedValue(null);
    const res = await request(app).get('/api/fcc/examen/999');
    expect(res.status).toBe(404);
  });
});

describe('GET /api/fcc/examen/historia/:idHistoria', () => {
  test('retorna examenes por historia', async () => {
    mockService.findByHistoria.mockResolvedValue([{ id_examen: 1 }]);
    const res = await request(app).get('/api/fcc/examen/historia/5');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});

describe('GET /api/fcc/examen/last/:idHistoria', () => {
  test('retorna el ultimo examen', async () => {
    mockService.findByHistoria.mockResolvedValue([
      { id_examen: 1, tipo: 'Sangre' },
      { id_examen: 2, tipo: 'Rayos X' },
    ]);
    const res = await request(app).get('/api/fcc/examen/last/5');
    expect(res.status).toBe(200);
    expect(res.body.id_examen).toBe(2);
  });
});

describe('POST /api/fcc/examen', () => {
  test('crea examen', async () => {
    mockService.create.mockResolvedValue({ id_examen: 1 });
    const res = await request(app).post('/api/fcc/examen').send({ tipo: 'Sangre' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('PUT /api/fcc/examen/:id', () => {
  test('actualiza examen', async () => {
    mockService.update.mockResolvedValue([1]);
    const res = await request(app).put('/api/fcc/examen/1').send({ resultado: 'Normal' });
    expect(res.status).toBe(200);
  });
});

describe('DELETE /api/fcc/examen/:id', () => {
  test('elimina examen', async () => {
    mockService.delete.mockResolvedValue({ deleted: true });
    const res = await request(app).delete('/api/fcc/examen/1');
    expect(res.status).toBe(200);
    expect(res.body.deleted).toBe(true);
  });
});
