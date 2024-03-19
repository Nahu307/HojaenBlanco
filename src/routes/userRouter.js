const express = require('express');
const router = express.Router();
const User = require('../models/user.model'); // Importa el modelo de usuario
const upload = require('../middlewares/auth.middleware'); // Importa el middleware de Multer

// Endpoint para actualizar el estado premium del usuario
router.post('/premium/:uid', async (req, res) => {
  try {
    const user = await User.findById(req.params.uid);

    // Verificar si el usuario ha cargado los documentos requeridos
    const requiredDocuments = ['Identificación', 'Comprobante de domicilio', 'Comprobante de estado de cuenta'];
    const missingDocuments = requiredDocuments.filter(doc => !user.documents.find(d => d.name === doc));

    if (missingDocuments.length > 0) {
      return res.status(400).json({ message: `Faltan los siguientes documentos: ${missingDocuments.join(', ')}` });
    }

    // Actualizar al usuario premium
    user.premium = true;
    await user.save();

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar estado premium del usuario' });
  }
});

// Endpoint para actualizar documentos y last_connection
router.post('/:uid/documents', upload.array('documents'), async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.uid },
      { $set: { documents: req.files.map(file => ({ name: file.originalname, reference: file.path })) } },
      { new: true }
    );

    // Actualizar last_connection
    user.last_connection = new Date();
    await user.save();

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar documentos del usuario' });
  }
});

module.exports = router;
