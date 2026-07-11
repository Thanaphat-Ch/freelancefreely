require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

const http = require("http")

connectDB();
const server = http.createServer(app)
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

//  server.js → app.js → routes → controllers → models → MongoDB