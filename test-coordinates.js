const axios = require('axios');

async function testCreateCinemaWithCoordinates() {
  try {
    console.log('Testing create cinema with coordinates...');
    const cinemaData = {
      cinema_name: 'CGV Hồ Gươm Plaza',
      address: '102-104 Đường Trần Phú - Hà Đông',
      phone: '0901234567',
      email: 'test@example.com',
      province_id: 1, // Hà Nội
      latitude: 20.9538,
      longitude: 105.8345,
      status: 'active'
    };
    
    const response = await axios.post('http://localhost:3000/api/cinemas', cinemaData);
    console.log('Create cinema response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error creating cinema:', error.response?.data || error.message);
  }
}

testCreateCinemaWithCoordinates();
