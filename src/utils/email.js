const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendFoundEmail = async (ownerEmail, location) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: ownerEmail,
      subject: '¡Tu mascota ha sido encontrada!',
      html: `<p>¡Buenas noticias! Alguien ha escaneado el QR de tu mascota. Ubicación reportada: ${location}</p>`
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error enviando email:', error);
  }
};

module.exports = { sendFoundEmail };