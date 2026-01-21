const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const Connection = require("./config/db");
const userrouter = require("./routes/user.routes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

app.use("/api", userrouter);

app.get("/", (req, res) => {
  res.send("Backend is running");
});

Connection();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
