const nodemailer = require('nodemailer');

// Configura el transportador de nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ingenierokikosanchez@gmail.com',
        pass: 'rvsh irew bqty kllc'
    }
});

// Función para enviar correos
const sendVerificationEmail = (email, token) => {
    const mailOptions = {
        from: 'ingenierokikosanchez@gmail.com',
        to: email,
        subject: 'Verificación de cuenta',
        text: `Por favor, verifica tu cuenta haciendo clic en el siguiente enlace: 
        http://localhost:3000/verify-email?token=${token}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Correo enviado: ' + info.response);
        }
    });
};

module.exports = { sendVerificationEmail };
