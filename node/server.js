const express = require("express");
const app = express();
const cors = require('cors');
const {join} = require('path');
const fs = require('fs')

const { logger } = require('./logger');
const excelFileRoutes = require('./routes/readAndWriteRoute');
const profitLossRoute = require('./routes/profitAndLossRoute')
const corsOptions = {
    origin: 'http://206.72.206.254:3001' 
}

app.use(cors(corsOptions)) // Enable CORS for all routes

//Create public folder if not exists
const filePaths = ['masterSourceFiles', 'targetFile', 'pnlSourceFiles']

filePaths.map((filePath) => {
    const publicFolderPath = join(__dirname, `./public/${filePath}`);
    // Check if the folder exist, if doesn't, create it
    !fs.existsSync(publicFolderPath) ? fs.mkdirSync(publicFolderPath) : null
})

app.use('/api/mastersheet', excelFileRoutes);
app.use('/api/profitLoss', profitLossRoute);

app.listen(8000, function () {
    console.log("server is ready at 8000");
    logger.info("server is ready at 8000");
})