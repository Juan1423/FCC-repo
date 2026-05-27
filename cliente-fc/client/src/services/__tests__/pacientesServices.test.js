import axios from 'axios';
import {
  getPacientes,
  getPaciente,
  createPaciente,
  updatePaciente,
  deletePaciente,
  deleteLogicalPaciente,
} from '../pacientesServices';
import { logAuditAction } from '../auditoriaServices';

jest.mock('axios');
jest.mock('../auditoriaServices', () => ({
  logAuditAction: jest.fn().mockResolvedValue(undefined),
}));

const API_URL = 'http://localhost:5000/api/fcc';

describe('pacientesServices', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPacientes', () => {
    it('calls GET /paciente and returns data', async () => {
      const mockData = [{ id: 1, nombre: 'Paciente 1' }];
      axios.get.mockResolvedValue({ data: mockData });

      const result = await getPacientes();

      expect(axios.get).toHaveBeenCalledWith(`${API_URL}/paciente`);
      expect(result).toEqual(mockData);
    });

    it('throws on error', async () => {
      const error = new Error('Network error');
      axios.get.mockRejectedValue(error);

      await expect(getPacientes()).rejects.toThrow('Network error');
    });
  });

  describe('getPaciente', () => {
    it('calls GET /paciente/:id and returns data', async () => {
      const mockData = { id: 1, nombre: 'Paciente 1' };
      axios.get.mockResolvedValue({ data: mockData });

      const result = await getPaciente(1);

      expect(axios.get).toHaveBeenCalledWith(`${API_URL}/paciente/1`);
      expect(result).toEqual(mockData);
    });

    it('throws on error', async () => {
      axios.get.mockRejectedValue(new Error('Not found'));

      await expect(getPaciente(999)).rejects.toThrow('Not found');
    });
  });

  describe('createPaciente', () => {
    it('calls POST /paciente with multipart/form-data and logs audit', async () => {
      const formData = new FormData();
      formData.append('nombre', 'Nuevo');
      const mockResponse = { id: 2, nombre: 'Nuevo' };
      axios.post.mockResolvedValue({ data: mockResponse });

      const result = await createPaciente(formData);

      expect(axios.post).toHaveBeenCalledWith(
        `${API_URL}/paciente`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      expect(logAuditAction).toHaveBeenCalledWith('CREAR_PACIENTE', { newData: formData });
      expect(result).toEqual(mockResponse);
    });

    it('throws on error', async () => {
      axios.post.mockRejectedValue(new Error('Validation error'));

      await expect(createPaciente(new FormData())).rejects.toThrow('Validation error');
    });
  });

  describe('updatePaciente', () => {
    it('calls PUT /paciente/:id with multipart/form-data, logs audit, returns response on 200', async () => {
      const formData = new FormData();
      formData.append('nombre', 'Actualizado');
      const mockResponse = { id: 1, nombre: 'Actualizado' };
      axios.put.mockResolvedValue({ status: 200, data: mockResponse });

      const result = await updatePaciente(1, formData);

      expect(axios.put).toHaveBeenCalledWith(
        `${API_URL}/paciente/1`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      expect(logAuditAction).toHaveBeenCalledWith('ACTUALIZAR_PACIENTE', {
        pacienteId: 1,
        updatedData: formData,
      });
      expect(result).toEqual({ status: 200, data: mockResponse });
    });

    it('throws when response status is not 200', async () => {
      axios.put.mockResolvedValue({ status: 400, data: { message: 'Bad request' } });

      await expect(updatePaciente(1, new FormData())).rejects.toThrow('Bad request');
    });

    it('throws on network error', async () => {
      axios.put.mockRejectedValue(new Error('Network error'));

      await expect(updatePaciente(1, new FormData())).rejects.toThrow('Network error');
    });
  });

  describe('deletePaciente', () => {
    it('calls DELETE /paciente/:id and logs audit', async () => {
      axios.delete.mockResolvedValue({ data: { deleted: true } });

      const result = await deletePaciente(1);

      expect(axios.delete).toHaveBeenCalledWith(`${API_URL}/paciente/1`);
      expect(logAuditAction).toHaveBeenCalledWith('ELIMINAR_PACIENTE', { pacienteId: 1 });
      expect(result).toEqual({ deleted: true });
    });

    it('throws on error', async () => {
      axios.delete.mockRejectedValue(new Error('Forbidden'));

      await expect(deletePaciente(1)).rejects.toThrow('Forbidden');
    });
  });

  describe('deleteLogicalPaciente', () => {
    it('calls PUT /paciente/estado/:id and logs audit', async () => {
      axios.put.mockResolvedValue({ data: { deleted: true } });

      const result = await deleteLogicalPaciente(1);

      expect(axios.put).toHaveBeenCalledWith(`${API_URL}/paciente/estado/1`);
      expect(logAuditAction).toHaveBeenCalledWith('ELIMINAR_LOGICO_PACIENTE', { pacienteId: 1 });
      expect(result).toEqual({ deleted: true });
    });

    it('throws on error', async () => {
      axios.put.mockRejectedValue(new Error('Not found'));

      await expect(deleteLogicalPaciente(999)).rejects.toThrow('Not found');
    });
  });
});
