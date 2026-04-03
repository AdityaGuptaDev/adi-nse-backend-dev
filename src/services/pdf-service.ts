// import fs from "fs";
import fs from 'fs/promises';
import handlebars from 'handlebars';
import { chromium } from 'playwright';
import path from 'path';
import * as XLSX from "xlsx";
import { Request, Response } from 'express';
import fs2 from "fs";



type pdfargs = {
  orientation?: String;
  template: any;
  data?: any;
  fileName: any;
  uploadRoute?: any;
};


export const printPDF = async (pdfArgs: pdfargs): Promise<string> => {
  try {
    // 1. Read template HTML file
    const htmlTemplate = await fs.readFile(pdfArgs.template, 'utf-8');

    // 2. Compile Handlebars HTML with dynamic data
    const compiledHTML = handlebars.compile(htmlTemplate)({ data: pdfArgs.data });

    // 3. Launch browser
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // 4. Load HTML content
    await page.setContent(compiledHTML, { waitUntil: 'domcontentloaded' });

    // 5. Generate PDF with header/footer
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<div style="font-size:10px;text-align:center;width:100%;">Fund Explore</div>',
      footerTemplate: `
        <div style="font-size:10px;text-align:center;width:100%;">
          Page <span class="pageNumber"></span> of <span class="totalPages"></span>
        </div>`,
      margin: {
        top: '60px',
        bottom: '60px',
        left: '25px',
        right: '25px'
      },
    });

    await browser.close();

    // ✅ Ensure upload folder exists
    const dirPath = pdfArgs.uploadRoute || '.';
    await fs.mkdir(dirPath, { recursive: true });

    // 6. Save the file to disk
    const fullPath = path.join(pdfArgs.uploadRoute || '.', pdfArgs.fileName);
    await fs.writeFile(fullPath, pdfBuffer);

    return pdfArgs.fileName;
  } catch (err) {
    console.error('PDF generation failed:', err);
    throw err;
  }
};



// export const printPDF = async (pdfArgs: pdfargs) => {
//   return new Promise(async (resolve, reject) => {
//     let options: any = {
//       format: "A4",
//       orientation: "portrait",
//       border: {
//         top: "25px", // default is 0, units: mm, cm, in, px
//         right: "25px",
//         bottom: "25px",
//         left: "25px",
//       },
//       paginationOffset: 1, // Override the initial pagination number
//       header: {
//         height: "0mm",
//         contents: "",
//       },
//       footer: {
//         height: "10mm",
//         contents: {
//           // first: 'Cover page',
//           // 2: 'Second page', // Any page number is working. 1-based index
//           // default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
//           default:
//             '<div class="gradient"></div><div class="paging"><span style="color: #444;">{{page}}</span>/<span>{{pages}}</span></div>', // fallback value
//           // last: 'Last Page'
//         },
//       },
//     };

//     await fs.readFile(
//       pdfArgs.template,
//       {
//         encoding: "utf-8",
//       },
//       async (err, html) => {
//         if (err) {
//           reject(err);
//         } else {
//           let compiledHTML = await handleBars.compile(html)({
//             data: pdfArgs.data,
//           });

//           pdf
//             .create(compiledHTML, options)
//             .toFile(`${pdfArgs.uploadRoute}/${pdfArgs.fileName}`, (err) => {
//               if (err) {
//                 reject(err);
//               }
//               resolve(pdfArgs.fileName);
//             });
//         }
//       }
//     );
//   });
// };

export const generateExcel = async (req: Request, res: Response, uploadRoute: any, fileName: any) => {
  const wb = XLSX.utils.book_new();
  const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);
  XLSX.utils.sheet_add_aoa(ws, req.body.Heading);
  XLSX.utils.sheet_add_json(ws, req.body.data, { origin: "A2", skipHeader: true });
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });

  const dirPath = uploadRoute || '.';
  await fs.mkdir(dirPath, { recursive: true });

  // const fileName = `Funds.xlsx`;
  // const filePath = path.join(__dirname, "../exports", fileName);

  const filePath = path.join(uploadRoute || '.', fileName);


  fs2.writeFileSync(filePath, buffer);

  return fileName; // now it returns a path string!
};