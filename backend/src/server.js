require("dotenv").config();

const app = require("./app");

// Ép kiểu Number để đảm bảo port hợp lệ
const port = Number(process.env.PORT || 3001);

app.listen(port, () => {
  console.log(`🚀 Backend is running on port ${port}`);
  console.log(`🔗 Health check: http://localhost:${port}/health`);
});