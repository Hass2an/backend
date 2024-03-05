import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import uploadCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";


const registerUser = asyncHandler( async( req,res)=>{
   const {username, password, email,fullName} = req.body
   console.log("email", email);
   console.log("username", username);
   console.log("password", password);
   console.log("fullname", fullName);

   if (fullName === "") {
        throw ApiError(400, "fullname is required")
   }

   if (username === "") {
        throw ApiError(400, "username is required")
   }
   if (password === "") {
        throw ApiError(400, "password is required")
   }
   if (email === "") {
        throw ApiError(400, "email is required")
   }

   const existUser = User.findOne({
    $or: [{username},{email}]
   })
   if (existUser) {
    throw new ApiError(409,"User with email or username already exist")
    
   }

   const avaterLocalPath = req.files?.avater[0]?.path;
   const coverImagePath = req.files?.coverImage[0]?.path;
   if (!avaterLocalPath) {
     throw ApiError(400, "Avater File is required")
   }

   const avater = await uploadCloudinary(avaterLocalPath)
   const coverimage = await uploadCloudinary(coverImagePath)
   if (!avater) {
    throw new ApiError(400, "Avater file is required")
   }

   const user = await User.create({
    fullName,
    avater: avater.url,
    coverimage: coverimage?.url || "",
    email,
    password,
    username: username.toLowercase()
   })

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )
  if (!createdUser) {
    throw new ApiError(500,"registring error")
  }

return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered Successfully")
)

})


export default registerUser;