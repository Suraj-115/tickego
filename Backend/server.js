const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const app = express();

const authRoutes = require("./routes/authRoutes");
const orgRoutes = require("./routes/organizationRoutes");
const deptRoutes = require("./routes/departmentRoutes");
const eventRoutes = require("./routes/eventRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const ticketRoutes = require("./routes/ticketRoutes");

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/org", orgRoutes);
app.use("/api/dept", deptRoutes);
app.use("/api/event", eventRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/ticket", ticketRoutes);

app.get("/", (req, res) => {
  res.send("TickeGo API running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running with port: https://localhost:${PORT}`);
});