const prisma = require("../config/prisma");
const { asyncHandler } = require("../middlewares/errorHandler");
const { hashPassword } = require("../utils/passwordHash");
const { sendPinEmail } = require("../utils/email");
const bcrypt = require("bcryptjs");

function generatePin() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

exports.requestPin = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(200).json({ message: "If the email exists, a PIN has been sent." });

  const pin = generatePin();
  const hashedPin = await bcrypt.hash(pin, 6);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  const isDev = process.env.NODE_ENV === 'development';

  await prisma.passwordResetToken.create({
    data: { email, pin: hashedPin, expiresAt },
  });

  console.log(`[PasswordReset] PIN for ${email}: ${pin}`);

  sendPinEmail(email, pin).catch((err) => {
    console.error("[PasswordReset] Failed to send email:", err.message);
  });

  const response = { message: "If the email exists, a PIN has been sent." };
  if (isDev) response.pin = pin;

  res.json(response);
});

exports.verifyPin = asyncHandler(async (req, res) => {
  const { email, pin } = req.body;
  if (!email || !pin) return res.status(400).json({ error: "Email and PIN are required" });

  const token = await prisma.passwordResetToken.findFirst({
    where: {
      email,
      used: false,
      expiresAt: { gte: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!token) return res.status(400).json({ error: "Invalid or expired PIN" });

  const valid = await bcrypt.compare(pin, token.pin);
  if (!valid) return res.status(400).json({ error: "Invalid or expired PIN" });

  await prisma.passwordResetToken.update({
    where: { id: token.id },
    data: { used: true },
  });

  res.json({ message: "PIN verified successfully", tokenId: token.id });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) return res.status(400).json({ error: "Email and new password are required" });
  if (newPassword.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters" });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ error: "User not found" });

  const hashed = await hashPassword(newPassword);
  await prisma.user.update({
    where: { email },
    data: { password: hashed },
  });

  await prisma.passwordResetToken.updateMany({
    where: { email, used: true },
    data: { used: false },
  });

  res.json({ message: "Password has been reset successfully" });
});
