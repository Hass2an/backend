import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import uploadCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";

const generateaccessTokenandRefreshToken = async(userid) =>{
     try {
          const user = await User.findById(userid)
          const accessToken = user.generateAccessToken()
          const refreshToken = user.generateRefreshToken()

          user.refreshToken = refreshToken
          await user.save({validiteBeforeSave: false})

          return {refreshToken,accessToken}
     } catch (error) {
          throw new ApiError(500, "Something went wrong")
     }
}

const registerUser = asyncHandler( async( req,res)=>{
   const {username, password, email,fullName} = req.body
   console.log("email", email);


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

   const existUser = await User.findOne({
    $or: [{username},{email}]
   })
   if (existUser) {
    throw new ApiError(409,"User with email or username already exist")
    
   }

   const avaterLocalPath = req.files?.avater[0]?.path;
//    const coverImagePath = req.files?.coverImage[0]?.path;

let coverImagePath;
if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
     coverImagePath = req.files.coverImage[0].path;
}

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
    username,
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

const loginUser = asyncHandler(async (req, res) => {

     const {email, password,username} = req.body
     if(!username || !email){
          throw new ApiError(400,"username or password are required")
     }

     const user = await User.findOne({
          $or: [{username},{email}]
     })
     if (!user) {
          throw new ApiError(404, "email not found")
     }

     const isPasswordValid = await user.isPasswordCorrect(password)
     
     if (!isPasswordValid){
          throw new ApiError(401, "credational are not correct")
     }

     const {accessToken,refreshToken}= await generateaccessTokenandRefreshToken(user._id)

     const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

     const options = {
          httpOnly :true,
          secure: true
     }
     return res
     .status(200)
     .cookie("accessToken",accessToken,options)
     .cookie("refreshToken", refreshToken, options)
     .json(
          new ApiResponse(
               200,
               {
                    user: loggedInUser, accessToken
               },
               "User logged in successfully"
          )
     )
})

const logoutUser = asyncHandler(async(req,res) =>{
     await User.findByIdAndUpdate(
          req.user._id,
          {
               $set:{
                    refreshToken: undefined,
               }
          },
          {
               new : true
          }

     )

     const options = {
          httpOnly: true,
          secure:true
     }
     return res
     .status(200)
     .clearCookie("accessToken, options")
     .clearCookie("refreshToken, options")
     .json(new ApiResponse(200,{},"UserLogout"))
}) 

export {
     registerUser,
     loginUser,
     logoutUser
};