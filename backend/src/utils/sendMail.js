import nodemailer from 'nodemailer';

let transporter = null;

async function sendMail(email, password) {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your UniSphere Account Password',
        text: `Welcome to UniSphere!

Email: ${email}
Temporary Password: ${password}

Please login and change your password immediately.`
    });
}

export { sendMail };
