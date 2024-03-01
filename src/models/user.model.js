import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique: true,
        lowercase:true,
        trim:true,
        index:true
    },
    email:{
        type:String,
        required: true,
        lowercase:true,
        unique:true,
        lowercase:true,
        trim:true
    },
    fullName:{
        type:String,
        required:true,
        trim:true,
        index:true
    },

    avater:{
        type: String, // cloudinary url
        required: true
    },
    coverImage:{
        type: String,
    },
    watchHistory:[
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
}
],
    password:{
        type:String,
        required:[true, "Password us required"],
    },
    
    refreshToken:{
        type:String,
    }

},{timestamps:true});

const User = mongoose.model("User", userSchema)
