import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const UserSchema= new mongoose.Schema( 
    {
        watchHistory:[
            //array of video id
               {
                type:mongoose.Schema.Types.ObjectId,
                ref:"Video"
              }
        ],
        username:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
            index:true,
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
        },
        fullName:{
            type:String ,
            required:true,
            index:true,
        },
        avatar:{
        type:String ,//cloudnary url
        required:true,
        },
        coverImage:{
            type:String,//cloudnary url
            

        },
        password:{
            type:String,
            required:[true,"password is required"]
        },
        refreshToken:{
            type:String,

        }

    },{timestamps:true}
)
UserSchema.pre("save",async function (next) {
    if(!this.isModified("password")) return next()
        this.password= await bcrypt.hash(this.password,10)    
    next()
})

UserSchema.methods.isPasswordCorrect=async function (password) {
return await bcrypt.compare(password,this.password)   
}
UserSchema.methods.generateAccessToken=function(){
return jwt.sign(
    {
        _id:this._id,
        email:this.email,
        username:this.username,
        fullName:this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
    expiresIn:process.env.ACCESS_TOKEN_EXPIRE
    }
)
}
UserSchema.methods.generateRefreshToken=function(){
  return jwt.sign( 
     {  
          _id:this._id,
     },
     process.env.REFRESH_TOKEN_SECRET,
     {
     expiresIn:process.env.REFRESH_TOKEN_EXPIRE
     }) 
 
    
}
export const User= mongoose.model("User",UserSchema)