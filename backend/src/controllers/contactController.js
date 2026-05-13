const prisma = require("../config/prisma");
const { asyncHandler } = require("../middlewares/errorHandler");

exports.submit = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Name, email, and message are required" });
  }

  const contact = await prisma.contact.create({
    data: { name, email, message },
  });

  res.status(201).json({ success: true, message: "Thank you! We'll get back to you soon." });
});
