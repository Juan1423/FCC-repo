jest.mock('dotenv', () => ({ config: jest.fn() }));
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../src/libs/sequelize', () => ({
  models: {
    Usuario: {
      findAll: jest.fn(),
      findByPk: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
    },
  },
}));

process.env.JWT_SECRET = 'test-secret';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UsuarioService = require('../src/services/historiaclinica.services/usuario.service');
const { models } = require('../src/libs/sequelize');

const service = new UsuarioService();

beforeEach(() => {
  jest.clearAllMocks();
});

describe('UsuarioService.find', () => {
  test('retorna todos los usuarios', async () => {
    models.Usuario.findAll.mockResolvedValue([{ id_usuario: 1 }]);
    expect(await service.find()).toHaveLength(1);
  });
});

describe('UsuarioService.findOne', () => {
  test('retorna usuario por ID', async () => {
    models.Usuario.findByPk.mockResolvedValue({ id_usuario: 1 });
    expect(await service.findOne(1)).toEqual({ id_usuario: 1 });
  });
});

describe('UsuarioService.encryptPassword', () => {
  test('hashea la contraseña con bcrypt', async () => {
    bcrypt.hashSync.mockReturnValue('hashed-password');
    const result = await service.encryptPassword('mypassword');
    expect(bcrypt.hashSync).toHaveBeenCalledWith('mypassword', 10);
    expect(result).toBe('hashed-password');
  });
});

describe('UsuarioService.login', () => {
  const mockUser = {
    id_usuario: 1,
    correo_usuario: 'test@test.com',
    password_usuario: 'hashed-password',
    rol_usuario: 'admin',
  };

  test('login exitoso retorna token y datos', async () => {
    models.Usuario.findOne.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('fake-jwt-token');

    const result = await service.login('test@test.com', 'password');

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockUser);
    expect(result.token).toBe('fake-jwt-token');
    expect(jwt.sign).toHaveBeenCalledWith(
      { user: 1, rol: 'admin' },
      'test-secret',
      { expiresIn: '23h' }
    );
  });

  test('login con email incorrecto retorna error', async () => {
    models.Usuario.findOne.mockResolvedValue(null);

    const result = await service.login('noexiste@test.com', 'password');

    expect(result.success).toBe(false);
    expect(result.message).toBe('Usuario no encontrado');
  });

  test('login con contraseña incorrecta retorna error', async () => {
    models.Usuario.findOne.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(false);

    const result = await service.login('test@test.com', 'wrong-password');

    expect(result.success).toBe(false);
    expect(result.message).toBe('Contraseña incorrecta');
  });
});

describe('UsuarioService.changePassword', () => {
  const mockUser = {
    id_usuario: 1,
    password_usuario: 'old-hashed',
    update: jest.fn().mockResolvedValue([1]),
  };

  test('cambio exitoso', async () => {
    models.Usuario.findByPk.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(true);
    bcrypt.hashSync.mockReturnValue('new-hashed');

    const result = await service.changePassword(1, 'old-password', 'new-password');

    expect(result.success).toBe(true);
    expect(result.message).toBe('Contraseña actualizada correctamente');
    expect(mockUser.update).toHaveBeenCalledWith({ password_usuario: 'new-hashed' });
  });

  test('error si usuario no existe', async () => {
    models.Usuario.findByPk.mockResolvedValue(null);

    const result = await service.changePassword(999, 'old', 'new');

    expect(result.success).toBe(false);
    expect(result.message).toBe('Usuario no encontrado');
  });

  test('error si contraseña antigua incorrecta', async () => {
    models.Usuario.findByPk.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(false);

    const result = await service.changePassword(1, 'wrong-old', 'new');

    expect(result.success).toBe(false);
    expect(result.message).toBe('Contraseña incorrecta');
  });
});

describe('UsuarioService CRUD', () => {
  test('create() crea usuario', async () => {
    const data = { nombre_usuario: 'Test' };
    models.Usuario.create.mockResolvedValue({ id_usuario: 1, ...data });
    expect(await service.create(data)).toEqual({ id_usuario: 1, ...data });
  });

  test('update() actualiza usuario', async () => {
    const instance = { update: jest.fn().mockResolvedValue([1]) };
    models.Usuario.findByPk.mockResolvedValue(instance);
    await service.update(1, { nombre_usuario: 'Updated' });
    expect(instance.update).toHaveBeenCalledWith({ nombre_usuario: 'Updated' });
  });

  test('delete() elimina usuario', async () => {
    const instance = { destroy: jest.fn().mockResolvedValue(true) };
    models.Usuario.findByPk.mockResolvedValue(instance);
    expect(await service.delete(1)).toEqual({ deleted: true });
  });
});
