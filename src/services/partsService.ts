import axios from 'axios';

// Cambia esto por tu IP local si pruebas en un dispositivo físico
const API_BASE_URL = 'http://192.168.0.220:3001/api';

export const getParts = async (year: string, make: string, model: string, query: string = '') => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/parts`, {
      params: { year, make, model, query }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching parts:', error);
    throw error;
  }
};
