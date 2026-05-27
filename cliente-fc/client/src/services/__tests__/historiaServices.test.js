import axios from 'axios';
import {
  getHistoria,
  getHistorias,
  getHistoriaFile,
  createHistoria,
  updateHistoria,
} from '../historiaServices';
import { logAuditAction } from '../auditoriaServices';

jest.mock('axios');
jest.mock('../auditoriaServices', () => ({
  logAuditAction: jest.fn().mockResolvedValue(undefined),
}));

const API_URL = 'http://localhost:5000/api/fcc';

describe('historiaServices', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getHistoria', () => {
    it('calls GET /historia/:id', async () => {
      const mockData = { id: 1, paciente_id: 1 };
      axios.get.mockResolvedValue({ data: mockData });

      const result = await getHistoria(1);

      expect(axios.get).toHaveBeenCalledWith(`${API_URL}/historia/1`);
      expect(result).toEqual(mockData);
    });

    it('throws on error', async () => {
      axios.get.mockRejectedValue(new Error('Not found'));
      await expect(getHistoria(999)).rejects.toThrow('Not found');
    });
  });

  describe('getHistorias', () => {
    it('calls GET /historia', async () => {
      const mockData = [{ id: 1 }, { id: 2 }];
      axios.get.mockResolvedValue({ data: mockData });

      const result = await getHistorias();

      expect(axios.get).toHaveBeenCalledWith(`${API_URL}/historia`);
      expect(result).toEqual(mockData);
    });

    it('throws on error', async () => {
      axios.get.mockRejectedValue(new Error('Network error'));
      await expect(getHistorias()).rejects.toThrow('Network error');
    });
  });

  describe('getHistoriaFile', () => {
    it('calls GET /historia/file/:id with responseType blob', async () => {
      const blob = new Blob(['fake pdf']);
      axios.get.mockResolvedValue({ data: blob });

      const result = await getHistoriaFile(1);

      expect(axios.get).toHaveBeenCalledWith(`${API_URL}/historia/file/1`, {
        responseType: 'blob',
      });
      expect(result).toEqual(blob);
    });

    it('throws on error', async () => {
      axios.get.mockRejectedValue(new Error('File not found'));
      await expect(getHistoriaFile(999)).rejects.toThrow('File not found');
    });
  });

  describe('createHistoria', () => {
    it('calls POST /historia with JSON and logs audit', async () => {
      const data = { paciente_id: 1, descripcion: 'test' };
      axios.post.mockResolvedValue({ data: { id: 1, ...data } });

      const result = await createHistoria(data);

      expect(axios.post).toHaveBeenCalledWith(
        `${API_URL}/historia`,
        data,
        { headers: { 'Content-Type': 'application/json' } }
      );
      expect(logAuditAction).toHaveBeenCalledWith('CREAR_HISTORIA', { newData: data });
      expect(result).toEqual({ id: 1, ...data });
    });

    it('throws on error', async () => {
      axios.post.mockRejectedValue(new Error('Validation error'));
      await expect(createHistoria({})).rejects.toThrow('Validation error');
    });
  });

  describe('updateHistoria', () => {
    it('calls PUT /historia/:id with JSON and logs audit', async () => {
      const data = { descripcion: 'updated' };
      axios.put.mockResolvedValue({ data: { id: 1, ...data } });

      const result = await updateHistoria(1, data);

      expect(axios.put).toHaveBeenCalledWith(
        `${API_URL}/historia/1`,
        data,
        { headers: { 'Content-Type': 'application/json' } }
      );
      expect(logAuditAction).toHaveBeenCalledWith('ACTUALIZAR_HISTORIA', {
        historiaId: 1,
        updatedData: data,
      });
      expect(result).toEqual({ id: 1, ...data });
    });

    it('throws on error', async () => {
      axios.put.mockRejectedValue(new Error('Not found'));
      await expect(updateHistoria(999, {})).rejects.toThrow('Not found');
    });
  });
});
