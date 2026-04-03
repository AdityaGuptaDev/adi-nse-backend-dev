import { Request } from "express";
import fs from "fs";
import configs from "../config/config";
import environment from "../environment";
const config = (configs as { [key: string]: any })[environment];
const multer = require("multer");
const express = require('express')

const excelFiles = "excelFiles";
const blog = 'blog'
const panImage = 'panDoc'
const AddressImage = 'addressDoc'
const Cheque = 'chequeDoc'
const sign = 'signature'
const video = 'video'
const photo = 'photo'
const RelationshipProofImage = "RelationshipProofImage"
const assetsExcelImport = "assetsExcelImport";

const app = express()

const removeInitSlash = (str: string) => {
  return str.substring(1);
};


const getFileStorage = (path: string) => {
  return multer.diskStorage({
    destination: function (req: Request, file: any, cb: any) {
      // const uploadPath = `/${config.development.publicPath}/${path}`;
      // cb(null, process.cwd() + uploadPath);
      const uploadPath = `/${config.publicPath}/${path}`;
      if (!fs.existsSync(`.${uploadPath}`)) {
        fs.mkdirSync(`.${uploadPath}`);
      }
      cb(null, process.cwd() + uploadPath);
    },
    filename: function (req: Request, file: any, cb: any) {
      var d = new Date();
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });
};

const getFileStorage2 = () => {
  return multer.diskStorage({
    destination: function (req: Request, file: any, cb: any) {
      // const uploadPath = `/${config.development.publicPath}/${path}`;
      // cb(null, process.cwd() + uploadPath);

      const uploadPath = `/${config.publicPath}/${req.body.folder}`;
      if (!fs.existsSync(`.${uploadPath}`)) {

        fs.mkdirSync(`.${uploadPath}`);
      }
      cb(null, process.cwd() + uploadPath);
    },
    filename: function (req: Request, file: any, cb: any) {
      // console.log(file,"<<<<<<<<<<<<<<<<<<<<<<");

      var d = new Date();
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });
};

const excelFilter = function (req: Request, file: any, cb: any) {
  // accept image only
  if (!file.originalname.match(/\.(xlsx|xls)$/)) {
    return cb(new Error("Only excel files are allowed!"), false);
  }
  cb(null, true);
};

const imageFilter = function (req: Request, file: any, cb: any) {
  // accept image only
  if (!file.originalname.match(/\.(jpg|jpeg|png|JPG|JPEG|PNG|webp)$/)) {
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};
const VideoFilter = function (req: Request, file: any, cb: any) {
  // accept image only
  if (!file.originalname.match(/\.(mp4|avi|mov|mkv|webm)$/i)) {
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};


export const excelUpload = multer({
  storage: getFileStorage(excelFiles),
  fileFilter: excelFilter,
});

export const blogImage = multer({
  storage: getFileStorage(blog),
  fileFilter: imageFilter,
});

export const AssetsExcelImport = multer({
  storage: getFileStorage(assetsExcelImport),
  fileFilter: excelFilter,
});

export const ImageUploder = multer({
  storage: getFileStorage2(),
  fileFilter: imageFilter,
});

export const PANUploder = multer({
  storage: getFileStorage(panImage),
  fileFilter: imageFilter,
});
export const RelationshipProof = multer({
  storage: getFileStorage(RelationshipProofImage),
  fileFilter: imageFilter,
});
export const UploderFrontAddress = multer({
  storage: getFileStorage(AddressImage),
  fileFilter: imageFilter,
});
export const CancelCheque = multer({
  storage: getFileStorage(Cheque),
  fileFilter: imageFilter,
});
export const Signature = multer({
  storage: getFileStorage(sign),
  fileFilter: imageFilter,
});
export const Video = multer({
  storage: getFileStorage(video),
  fileFilter: VideoFilter,
});
export const Photo = multer({
  storage: getFileStorage(photo),
  fileFilter: imageFilter,
});