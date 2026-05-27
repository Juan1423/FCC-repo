import axios from 'axios';
import {
  getExamenes,
  getExamen,
  createExamen,
  updateExamen,
  deleteExamen,
  getExamenByHistoria,
} from '../examenServices';
import { logAuditAction } from '../auditoriaServices';

jest.mock('axios');
jest.mock('../auditoriaServices', () => ({
  logAuditAction: jest.fn().mockResolvedValue(undefined),
}));

const API_URL = 'http://localhost:5000/api/fcc';

describe('examenServices', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getExamenes', () => {
    it('calls GET /examen', async () => {
      axios.get.mockResolvedValue({ data: [{ id: 1 }] });
      const result = await getExamenes();
      expect(axios.get).toHaveBeenCalledWith(`${API_URL}/examen`);
      expect(result).toEqual([{ id: 1 }]);
    });

    it('throws on error', async () => {
      axios.get.mockRejectedValue(new Error('Error'));
      await expect(getExamenes()).rejects.toThrow('Error');
    });
  });

  describe('getExamen', () => {
    it('calls GET /examen/:id', async () => {
      axios.get.mockResolvedValue({ data: { id: 1, tipo: 'Rayos X' } });
      const result = await getExamen(1);
      expect(axios.get).toHaveBeenCalledWith(`${API_URL}/examen/1`);
      expect(result).toEqual({ id: 1, tipo: 'Rayos X' });
    });

    it('throws on error', async () => {
      axios.get.mockRejectedValue(new Error('Not found'));
      await expect(getExamen(999)).rejects.toThrow('Not found');
    });
  });

  describe('createExamen', () => {
    it('calls POST /examen with multipart/form-data and logs audit', async () => {
      const formData = new FormData();
      axios.post.mockResolvedValue({ data: { id: 1 } });

      const result = await createExamen(formData);

      expect(axios.post).toHaveBeenCalledWith(
        `${API_URL}/examen`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      expect(logAuditAction).toHaveBeenCalledWith('CREAR_EXAMEN', { newData: formData });
      expect(result).toEqual({ id: 1 });
    });

    it('throws on error', async () => {
      axios.post.mockRejectedValue(new Error('Error'));
      await expect(createExamen(new FormData())).rejects.toThrow('Error');
    });
  });

  describe('updateExamen', () => {
    it('calls PUT /examen/:id with multipart/form-data and logs audit', async () => {
      const formData = new FormData();
      axios.put.mockResolvedValue({ data: { id: 1 } });

      const result = await updateExamen(1, formData);

      expect(axios.put).toHaveBeenCalledWith(
        `${API_URL}/examen/1`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      expect(logAuditAction).toHaveBeenCalledWith('ACTUALIZAR_EXAMEN', {
        examenId: 1,
        updatedData: formData,
      });
      expect(result).toEqual({ id: 1 });
    });

    it('throws on error', async () => {
      axios.put.mockRejectedValue(new Error('Error'));
      await expect(updateExamen(1, new FormData())).rejects.toThrow('Error');
    });
  });

  describe('deleteExamen', () => {
    it('calls DELETE /examen/:id and logs audit', async () => {
      axios.delete.mockResolvedValue({ data: { deleted: true } });

      const result = await deleteExamen(1);

      expect(axios.delete).toHaveBeenCalledWith(`${API_URL}/examen/1`);
      expect(logAuditAction).toHaveBeenCalledWith('ELIMINAR_EXAMEN', { examenId: 1 });
      expect(result).toEqual({ deleted: true });
    });

    it('throws on error', async () => {
      axios.delete.mockRejectedValue(new Error('Error'));
      await expect(deleteExamen(1)).rejects.toThrow('Error');
    });
  });

  describe('getExamenByHistoria', () => {
    it('calls GET /examen/historia/:historiaId', async () => {
      axios.get.mockResolvedValue({ data: [{ id: 1, historia_id: 5 }] });

      const result = await getExamenByHistoria(5);

      expect(axios.get).toHaveBeenCalledWith(`${API_URL}/examen/historia/5`);
      expect(result).toEqual([{ id: 1, historia_id: 5 }]);
    });

    it('throws on error', async () => {
      axios.get.mockRejectedValue(new Error('Not found'));
      await expect(getExamenByHistoria(999)).rejects.toThrow('Not found');
    });
  });
});
