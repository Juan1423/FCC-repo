jest.mock('jsonwebtoken');
jest.mock('../src/libs/sequelize', () => ({
  models: {
    Seguridad: {
      findOne: jest.fn(),
    },
  },
}));

const jwt = require('jsonwebtoken');
const { verifyToken, verifyTokenAdmin, verifyTokenOrVisitor } = require('../src/middleware/verifyToken');
const { models } = require('../src/libs/sequelize');

process.env.JWT_SECRET = 'test-secret';

const mockReq = (overrides = {}) => ({
  headers: { token: 'valid-token' },
  ip: '127.0.0.1',
  connection: { remoteAddress: '127.0.0.1' },
  ...overrides,
});

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

beforeEach(() => {
  jest.clearAllMocks();
  models.Seguridad.findOne.mockResolvedValue(null);
});

describe('verifyToken', () => {
  test('llama a next() si el token es válido', async () => {
    jwt.verify.mockImplementation((token, secret, cb) => cb(null, { id: 1, rol: 'admin' }));
    const req = mockReq();
    const res = mockRes();
    const next = jest.fn();

    await verifyToken(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({ id: 1, rol: 'admin' });
  });

  test('responde 401 si el token es inválido', async () => {
    jwt.verify.mockImplementation((token, secret, cb) => cb(new Error('Token inválido'), null));
    const req = mockReq();
    const res = mockRes();
    const next = jest.fn();

    await verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ mensaje: 'Token inválido' });
    expect(next).not.toHaveBeenCalled();
  });

  test('responde 400 si no se envía token', async () => {
    const req = mockReq({ headers: {} });
    const res = mockRes();
    const next = jest.fn();

    await verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ mensaje: 'Verificación de token errónea, debes enviar un token' });
    expect(next).not.toHaveBeenCalled();
  });

  test('responde 403 si la IP está bloqueada', async () => {
    models.Seguridad.findOne.mockResolvedValue({ id: 1, action: 'block_ip', ip_address: '127.0.0.1' });
    const req = mockReq();
    const res = mockRes();
    const next = jest.fn();

    await verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ mensaje: 'Acceso denegado desde esta IP' });
    expect(next).not.toHaveBeenCalled();
  });
});

describe('verifyTokenAdmin', () => {
  test('llama a next() si el token es admin', async () => {
    jwt.verify.mockImplementation((token, secret, cb) => cb(null, { id: 1, rol: 'admin' }));
    const req = mockReq();
    const res = mockRes();
    const next = jest.fn();

    await verifyTokenAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test('responde 400 si el rol no es admin', async () => {
    jwt.verify.mockImplementation((token, secret, cb) => cb(null, { id: 1, rol: 'user' }));
    const req = mockReq();
    const res = mockRes();
    const next = jest.fn();

    await verifyTokenAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ mensaje: 'No tienes permisos para realizar esta acción' });
    expect(next).not.toHaveBeenCalled();
  });
});

describe('verifyTokenOrVisitor', () => {
  test('acepta token válido', async () => {
    jwt.verify.mockImplementation((token, secret, cb) => cb(null, { id: 1, nombre: 'Test' }));
    const req = mockReq();
    const res = mockRes();
    const next = jest.fn();

    await verifyTokenOrVisitor(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.isVisitor).toBe(false);
  });

  test('acepta visitor-id sin token', async () => {
    const req = mockReq({
      headers: { 'visitor-id': 'abc-123' },
    });
    delete req.headers.token;
    const res = mockRes();
    const next = jest.fn();

    await verifyTokenOrVisitor(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.isVisitor).toBe(true);
    expect(req.user.visitorId).toBe('abc-123');
  });

  test('responde 401 sin token ni visitor-id', async () => {
    const req = mockReq({ headers: {} });
    const res = mockRes();
    const next = jest.fn();

    await verifyTokenOrVisitor(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ mensaje: 'Se requiere token o ID de visitante' });
    expect(next).not.toHaveBeenCalled();
  });
});
