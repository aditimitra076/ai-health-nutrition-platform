import nodemailer from "nodemailer";

const getSmtpConfig = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM } = process.env;
  const values = [SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM];
  const configuredCount = values.filter(Boolean).length;

  if (configuredCount === 0 && process.env.NODE_ENV !== "production") {
    return null;
  }

  if (configuredCount !== values.length) {
    throw new Error("SMTP configuration is incomplete.");
  }

  const port = Number(SMTP_PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("SMTP_PORT must be a valid port number.");
  }

  return {
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    from: EMAIL_FROM
  };
};

export const sendOtpEmail = async (email, otp) => {
  const smtp = getSmtpConfig();

  if (!smtp) {
    console.info(`[DEV ONLY] OTP for ${email}: ${otp}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: smtp.auth
  });

  await transporter.sendMail({
    from: smtp.from,
    to: email,
    subject: "Your verification code",
    text: `Your verification code is ${otp}. It expires in 5 minutes.`
  });
};
