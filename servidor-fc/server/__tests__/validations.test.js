const { validarTelefono, validarCorreoElectronico } = require('../src/utils/validations');

describe('validarTelefono', () => {
  test('teléfono válido de 10 dígitos no lanza error', () => {
    expect(() => validarTelefono('0999999999')).not.toThrow();
  });

  test('teléfono de menos de 10 dígitos lanza error', () => {
    expect(() => validarTelefono('099999999')).toThrow('El formato del teléfono no es válido');
  });

  test('teléfono con letras lanza error', () => {
    expect(() => validarTelefono('09999999aa')).toThrow('El formato del teléfono no es válido');
  });

  test('teléfono vacío lanza error', () => {
    expect(() => validarTelefono('')).toThrow('El formato del teléfono no es válido');
  });

  test('teléfono nulo lanza error', () => {
    expect(() => validarTelefono(null)).toThrow('El formato del teléfono no es válido');
  });
});

describe('validarCorreoElectronico', () => {
  test('email válido no lanza error', () => {
    expect(() => validarCorreoElectronico('test@example.com')).not.toThrow();
  });

  test('email con dominio válido no lanza error', () => {
    expect(() => validarCorreoElectronico('user@domain.co')).not.toThrow();
  });

  test('email sin @ lanza error', () => {
    expect(() => validarCorreoElectronico('testexample.com')).toThrow('El formato del correo electrónico no es válido');
  });

  test('email sin dominio lanza error', () => {
    expect(() => validarCorreoElectronico('test@')).toThrow('El formato del correo electrónico no es válido');
  });

  test('email vacío lanza error', () => {
    expect(() => validarCorreoElectronico('')).toThrow('El formato del correo electrónico no es válido');
  });

  test('email nulo lanza error', () => {
    expect(() => validarCorreoElectronico(null)).toThrow('El formato del correo electrónico no es válido');
  });
});
