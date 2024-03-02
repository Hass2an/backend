import fs from 'fs';
import {v2 as cloudinary} from 'cloudinary';
          
cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.CLOUD_API_KEY, 
  api_secret: process.env.CLOUD_API_KEY_SECRET 
});

const uploadCloudinary = async(localFilePath)=>{
    try {
        if(!localFilePath) return null
        // upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto"
        })
        // file has been upload successfull
        console.log("File is upload on cloud", response.url);
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath)
        // remove the locally saved temporoty file as the upload operation got failed
        return null;
    }
}

export default uploadCloudinary;