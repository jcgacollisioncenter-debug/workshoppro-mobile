import axios from 'axios';

// Replace with your local IP if testing on a physical device
const API_BASE_URL = 'https://workshoppro-backend.onrender.com/api';

export const decodeVin = async (vin: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/vehicles/decode-vin/${vin}`);
    return response.data;
  } catch (error) {
    console.error('Error decoding VIN:', error);
    throw error;
  }
};

export const performVinOcr = async (imageUri: string, mimeType = 'image/jpeg') => {
  try {
    const formData = new FormData();
    const extension = mimeType.split('/')[1] || 'jpg';
    formData.append('image', {
      uri: imageUri,
      name: `vin_scan.${extension}`,
      type: mimeType,
    } as any);

    const response = await axios.post(`${API_BASE_URL}/vehicles/ocr-vin`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.vin;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};

export const analyzeDamage = async (imageUri: string, zones: string[], mimeType = 'image/jpeg', vehicleSpecs?: any) => {
  try {
    const formData = new FormData();
    const extension = mimeType.split('/')[1] || 'jpg';
    formData.append('image', {
      uri: imageUri,
      name: `damage.${extension}`,
      type: mimeType,
    } as any);
    
    formData.append('zones', JSON.stringify(zones));
    if (vehicleSpecs) {
      formData.append('vehicleSpecs', JSON.stringify(vehicleSpecs));
    }

    const response = await axios.post(`${API_BASE_URL}/vehicles/analyze-damage`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};
