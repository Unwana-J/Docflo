const express = require('express');
const cors = require('cors');
const { PORT } = require('./config');
const aiRoutes = require('./routes/ai');

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));

app.use('/ai', aiRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
