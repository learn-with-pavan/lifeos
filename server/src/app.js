const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const assetRoutes = require("./routes/assetRoutes");
const warrantyRoutes = require("./routes/warrantyRoutes");
const reminderRoutes = require("./routes/reminderRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const documentRoutes = require("./routes/documentRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const maintenanceRoutes = require("./routes/maintenanceRoutes");
const serviceHistoryRoutes = require("./routes/serviceHistoryRoutes");
const homeRoutes = require("./routes/homeRoutes");
const insightsRoutes = require("./routes/insightsRoutes");
const serviceProviderRoutes = require("./routes/serviceProviderRoutes");
const serviceRequestRoutes = require("./routes/serviceRequestRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const userRoutes = require("./routes/userRoutes");

const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
);
app.use(express.json());

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "LifeOS API is running",
    });
});

app.use('/api/auth', authRoutes)
app.use('/api/assets', assetRoutes)
app.use("/api", warrantyRoutes);
app.use("/api", reminderRoutes);
app.use("/api", notificationRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/service-history", serviceHistoryRoutes);
app.use("/api/homes", homeRoutes);
app.use("/api/insights", insightsRoutes);
app.use("/api/service-providers", serviceProviderRoutes);
app.use("/api/service-requests", serviceRequestRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/users", userRoutes);

app.use(errorMiddleware);

module.exports = app;