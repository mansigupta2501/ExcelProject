const fs = require("fs");
const { join } = require("path");
const { logger, exceptionLogger } = require("../logger.js");
const validateFiles = require("../helpers/validateFiles.js");
const readFileHelper = require("../helpers/readFilesHelper.js");
const pnlHelper = require("../helpers/pnlHelper.js");
const createSheet = require("../controllers/createSheet.js");

const ProfitAndLossController = async (req, res, paymentReportDate) => {
  let pnlOrderReportData; // Define a variable to store the value
  
  try {
    // Extracted from req.files for better readability
    const { pnlFbaInventory, pnlPurchaseMaster, paymentReport } = req.files;
    const pnlType = req.body.payReportType;
    paymentReportDate =
      pnlType === "daily"
        ? pnlHelper.getDate(paymentReportDate)
        : pnlHelper.getMonth(paymentReportDate);
    const summaryFileName = paymentReportDate + " PNL AMZ";

    const allFilesArray = [
      join(
        __dirname,
        `../public/pnlSourceFiles/${pnlFbaInventory[0].filename}`
      ),
      join(
        __dirname,
        `../public/pnlSourceFiles/${pnlPurchaseMaster[0].filename}`
      ),
      join(__dirname, `../public/pnlSourceFiles/${paymentReport[0].filename}`),
    ];

    if (pnlFbaInventory && pnlPurchaseMaster && paymentReport) {
      const isFileValid = true;
      if (isFileValid) {
        const newHeaders = [
          "Asin",
          "Brand Manager",
          "SP",
          "NLC(CP)",
          "Final CP",
          "P&L",
          "Support",
          "Final CP With support",
          "P&L with support",
        ]; // Add the new headers here

        const [pnlFbaInventoryData, pnlPurchaseData, isPayReportUpdated] =
          await Promise.all([
            readFileHelper.readCSVFile(allFilesArray[0]),
            readFileHelper.readXLSXFile(allFilesArray[1]),
            readFileHelper.updatePayReport(allFilesArray[2]),
          ]);

        const excelFilePath1 = join(
          __dirname,
          `../public/pnlSourceFiles/${summaryFileName}.xlsx`
        );

        if (isPayReportUpdated) {
          var UpdatedPayReportPath = join(
            __dirname,
            `../public/pnlSourceFiles/UpdatedPayReport.csv`
          );
        }
        //generate new file - ${summaryFileName}.xlsx with added headers
        const isHeaderAdded = await readFileHelper.addNewHeaders(
          UpdatedPayReportPath,
          summaryFileName,
          newHeaders
        );
        if (isHeaderAdded) {
          console.log("isHeaderAdded", isHeaderAdded);

          // Instead of directly logging, assign the value to pnlOrderReportData
          pnlOrderReportData = await pnlHelper.checkFileAndReadExcel(
            excelFilePath1
          );
          let dates_Arr = [];
          let allBrandManagers_Arr = [];
          let orderId_Arr = [];
          let count = 0;

          // console.log('pnlOrderReportData',pnlOrderReportData.length, 'pnlFbaInventoryData',pnlFbaInventoryData.length, 'pnlPurchaseData',pnlPurchaseData.length);

          ///
          //   pnlOrderReportData.forEach((row) => {
          //     dates_Arr.push(row["date/time"]);
          //     orderId_Arr.push(row["order id"]);
          //     //updating data from
          //     pnlFbaInventoryData.forEach((fbaInventoryRow) => {
          //       //fetch asin by sku id
          //       var fbaAsin =
          //         typeof fbaInventoryRow["asin"] === "string"
          //           ? fbaInventoryRow["asin"].trim()
          //           : fbaInventoryRow["asin"];
          //       if (row["Sku"] === fbaInventoryRow["sku"]) {
          //         // console.log('match');
          //         row["Asin"] = fbaAsin
          //           ? fbaAsin
          //           : "Not available in fba inventory";
          //         pnlType === "daily"
          //           ? (row["SP"] = fbaInventoryRow["your-price"]
          //               ? Number(fbaInventoryRow["your-price"])
          //               : "Not available in fba inventory")
          //           : (row["SP"] = 0);
          //       }
          //       // fetch asin by product-name(description) if sku not available
          //       else if (
          //         !row["Asin"] &&
          //         (row["description\n"] === fbaInventoryRow["product-name"] ||
          //           row["description"] === fbaInventoryRow["product-name"])
          //       ) {
          //         row["Asin"] = fbaAsin
          //           ? fbaAsin
          //           : "Not available in fba inventory";

          //         pnlType === "daily"
          //           ? (row["SP"] = fbaInventoryRow["your-price"]
          //               ? Number(fbaInventoryRow["your-price"])
          //               : "Not available in fba inventory")
          //           : (row["SP"] = 0);
          //       }
          //     });

          //     pnlPurchaseData.forEach(async (purchaseMasterRow) => {
          //       var pmAsin =
          //         typeof purchaseMasterRow["ASIN"] === "string"
          //           ? purchaseMasterRow["ASIN"].trim()
          //           : purchaseMasterRow["ASIN"];

          //       if (row["Asin"] === pmAsin) {
          //         row["Brand Manager"] = purchaseMasterRow["Brand Manager"]
          //           ? purchaseMasterRow["Brand Manager"]
          //           : "Not available";
          //         row["NLC(CP)"] = purchaseMasterRow["CP"]
          //           ? purchaseMasterRow["CP"]
          //           : "Not available in purchase master";
          //         row["Support"] = purchaseMasterRow["Additional support"]
          //           ? purchaseMasterRow["Additional support"]
          //           : 0;
          //       }

          //       //Pushing names of brand managers in an array
          //       if (purchaseMasterRow["Brand Manager"] !== "") {
          //         const brandManagerName = await pnlHelper.formatBrandManagerName(
          //           purchaseMasterRow["Brand Manager"]
          //         );
          //         allBrandManagers_Arr.push(brandManagerName);
          //       }
          //     });
          //     //convert to numbers
          //     row["quantity"] = Number(row["quantity"]);
          //     row["settlement id\n"] = Number(row["settlement id\n"]);
          //     row["payout"] = Number(row["payout"]);
          //     typeof row["Sku"] === "number" ? Number(row["Sku"]) : row["Sku"];

          //     if (
          //       row["NLC(CP)"] &&
          //       row["NLC(CP)"] !== "Not available in purchase master"
          //     ) {
          //       row["Final CP"] =
          //         Number(row["quantity"]) * Number(row["NLC(CP)"]);
          //       row["Final CP With support"] =
          //         (Number(row["NLC(CP)"]) - Number(row["Support"])) *
          //         Number(row["quantity"]);
          //     }
          //     if (row["Final CP"] && row["Final CP"] !== "NaN") {
          //       //pnl = payout - final cp
          //       row["P&L"] = Number(row["payout"]) - Number(row["Final CP"]);
          //     }
          //     if (
          //       row["Final CP With support"] &&
          //       row["Final CP With support"] !== "NaN"
          //     ) {
          //       //pnl = payout - final cp
          //       row["P&L with support"] =
          //         Number(row["payout"]) - Number(row["Final CP With support"]);
          //     }
          //     count++;
          //     console.log(count);
          //   });
          ///

          const chunkSize = 500; // Choose an appropriate chunk size

          for (
            let startIndex = 0;
            startIndex < pnlOrderReportData.length;
            startIndex += chunkSize
          ) {
            const endIndex = Math.min(
              startIndex + chunkSize,
              pnlOrderReportData.length
            );
            const chunk = pnlOrderReportData.slice(startIndex, endIndex);

            for (const row of chunk) {
              dates_Arr.push(row["date/time"]);
              orderId_Arr.push(row["order id"]);

              //fetch asin by sku id
              const fbaInventoryMatch = pnlFbaInventoryData.find(
                (fbaInventoryRow) => row["Sku"] === fbaInventoryRow["sku"]
              );
              if (fbaInventoryMatch) {
                row["Asin"] =
                  fbaInventoryMatch["asin"] || "Not available in fba inventory";
                row["SP"] =
                  pnlType === "daily"
                    ? Number(fbaInventoryMatch["your-price"]) ||
                      "Not available in fba inventory"
                    : 0;
              }
// fetch asin by product-name(description) if sku not available
              const fbaInventoryMatchbyProductName = pnlFbaInventoryData.find(
                (fbaInventoryRow) =>
                  row["description\n"] === fbaInventoryRow["product-name"] ||
                  row["description"] === fbaInventoryRow["product-name"]
              );
              if (fbaInventoryMatchbyProductName) {
                var fbaAsin =
                  typeof fbaInventoryMatchbyProductName["asin"] === "string"
                    ? fbaInventoryMatchbyProductName["asin"].trim()
                    : fbaInventoryMatchbyProductName["asin"];
                row["Asin"] = fbaAsin || "Not available in fba inventory";
                row["SP"] =
                  pnlType === "daily"
                    ? Number(fbaInventoryMatchbyProductName["your-price"]) ||
                      "Not available in fba inventory"
                    : 0;
              }
              const purchaseMasterMatch = pnlPurchaseData.find(
                (purchaseMasterRow) => row["Asin"] === purchaseMasterRow["ASIN"]
              );
              if (purchaseMasterMatch) {
                row["Brand Manager"] =
                  purchaseMasterMatch["Brand Manager"] || "Not available";
                row["NLC(CP)"] =
                  purchaseMasterMatch["CP"] ||
                  "Not available in purchase master";
                row["Support"] = purchaseMasterMatch["Additional support"] || 0;
                if (purchaseMasterMatch["Brand Manager"] !== "") {
                  const brandManagerName =
                    await pnlHelper.formatBrandManagerName(
                      purchaseMasterMatch["Brand Manager"]
                    );
                  allBrandManagers_Arr.push(brandManagerName);
                };
              }
//convert to numbers
              row["quantity"] = Number(row["quantity"]);
              row["settlement id\n"] = Number(row["settlement id\n"]);
              row["payout"] = Number(row["payout"]);
              typeof row["Sku"] === "number" ? Number(row["Sku"]) : row["Sku"];

              if (
                row["NLC(CP)"] &&
                row["NLC(CP)"] !== "Not available in purchase master"
              ) {
                row["Final CP"] =
                  Number(row["quantity"]) * Number(row["NLC(CP)"]);
                row["Final CP With support"] =
                  (Number(row["NLC(CP)"]) - Number(row["Support"])) *
                  Number(row["quantity"]);
              }
              if (row["Final CP"] && row["Final CP"] !== "NaN") {
                //pnl = payout - final cp
                row["P&L"] = Number(row["payout"]) - Number(row["Final CP"]);
              }
              if (
                row["Final CP With support"] &&
                row["Final CP With support"] !== "NaN"
              ) {
                //pnl = payout - final cp
                row["P&L with support"] =
                  Number(row["payout"]) - Number(row["Final CP With support"]);
              }

              // Rest of your calculations...

              count++;
              console.log(count);
            }
          }

          console.log("pnl complete");

          const duplicateOrderIds = await pnlHelper.findDuplicateOrderIds(
            orderId_Arr
          );
          console.log("duplicateOrderIds complete");
            
          duplicateOrderIds.forEach((orderId) => {
            pnlOrderReportData.forEach((row, index) => {
              if (row["order id"] == orderId) {
                for (let i = index + 1; i < pnlOrderReportData.length; i++) {
                  const nextRow = pnlOrderReportData[i];
                  if (row["order id"] === nextRow["order id"]) {
                    //   matchingOrders.push([row, pnlOrderReportData[i]]);
                    if (row["account type"] !== nextRow["account type"]) {
                      let payout = row["payout"];
                      let nextRowPayout = nextRow["payout"];
                      let updatedPayout =
                        Number(payout) + Number(nextRowPayout); // Converts to comma-separated format

                      console.log(
                        "updatedPayout",
                        updatedPayout,
                        "updatedPayout"
                      );
                      //updating payout of row having duplicate order id with part payment
                      row["payout"] = updatedPayout;

                      //updating pnl in case of duplicate order id with part payment
                      row["P&L"] = updatedPayout - row["Final CP"];
                      row["P&L with support"] =
                        updatedPayout - row["Final CP With support"];

                      //removing order id row after updating payout through part payment
                      const indexToRemove = pnlOrderReportData.indexOf(nextRow);
                      if (indexToRemove !== -1) {
                        pnlOrderReportData.splice(indexToRemove, 1);
                      }
                    }
                  }
                }
              }
            });
          });

          // console.log('pnlOrderReportData',pnlOrderReportData,'pnlOrderReportData');

          console.log("duplicateOrderIds find and update done");
          const totalPnlData_arr = []; // Create an object to store dynamic variable data
          const totalData = {}; // Push the totalData object into totalPnlData_arr with dynamic key
          var uniqueBrandManagers = [
            ...new Set(allBrandManagers_Arr.map((name) => name)),
          ];
          // Sort the array in alphabetical order
          uniqueBrandManagers.sort();
          // Loop through the variable names and initialize them in the object
          uniqueBrandManagers.forEach((name) => {
            if (name !== "`") {
              totalData[name] = {
                totalqty: 0,
                totalSP: 0,
                totalPayout: 0,
                totalPnl: 0,
                totalSupport: 0,
                totalPnlWithSupport: 0,
              };
            }
          });

          // // getting all the brand managers name & count total data for all the brand managers
          pnlOrderReportData.forEach((item) => {
            let brandManagerNames = pnlHelper.formatBrandManagerName(
              item["Brand Manager"]
            );
            uniqueBrandManagers.map((bm) => {
              if (bm == brandManagerNames) {
                totalData[brandManagerNames].totalqty += Number(
                  item["quantity"]
                );
                totalData[brandManagerNames].totalSP += Number(item["SP"]);
                totalData[brandManagerNames].totalPayout =
                  Number(totalData[brandManagerNames].totalPayout) +
                  Number(item["payout"]);
                totalData[brandManagerNames].totalPnl += Number(item["P&L"]);
                totalData[brandManagerNames].totalSupport += Number(
                  item["Support"]
                );
                totalData[brandManagerNames].totalPnlWithSupport += Number(
                  item["P&L with support"]
                );
              }
            });
          });

          //initializing total values as 0
          let totalqty = 0;
          let totalSP = 0;
          let totalPayout = 0;
          let totalPnl = 0;
          let totalSupport = 0;
          let totalPnlWithSupport = 0;

          // Iterate through each key (name) in totalData and its corresponding object
          for (const name in totalData) {
            if (totalData.hasOwnProperty(name)) {
              const values = totalData[name];
              totalPnlData_arr.push({ [name]: values });

              //calculating total of all the keys in totalData object
              totalqty += values.totalqty;
              totalSP += values.totalSP;
              totalPayout += values.totalPayout;
              totalPnl += values.totalPnl;
              totalSupport += values.totalSupport;
              totalPnlWithSupport += values.totalPnlWithSupport;
            }
          }
          totalPnlData_arr.push({
            Total: {
              totalqty,
              totalSP,
              totalPayout,
              totalPnl,
              totalSupport,
              totalPnlWithSupport,
            },
          });

          totalPnlData_arr.forEach((item) => {
            const key = Object.keys(item)[0]; // The variable 'item' represents each object in the array
            const value = item[key]; // Extract the value (the inner object) based on the key
            // Add the 'twoPercentOfPayout' property to the inner object
            value.twoPercentOfPayout = (value.totalPayout.toFixed(2) * 2) / 100;
            if (value.twoPercentOfPayout) {
              //netpnl = totalpnl - 2% of payout
              value.netPnl =
                value.totalPnl.toFixed(2) - value.twoPercentOfPayout.toFixed(2);
              value.netPnlWithSupport =
                value.totalPnlWithSupport.toFixed(2) -
                value.twoPercentOfPayout.toFixed(2);
            }
          });
          // console.log("totalPnlData_arr1111", totalPnlData_arr[0]);

          // create json to excel format & create the Excel file
          await pnlHelper.createExcelFile(
            pnlOrderReportData,
            excelFilePath1,
            "sheet1"
          );

          await createSheet(totalPnlData_arr, summaryFileName);
          console.log("updated successfully");
          logger.info("updated successfully");
          const jsonData = {
            success: true,
            message: "Data updated successfully.",
            data: {
              updatedSummary: `${summaryFileName}.xlsx`,
            },
          };

          // Send the final JSON response using res.json
          res.status(200).json(jsonData);
          //Delete files
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
        logger.error("File is not valid Please check and try again");
        exceptionLogger.error("File is not valid Please check and try again");
        const errorMessage = "File is not valid Please check and try again";
        res.json({
          message: errorMessage,
          error: true,
        });
      }
    } else {
      await Promise.all(
        allFilesArray.map((filePath) =>
          filePath
            ? fs.promises
                .unlink(filePath)
                .then(() =>
                  console.log(`Successfully deleted file ${filePath}`)
                )
            : null
        )
      );

      const errorMessage =
        "Files you uploaded may is not valid Please check its format and try again";
      logger.error(errorMessage);
      exceptionLogger.error(errorMessage);
      res.json({
        message: errorMessage,
        error: true,
      });
    }
  } catch (error) {
    console.error(error);
    logger.error("Error occurred:", error);
    exceptionLogger.error("Error occurred:", error);
    const errorMessage = "Data not updated.";
    res.json({
      message: errorMessage,
      error: true,
    });
  }
};
module.exports = ProfitAndLossController;
