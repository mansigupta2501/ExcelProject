const fs = require('fs');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const {join} = require('path');
// const Logger = require('../Loggers/logger');
const { logger, exceptionLogger } = require('../logger.js');
// config file rquiring
const configData = require('../config/config.json');
const validateFiles = require('../helpers/validateFiles.js')

// getting data of config in the base of files
const FBAConfigdata = configData['FbaInventory.xlsx'];
const purchaseConfigdata = configData['PurchaseMaster.xlsx']
const easyopsDamageConfigdata = configData['EasyopsDamage.xlsx'];
const businessConfigdata = configData['BusinessReport.csv'];
const inventoryLedgerConfigData = configData["InventoryLedger.csv"];
const readFileHelper = require('../helpers/readFilesHelper.js');
const readAndWriteController = async (req, res) => {
    // res.setHeader('Content-Type', 'text/plain');
    // res.writeHead(200, {
    //     'Content-Type': 'text/html',
    //     'Transfer-Encoding': 'chunked',
    // });
    // let progress = 0
    const findHighestStockAge = (stockAgeArr) => {
        let highestStockAge = stockAgeArr[0];
        for (let i = 1; i < stockAgeArr.length; i++) {
            if (stockAgeArr[i] > highestStockAge) {
                highestStockAge = stockAgeArr[i];
            }
        }
        return highestStockAge;
    }
    const files = req.files;
    console.log('files', files)

    // console.log('req.body', req.files.targetFile[0].filename, 'req');
    try {
        // Set the response headers
        if (files.targetFile) {
            var masterSheetDataPath = join(__dirname, `../public/targetFile/${req.files.targetFile[0].filename}`)
        }
        if (files.fbaInventory) {
            var manageFBAinventoryDataPath = join(__dirname, `../public/masterSourceFiles/${req.files.fbaInventory[0].filename}`)
        }
        if (files.purchaseMaster) {
            var purchaseDataPath = join(__dirname, `../public/masterSourceFiles/${req.files.purchaseMaster[0].filename}`)
        }
        if (files.businessReport) {
            var businessCsvDataPath = join(__dirname, `../public/masterSourceFiles/${req.files.businessReport[0].filename}`)
        }
        if (files.easyopsDamage) {
            var easyopsDamageDataPath = join(__dirname, `../public/masterSourceFiles/${req.files.easyopsDamage[0].filename}`)
        }
        if (files.inventoryLedger) {
            var inventoryLedgerDataPath = join(__dirname, `../public/masterSourceFiles/${req.files.inventoryLedger[0].filename}`)
        }
        if (files.feesPreview) {
            var feesPreviewDataPath = join(__dirname, `../public/masterSourceFiles/${req.files.feesPreview[0].filename}`)
        }
        if (files.agingFile) {
            var agingFileDataPath = join(__dirname, `../public/masterSourceFiles/${req.files.agingFile[0].filename}`)
        }

        const allFilesArray = [manageFBAinventoryDataPath, purchaseDataPath, businessCsvDataPath, easyopsDamageDataPath, feesPreviewDataPath, agingFileDataPath, inventoryLedgerDataPath]

        if (files.targetFile && files.fbaInventory && files.purchaseMaster && files.businessReport) {
            console.log('yes');
            const isFileValid = await validateFiles.validateFiles(files);
            console.log('isFileValid', isFileValid);
            if (isFileValid) {

                const masterSheetData = await readFileHelper.readXLSXFile(masterSheetDataPath);
                // res.write(`25\n`);

                const manageFBAinventoryData = await readFileHelper.readXLSXFile(manageFBAinventoryDataPath);
                // res.write(`30\n`);
                const purchaseData = await readFileHelper.readXLSXFile(purchaseDataPath);
                // res.write(`35\n`);
                const businessCsvData = await readFileHelper.readCSVFile(businessCsvDataPath);
                // res.write(`40\n`);
                if (easyopsDamageDataPath) {
                    var easyopsDamageData = await readFileHelper.readXLSXFile(easyopsDamageDataPath);
                }
                if (inventoryLedgerDataPath) {
                    var inventoryLedgerData = await readFileHelper.readCSVFile(inventoryLedgerDataPath);

                }
                if (feesPreviewDataPath) {
                    var feesPreviewData = await readFileHelper.readCSVFile(feesPreviewDataPath);
                }
                if (agingFileDataPath) {
                    var agingFileData = await readFileHelper.readCSVFile(agingFileDataPath);
                }
                // res.write(`50\n`);
                const locationWiseInventory = ['BLR7', 'DEL4', 'SIDA', 'DEL5', 'BOM4', 'BOM5', 'BOM7', 'CJB1', 'ISK3', 'MAA4', 'PNQ3', 'DEX3', 'BLR5', 'DEL2', 'HYD8', 'FBOA', 'PNQ2', 'FBOB', 'FBOC', 'FBOF', 'NAG1', 'SDEE', 'FBOD', 'FBOI']

                const masterArr = []; // Initialize an empty array to store updated rows
                const headers = masterSheetData[0];
                headers.push('Commission')
                locationWiseInventory.forEach(location => {
                    headers.push(location)
                });

                // Iterate over each row in manageFBAinventoryData
                for (let i = 0; i < manageFBAinventoryData?.length; i++) {
                    const row1 = manageFBAinventoryData[i];
                    var newRow = {};
                    // Create a new object for each row
                    for (let l = 0; l < headers.length; l++) {
                        const element = headers[l];
                        // console.log('element',element);
                        // console.log('row1',row1);
                        Object.entries(FBAConfigdata).forEach(([keys, value]) => {
                            newRow[(element == keys) ? element : keys] = (row1[value] !== undefined) ? row1[value] : 0;
                            if (element == 'Last 7 Days Sale' && keys == 'Last 7 Days Sale' && value == 'Units Ordered') {
                                const totalUnit = (row1[value] !== undefined) ? row1[value] : ''
                                newRow[element] = ((Number(totalUnit) / 7) !== NaN ? (Number(totalUnit) / 7).toFixed(2) : '');
                            }
                        });

                    }
                    masterArr.push(newRow); // Push newRow to masterArr
                }

                // res.write(`60\n`);
                for (let i = 0; i < masterArr?.length; i++) {
                    const element1 = masterArr[i];
                    console.log('element1',element1);
                    // res.write(`40\n`);
                    // Takin values from business file
                    for (let j = 0; j < businessCsvData?.length; j++) {
                        if (masterArr[i]['ASIN'] === businessCsvData[j]['﻿(Parent) ASIN']) {
                            Object.entries(businessConfigdata).forEach(([keys, value]) => {
                                masterArr[i][keys] = (businessCsvData[j][value] !== undefined) ? businessCsvData[j][value] : '';
                            });
                            const sales30 = (businessCsvData[j]['Units Ordered'] != undefined ? businessCsvData[j]['Units Ordered'] : '')
                            masterArr[i]['Daily avg sales'] = (Number(sales30) / 30 != NaN ? (Number(sales30) / 30).toFixed(2) : '')
                            masterArr[i]['Last 7 Days Sale'] = (Number(sales30) / 7 != NaN ? (Number(sales30) / 7).toFixed(2) : '')
                        }
                    }
                    // taking values from easyopsDamage file
                    for (let j = 0; j < easyopsDamageData?.length; j++) {
                        if (masterArr[i]['ASIN'] === easyopsDamageData[j]['ASIN']) {
                            masterArr[i]['Damage qty'] = ((Number(easyopsDamageData[j]['Good Qty']) || 0) + (Number(easyopsDamageData[j]['Bad Qty']) || 0) + Number(easyopsDamageData[j]['Blocked Qty'])) || 0;
                            masterArr[i]['Damage qty'] ? masterArr[i]['Damage qty'] : 0
                        }
                    }
                    // Adding value of "Any dispute qty where portal has not acknowledged the stock (claime)" 
                    for (let j = 0; j < inventoryLedgerData?.length; j++) {
                        // console.log('inventoryLedgerData[j]',inventoryLedgerData[j]);
                        // Object.entries(inventoryLedgerConfigData).forEach(([keys, value]) => {
                        //     masterArr[i][keys] = (inventoryLedgerData[j][value] !== undefined) ? inventoryLedgerData[j][value] : 0;
                        // });
                        if (masterArr[i]['ASIN'] === inventoryLedgerData[j]['ASIN']) {
                            if (inventoryLedgerData[j]['Location'] === 'QWTT') {
                                masterArr[i]['QWTT (GOOD)'] = ((Number(masterArr[i]['QWTT (GOOD)']) || 0) + Number(inventoryLedgerData[j]['Ending Warehouse Balance'])) || 0;
                            }
                            else {
                                //update amazon FC's
                                if (masterArr[i]['Amazon FCs'] !== undefined || masterArr[i]['Amazon FCs'] !== 'NAN') {
                                    masterArr[i]['Amazon FCs'] = Number(masterArr[i]['Amazon FCs']) + Number(inventoryLedgerData[j]['Ending Warehouse Balance']);
                                    
                                }
                                //Update locationwise data
                                locationWiseInventory.forEach(location => {
                                    if (inventoryLedgerData[j]['Location'] === location) {
                                        masterArr[i][location] = ((Number(masterArr[i][location]) || 0) + Number(inventoryLedgerData[j]['Ending Warehouse Balance'])) || 0;
                                    }
                                });


                            }
                        }
                    }
                    // total units = qwtt + amazon fc's

                    masterArr[i]['Total Units'] = Number(masterArr[i]['QWTT (GOOD)']) + Number(masterArr[i]['Amazon FCs']);
                    console.log('amazon',masterArr[i]['Amazon FCs']);

                    // Iterate over each row in purchaseData
                    for (let j = 0; j < purchaseData?.length; j++) {
                        if (masterArr[i]['ASIN'] === purchaseData[j]['ASIN']) {
                            Object.entries(purchaseConfigdata).forEach(([keys, value]) => {
                                masterArr[i][keys] = (purchaseData[j][value] !== undefined) ? purchaseData[j][value] : 'NA';
                                masterArr[i]['Stock Value'] = (Number(masterArr[i]['Total Units']) * Number(purchaseData[j]['CP'])) || 0
                            });
                        }
                        
                    }

                    // taking value of "sp" from otherfile

                    for (let j = 0; j < agingFileData?.length; j++) {
                        if (masterArr[i]['ASIN'] === agingFileData[j]['asin']) {
                            //calculating "age of stock" from otherfile
                            const stockAges = {
                                '0-90 days': parseInt(agingFileData[j]['inv-age-0-to-90-days']),
                                '91-180 days': parseInt(agingFileData[j]['inv-age-91-to-180-days']),
                                '181-270 days': parseInt(agingFileData[j]['inv-age-181-to-270-days']),
                                '271-365 days': parseInt(agingFileData[j]['inv-age-271-to-365-days']),
                                '365-plus days': parseInt(agingFileData[j]['inv-age-365-plus-days'])
                            };
                            let stockAgeArr = Object.values(stockAges);
                            let highestStockagevalue = await findHighestStockAge(stockAgeArr)
                            let ageOfStock = null;
                            for (let key in stockAges) {
                                if (stockAges[key] === highestStockagevalue) {
                                    ageOfStock = key;
                                    break;
                                }
                            }
                            masterArr[i]['Age of Stock'] = ageOfStock;

                            // //calculating "Payout" from feesfile
                            for (let k = 0; k < feesPreviewData?.length; k++) {
                                // console.log('in feesPreviewData');
                                if (agingFileData[j]['asin'] === feesPreviewData[k]['asin']) {
                                    // console.log('in feesPreviewData match ASIN');
                                    const estimatedFeeTotal = (feesPreviewData[k]['estimated-fee-total'] != undefined ? feesPreviewData[k]['estimated-fee-total'] : 0);
                                    const SP = (agingFileData[j]['sales-price'] != undefined ? agingFileData[j]['sales-price'] : 0)
                                    const commission = (Number(estimatedFeeTotal) * 1.18).toFixed(2)
                                    masterArr[i]['Commission'] = commission ? commission : 0
                                    if (estimatedFeeTotal != 0 && SP != 0) {
                                        masterArr[i]['payout'] = (SP - commission).toFixed(2)
                                    }
                                }
                            }
                        }
                    }
                    // res.write(`80\n`);

                }
                // Further processing or writing to file can be done here
                // Load the existing Excel file
                const workbook = xlsx.readFile(masterSheetDataPath);
                // Get the sheet name
                const sheetName = workbook.SheetNames[0];
                // Convert the JSON array to worksheet
                const worksheet = xlsx.utils.json_to_sheet(masterArr);

                // Add the worksheet to the workbook
                workbook.Sheets[sheetName] = worksheet;
                // Write the updated workbook back to the file
                xlsx.writeFile(workbook, masterSheetDataPath);
                // res.write(`90\n`);
                // Optional: Convert the workbook to a buffer
                const excelBuffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
                // Optional: Write the buffer to a new file
                fs.writeFileSync(masterSheetDataPath, excelBuffer);
                console.log('updated successfully');
                logger.info('updated successfully');

                // Simulate an asynchronous process

                // Complete the response with JSON using res.json or res.status.json
                const jsonData = {
                    success: true,
                    message: "Data updated successfully.",
                    data: {
                        updatedFile: `${req.files.targetFile[0].filename}`
                    }
                };



                

                // res.write('90\n')
                // // Simulate a delay before sending the JSON response
                // setTimeout(() => {lo
                // Send the final JSON response using res.json
                res.status(200).json(jsonData)
                // })

                // res.end('updation completed')
                //Delete files
                // allFilesArray
                allFilesArray.forEach((filePath) => {
                    if (filePath) {
                        fs.unlink(filePath, (err) => {
                            if (err) {
                                console.error(`Error deleting file ${filePath}:`, err);
                            } else {
                                console.log(`Successfully deleted file ${filePath}`);
                            }
                        });
                    }
                });
            }
            else {
                allFilesArray.forEach((filePath) => {
                    if (filePath) {
                        fs.unlink(filePath, (err) => {
                            if (err) {
                                console.error(`Error deleting file ${filePath}:`, err);
                            } else {
                                console.log(`Successfully deleted file ${filePath}`);
                            }
                        });
                    }
                });
                logger.error('File is not valid Please check and try again');
                exceptionLogger.error('File is not valid Please check and try again');
                const errorMessage = 'File is not valid Please check and try again';
                res.json({
                    message: errorMessage,
                    error: true
                });

            }

        } else {
            allFilesArray.forEach((filePath) => {
                if (filePath) {
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            console.error(`Error deleting file ${filePath}:`, err);
                        } else {
                            console.log(`Successfully deleted file ${filePath}`);
                        }
                    });
                }
            });
            logger.error('Files you uploaded may is not valid Please check its format and try again');
            exceptionLogger.error('Files you uploaded may is not valid Please check its format and try again');
            const errorMessage = 'Files you uploaded may is not valid Please check its format and try again';
            res.json({
                message: errorMessage,
                error: true
            });
        }

    } catch (error) {
        console.error(error);
        logger.error('Error occurred:', error);
        exceptionLogger.error('Error occurred:', error);
        const errorMessage = 'Data not updated.';
        res.json({
            message: errorMessage,
            error: true
        });
    }
    // Return from the request handler.
    // next()
}
module.exports = readAndWriteController
