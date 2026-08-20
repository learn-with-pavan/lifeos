require('dotenv').config();

const app = require('./app');
const connectDatabase = require('./config/db');
const { startAutomationWorker } = require('./services/automationWorker');
const { startReminderWorker } = require('./services/reminderWorker');
const PORT = process.env.PORT || 5000

const startServer = async () => {
    await connectDatabase().then(() => {
        startReminderWorker();
        startAutomationWorker();
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
        .catch((error) => {
            console.error(error);
        });
}

startServer();
