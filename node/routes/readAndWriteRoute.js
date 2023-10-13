const {join} = require("path");
const multer = require("multer");
const express = require("express");
const app = express();
// const http = require('http')
// const { Server } = require('socket.io')
// const cors = require('cors');
const {getType} = require('mime');
const { logger, exceptionLogger } = require('../logger.js');

const readAndWriteController = require('../controllers/ReadAndWriteController.js')

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log('inside dest');
        if (file.fieldname === "targetFile") {
            return cb(null, "./public/targetFile");
        }
        else {
            return cb(null, "./public/masterSourceFiles");
        }
    },
    filename: function (req, file, cb) {
        console.log('inside filename');
        if (file.fieldname === "targetFile") {
            var fileExtension = file.originalname.split('.').pop();
            return cb(null, `MasterSheet.${fileExtension}`);
        } else if (file.fieldname === "purchaseMaster") {
            var fileExtension = file.originalname.split('.').pop();
            return cb(null, `PurchaseMaster.${fileExtension}`);
        } else if (file.fieldname === "fbaInventory") {
            var fileExtension = file.originalname.split('.').pop();
            return cb(null, `FbaInventory.${fileExtension}`);
        } else if (file.fieldname === "businessReport") {
            var fileExtension = file.originalname.split('.').pop();
            return cb(null, `BusinessReport.${fileExtension}`);
        } else if (file.fieldname === "inventoryLedger") {
            var fileExtension = file.originalname.split('.').pop();
            return cb(null, `InventoryLedger.${fileExtension}`);
        } else if (file.fieldname === "feesPreview") {
            var fileExtension = file.originalname.split('.').pop();
            return cb(null, `FeesPreview.${fileExtension}`);
        } else if (file.fieldname === "agingFile") {
            var fileExtension = file.originalname.split('.').pop();
            return cb(null, `AgingFile.${fileExtension}`);
        } else if (file.fieldname === "easyopsDamage") {
            var fileExtension = file.originalname.split('.').pop();
            return cb(null, `EasyopsDamage.${fileExtension}`);
        }
    },
});

// Set the file filter to only allow CSV and Excel files
const fileFilter = (req, file, cb) => {
    console.log('inside file filter');
    if (file.fieldname === "purchaseMaster") {
        (file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") ? cb(null, true) : cb(null, false); // accept the file
    } else if (file.fieldname === "fbaInventory") {
        (file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") ? cb(null, true) : cb(null, false); // accept the file
    } else if (file.fieldname === "businessReport") {
        (file.mimetype === "text/csv") ? cb(null, true) : cb(null, false); // accept the file
    } else if (file.fieldname === "inventoryLedger") {
        (file.mimetype === "text/csv") ? cb(null, true) : cb(null, false); // accept the file
    }  else if (file.fieldname === "feesPreview") {
        (file.mimetype === "text/csv") ? cb(null, true) : cb(null, false); // accept the file
    } else if (file.fieldname === "agingFile") {
        (file.mimetype === "text/csv") ? cb(null, true) : cb(null, false); // accept the file
    } else if (file.fieldname === "easyopsDamage") {
        file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ? cb(null, true) : cb(null, false); // accept the file
    } else if (file.fieldname === "targetFile") {
        file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ? cb(null, true) : cb(null, false); // accept the file
    } else {
        cb(new Error("Invalid file type. Only CSV & xlsx format files are allowed."), false); // reject the file
    }
};

const uploadMulter = multer({ storage, fileFilter }).fields([
    {
        name: "purchaseMaster",
        maxCount: 1,
    },
    {
        name: "fbaInventory",
        maxCount: 1,
    },
    {
        name: "businessReport",
        maxCount: 1,
    },
    {
        name: "targetFile",
        maxCount: 1,
    },
    {
        name: "feesPreview",
        maxCount: 1
    },
    {
        name: "inventoryLedger",
        maxCount: 1
    },
    {
        name: "agingFile",
        maxCount: 1
    },
    {
        name: "easyopsDamage",
        maxCount: 1
    }
]);

app.post("/upload", uploadMulter, readAndWriteController);

app.get("/download/:updatedFile", (req, res) => {
    let updatedFile = req.params.updatedFile;
    const result = updatedFile.split("=")[1];
    const my_directory = "./public/targetFile";
    try {
        if (result) {
            let filePath = join(my_directory, `${result}`);
            const mimeType = getType(result);

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