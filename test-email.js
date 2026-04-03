require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendTestEmail() {
  console.log('SMTP Config:');
  console.log('  Host:', process.env.SMTP_HOST);
  console.log('  Port:', process.env.SMTP_PORT);
  console.log('  User:', process.env.SMTP_USER);
  console.log('  From:', `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`);
  console.log('  To:', process.env.CRITICAL_EMAIL_RECIPIENT);
  console.log('');

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
    to: process.env.CRITICAL_EMAIL_RECIPIENT,
    subject: 'Test Email - Vedant Asset Email Service',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2c3e50;">Email Service Test</h2>
        <p>This is a test email sent from the <strong>Vedant Asset Limited</strong> backend email service.</p>
        <table style="border-collapse: collapse; width: 100%; margin-top: 15px;">
          <tr style="background-color: #f2f2f2;">
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>SMTP Host</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${process.env.SMTP_HOST}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>SMTP Port</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${process.env.SMTP_PORT}</td>
          </tr>
          <tr style="background-color: #f2f2f2;">
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Sender</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${process.env.SMTP_FROM_EMAIL}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Sent At</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${new Date().toISOString()}</td>
          </tr>
        </table>
        <p style="margin-top: 20px; color: #27ae60; font-weight: bold;">Email service is working correctly.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('SUCCESS: Email sent!');
    console.log('  Message ID:', info.messageId);
    console.log('  Response:', info.response);
  } catch (error) {
    console.error('FAILED: Error sending email:');
    console.error(' ', error.message);
    if (error.code) console.error('  Code:', error.code);
  }
}

sendTestEmail();
