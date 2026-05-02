require("dotenv").config();
const app = require("./app");

const port = Number(process.env.PORT || 3000);

const server = app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
  console.log(`🔗 Health check: http://localhost:${port}/health`);
});

// Xử lý lỗi khởi động (ví dụ: Port đã bị sử dụng)
server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`❌ Port ${port} đã bị sử dụng. Vui lòng kiểm tra lại!`);
    process.exit(1);
  } else {
    throw error;
  }
});