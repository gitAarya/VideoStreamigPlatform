import {v2 as cloudinary} from "cloudinary";
import { log } from "console";
import fs from "fs";
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const UploadOnCloudinary= async (LocaFilePath)=>{
    try {
      if(!LocaFilePath) return null
      //uplaod the file to the cloudinary
       const response = await cloudinary.uploader.upload(LocaFilePath,
        {
          resource_type:"auto"
        })
        //file has been uploades succccessfully 
        console.log("file is uploaded on the cloudinaey",response.url);
        return response;
        
    } catch (error) {
      fs.unlinkSync(LocaFilePath)// remove the locally saved file as the upload opeartion got failed
      return null;

      
    }

  }
  export {UploadOnCloudinary}