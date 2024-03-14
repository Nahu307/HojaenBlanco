const request = require('supertest');
const app = require('../app'); 
const { expect } = require('chai');

describe('Productos API', () => {
  it('Debería obtener todos los productos', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array');
  });

  it('Debería obtener un producto por su ID', async () => {
    const res = await request(app).get('/api/products/1');
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('object');
    expect(res.body.id).to.equal(1);
  });

  // Agrega más pruebas según sea necesario
});
