const mockService = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

jest.mock('../../src/services/historiaclinica.services/historia.service', () => {
  return jest.fn().mockImplementation(() => mockService);
});

const request = require('supertest');
const { createTestApp } = require('../../test-utils/createTestApp');
const historiaRouter = require('../../src/routes/historiaclinica.routes/historia.routes');

const app = createTestApp('/api/fcc/historia', historiaRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/fcc/historia', () => {
  test('retorna lista de historias', async () => {
    mockService.find.mockResolvedValue([{ id_historia: 1 }]);
    const res = await request(app).get('/api/fcc/historia');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});

describe('GET /api/fcc/historia/:id', () => {
  test('retorna historia por ID', async () => {
    mockService.findOne.mockResolvedValue({ id_historia: 1 });
    const res = await request(app).get('/api/fcc/historia/1');
    expect(res.status).toBe(200);
    expect(res.body.id_historia).toBe(1);
  });
});

describe('POST /api/fcc/historia', () => {
  const baseData = {
    id_paciente: 1,
    motivo_consulta_historia: 'Dolor de cabeza',
  };

  test('crea historia con datos básicos', async () => {
    mockService.create.mockResolvedValue({ id_historia: 1, ...baseData });

    const res = await request(app).post('/api/fcc/historia').send(baseData);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('convierte campos JSON string a objetos', async () => {
    const data = {
      ...baseData,
      ant_familiares_materno: JSON.stringify({ diabetes: true, hipertension: false }),
      alergias: JSON.stringify(['penicilina', 'aspirina']),
    };
    mockService.create.mockImplementation(async (body) => {
      expect(typeof body.ant_familiares_materno).toBe('object');
      expect(Array.isArray(body.alergias)).toBe(true);
      return { id_historia: 1, ...body };
    });

    const res = await request(app).post('/api/fcc/historia').send(data);

    expect(res.status).toBe(200);
  });

  test('convierte seguro_social string a booleano', async () => {
    const data = { ...baseData, seguro_social: 'true' };
    mockService.create.mockImplementation(async (body) => {
      expect(body.seguro_social).toBe(true);
      return { id_historia: 1, ...body };
    });

    const res = await request(app).post('/api/fcc/historia').send(data);

    expect(res.status).toBe(200);
  });

  test('convierte fecha_historia string a Date', async () => {
    const data = { ...baseData, fecha_historia: '2024-06-15' };
    mockService.create.mockImplementation(async (body) => {
      expect(body.fecha_historia instanceof Date).toBe(true);
      return { id_historia: 1, ...body };
    });

    const res = await request(app).post('/api/fcc/historia').send(data);

    expect(res.status).toBe(200);
  });

  test('setea campos JSON vacíos como objetos vacíos', async () => {
    const data = { ...baseData };
    mockService.create.mockImplementation(async (body) => {
      expect(body.ant_familiares_materno).toEqual({});
      expect(body.ant_prenatales).toEqual({});
      expect(body.alergias).toEqual([]);
      return { id_historia: 1, ...body };
    });

    const res = await request(app).post('/api/fcc/historia').send(data);

    expect(res.status).toBe(200);
  });
});

describe('PUT /api/fcc/historia/:id', () => {
  test('actualiza historia existente', async () => {
    mockService.findOne.mockResolvedValue({ id_historia: 1 });
    mockService.update.mockResolvedValue([1]);

    const res = await request(app)
      .put('/api/fcc/historia/1')
      .send({ motivo_consulta_historia: 'Actualizado' });

    expect(res.status).toBe(200);
  });

  test('retorna 404 si la historia no existe', async () => {
    mockService.findOne.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/fcc/historia/999')
      .send({ motivo_consulta_historia: 'Test' });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe('DELETE /api/fcc/historia/:id', () => {
  test('elimina historia', async () => {
    mockService.delete.mockResolvedValue({ deleted: true });
    const res = await request(app).delete('/api/fcc/historia/1');
    expect(res.status).toBe(200);
    expect(res.body.deleted).toBe(true);
  });
});
