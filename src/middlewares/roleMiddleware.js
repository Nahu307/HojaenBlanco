const checkRole = (roles) => (req, res, next) => {
    if (!roles.includes(req.user.rol)) {
    return res.status(403).json({ message: 'No tienes permisos para acceder a esta ruta' });
    }
    next();
};

module.exports = { checkRole };
