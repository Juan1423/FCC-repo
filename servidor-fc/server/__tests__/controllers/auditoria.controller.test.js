const mockService = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

jest.mock('../../src/services/historiaclinica.services/auditoria.service', () => {
  return jest.fn().mockImplementation(() => mockService);
});

const request = require('supertest');
const { createTestApp } = require('../../test-utils/createTestApp');
const auditoriaRouter = require('../../src/routes/historiaclinica.routes/auditoria.routes');

const app = createTestApp('/api/fcc/auditoria', auditoriaRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/fcc/auditoria', () => {
  test('retorna lista de auditorias', async () => {
    mockService.find.mockResolvedValue([{ id_auditoria: 1 }]);
    const res = await request(app).get('/api/fcc/auditoria');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});

describe('GET /api/fcc/auditoria/:id', () => {
  test('retorna auditoria por ID', async () => {
    mockService.findOne.mockResolvedValue({ id_auditoria: 1, operacion: 'CREATE' });
    const res = await request(app).get('/api/fcc/auditoria/1');
    expect(res.status).toBe(200);
    expect(res.body.operacion).toBe('CREATE');
  });
});

describe('POST /api/fcc/auditoria', () => {
  test('crea auditoria con todos los campos requeridos', async () => {
    const data = { id_usuario: 1, modulo: 'Pacientes', operacion: 'CREATE', detalle: 'Creó paciente' };
    mockService.create.mockResolvedValue({ id_auditoria: 1, ...data });

    const res = await request(app).post('/api/fcc/auditoria').send(data);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('rechaza auditoria sin campos requeridos', async () => {
    const res = await request(app).post('/api/fcc/auditoria').send({ modulo: 'Test' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Faltan campos requeridos');
  });

  test('rechaza auditoria con body vacío', async () => {
    const res = await request(app).post('/api/fcc/auditoria').send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('PUT /api/fcc/auditoria/:id', () => {
  test('actualiza auditoria', async () => {
    mockService.update.mockResolvedValue([1]);
    const res = await request(app).put('/api/fcc/auditoria/1').send({ detalle: 'Actualizado' });
    expect(res.status).toBe(200);
  });
});

describe('DELETE /api/fcc/auditoria/:id', () => {
  test('elimina auditoria', async () => {
    mockService.delete.mockResolvedValue({ deleted: true });
    const res = await request(app).delete('/api/fcc/auditoria/1');
    expect(res.status).toBe(200);
    expect(res.body.deleted).toBe(true);
  });
});
