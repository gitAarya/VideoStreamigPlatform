import {asyncHandler} from "../utils/asyncHandler.js";
import {apiError} from "../utils/apiError.js"
import {User} from "../models/user.model.js"
import {UploadOnCloudinary} from "../utils/cloudinaryService.js"
import {apiResponse} from "../utils/ApiResponse.js"

const registerUser=asyncHandler( async(req,res)=>{
    
    //get user details from frontend
    //validation -not empty
    //check if user already exixt -usrname email
    //check for images
    // checks for avatar
    //uplaod them to cloudnary,avatar
    //create user object- create entry in db
    //remove password and refresh token field from response 
    //check for user creation 
    //return response
    const {fullName,email,username,password}=req.body;
    console.log("email: ",email);
    
    if(
        [fullName,username,email,password].some( (field)=>field?.trim()=== "")
    ){
        throw new apiError(400,"all fields are required")
        
    }
    const existedUser=await User.findOne({
        $or:[{username},{email}]
    })

    if(existedUser){
        throw new apiError(409,"user already exist")
    }

const avatarlocalpath=req.files?.avatar[0]?.path
const coverImageLocalpath=req.files?.coverImage[0]?.path

if(!avatarlocalpath){
    throw new apiError(404,"avatar is required")
}

const avatar=UploadOnCloudinary(avatarlocalpath)
const coverImage=UploadOnCloudinary(coverImageLocalpath)
if(!avatar){
    throw new apiError(404,"avatar is not uploaded")
}
const user=await User.create({
    fullName,
    username:username.toLowerCase(),
    email,
    avatar:avatar?.url,
    coverImage:coverImage?.url|| "",
    password,
})
const createdUser=await User.findById(user._id).select(
    "-password -refreshToken"
)
if(!createdUser){
    throw new apiError(500,"something went wrong while registration")
}

return res.status(209).json(
    new apiResponse(209,createdUser,"user created successfully")
)

})

export {registerUser}