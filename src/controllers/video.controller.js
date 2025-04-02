import mongoose, {isValidObjectId, set} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {deleteFromCloudinary, UploadOnCloudinary} from "../utils/cloudinaryService.js"
import { decrypt } from "dotenv"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    // Convert page & limit to numbers
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    // console.log(query);
    

    // Build filter query
    const filter = {};
    if (userId) filter.userId = userId;
    if (query) filter.title = { $regex: query, $options: "i" };
    console.log(typeof(filter));
     // Case-insensitive search

    // Sorting configuration
    const sort = { [sortBy]: sortType === "desc" ? -1 : 1 };

    // Fetch videos with pagination & sorting
    const videos = await Video.find(filter)
        .sort(sort)
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber);

    // Get total count for pagination info
    const totalVideos = await Video.countDocuments(filter);

    return res
    .status(200)
    .json(
        new apiResponse(
            200,videos,"videos fetched successfully",
        )
    )

})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    const videoLocalpath=req.files?.video[0]?.path
    // const thumbnailLocalPath=req.files?.thumbnail[0]?.path
    let thumbnailLocalPath
    if(req.files&& Array.isArray(req.files.thumbnail)&&req.files.thumbnail.length >0 ){
        thumbnailLocalPath=req.files.thumbnail[0].path
    }
    console.log(`video${videoLocalpath} thumbnail${thumbnailLocalPath}`);
    

    if(!videoLocalpath&&!thumbnailLocalPath){
        throw new apiError(400,"video file is missing  or thumbnail is missing")
    }
    const Uploadedvideo=await UploadOnCloudinary(videoLocalpath)
    const uplaodThumbnail=await UploadOnCloudinary(thumbnailLocalPath)

    if(!Uploadedvideo?.url){
        throw new apiError(400,"error while uploading video on cloudniary")
    }
    if(!uplaodThumbnail?.url){
        throw new apiError(400,"error while uploading thumbnail on cloudniary")
    }
    const video= await Video.create({
            VideoFile:Uploadedvideo.url,
            thumbnail:uplaodThumbnail.url,
            owner:req.user?._id,
            title,
            description,
    }
)
return res
.status(200)
.json(
    new apiResponse(
        200,video,"video uplaoded succccesfylly"
    )
)

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    const video=await Video.findById(videoId)
    if(!video){
        return res
        .status(400)
        .json(
            new apiResponse(400,video,"Video not found")
        )
    }

    return res
    .status(200)
    .json(
        new apiResponse(200,video,"video got successfully")
    )

})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const {title,description} = req.body
    const thumbnailLocalPath=req.file?.path
    console.log(thumbnailLocalPath);
    const uplaodThumbnail= await UploadOnCloudinary(thumbnailLocalPath)
    if(!uplaodThumbnail.url){
        throw new apiError(400,"error while uploading thumbnail on cloudnary")
    }
    const video= await Video.findByIdAndUpdate(videoId,{
        $set:{
            thumbnail:uplaodThumbnail.url,
            title,
            description
        }
    },
{
    new:true
}
)

return res
.status(200)
.json(
    new apiResponse(
        200,video,"video details updated successfully"
    )
)


})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
     const deleteRes=await deleteFromCloudinary(videoId)
     const Res=await Video.deleteOne({
        _id:videoId
     })
     return res
     .status(200)
     .json(
        new apiResponse(
            200,"Video deleted successfully"
        )
     )
    
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
 // Find the video first
 const video = await Video.findById(videoId);

 if (!video) {
     throw new apiError(400, "Video not found");
 }

// console.log(video.isPublished);

 // Toggle the publish status
 const updatedVideo= await Video.findByIdAndUpdate(videoId,
    { $set: { isPublished: !video.isPublished } }, 
    {
        new:true
    }
 )


    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            updateVideo.isPublished,
            "status upadted successfully"

        )
    )
}
)
export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}