const mockService = {
  find: jest.fn(),
  findById: jest.fn(),
  findByHistoria: jest.fn(),
  findFirstByHistoria: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

jest.mock('../../src/services/historiaclinica.services/atencion.service', () => {
  return jest.fn().mockImplementation(() => mockService);
});

const request = require('supertest');
const { createTestApp } = require('../../test-utils/createTestApp');
const apsRouter = require('../../src/routes/historiaclinica.routes/atencion.routes');

const app = createTestApp('/api/fcc/atencion', apsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/fcc/atencion', () => {
  test('retorna lista de atenciones', async () => {
    mockService.find.mockResolvedValue([{ id_aps: 1 }]);
    const res = await request(app).get('/api/fcc/atencion');
    expect(res.status).toBe(200);
  });
});

describe('GET /api/fcc/atencion/:id', () => {
  test('retorna atencion por ID', async () => {
    mockService.findById.mockResolvedValue({ id_aps: 1, motivo: 'Control' });
    const res = await request(app).get('/api/fcc/atencion/1');
    expect(res.status).toBe(200);
    expect(res.body.id_aps).toBe(1);
  });

  test('retorna 404 si no existe', async () => {
    mockService.findById.mockResolvedValue(null);
    const res = await request(app).get('/api/fcc/atencion/999');
    expect(res.status).toBe(404);
  });
});

describe('GET /api/fcc/atencion/historia/:idHistoria', () => {
  test('retorna atenciones por historia', async () => {
    mockService.findByHistoria.mockResolvedValue([{ id_aps: 1 }]);
    const res = await request(app).get('/api/fcc/atencion/historia/5');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  test('retorna 404 si no hay atenciones', async () => {
    mockService.findByHistoria.mockResolvedValue(null);
    const res = await request(app).get('/api/fcc/atencion/historia/999');
    expect(res.status).toBe(404);
  });
});

describe('GET /api/fcc/atencion/first/:idHistoria', () => {
  test('retorna la primera atencion', async () => {
    mockService.findFirstByHistoria.mockResolvedValue({ id_aps: 1, fecha_atencion: '2024-01-01' });
    const res = await request(app).get('/api/fcc/atencion/first/5');
    expect(res.status).toBe(200);
    expect(res.body.id_aps).toBe(1);
  });

  test('retorna 404 si no hay atenciones', async () => {
    mockService.findFirstByHistoria.mockResolvedValue(null);
    const res = await request(app).get('/api/fcc/atencion/first/999');
    expect(res.status).toBe(404);
  });
});

describe('GET /api/fcc/atencion/last/:idHistoria', () => {
  test('retorna la ultima atencion del array', async () => {
    mockService.findByHistoria.mockResolvedValue([
      { id_aps: 1, fecha_atencion: '2024-01-01' },
      { id_aps: 2, fecha_atencion: '2024-06-01' },
    ]);
    const res = await request(app).get('/api/fcc/atencion/last/5');
    expect(res.status).toBe(200);
    expect(res.body.id_aps).toBe(2);
  });
});

describe('POST /api/fcc/atencion', () => {
  test('crea atencion con campos JSON', async () => {
    const data = {
      id_historia: 1,
      revision_actual_sistema: JSON.stringify({ neurologico: 'Normal' }),
      diagnostico: JSON.stringify({ principal: 'Hipertensión' }),
    };
    mockService.create.mockResolvedValue({ id_aps: 1, ...data });

    const res = await request(app).post('/api/fcc/atencion').send(data);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('crea atencion sin campos JSON', async () => {
    mockService.create.mockResolvedValue({ id_aps: 1 });
    const res = await request(app).post('/api/fcc/atencion').send({ id_historia: 1 });
    expect(res.status).toBe(200);
  });
});

describe('PUT /api/fcc/atencion/:id', () => {
  test('actualiza atencion', async () => {
    mockService.update.mockResolvedValue([1]);
    const res = await request(app).put('/api/fcc/atencion/1').send({ motivo: 'Actualizado' });
    expect(res.status).toBe(200);
  });
});

describe('DELETE /api/fcc/atencion/:id', () => {
  test('elimina atencion', async () => {
    mockService.delete.mockResolvedValue({ deleted: true });
    const res = await request(app).delete('/api/fcc/atencion/1');
    expect(res.status).toBe(200);
    expect(res.body.deleted).toBe(true);
  });
});
