const ExcelJS = require('exceljs');
const {join} = require('path');
const XLSX = require('xlsx');

async function createTwoWorksheets(summary, summaryFileName) {
    const existingWorkbookPath = join(__dirname, `../public/pnlSourceFiles/${summaryFileName}.xlsx`);
    const workbook = new ExcelJS.Workbook();
    // const workbook = XLSX.utils.book_new();
    await workbook.xlsx.readFile(existingWorkbookPath);

    // Create the second worksheet2
    const worksheet2 = workbook.addWorksheet('Summary'); // Replace 'Sheet1' with the desired sheet name

    const border = {
        top: { style: 'medium', color: { argb: 'FF000000' } },    // Top border with medium thickness and black color
        left: { style: 'medium', color: { argb: 'FF000000' } },   // Left border with medium thickness and black color
        bottom: { style: 'medium', color: { argb: 'FF000000' } }, // Bottom border with medium thickness and black color
        right: { style: 'medium', color: { argb: 'FF000000' } }   // Right border with medium thickness and black color
      };
    const fillPeach = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFCBA5' }, // PEACH fill color
    }
    const alignCenter = { horizontal: 'center', vertical: 'middle', wrapText: true, textRotation: 0, indent: 0, readingOrder: 'ltr', };
    const padding ={
        top: { pt: 10 },    // Top padding in points
        bottom: { pt: 10 }, // Bottom padding in points
      };
    // Add summary to the worksheet2
    //ROW1
    worksheet2.getCell('A1').value = 'DATE';
    worksheet2.getCell('A1').border = border;
    worksheet2.getCell('A1').fill = fillPeach;
    worksheet2.getCell('A1').alignment = alignCenter;
    worksheet2.getCell('A1').text = padding;

    worksheet2.getCell('B1').value = summaryFileName;
    worksheet2.getCell('B1').border = border;
    worksheet2.getCell('B1').fill = fillPeach;
    worksheet2.getCell('B1').alignment = alignCenter;
    worksheet2.getCell('B1').text = padding;

    // Merge cells A1 and B1 (horizontal merge)
    worksheet2.mergeCells('B1:H1');

    let j = 2;
    const fillYellow = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFF00' }, // YELLOW fill color
    }
    const fillBlue = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '000080' }, // BLUE fill color
    }
    const fillOrange = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'F4C430' }, // ORANGE fill color
    }
    
    const fillRed = {
        bold: true,
        color: { argb: 'FF0000' }, // RED font color
    };

    const fillWhite = {
        bold: true,
        color: { argb: 'FFFFFF' }, // RED font color
    };
    for (var i = 0; i < summary.length; i++) {
        var item = summary[i]
        if (item) {
            var key = Object.keys(item)[0];
        }
        // console.log('item',item);
        const value = item[key]; // Extract the value (the inner object) based on the key

        //ROW2
        worksheet2.getCell(`A${j}`).value = key
        worksheet2.getCell(`A${j}`).border = border
        worksheet2.getCell(`A${j}`).alignment = alignCenter;

        worksheet2.getCell(`A${j}`).fill = fillOrange
        worksheet2.getCell(`A${j}`).border = border

        worksheet2.getCell(`B${j}`).fill = fillBlue
        worksheet2.getCell(`B${j}`).border = border

        worksheet2.getCell(`C${j}`).value = 'QTY';
        worksheet2.getCell(`C${j}`).fill = fillBlue
        worksheet2.getCell(`C${j}`).font = fillWhite
        worksheet2.getCell(`C${j}`).border = border

        worksheet2.getCell(`D${j}`).value = 'SP';
        worksheet2.getCell(`D${j}`).fill = fillBlue
        worksheet2.getCell(`D${j}`).font = fillWhite
        worksheet2.getCell(`D${j}`).border = border

        worksheet2.getCell(`E${j}`).value = 'PAYOUT';
        worksheet2.getCell(`E${j}`).fill = fillBlue
        worksheet2.getCell(`E${j}`).font = fillWhite
        worksheet2.getCell(`E${j}`).border = border

        worksheet2.getCell(`F${j}`).value = 'P&L';
        worksheet2.getCell(`F${j}`).fill = fillBlue
        worksheet2.getCell(`F${j}`).font = fillWhite
        worksheet2.getCell(`F${j}`).border = border

        worksheet2.getCell(`G${j}`).value = 'Support';
        worksheet2.getCell(`G${j}`).fill = fillBlue
        worksheet2.getCell(`G${j}`).font = fillWhite
        worksheet2.getCell(`G${j}`).border = border

        worksheet2.getCell(`H${j}`).value = 'P&L With Support';
        worksheet2.getCell(`H${j}`).fill = fillBlue
        worksheet2.getCell(`H${j}`).font = fillWhite
        worksheet2.getCell(`H${j}`).border = border
        worksheet2.getCell(`H${j}`).alignment = { wrapText: true }; // Set wrapText property

        //Merge cells
        worksheet2.mergeCells(`A${j}:A${j + 3}`);
        // console.log(key, value, 'value');
        worksheet2.getCell(`B${j + 1}`).fill = fillYellow
        worksheet2.getCell(`B${j + 1}`).border = border        

        worksheet2.getCell(`C${j + 1}`).value = value.totalqty;
        worksheet2.getCell(`C${j + 1}`).fill = fillYellow
        worksheet2.getCell(`C${j + 1}`).border = border

        worksheet2.getCell(`D${j + 1}`).value = value.totalSP;
        worksheet2.getCell(`D${j + 1}`).fill = fillYellow
        worksheet2.getCell(`D${j + 1}`).border = border

        worksheet2.getCell(`E${j + 1}`).value = value.totalPayout;
        worksheet2.getCell(`E${j + 1}`).fill = fillYellow
        worksheet2.getCell(`E${j + 1}`).font = fillRed
        worksheet2.getCell(`E${j + 1}`).border = border

        worksheet2.getCell(`F${j + 1}`).value = value.totalPnl;
        worksheet2.getCell(`F${j + 1}`).fill = fillYellow
        worksheet2.getCell(`F${j + 1}`).border = border

        worksheet2.getCell(`G${j + 1}`).value = value.totalSupport;
        worksheet2.getCell(`G${j + 1}`).fill = fillYellow
        worksheet2.getCell(`G${j + 1}`).border = border

        worksheet2.getCell(`H${j + 1}`).value = value.totalPnlWithSupport;
        worksheet2.getCell(`H${j + 1}`).fill = fillYellow
        worksheet2.getCell(`H${j + 1}`).border = border


        worksheet2.getCell(`B${j + 2}`).value = '2% less';
        worksheet2.getCell(`B${j + 2}`).border = border


        worksheet2.getCell(`B${j + 2}`).fill = fillYellow
        worksheet2.getCell(`B${j + 2}`).border = border

        worksheet2.getCell(`C${j + 2}`).fill = fillYellow
        worksheet2.getCell(`C${j + 2}`).border = border
    
        worksheet2.getCell(`D${j + 2}`).fill = fillYellow
        worksheet2.getCell(`D${j + 2}`).border = border

        worksheet2.getCell(`E${j + 2}`).value = value.twoPercentOfPayout;
        worksheet2.getCell(`E${j + 2}`).fill = fillYellow
        worksheet2.getCell(`E${j + 2}`).border = border

        worksheet2.getCell(`F${j + 2}`).fill = fillYellow
        worksheet2.getCell(`F${j + 2}`).border = border

        worksheet2.getCell(`G${j + 2}`).fill = fillYellow
        worksheet2.getCell(`G${j + 2}`).border = border

        worksheet2.getCell(`H${j + 2}`).fill = fillYellow
        worksheet2.getCell(`H${j + 2}`).border = border


        worksheet2.getCell(`B${j + 3}`).value = 'NET P&L';
        worksheet2.getCell(`B${j + 3}`).fill = fillBlue
        worksheet2.getCell(`B${j + 3}`).font = fillWhite
        worksheet2.getCell(`B${j + 3}`).border = border


        worksheet2.getCell(`C${j + 3}`).fill = fillBlue
        worksheet2.getCell(`C${j + 3}`).border = border

        worksheet2.getCell(`D${j + 3}`).fill = fillBlue
        worksheet2.getCell(`D${j + 3}`).border = border

        // worksheet2.getCell(`E${j + 3}`).value = value.netPnl;
        worksheet2.getCell(`E${j + 3}`).fill = fillBlue
        // worksheet2.getCell(`E${j + 3}`).font = fillWhite;
        worksheet2.getCell(`E${j + 3}`).border = border

        worksheet2.getCell(`F${j + 3}`).fill = fillBlue
        worksheet2.getCell(`F${j + 3}`).border = border
        worksheet2.getCell(`F${j + 3}`).font = fillWhite;
        worksheet2.getCell(`F${j + 3}`).value = value.netPnl;

        worksheet2.getCell(`G${j + 3}`).fill = fillBlue
        worksheet2.getCell(`G${j + 3}`).border = border

        worksheet2.getCell(`H${j + 3}`).fill = fillBlue
        worksheet2.getCell(`H${j + 3}`).border = border
        worksheet2.getCell(`H${j + 3}`).font = fillWhite;
        worksheet2.getCell(`H${j + 3}`).value = value.netPnlWithSupport;

        j = j + 5;
    }
  
    await workbook.xlsx.writeFile(existingWorkbookPath);
    console.log('Two worksheets created successfully.');
    // Save the workbook to a file
}

module.exports = createTwoWorksheets