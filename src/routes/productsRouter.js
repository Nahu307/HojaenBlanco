const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Obtiene todos los productos
 *     description: Obtiene una lista de todos los productos disponibles.
 *     responses:
 *       '200':
 *         description: Respuesta exitosa
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get('/api/products', (req, res) => {
  // Aquí iría la lógica para obtener todos los productos
});

module.exports = router;
