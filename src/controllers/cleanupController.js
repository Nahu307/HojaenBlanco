const User = require('../models/User');
const { sendInactiveAccountEmail } = require('../services/email');

const cleanupUsers = async (req, res) => {
  try {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    await User.deleteMany({ lastLogin: { $lt: twoDaysAgo } });

    // Envía correos a usuarios eliminados
    const inactiveUsers = await User.find({ lastLogin: { $lt: twoDaysAgo } });
    inactiveUsers.forEach(user => {
      sendInactiveAccountEmail(user.correo);
    });

    res.json({ message: 'Usuarios inactivos eliminados' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al eliminar usuarios inactivos' });
  }
};

module.exports = { cleanupUsers };