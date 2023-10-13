const fs = require("fs");
const XLSX = require("xlsx");
const { join } = require("path");
const { eachDayOfInterval, parse, format } = require("date-fns");

const readFileHelper = require("../helpers/readFilesHelper.js");
let formattedDate;

async function checkFileAndReadExcel(excelFilePath) {
  try {
    const exists = await checkFileExists(excelFilePath);
    if (exists) {
      console.log("exist");
      const pnlOrderReportData = await readFileHelper.readXLSXFile(
        excelFilePath
      );
      return pnlOrderReportData; // Return the data from the function
    } else {
      console.log(`File "${excelFilePath}" does not exist.............`);
      return null; // Return null if the file doesn't exist
    }
  } catch (error) {
    console.error("Error occurred:", error);
    return null; // Return null in case of an error
  }
}

function checkFileExists(filePath) {
  return new Promise((resolve) => {
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        resolve(false); // The file does not exist
      } else {
        resolve(true); // The file exists
      }
    });
  });
}

// Function to create and populate the Excel file from JSON data
async function createExcelFile(data, excelFilePath, sheetName) {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  let worksheet;
  if (sheetName === "sheet1") {
    // Convert data to a worksheet
    worksheet = await XLSX.utils.json_to_sheet(data);
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  } else {
    // Convert data to a worksheet
    worksheet = await XLSX.utils.json_to_sheet(data);
    console.log(worksheet, "worksheet");
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Summary");
  }

  // Write the workbook to the file
  XLSX.writeFile(workbook, excelFilePath);

  console.log("Excel file created successfully!");
}

function formatBrandManagerName(name) {
  const brandeManagerName =
    name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  return brandeManagerName;
}

async function findDuplicateOrderIds(orderIds) {
  const uniqueIds = new Set();
  const duplicateIds = new Set();

  for (const orderId of orderIds) {
    if (uniqueIds.has(orderId)) {
      duplicateIds.add(orderId);
    } else {
      uniqueIds.add(orderId);
    }
  }

  return Array.from(duplicateIds);
}

function getDate(filename) {
  const keyword = "CustomUnifiedTransaction";

  const dateRange = filename.substring(0, filename.indexOf(keyword)); // Output: 2023Aug17-2023Aug17
  let formattedDates;
  const [startDateStr, endDateStr] = dateRange.split("-");
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  if (startDateStr === endDateStr) {
    const parsedDate = parse(startDateStr, "yyyyMMMdd", new Date());
    return format(parsedDate, "dd-MMM-yyyy"); //Output: 2023_Aug_14
  } else {
    console.log("different-", 'startDate', startDateStr, 'endDate',endDateStr);
    const datesInRange = eachDayOfInterval({ start: startDate, end: endDate });
    console.log('datesInRange',datesInRange);
    formattedDates = datesInRange.map((date) => format(date, "dd-MMM-yyyy"));
    const [day, month, year] = formattedDates[0].split("-"); // Extract the year and abbreviated month from the first date
    const dayParts = formattedDates.map((date) => date.split("-")[0]); // Extract the day part from each date
    const combinedDay = dayParts.join(","); // Combine day parts
    const combinedDate = `${combinedDay}-${month}-${year}`; // Form the combined date string
    return combinedDate;
  }
}

function getMonth(filename) {
  const keyword = "CustomUnifiedTransaction";

  const dateRange = filename.substring(0, filename.indexOf(keyword)); // Output: 2023Aug17-2023Aug17
  const [startDateStr, endDateStr] = dateRange.split("-");
  const parsedDate = parse(startDateStr, "yyyyMMMdd", new Date());

  const month = format(parsedDate, "MMM"); // Adding 1 because getMonth() returns 0-indexed months
  const year = parsedDate.getFullYear();

  return `${month}-${year}`;
}

module.exports = {
  checkFileAndReadExcel,
  checkFileExists,
  createExcelFile,
  formatBrandManagerName,
  findDuplicateOrderIds,
  getDate,
  getMonth,
};
