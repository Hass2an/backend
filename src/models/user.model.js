import mongoose from "mongoose";
import bcrypt from "bcrypt"
import  Jwt  from "jsonwebtoken";

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

userSchema.pre("save", function async(next){
    if(!this.isModified("password")) return next();
    this.password = bcrypt.hash(this.password,10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
    Jwt.sign(
        {
            _id:this._id,
            username : this.username,
            email: this.email,
            fullName:this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    Jwt.sign({
        _id: this._id
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
    }
    )
}

export const User = mongoose.model("User", userSchema)
