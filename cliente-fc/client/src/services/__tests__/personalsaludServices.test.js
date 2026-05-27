import axios from 'axios';
import {
  getPersonalSalud,
  getPersonalSaludId,
  getPersonalSaludSimpleId,
  createPersonalSalud,
  updatePersonalSalud,
  deletePersonalSalud,
  deleteLogicalPersonalSalud,
  getEspecialidades,
  getTipoEspecialidad,
  getEstadisticas,
} from '../personalsaludServices';
import { logAuditAction } from '../auditoriaServices';

jest.mock('axios');
jest.mock('../auditoriaServices', () => ({
  logAuditAction: jest.fn().mockResolvedValue(undefined),
}));

const API_URL = 'http://localhost:5000/api/fcc';

describe('personalsaludServices', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPersonalSalud', () => {
    it('calls GET /personalsalud', async () => {
      axios.get.mockResolvedValue({ data: [{ id: 1, nombre: 'Dr. Perez' }] });

      const result = await getPersonalSalud();

      expect(axios.get).toHaveBeenCalledWith(`${API_URL}/personalsalud`);
      expect(result).toEqual([{ id: 1, nombre: 'Dr. Perez' }]);
    });

    it('throws on error', async () => {
      axios.get.mockRejectedValue(new Error('Error'));
      await expect(getPersonalSalud()).rejects.toThrow('Error');
    });
  });

  describe('getPersonalSaludId', () => {
    it('chains 3 GET calls and combines data', async () => {
      const personalData = { id: 1, id_especialidad: 5, nombre: 'Dr. Perez' };
      const especialidadData = { id: 5, nombre_especialidad: 'Cardiología', id_tipo_especialidad: 3 };
      const tipoEspData = { id: 3, descripcion_tipo_especialidad: 'Clínica' };

      axios.get
        .mockResolvedValueOnce({ data: personalData })
        .mockResolvedValueOnce({ data: especialidadData })
        .mockResolvedValueOnce({ data: tipoEspData });

      const result = await getPersonalSaludId(1);

      expect(axios.get).toHaveBeenCalledWith(`${API_URL}/personalsalud/1`);
      expect(axios.get).toHaveBeenCalledWith(`${API_URL}/especialidad/5`);
      expect(axios.get).toHaveBeenCalledWith(`${API_URL}/tipo_especialidad/3`);
      expect(result).toEqual({
        ...personalData,
        nombre_especialidad: 'Cardiología',
        descripcion_tipo_especialidad: 'Clínica',
      });
    });

    it('throws on error in any chained call', async () => {
      axios.get.mockResolvedValueOnce({ data: { id: 1, id_especialidad: 5 } });
      axios.get.mockRejectedValue(new Error('Not found'));

      await expect(getPersonalSaludId(1)).rejects.toThrow('Not found');
    });
  });

  describe('getPersonalSaludSimpleId', () => {
    it('calls GET /personalsalud/:id simple', async () => {
      axios.get.mockResolvedValue({ data: { id: 1 } });

      const result = await getPersonalSaludSimpleId(1);

      expect(axios.get).toHaveBeenCalledWith(`${API_URL}/personalsalud/1`);
      expect(result).toEqual({ id: 1 });
    });
  });

  describe('createPersonalSalud', () => {
    it('calls POST /personalsalud and logs audit', async () => {
      const data = { nombre: 'Dr. Paz', id_especialidad: 2 };
      axios.post.mockResolvedValue({ data: { id: 1, ...data } });

      const result = await createPersonalSalud(data);

      expect(axios.post).toHaveBeenCalledWith(`${API_URL}/personalsalud`, data);
      expect(logAuditAction).toHaveBeenCalledWith('CREAR_PERSONAL_SALUD', { newData: data });
      expect(result).toEqual({ id: 1, ...data });
    });

    it('throws on error', async () => {
      axios.post.mockRejectedValue(new Error('Validation error'));
      await expect(createPersonalSalud({})).rejects.toThrow('Validation error');
    });
  });

  describe('updatePersonalSalud', () => {
    it('calls PUT /personalsalud/:id and logs audit', async () => {
      const data = { nombre: 'Dr. Paz Updated' };
      axios.put.mockResolvedValue({ data: { id: 1, ...data } });

      const result = await updatePersonalSalud(1, data);

      expect(axios.put).toHaveBeenCalledWith(`${API_URL}/personalsalud/1`, data);
      expect(logAuditAction).toHaveBeenCalledWith('ACTUALIZAR_PERSONAL_SALUD', {
        personalId: 1,
        updatedData: data,
      });
      expect(result).toEqual({ id: 1, ...data });
    });

    it('throws on error', async () => {
      axios.put.mockRejectedValue(new Error('Not found'));
      await expect(updatePersonalSalud(999, {})).rejects.toThrow('Not found');
    });
  });

  describe('deletePersonalSalud', () => {
    it('calls DELETE /personalsalud/:id and logs audit', async () => {
      axios.delete.mockResolvedValue({ data: { deleted: true } });

      const result = await deletePersonalSalud(1);

      expect(axios.delete).toHaveBeenCalledWith(`${API_URL}/personalsalud/1`);
      expect(logAuditAction).toHaveBeenCalledWith('ELIMINAR_PERSONAL_SALUD', { personalId: 1 });
      expect(result).toEqual({ deleted: true });
    });

    it('throws on error', async () => {
      axios.delete.mockRejectedValue(new Error('Error'));
      await expect(deletePersonalSalud(1)).rejects.toThrow('Error');
    });
  });

  describe('deleteLogicalPersonalSalud', () => {
    it('calls PUT /personalsalud/estado/:id and logs audit', async () => {
      axios.put.mockResolvedValue({ data: { deleted: true } });

      const result = await deleteLogicalPersonalSalud(1);

      expect(axios.put).toHaveBeenCalledWith(`${API_URL}/personalsalud/estado/1`);
      expect(logAuditAction).toHaveBeenCalledWith('ELIMINAR_LOGICO_PERSONAL_SALUD', { personalId: 1 });
      expect(result).toEqual({ deleted: true });
    });
  });

  describe('getEspecialidades', () => {
    it('calls GET /especialidad', async () => {
      axios.get.mockResolvedValue({ data: [{ id: 1, nombre: 'Cardiología' }] });

      const result = await getEspecialidades();

      expect(axios.get).toHaveBeenCalledWith(`${API_URL}/especialidad`);
      expect(result).toEqual([{ id: 1, nombre: 'Cardiología' }]);
    });
  });

  describe('getTipoEspecialidad', () => {
    it('calls GET /tipo_especialidad', async () => {
      axios.get.mockResolvedValue({ data: [{ id: 1, descripcion: 'Clínica' }] });

      const result = await getTipoEspecialidad();

      expect(axios.get).toHaveBeenCalledWith(`${API_URL}/tipo_especialidad`);
      expect(result).toEqual([{ id: 1, descripcion: 'Clínica' }]);
    });
  });

  describe('getEstadisticas', () => {
    it('calls GET /personalsalud/:id/estadisticas', async () => {
      axios.get.mockResolvedValue({ data: { total_atenciones: 42 } });

      const result = await getEstadisticas(1);

      expect(axios.get).toHaveBeenCalledWith(`${API_URL}/personalsalud/1/estadisticas`);
      expect(result).toEqual({ total_atenciones: 42 });
    });

    it('throws on error', async () => {
      axios.get.mockRejectedValue(new Error('Error'));
      await expect(getEstadisticas(999)).rejects.toThrow('Error');
    });
  });
});
