const request = require('supertest');
const app = require('../app'); 
const { expect } = require('chai');

describe('Carritos API', () => {
  it('Debería obtener el carrito de un usuario', async () => {
    const res = await request(app).get('/api/carts/user123');
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('object');
    expect(res.body.userId).to.equal('user123');
  });

  it('Debería agregar un producto al carrito de un usuario', async () => {
    const res = await request(app)
      .post('/api/carts/user123/products')
      .send({ productId: 'product123', quantity: 2 });
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('object');
    // Verificar el estado del carrito después de agregar un producto
  });

  // Agrega más pruebas según sea necesario
});
