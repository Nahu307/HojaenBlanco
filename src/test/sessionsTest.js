const request = require('supertest');
const app = require('../app'); 
const { expect } = require('chai');

describe('Sesiones API', () => {
  it('Debería iniciar sesión correctamente', async () => {
    const res = await request(app)
      .post('/api/sessions/login')
      .send({ username: 'user123', password: 'password123' });
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('object');
    // Verificar si se recibió un token de sesión
  });

  it('Debería cerrar sesión correctamente', async () => {
    const res = await request(app).post('/api/sessions/logout');
    expect(res.status).to.equal(200);
    // Verificar si la sesión se cerró correctamente
  });

  // Agrega más pruebas según sea necesario
});
