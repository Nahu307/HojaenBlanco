const User = require('../models/User');

const getUsers = async (req, res) => {
  try {
    const users = await User.find({}, 'nombre correo rol');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
};

module.exports = { getUsers };