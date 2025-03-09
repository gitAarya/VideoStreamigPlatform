import {asyncHandler} from "../utils/asyncHandler.js";
import {apiError} from "../utils/apiError.js"
import {User} from "../models/user.model.js"
import {UploadOnCloudinary} from "../utils/cloudinaryService.js"
import {apiResponse} from "../utils/ApiResponse.js"
import jwt from  "jsonwebtoken"
import mongoose from "mongoose";

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

const changeCurrentPassword=asyncHandler(async (req,res)=>{
    const {oldPassword,newPassword}=req.body
    // find the user from teh auth middleware we can search ofr the user from req.user 
    const user = await User.findById(req.user?._id)
   const IsPasswordCorrect= await user.isPasswordCorrect(oldPassword)
   if(IsPasswordCorrect){
    throw new apiError(400,"invalid old password ")

   }
  user.password=newPassword
  await user.save({validateBeforeSave:false})

  return res
  .status(200)
  .json(new apiResponse(200,{},"password changed"))

})

const getCurrentUser=asyncHandler(async (req,res)=>{
    return res
    .status(200)
    .json( new apiResponse(200,user,"current user fetched successfully"))


})

const updateAccountDetails=asyncHandler( async (req,res)=>{
    const {fullName,email}=req.body
    if(!fullName && !email){
        throw new apiError(400,"all fields are required")
    }
    const user=await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                fullName,
                email:email
            }
        }
        ,{new :true}).select("-password")
        return res
        .status(200)
        .json(new apiResponse(200,user,"account details updated"))
})

const updateUserAvatar=asyncHandler(async (req,res)=>{
    const avatarLocalPath=req.file?.path
    if(!avatarLocalPath){
        throw new apiError(400,"avatar file is missing")
    }

    const avatar=await UploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new apiError(400,"error while uploading avatar on cloudinary")
    }
   const user=await User.findByIdAndUpdate(req.user?._id,
    {
        $set:{
            avatar:avatar.url
        }
    },
    {new:true}
   ).select("-password")

   return res.status(200)
   .json(new apiResponse(200,user,"avatar updated successfully"))


})
const updateUserCover=asyncHandler(async(req,res)=>{
    const coverImageLocalpath=req.file?.path
    if(!coverImageLocalpath){
        throw new apiError(400,"cover local path not available")
    }

    const cover=await UploadOnCloudinary(coverImageLocalpath)

    if(!cover.url){
        throw new apiError(400,"error while uploading coverImage to cloudinary")
    }
    const user=await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                coverImage:cover.url

            }
        },
        {
            new:true
        }
    ).select("-password")

    return res
    .status(200)
    .json(new apiResponse(200,user,"cover Image updated successfully"))
})

const getUserProfile=asyncHandler(async (req,res)=>{
    const {username}=req.params

    if(!username?.trim()){
        throw new apiError(400,"username not found!")
    }
   const channel= await User.aggregate([
    {
        $match:{
            username:username?.toLowerCase()
        }
    },
    {
        $lookup:{
            from:"Subscription",
            localField:"_id",
            foreignField:"channel",
            as:"subscribers"
        }
    },
   {
        $lookup:{  
        from:"Subscription",
        localField:"_id",
        foreignField:"subscriber",
        as:"subscribedTo"

            }
    },
    {
        $addFields:{
            subscriberCount:{
                $size:"subscribers"
            },
            subscribedToCount:{
                $size:"subscribedTo"
            },
            isSubscribed:{
                $cond:{
                    if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                    then:true,
                    else :false
                }
            }
        }
    },
    {
        $project:{
            fullName:1,
            username:1,
            subscriberCount:1,
            subscribedToCount:1,
            isSubscribed:1,
            avatar:1,
            coverImage:1,
        }
    }

])
// console.log(channel);
if(!channel?.length){
    throw new apiError(400,"channel doesnot exist")
}

return res
.status(200)
.json(
    new apiResponse(200,channel[0],"user channel fetched successfully")
)

})

const getUserWatchHIstory=asyncHandler(async(req,res)=>{
    const user=await User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullName:1,
                                        username:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },{
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]
                
            }
        },
        {

        }
    ])
    return res
    .status(200)
    .json( new apiResponse(200,user[0].watchHistory,"watch history fetched successfully"))
})
export {
    registerUser,
    loginUser,
    LogOutUser,
    refeshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCover,
    getUserProfile,
    getUserWatchHIstory
    
    
}