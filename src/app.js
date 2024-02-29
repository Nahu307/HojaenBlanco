import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import crypto from "crypto";
import bodyParser from "body-parser";
import moment from "moment";

import authRoutes from "./routes/auth.routes.js";
import taskRoutes from "./routes/tasks.routes.js";
import { FRONTEND_URL, MONGODB_URI } from "./config.js";

const app = express();

// Conexión a MongoDB
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error de conexión a MongoDB:'));
db.once('open', () => {
  console.log('Conectado a MongoDB');
});

// Esquema de Usuario
const usuarioSchema = new mongoose.Schema({
    correo: String,
    contraseña: String,
    rol: { type: String, enum: ['regular', 'premium'], default: 'regular' },
    resetToken: String,
    resetTokenExpira: Date,
    productos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Producto' }]
});
const Usuario = mongoose.model('Usuario', usuarioSchema);

// Esquema de Producto
const productoSchema = new mongoose.Schema({
    nombre: String,
    descripcion: String,
    owner: { type: String, required: true, default: 'admin' }
});
const Producto = mongoose.model('Producto', productoSchema);

// Middleware para analizar datos de solicitud codificados en json
app.use(express.json());

// Middleware para permitir solicitudes desde el frontend
app.use(
  cors({
    credentials: true,
    origin: FRONTEND_URL,
  })
);

// Middleware para registrar solicitudes en consola
app.use(morgan("dev"));

// Middleware para analizar cookies
app.use(cookieParser());

// Middleware de análisis de formularios
app.use(bodyParser.urlencoded({ extended: true }));

// Rutas de autenticación y tareas
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// Ruta para solicitar restablecimiento de contraseña
app.post('/api/solicitar-restablecimiento', async (req, res) => {
    const { correo } = req.body;

    // Verificar si el usuario existe en la base de datos
    const usuario = await Usuario.findOne({ correo });
    if (!usuario) {
        return res.status(404).send('Usuario no encontrado');
    }

    // Generar y guardar token en la base de datos
    const token = crypto.randomBytes(20).toString('hex');
    usuario.resetToken = token;
    usuario.resetTokenExpira = Date.now() + 3600000; // Expira en 1 hora
    await usuario.save();

    // Enviar correo electrónico al usuario con el enlace para restablecer la contraseña
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'tucorreo@gmail.com',
            pass: 'tucontraseña'
        }
    });

    const mailOptions = {
        from: 'tucorreo@gmail.com',
        to: correo,
        subject: 'Restablecimiento de Contraseña',
        html: `
            <p>Hola ${usuario.correo},</p>
            <p>Puedes restablecer tu contraseña <a href="http://localhost:3000/restablecer-contraseña/${token}">aquí</a>.</p>
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            return res.status(500).send('Error al enviar el correo electrónico');
        } else {
            console.log('Correo electrónico enviado: ' + info.response);
            res.send('Correo electrónico enviado con éxito');
        }
    });
});

// Ruta para restablecer contraseña
app.get('/api/restablecer-contraseña/:token', async (req, res) => {
    const token = req.params.token;

    // Buscar al usuario con el token proporcionado
    const usuario = await Usuario.findOne({ resetToken: token, resetTokenExpira: { $gt: Date.now() } });
    if (!usuario) {
        return res.status(400).send('El enlace para restablecer la contraseña es inválido o ha expirado.');
    }

    // Mostrar formulario para restablecer la contraseña
    res.send(`
        <form action="/api/restablecer-contraseña/${token}" method="post">
            <input type="password" name="contraseña" placeholder="Nueva Contraseña" required>
            <button type="submit">Restablecer Contraseña</button>
        </form>
    `);
});

// Ruta para procesar restablecimiento de contraseña
app.post('/api/restablecer-contraseña/:token', async (req, res) => {
    const token = req.params.token;
    const nuevaContraseña = req.body.contraseña;

    // Buscar al usuario con el token proporcionado
    const usuario = await Usuario.findOne({ resetToken: token, resetTokenExpira: { $gt: Date.now() } });
    if (!usuario) {
        return res.status(400).send('El enlace para restablecer la contraseña es inválido o ha expirado.');
    }

    // Restablecer la contraseña
    usuario.contraseña = nuevaContraseña;
    usuario.resetToken = undefined;
    usuario.resetTokenExpira = undefined;
    await usuario.save();

    res.send('Contraseña restablecida con éxito');
});

// Ruta para crear un producto (requiere autenticación)
app.post('/api/crear-producto', async (req, res) => {
    const { nombre, descripcion } = req.body;
    const userId = req.user._id;

    // Crear el producto y asignar el propietario
    const producto = new Producto({ nombre, descripcion, owner: userId });
    await producto.save();

    // Actualizar la lista de productos del usuario
    req.user.productos.push(producto._id);
    await req.user.save();

    res.send('Producto creado con éxito');
});

// Ruta para eliminar un producto (requiere autenticación)
app.delete('/api/productos/:id', async (req, res) => {
    const productId = req.params.id;
    const userId = req.user._id;

    // Verificar si el usuario es el propietario del producto o es un administrador
    const producto = await Producto.findById(productId);
    if (!producto) {
        return res.status(404).send('Producto no encontrado');
    }

    if (producto.owner.toString() !== userId.toString() && req.user.rol !== 'premium') {
        return res.status(403).send('No tienes permiso para eliminar este producto');
    }

    await Producto.findByIdAndDelete(productId);

    res.send('Producto eliminado con éxito');
});

// Ruta para actualizar un producto (requiere autenticación)
app.put('/api/productos/:id', async (req, res) => {
    const productId = req.params.id;
    const userId = req.user._id;
    const { nombre, descripcion } = req.body;

    // Verificar si el usuario es el propietario del producto o es un administrador
    const producto = await Producto.findById(productId);
    if (!producto) {
        return res.status(404).send('Producto no encontrado');
    }

    if (producto.owner.toString() !== userId.toString() && req.user.rol !== 'premium') {
        return res.status(403).send('No tienes permiso para actualizar este producto');
    }

    await Producto.findByIdAndUpdate(productId, { nombre, descripcion });

    res.send('Producto actualizado con éxito');
});

app.listen(4000, () => {
    console.log('Servidor corriendo en el puerto 4000');
});

