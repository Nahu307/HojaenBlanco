const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'tu_correo@gmail.com',
    pass: 'tu_contraseña',
  },
});

const sendInactiveAccountEmail = (email) => {
  const mailOptions = {
    from: 'tu_correo@gmail.com',
    to: email,
    subject: 'Tu cuenta está inactiva',
    text: 'Tu cuenta ha estado inactiva por un tiempo. Por favor, contáctanos para reactivarla.',
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
    } else {
      console.log('Correo enviado: ' + info.response);
    }
  });
};

module.exports = { sendInactiveAccountEmail };