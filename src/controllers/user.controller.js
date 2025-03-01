import {asyncHandler} from "../utils/asyncHandler.js";
import {apiError} from "../utils/apiError.js"
import {User} from "../models/user.model.js"
import {UploadOnCloudinary} from "../utils/cloudinaryService.js"
import {apiResponse} from "../utils/ApiResponse.js"
import jwt from  "../middleware/auth.middleware.js"

const generateAccessAndRefreshToken= async (userId)=>{
    try {
        const user=await User.findById(userId);
        const accessToken=await user.generateAccessToken()
        const refreshToken=await user.generateRefreshToken()
        user.refreshToken=refreshToken;
        await user.save({validateBeforeSave:false})
        return {accessToken,refreshToken}
        
    } catch (error) {
        throw new apiError(500,"something went wrong while generation refresh and access token ")
        
    }

}


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
    // console.log("email: ",email);
    
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
// console.log(req.files?.avatar[0]?.path);

// const coverImageLocalpath=req.files?.coverImage[0]?.path
let coverImageLocalpath;
if(req.files&& Array.isArray(req.files.coverImage)&&req.files.coverImage.length >0 ){
    coverImageLocalpath=req.files.coverImage[0].path
}

if(!avatarlocalpath){
    throw new apiError(404,"avatar is required")
}

const avatar=await UploadOnCloudinary(avatarlocalpath)
// console.log("avatar url",avatar);

const coverImage= await UploadOnCloudinary(coverImageLocalpath)
if(!avatar){
    throw new apiError(404,"avatar is not uploaded")
}
const user=await User.create({
    username:username.toLowerCase(),
    email,
    fullName,
    avatar:avatar?.url,
    coverImage:coverImage?.url|| "",
    password,
})
// console.log(user);

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
const loginUser=asyncHandler(async  (req,res)=> {
    // req.body-> data 
    // username or email
    // find the user
    //password check
    //access and refesh token
    //send cookies


    const{email,username,password}=req.body;
    if(!username && !email){
        throw new apiError("username or email is required");
    }
    const user =await User.findOne({
        $or:[{username},{email}]
    })
    if(!user){
        throw new apiError(404,"user doesnot exist")
    }
    // console.log(user);
    
    const isPasswordValid=await user.isPasswordCorrect(password)
    // console.log(isPasswordValid);
    
    if(!isPasswordValid){
        throw new apiError(401,"password not correct")
    }
    const{accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id)
    const options={
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new apiResponse(200,{
            user:loginUser,accessToken,refreshToken
        },  
        "user logged In successfully"
    )
    )
})

const LogOutUser=asyncHandler(async (req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,{
            $set:{refreshToken:undefined}
        },{
            new:true
        }
    )
    const options={
        httpOnly:true,
        secure:true
    }
//     console.log("Logging out user:", req.user._id);
// console.log("Cookies cleared");
// console.log("Sending response:", new apiResponse(200, {}, "user loggedOut"));

    return res
    .status(200).clearCookie("accessToken").clearCookie("refreshToken").json(new apiResponse(
        200,
        {},
        "user loggedOut "
    ))
    
})

const refeshAccessToken =asyncHandler( async (req,res)=>{
   const incommingRefeshToken=req.cookies.refreshToken||req.body.refreshToken
   if(!incommingRefeshToken){
    throw new apiError(401,"unauthorized request")
   }
  try {
     const decodedToken=jwt.verify(incommingRefeshToken,process.env.REFRESH_TOKEN_SECRET)
  
     const user=await User.findById(decodedToken?._id)
     if(!user){
      throw new apiError(402,"Invalid refresh token")
      }
  
      if(incommingRefeshToken!== user?.refreshToken){
          throw new apiError(402,"refresh token expired or used")
      }
  
      const options={
          httpOnly:true,
          secure:true
      }
     const {accessToken,newRefreshToken} = await generateAccessAndRefreshToken(user._id)
  
      return res.status(200)
      .cookie("accessToken",accessToken,options)
      .cookie("refreshToken",newRefreshToken,options)
      .json(
          new apiResponse(
              200,{accessToken
                  ,
                  refreshToken:newRefreshToken
              },
              "acccess token refreshed successfully"
  
          )
      )
  } catch (error) {
    new apiError(401,error?.message||"access token refresh failed")
    
  }

})
export {registerUser,loginUser,LogOutUser,refeshAccessToken}