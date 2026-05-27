import axios from 'axios';
import {
  getTerapias,
  createTerapia,
  updateTerapia,
  getTerapiaByPaciente,
  getTerapia,
  getLastTerapia,
  deleteTerapia,
} from '../terapia';
import { logAuditAction } from '../auditoriaServices';

jest.mock('axios');
jest.mock('../auditoriaServices', () => ({
  logAuditAction: jest.fn().mockResolvedValue(undefined),
}));

const API_URL = 'http://localhost:5000/api/fcc';

describe('terapia service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTerapias', () => {
    it('calls GET /terapias/:pacienteId', async () => {
      const mockData = [{ id: 1 }];
      axios.get.mockResolvedValue({ data: mockData });

      const result = await getTerapias(1);

      expect(axios.get).toHaveBeenCalledWith(`${API_URL}/terapias/1`);
      expect(result).toEqual(mockData);
    });

    it('throws on error', async () => {
      axios.get.mockRejectedValue(new Error('Not found'));
      await expect(getTerapias(999)).rejects.toThrow('Not found');
    });
  });

  describe('createTerapia', () => {
    it('calls POST /terapias with multipart/form-data and logs audit', async () => {
      const formData = new FormData();
      formData.append('descripcion', 'Terapia 1');
      axios.post.mockResolvedValue({ data: { id: 1 } });

      const result = await createTerapia(formData);

      expect(axios.post).toHaveBeenCalledWith(
        `${API_URL}/terapias`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      expect(logAuditAction).toHaveBeenCalledWith('CREAR_TERAPIA', { newData: formData });
      expect(result).toEqual({ id: 1 });
    });

    it('throws on error', async () => {
      axios.post.mockRejectedValue(new Error('Error'));
      await expect(createTerapia(new FormData())).rejects.toThrow('Error');
    });
  });

  describe('updateTerapia', () => {
    it('calls PUT /terapias/:id with multipart/form-data and logs audit', async () => {
      const formData = new FormData();
      axios.put.mockResolvedValue({ data: { id: 1 } });

      const result = await updateTerapia(1, formData);

      expect(axios.put).toHaveBeenCalledWith(
        `${API_URL}/terapias/1`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      expect(logAuditAction).toHaveBeenCalledWith('ACTUALIZAR_TERAPIA', {
        terapiaId: 1,
        updatedData: formData,
      });
      expect(result).toEqual({ id: 1 });
    });

    it('throws on error', async () => {
      axios.put.mockRejectedValue(new Error('Error'));
      await expect(updateTerapia(1, new FormData())).rejects.toThrow('Error');
    });
  });

  describe('getTerapiaByPaciente', () => {
    it('calls GET /terapias/paciente/:pacienteId', async () => {
      axios.get.mockResolvedValue({ data: [{ id: 1 }] });

      const result = await getTerapiaByPaciente(1);

      expect(axios.get).toHaveBeenCalledWith(`${API_URL}/terapias/paciente/1`);
      expect(result).toEqual([{ id: 1 }]);
    });
  });

  describe('getTerapia', () => {
    it('calls GET /terapias/:id', async () => {
      axios.get.mockResolvedValue({ data: { id: 1 } });

      const result = await getTerapia(1);

      expect(axios.get).toHaveBeenCalledWith(`${API_URL}/terapias/1`);
      expect(result).toEqual({ id: 1 });
    });
  });

  describe('getLastTerapia', () => {
    it('calls GET /terapias/last/:pacienteId', async () => {
      axios.get.mockResolvedValue({ data: { id: 5 } });

      const result = await getLastTerapia(1);

      expect(axios.get).toHaveBeenCalledWith(`${API_URL}/terapias/last/1`);
      expect(result).toEqual({ id: 5 });
    });
  });

  describe('deleteTerapia', () => {
    it('calls DELETE /terapias/:id and logs audit', async () => {
      axios.delete.mockResolvedValue({ data: { deleted: true } });

      const result = await deleteTerapia(1);

      expect(axios.delete).toHaveBeenCalledWith(`${API_URL}/terapias/1`);
      expect(logAuditAction).toHaveBeenCalledWith('ELIMINAR_TERAPIA', { terapiaId: 1 });
      expect(result).toEqual({ deleted: true });
    });

    it('throws on error', async () => {
      axios.delete.mockRejectedValue(new Error('Forbidden'));
      await expect(deleteTerapia(1)).rejects.toThrow('Forbidden');
    });
  });
});
