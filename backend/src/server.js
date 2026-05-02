require("dotenv").config();

const app = require("./app");

// Ưu tiên dùng PORT từ file .env, nếu không có thì mặc định là 3001
const port = Number(process.env.PORT || 3001);

app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
  console.log(`🔗 Health check: http://localhost:${port}/health`);
});