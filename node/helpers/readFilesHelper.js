const fs = require("fs");
const csv = require("csv-parser");
const xlsx = require("xlsx");
const {join} = require("path");
const fastcsv = require("fast-csv");
const ExcelJS = require("exceljs");
const readline = require("readline");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const streamThrottle = require('stream-throttle'); // Example, if using throttling

const { logger, exceptionLogger } = require("../logger.js");
const { log } = require("console");

function readXLSXFile(filePath) {
  // console.log(res, 'ressssss');
  try {
    if (filePath) {
      return new Promise((resolve, reject) => {
        // validating master sheet
        if (filePath.includes("targetFile")) {
          console.log("working in helper targetFile");
          const workbook = xlsx.readFile(filePath);
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = xlsx.utils.sheet_to_json(worksheet, {
            defval: "",
            header: 1,
          });
          resolve(jsonData);
        } else {
          console.log("working in helper ", filePath);
          const workbook = xlsx.readFile(filePath);
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = xlsx.utils.sheet_to_json(worksheet, { defval: "" });
          console.log("data resolved");
          resolve(jsonData);
        }
      });
    }
  } catch (error) {
    console.error(error);
    logger.error("Error occurred:", error);
    exceptionLogger.error("Error occurred:", error);
  }
}

function readCSVFile(filePath) {
  if (!filePath) {
    logger.error("Internal Error:");
    exceptionLogger.error("Internal Error");
    return Promise.reject(new Error("Invalid file path"));
  }

  return new Promise((resolve, reject) => {
    const results = [];
    console.log("working in helper ", filePath);
    const readStream = fs.createReadStream(filePath);

    readStream
      .pipe(csv())
      .on("data", (data) => {
        results.push(data);
        // // Process a chunk of data here if needed
        // if (results.length >= 1000) {
        //   // Example: Process every 1000 rows
        //  // Clear results to free up memory
        //   results.length = 0;
        // }
      })
      .on("end", () => {        
        resolve(results); // Or resolve with any final data if needed
      })
      .on("error", (error) => {
        reject(error);
      })
      .on("close", () => {
        // Close and clean up resources here
      });
  });
}


const addNewHeaders = (filePath, summaryFileName, newHeaders) => {
  return new Promise((resolve, reject) => {
    const updatedData = [];
    // Read the existing CSV file and add new headers
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        updatedData.push(row);
      })
      .on("end", async () => {
        // Add the new headers to the first row of the updated data
        newHeaders.forEach((header) => {
          updatedData[0][header] = "";
        });

        // Create a new Excel workbook
        const workbook = new ExcelJS.Workbook();

        // Add a worksheet to the workbook
        const worksheet = workbook.addWorksheet("Sheet1");

        // Add the updated data with headers to the worksheet
        worksheet.addRow(Object.keys(updatedData[0])); // Add the headers
        updatedData.forEach((row) => {
          worksheet.addRow(Object.values(row)); // Add the rows
        });
        console.log("inside");
        try {
          const excelFilePath = join(
            __dirname,
            `../public/pnlSourceFiles/${summaryFileName}.xlsx`
          );
          const buffer = await workbook.xlsx.writeBuffer();
          fs.writeFileSync(excelFilePath, buffer);
          console.log("File created successfully.");
        } catch (error) {
          console.error("Error writing Excel file:", error);
        }
        resolve(true);
      })
      .on("error", (error) => {
        console.error(error);
        logger.error("Error occurred:", error);
        exceptionLogger.error("Error adding new headers to the CSV file.");
        reject(false);
      });
  });
};

// Function to read headers from the XLSX file
const getHeadersFromXLSX = async (filePath) => {
  try {
    if (filePath) {
      console.log('getting HeadersFromXLSX');
      return new Promise(async (resolve, reject) => {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);
        const worksheet = workbook.worksheets[0];
        const headers = [];

        worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
          if (rowNumber === 1) {
            // Assuming the headers are in the first row of the first worksheet
            row.eachCell({ includeEmpty: true }, (cell) => {
              headers.push(cell.value);
            });
          }
        });
        console.log('headers resolved');
        resolve(headers);
      });
    }
  } catch (error) {
    console.error(error);
    logger.error("Error occurred:", error);
    exceptionLogger.error("Error occurred:", error);
  }
};

// Function to read headers from the XLSX file
const updatePayReport = async (inputFilePath) => {
  return new Promise((resolve, reject) => {
    try {
      const outputFilePath = join(
        __dirname,
        `../public/pnlSourceFiles/UpdatedPayReport.csv`
      ); // Replace with your output CSV file path

      const desiredColumns = [
        "date/time",
        "settlement id\n",
        "type\n",
        "order id",
        "Sku",
        "description\n",
        "quantity",
        "account type",
        'payout'
      ]; // Add your desired column headers here

      const filteredResults = [];

      fs.createReadStream(inputFilePath)
        .pipe(csv({ skipLines: 11 })) // Skip the first 11 lines
        .on("data", (data) => {
          const lastColumnName = Object.keys(data)[Object.keys(data).length - 1];
          const lastColumnValue = parseFloat(data[lastColumnName].replace(/,/g, ""));

          if (data["type\n"] === "Order\n" && lastColumnValue > 0) {
            const filteredData = {};
            for (const column of desiredColumns) {
              filteredData[column] = (column === 'payout' ? Number(lastColumnValue) : data[column]);
            }

            // filteredData['payout'] = lastColumnValue;
            filteredResults.push(filteredData);
          }
        })
        .on("end", () => {
          // desiredColumns.push('payout')
          const csvWriter = createCsvWriter({
            path: outputFilePath,
            header: desiredColumns.map((column) => ({
              id: column,
              title: column,
            })),
          });

          csvWriter
            .writeRecords(filteredResults)
            .then(() => {
              console.log(
                "Filtered data has been written to updatedPayReport.csv"
              );
              resolve(true);
            })
            .catch((error) => {
              console.error("Error writing CSV file:", error);
              reject(false);
            });
        })
        .on("error", (err) => {
          console.error("Error:", err);
          reject(false);
        });
    } catch (error) {
      console.error("Error:", error);
      reject(false);
    }
  });
};

// const updatePayReport = async (inputFilePath) => {
//   return new Promise((resolve, reject) => {
//     try {
//       const outputFilePath = join(
//         __dirname,
//         `../public/pnlSourceFiles/UpdatedPayReport.csv`
//       ); // Replace with your output CSV file path

//       const desiredColumns = [
//         "date/time",
//         "settlement id\n",
//         "type\n",
//         "order id",
//         "Sku",
//         "description\n",
//         "quantity",
//         "account type",
//         "payout",
//       ]; // Add your desired column headers here

//       const writeStream = fs.createWriteStream(outputFilePath);
//       const csvWriter = createCsvWriter({
//         path: outputFilePath,
//         header: desiredColumns.map((column) => ({
//           id: column,
//           title: column,
//         })),
//         append: false, // Ensure we're writing a new CSV file
//       });

//       writeStream.write(`${desiredColumns.join(",")}\n`);

//       fs.createReadStream(inputFilePath)
//         .pipe(csv({ skipLines: 11 })) // Skip the first 11 lines
//         .on("data", (data) => {
//           const lastColumnName = Object.keys(data)[
//             Object.keys(data).length - 1
//           ];
//           const lastColumnValue = parseFloat(
//             data[lastColumnName].replace(/,/g, "")
//           );

//           if (data["type\n"] === "Order\n" && lastColumnValue > 0) {
//             const filteredData = {};
//             for (const column of desiredColumns) {
//               filteredData[column] =
//                 column === "payout" ? Number(lastColumnValue) : data[column];
//             }

//             const rowData = desiredColumns.map((column) => filteredData[column]);
//             writeStream.write(`${rowData.join(",")}\n`);
//           }
//         })
//         .on("end", () => {
//           writeStream.end();
//           console.log(
//             "Filtered data has been written to updatedPayReport.csv"
//           );
//           resolve(true);
//         })
//         .on("error", (err) => {
//           console.error("Error:", err);
//           reject(false);
//         });
//     } catch (error) {
//       console.error("Error:", error);
//       reject(false);
//     }
//   });
// };


module.exports = {
  readCSVFile: readCSVFile,
  readXLSXFile: readXLSXFile,
  addNewHeaders: addNewHeaders,
  getHeadersFromXLSX: getHeadersFromXLSX,
  updatePayReport: updatePayReport,
};
