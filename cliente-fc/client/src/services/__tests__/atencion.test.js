import axios from 'axios';
import {
  getLastSignosVitales,
  createSignosVitales,
  getAtenciones,
  getAllAtenciones,
  createAtencion,
  getSignosVitalesPorAps,
} from '../atencion';
import { logAuditAction } from '../auditoriaServices';

jest.mock('axios');
jest.mock('../auditoriaServices', () => ({
  logAuditAction: jest.fn().mockResolvedValue(undefined),
}));

const API_URL = 'http://localhost:5000/api/fcc';

describe('atencion service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getLastSignosVitales', () => {
    it('calls GET /signos_vitales/last/:pacienteId', async () => {
      const mockData = { id: 1, presion: '120/80' };
      axios.get.mockResolvedValue({ data: mockData });

      const result = await getLastSignosVitales(1);

      expect(axios.get).toHaveBeenCalledWith(`${API_URL}/signos_vitales/last/1`);
      expect(result).toEqual(mockData);
    });

    it('throws on error', async () => {
      axios.get.mockRejectedValue(new Error('Not found'));
      await expect(getLastSignosVitales(999)).rejects.toThrow('Not found');
    });
  });

  describe('createSignosVitales', () => {
    it('calls POST /signos_vitales and logs audit', async () => {
      const data = { presion: '120/80', pulso: 72 };
      axios.post.mockResolvedValue({ data: { id: 1, ...data } });

      const result = await createSignosVitales(data);

      expect(axios.post).toHaveBeenCalledWith(`${API_URL}/signos_vitales`, data);
      expect(logAuditAction).toHaveBeenCalledWith('CREAR_SIGNOS_VITALES', { newData: data });
      expect(result).toEqual({ id: 1, ...data });
    });

    it('throws on error', async () => {
      axios.post.mockRejectedValue(new Error('Validation error'));
      await expect(createSignosVitales({})).rejects.toThrow('Validation error');
    });
  });

  describe('getAtenciones', () => {
    it('calls GET /atencion/historia/:historiaId', async () => {
      const mockData = [{ id: 1 }, { id: 2 }];
      axios.get.mockResolvedValue({ data: mockData });

      const result = await getAtenciones(1);

      expect(axios.get).toHaveBeenCalledWith(`${API_URL}/atencion/historia/1`);
      expect(result).toEqual(mockData);
    });

    it('throws on error', async () => {
      axios.get.mockRejectedValue(new Error('Not found'));
      await expect(getAtenciones(999)).rejects.toThrow('Not found');
    });
  });

  describe('getAllAtenciones', () => {
    it('calls GET /atencion', async () => {
      const mockData = [{ id: 1 }];
      axios.get.mockResolvedValue({ data: mockData });

      const result = await getAllAtenciones();

      expect(axios.get).toHaveBeenCalledWith(`${API_URL}/atencion`);
      expect(result).toEqual(mockData);
    });

    it('throws on error', async () => {
      axios.get.mockRejectedValue(new Error('Network error'));
      await expect(getAllAtenciones()).rejects.toThrow('Network error');
    });
  });

  describe('createAtencion', () => {
    it('calls POST /atencion and logs audit', async () => {
      const data = { historia_id: 1, diagnostico: 'Fiebre' };
      axios.post.mockResolvedValue({ data: { id: 1, ...data } });

      const result = await createAtencion(data);

      expect(axios.post).toHaveBeenCalledWith(`${API_URL}/atencion`, data);
      expect(logAuditAction).toHaveBeenCalledWith('CREAR_ATENCION', { newData: data });
      expect(result).toEqual({ id: 1, ...data });
    });

    it('throws on error', async () => {
      axios.post.mockRejectedValue(new Error('Validation error'));
      await expect(createAtencion({})).rejects.toThrow('Validation error');
    });
  });

  describe('getSignosVitalesPorAps', () => {
    it('calls GET /signos_vitales/aps/:apsId', async () => {
      const mockData = [{ id: 1, aps_id: 5 }];
      axios.get.mockResolvedValue({ data: mockData });

      const result = await getSignosVitalesPorAps(5);

      expect(axios.get).toHaveBeenCalledWith(`${API_URL}/signos_vitales/aps/5`);
      expect(result).toEqual(mockData);
    });

    it('throws on error', async () => {
      axios.get.mockRejectedValue(new Error('Not found'));
      await expect(getSignosVitalesPorAps(999)).rejects.toThrow('Not found');
    });
  });
});
