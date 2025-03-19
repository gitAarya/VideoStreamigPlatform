import {v2 as cloudinary} from "cloudinary";
import { error, log } from "console";
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
        fs.unlink(LocaFilePath, (err) => {
          if (err) {
              console.error("Error deleting local file:", err);
          } else {
              console.log("File deleted from local storage:", LocaFilePath);
          }
      });
      
        return response;
        
    } catch (error) {
      console.error("Cloudinary upload error:", error);

      fs.unlinkSync(LocaFilePath)// remove the locally saved file as the upload opeartion got failed
      return null;

      
    }

  }
  const deleteFromCloudinary = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
        console.log("Old file deleted from Cloudinary.");
    } catch (error) {
        console.error("Error deleting file:", error);
    }
};
  export {UploadOnCloudinary,deleteFromCloudinary}