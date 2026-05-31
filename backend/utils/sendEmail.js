const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // If in development mode (or specifically requested to log links instead),
  // we just log the URL to the terminal instead of sending an actual email.
  if (process.env.NODE_ENV === "development" || !process.env.SMTP_HOST) {
    console.log(
      "\n\x1b[36m=========================================================\x1b[0m",
    );
    console.log(`\x1b[33m📧 Email Type:\x1b[0m ${options.subject}`);
    console.log(`\x1b[33m📬 To:\x1b[0m ${options.email}`);
    console.log(`\x1b[33m📝 Content:\x1b[0m`);
    console.log(options.message);
    // Extract and highlight any URLs for easy clicking
    const urlMatch = options.message.match(/(https?:\/\/[^\s]+)/);
    if (urlMatch) {
      console.log(
        `\n\x1b[32m🔗 Click this link:\x1b[0m \x1b[4m${urlMatch[1]}\x1b[0m`,
      );
    }
    console.log(
      "\x1b[36m=========================================================\x1b[0m\n",
    );
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
