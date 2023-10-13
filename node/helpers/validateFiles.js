const fs = require('fs');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const {join} = require('path')
const { logger, exceptionLogger } = require('../logger.js');

let businessReportValid = true;
let easyopsDamageInventoryValid = true;
let fbaInventoryValid= true;
let purchaseMasterValid = true
let masterSheetValid = true

// Middleware to validate CSV file
const validateCSVFiles = async (filepath, csvFilename, expectedColumnNames) => {
    console.log('validating ', csvFilename);
    // Read the CSV file and validate the column names
    return new Promise((resolve, reject) => {
    fs.createReadStream(filepath)
        .pipe(csv())
        .on('headers', (headers) => {
            const missingColumns = expectedColumnNames.filter((col) => !headers.includes(col) && col !== '');

            if (missingColumns.length > 0) {
                // Missing columns found
                exceptionLogger.error(`Missing columns in ${csvFilename} CSV file: ${missingColumns.join(', ')}`);
                // throw new Error(`Missing columns in ${csvFilename} CSV file: ${missingColumns.join(', ')}`);
                if(csvFilename == 'BusinessReport.csv'){
                    businessReportValid = false
                }
                // else if(csvFilename == 'EasyopsDamage.csv'){
                //     easyopsDamageInventoryValid = false
                // }
                resolve(false);             
            }
            
            // console.log(csvFilename, 'easyopsDamageInventoryValid', easyopsDamageInventoryValid);
            console.log(csvFilename, 'businessReportValid', businessReportValid);
            resolve(true);
            // All columns are present, proceed to the next middleware

        })
        .on('error', (err) => {
            // Error occurred while reading the CSV file
            // return res.status(500).send('Error reading CSV file');
            console.error('Error reading CSV file', err)
            reject(err);
        });
    });
};

// Middleware to validate XLSX file
const validateXLSXFile = async (filename, filePath, expectedColumnNames) => {
    console.log('validating ', filename);
    try {
        const workbook = xlsx.readFile(filePath);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = xlsx.utils.sheet_to_json(worksheet, { defval: '', header: 1 });
        const headers = jsonData[0];
        const missingColumns = await expectedColumnNames.filter((column) => !headers.includes(column) && column !== '');
        // Parse the XLSX file
        if (missingColumns.length > 0) {
            // throw new Error(`Missing columns XLSX file: ${missingColumns.join(', ')}`);
            exceptionLogger.error(`Missing columns XLSX file: ${missingColumns.join(', ')}`);
            if(filename == 'PurchaseMaster.xlsx'){
                purchaseMasterValid = false
            }
            else if(filename == 'EasyopsDamage.xlsx'){
                fbaInventoryValid = false
            }
            else if(filename == 'FbaInventory.xlsx'){
                fbaInventoryValid = false
            }
            else if(filename == 'MasterSheet.xlsx'){
                masterSheetValid = false
            }            
        }
            console.log(filename, 'easyopsDamageInventoryValid', easyopsDamageInventoryValid);
        console.log(filename, 'purchaseMasterValid', purchaseMasterValid);
            console.log(filename, 'fbaInventoryValid', fbaInventoryValid);
            console.log(filename, 'masterSheetValid', masterSheetValid);

        // File is valid

    } catch (error) {
        // File is invalid
        throw new Error('Invalid XLSX file: ' + error.message);
    }
}

const validateFiles = async (files) => {
    console.log('Getting files in middleware for validation');
    try {
        for (const file in files) {
            const filesArray = files[file];
            for (const file of filesArray) {
                if (file.filename.endsWith('.csv')) {
                    if (file.filename == 'BusinessReport.csv') {
                        const csvFilePublicpath = '../public/masterSourceFiles/' + file.filename
                        const filepath = join(__dirname, csvFilePublicpath)
                        const BusinessReportColumns = [ 'Units Ordered'];

                        await validateCSVFiles(filepath, file.filename, BusinessReportColumns)
                    }
                    // else if (file.filename == 'EasyopsDamage.csv') {
                    //     const csvFilePublicpath = '../public/masterSourceFiles/' + file.filename
                    //     const filepath = join(__dirname, csvFilePublicpath)
                    //     const easyopsDamageInventoryColumns = [ 'SKU'];

                    //     await validateCSVFiles(filepath, file.filename, easyopsDamageInventoryColumns)
                    // }
                }
                else if (file.filename.endsWith('.xlsx')) {
                    // console.log('file.filename---.xlsx---', file.filename)

                    if (file.filename == 'FbaInventory.xlsx') {
                        const csvFilePublicpath = '../public/masterSourceFiles/' + file.filename
                        const filepath = join(__dirname, csvFilePublicpath)
                        const fbaInventoryColumns = ['sku', 'asin', 'product-name', 'your-price'];

                        await validateXLSXFile(file.filename, filepath, fbaInventoryColumns)
                    }
                    else if (file.filename == 'PurchaseMaster.xlsx') {
                        const csvFilePublicpath = '../public/masterSourceFiles/' + file.filename
                        const filepath = join(__dirname, csvFilePublicpath)
                        const purchaseMasterColumns = ['ASIN', 'Brand Manager'];

                        await validateXLSXFile(file.filename, filepath, purchaseMasterColumns)
                    }
                    else if (file.filename == 'EasyopsDamage.xlsx') {
                        const csvFilePublicpath = '../public/masterSourceFiles/' + file.filename
                        const filepath = join(__dirname, csvFilePublicpath)
                        const easyopsDamageInventoryColumns = ['SKU'];

                        await validateXLSXFile(file.filename, filepath, easyopsDamageInventoryColumns)
                    }
                }
            };
            // console.log('invalidFiles---', invalidFiles)

            // }
        }

        if(masterSheetValid && purchaseMasterValid && easyopsDamageInventoryValid && businessReportValid){
            return true;
        }
        else{
            return false;
        }
            
    }
    catch (err) {
        console.error('error while validating', err)
    }
}

module.exports = {
    validateFiles: validateFiles
}