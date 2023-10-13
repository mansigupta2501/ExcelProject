const multer = require("multer");
const express = require("express");
const app = express();
const {join} = require('path')
const mime = require('mime');
const { logger, exceptionLogger } = require('../logger.js');

const profitAndLossController = require('../controllers/ProfitAndLossController.js')
const { getDate } = require('../helpers/pnlHelper.js')
let paymentReportDate;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        return cb(null, "./public/pnlSourceFiles");
    },
    filename: function (req, file, cb) {
        console.log('inside filename');
        if (file.fieldname === "pnlPurchaseMaster") {
            var fileExtension = file.originalname.split('.').pop();
            return cb(null, `PurchaseMaster-pl.${fileExtension}`);
        } else if (file.fieldname === "pnlFbaInventory") {
            var fileExtension = file.originalname.split('.').pop();
            return cb(null, `FbaInventory-pl.${fileExtension}`);
        } else if (file.fieldname === "paymentReport") {
            paymentReportDate = file.originalname
            var fileExtension = file.originalname.split('.').pop();
            return cb(null, `PaymentReport-pl.${fileExtension}`);
        }
    },
});

// Set the file filter to only allow CSV and Excel files
const fileFilter = (req, file, cb) => {
    console.log('inside file filter');
    if (file.fieldname === "pnlPurchaseMaster") {
        (file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") ? cb(null, true) : cb(null, false); // accept the file
    } else if (file.fieldname === "pnlFbaInventory") {
        (file.mimetype === "text/csv") ? cb(null, true) : cb(null, false); // accept the file
    } else if (file.fieldname === "paymentReport") {
        (file.mimetype === "text/csv") ? cb(null, true) : cb(null, false); // accept the file
    } else {
        cb(new Error("Invalid file type. Only CSV & xlsx format files are allowed."), false); // reject the file
    }
};

const uploadMulter = multer({ storage, fileFilter }).fields([
    {
        name: "pnlPurchaseMaster",
        maxCount: 1,
    },
    {
        name: "pnlFbaInventory",
        maxCount: 1,
    },
    {
        name: "paymentReport",
        maxCount: 1,
    }
]);

app.post("/upload", uploadMulter, function(req, res){
    profitAndLossController(req, res, paymentReportDate);
})

app.get("/download/:updatedFile", (req, res) => {
    let updatedFile = req.params.updatedFile;
    console.log('updatedFile',updatedFile);
    const result = updatedFile.split("=")[1];
    const my_directory = "./public/pnlSourceFiles";
    try {
        if (result) {
            let filePath = join(my_directory, `${result}`);
            const mimeType = mime.getType(result);

            res.setHeader('Content-Type', mimeType);
            res.setHeader("Content-Disposition", `attachment; filename="${result}"`);
            res.status(200).download(filePath, (err) => {
                if (err) {
                    logger.error('Error occurred:', err);
                    exceptionLogger.error('Error occurred:', err);
                    console.error("Error sending file: ", err);
                    res.status(500).send("Internal server error");
                }
            });

        } else {
            res.status(500).json({
                message: 'Internal Error',
                error: true
            })
        }
    } catch (error) {
        console.error(error);
        logger.error('Error occurred:', error);
        exceptionLogger.error('Error occurred:', error);
        res.status(500).json({
            message: 'Internal Error',
            error: true
        })
    }
});

module.exports = app;