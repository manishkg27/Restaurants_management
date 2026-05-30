const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // If in development mode (or specifically requested to log links instead),
  // we just log the URL to the terminal instead of sending an actual email.
  if (process.env.NODE_ENV === "development" || !process.env.SMTP_HOST) {
    console.log("---------------------------------------------------------");
    console.log(`Email Type: ${options.subject}`);
    console.log(`To: ${options.email}`);
    console.log(`Email Content:\n${options.message}`);
    console.log("---------------------------------------------------------");
    return;
  }

  // Uncomment and configure your SMTP credentials in .env to send real emails
  /*
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  const info = await transporter.sendMail(message);
  console.log("Message sent: %s", info.messageId);
  */
};

module.exports = sendEmail;
