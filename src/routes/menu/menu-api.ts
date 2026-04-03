import express from "express";
import { serverError } from "proses-response";
import configs from "../../config/config";
import environment from "../../environment";
import { sendEncryptedResponse } from "../../services/encryptResponse-service";
import { printPDF } from "../../services/pdf-service";
import { Menu } from "./menu-model";
import { tokenMiddleWare } from "../../middlewares/tokenMiddleware";
const config = (configs as { [key: string]: any })[environment];
const router = express.Router();

router.post("/", tokenMiddleWare, async (req, res) => {
  try {
   await Menu.bulkCreate(req.body);
   
    sendEncryptedResponse(res,  null, "menu added");

  } catch (error) {
    serverError(res, error);
  }
});

router.get("/", async (req, res) => {
  try {
    let menu = await Menu.findAll({ attributes: ["id", "title", "link"] });
    // success(res, menu, "all menu");
    sendEncryptedResponse(res,  menu, "all menu");
  } catch (error) {
    serverError(res, error);
  }
});

router.get("/create-pdf", async (req, res) => {
  try {
    const pdfArgs = {
      template: "./src/template/newPdf2.html",
      fileName: "newPdf.pdf",
      uploadRoute: `${config.publicPath}/pdf`,
      data: {
        baseUrl: config.ApiUrl,
        logo: "/static/pdf/img/fitzy.png",
        body: "/static/pdf/img/body.png",
        heightChart: "/static/pdf/img/heightForAgeGraph.jpg",
        bmiChart: "/static/pdf/img/BMIforAgeGraph.jpg",
        fitzyIcon: "/static/pdf/img/fitzyIcon.png",
        bowlIcon: "/static/pdf/img/bowl.png",
        spoonIcon: "/static/pdf/img/spoon.png",
        glassIcon: "/static/pdf/img/glass.png",
      },
    };
    const result = await printPDF(pdfArgs);
    // success(res, result, "Get all ExamApplication");
    sendEncryptedResponse(res,  result, "Get all ExamApplication");
  } catch (error) {
    serverError(res, error);
  }
});

module.exports = router;
