const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PASS || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    tls: {
        rejectUnauthorized: false,
    },
});

const FROM = `"AquaWash" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`;

async function sendVerificationEmail(email, nombre, token) {
    const url = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    await transporter.sendMail({
        from: FROM,
        to: email,
        subject: 'Verificá tu email — AquaWash',
        html: `
            <div style="font-family:sans-serif;max-width:480px;margin:auto">
                <h2>¡Hola ${nombre}!</h2>
                <p>Para activar tu cuenta hacé click aquí:</p>
                <p>
                    <a href="${url}"
                       style="display:inline-block;padding:12px 24px;background:#2f80ff;
                              color:#fff;text-decoration:none;border-radius:8px;">
                        Verificar email
                    </a>
                </p>
                <p style="color:#999;font-size:12px;">
                    Este enlace expira en 24 horas.
                    Si no creaste esta cuenta, ignorá este mensaje.
                </p>
            </div>`,
    });
}

async function sendPasswordResetEmail(email, nombre, token) {
    const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await transporter.sendMail({
        from: FROM,
        to: email,
        subject: 'Recuperar contraseña — AquaWash',
        html: `
            <div style="font-family:sans-serif;max-width:480px;margin:auto">
                <h2>¡Hola ${nombre}!</h2>
                <p>Recibimos una solicitud para restablecer tu contraseña:</p>
                <p>
                    <a href="${url}"
                       style="display:inline-block;padding:12px 24px;background:#2f80ff;
                              color:#fff;text-decoration:none;border-radius:8px;">
                        Restablecer contraseña
                    </a>
                </p>
                <p style="color:#999;font-size:12px;">
                    Este enlace expira en 1 hora.
                    Si no solicitaste esto, ignorá este mensaje.
                </p>
            </div>`,
    });
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail };