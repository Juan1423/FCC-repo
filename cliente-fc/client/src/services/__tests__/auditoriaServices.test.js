import axios from 'axios';
import {
  logAuditAction,
  getAuditorias,
  getAuditoria,
  updateAuditoria,
  deleteAuditoria,
} from '../auditoriaServices';

jest.mock('axios');

const API_URL = 'http://localhost:5000/api/fcc';

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

describe('auditoriaServices', () => {
  describe('logAuditAction', () => {
    beforeEach(() => {
      localStorage.setItem('user', JSON.stringify({ id_usuario: 42 }));
    });

    afterEach(() => {
      localStorage.clear();
    });

    it('posts audit data with formatted module', async () => {
      axios.post.mockResolvedValue({ data: { id: 1 } });

      await logAuditAction('CREAR_PACIENTE', { pacienteId: 1 });

      expect(axios.post).toHaveBeenCalledWith(`${API_URL}/auditoria`, expect.objectContaining({
        id_usuario: 42,
        modulo: 'Paciente',
        operacion: 'CREAR_PACIENTE',
        detalle: JSON.stringify({ pacienteId: 1 }),
      }));
    });

    it('does not throw when audit fails (non-blocking)', async () => {
      axios.post.mockRejectedValue(new Error('Network error'));

      await expect(logAuditAction('CREAR_PACIENTE', {})).resolves.toBeUndefined();
    });

    it('does not post when no user is logged in', async () => {
      localStorage.clear();

      await logAuditAction('CREAR_PACIENTE', {});

      expect(axios.post).not.toHaveBeenCalled();
    });

    it('handles operation string with single word as General module', async () => {
      localStorage.setItem('user', JSON.stringify({ id_usuario: 1 }));
      axios.post.mockResolvedValue({ data: {} });

      await logAuditAction('LOGIN', { userId: 1 });

      expect(axios.post).toHaveBeenCalledWith(`${API_URL}/auditoria`, expect.objectContaining({
        modulo: 'General',
      }));
    });
  });

  describe('getAuditorias', () => {
    it('calls GET /auditoria without filters', async () => {
      axios.get.mockResolvedValue({ data: [{ id: 1 }] });

      const result = await getAuditorias();

      expect(axios.get).toHaveBeenCalledWith(`${API_URL}/auditoria`);
      expect(result).toEqual([{ id: 1 }]);
    });

    it('appends query params when filters are provided', async () => {
      axios.get.mockResolvedValue({ data: [] });

      await getAuditorias({ modulo: 'Paciente', operacion: 'CREAR_PACIENTE' });

      expect(axios.get).toHaveBeenCalledWith(
        `${API_URL}/auditoria?modulo=Paciente&operacion=CREAR_PACIENTE`
      );
    });

    it('throws on error', async () => {
      axios.get.mockRejectedValue(new Error('Error'));
      await expect(getAuditorias()).rejects.toThrow('Error');
    });
  });

  describe('getAuditoria', () => {
    it('calls GET /auditoria/:id', async () => {
      axios.get.mockResolvedValue({ data: { id: 1 } });

      const result = await getAuditoria(1);

      expect(axios.get).toHaveBeenCalledWith(`${API_URL}/auditoria/1`);
      expect(result).toEqual({ id: 1 });
    });
  });

  describe('updateAuditoria', () => {
    it('calls PUT /auditoria/:id', async () => {
      axios.put.mockResolvedValue({ data: { id: 1, operacion: 'UPDATED' } });

      const result = await updateAuditoria(1, { operacion: 'UPDATED' });

      expect(axios.put).toHaveBeenCalledWith(`${API_URL}/auditoria/1`, { operacion: 'UPDATED' });
      expect(result).toEqual({ id: 1, operacion: 'UPDATED' });
    });
  });

  describe('deleteAuditoria', () => {
    it('calls DELETE /auditoria/:id', async () => {
      axios.delete.mockResolvedValue({ data: { deleted: true } });

      const result = await deleteAuditoria(1);

      expect(axios.delete).toHaveBeenCalledWith(`${API_URL}/auditoria/1`);
      expect(result).toEqual({ deleted: true });
    });
  });
});
