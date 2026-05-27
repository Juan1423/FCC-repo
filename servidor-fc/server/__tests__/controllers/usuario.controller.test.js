const mockService = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  login: jest.fn(),
  encryptPassword: jest.fn(),
};

jest.mock('../../src/services/historiaclinica.services/usuario.service', () => {
  return jest.fn().mockImplementation(() => mockService);
});

const request = require('supertest');
const { createTestApp } = require('../../test-utils/createTestApp');
const usuarioRouter = require('../../src/routes/historiaclinica.routes/usuario.routes');

const app = createTestApp('/api/fcc/users', usuarioRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/fcc/users', () => {
  test('retorna lista de usuarios', async () => {
    mockService.find.mockResolvedValue([{ id_usuario: 1, nombre_usuario: 'Admin' }]);
    const res = await request(app).get('/api/fcc/users');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});

describe('GET /api/fcc/users/:id', () => {
  test('retorna usuario por ID', async () => {
    mockService.findOne.mockResolvedValue({ id_usuario: 1 });
    const res = await request(app).get('/api/fcc/users/1');
    expect(res.status).toBe(200);
    expect(res.body.id_usuario).toBe(1);
  });
});

describe('POST /api/fcc/users/login', () => {
  test('login exitoso', async () => {
    mockService.login.mockResolvedValue({ success: true, token: 'jwt-token', data: { id: 1 } });
    const res = await request(app)
      .post('/api/fcc/users/login')
      .send({ correo_usuario: 'admin@test.com', password_usuario: '123456' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBe('jwt-token');
  });

  test('login con credenciales inválidas', async () => {
    mockService.login.mockResolvedValue({ success: false, message: 'Contraseña incorrecta' });
    const res = await request(app)
      .post('/api/fcc/users/login')
      .send({ correo_usuario: 'admin@test.com', password_usuario: 'wrong' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(false);
  });

  test('login retorna 500 si el service falla', async () => {
    mockService.login.mockRejectedValue(new Error('Error'));
    const res = await request(app)
      .post('/api/fcc/users/login')
      .send({ correo_usuario: 'test@test.com', password_usuario: '123456' });
    expect(res.status).toBe(500);
  });
});

describe('POST /api/fcc/users', () => {
  test('crea usuario con password encriptada', async () => {
    mockService.encryptPassword.mockResolvedValue('hashed-password');
    mockService.create.mockResolvedValue({ id_usuario: 1, nombre_usuario: 'Nuevo', password_usuario: 'hashed-password' });

    const res = await request(app)
      .post('/api/fcc/users')
      .send({ nombre_usuario: 'Nuevo', password_usuario: 'plain123' });

    expect(mockService.encryptPassword).toHaveBeenCalledWith('plain123');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.password_usuario).toBe('hashed-password');
  });

  test('create retorna 500 si falla', async () => {
    mockService.encryptPassword.mockRejectedValue(new Error('Error'));
    const res = await request(app)
      .post('/api/fcc/users')
      .send({ nombre_usuario: 'Nuevo', password_usuario: '123' });
    expect(res.status).toBe(500);
  });
});

describe('PUT /api/fcc/users/:id', () => {
  test('actualiza usuario', async () => {
    mockService.update.mockResolvedValue([1]);
    const res = await request(app).put('/api/fcc/users/1').send({ nombre_usuario: 'Updated' });
    expect(res.status).toBe(200);
  });
});

describe('DELETE /api/fcc/users/:id', () => {
  test('elimina usuario', async () => {
    mockService.delete.mockResolvedValue({ deleted: true });
    const res = await request(app).delete('/api/fcc/users/1');
    expect(res.status).toBe(200);
    expect(res.body.deleted).toBe(true);
  });
});
