import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/likes.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if(!videoId) throw new apiError(400,"videoID required")
    const existedLike= await Like.findOne({
        video:videoId,
        likedBy:req.user?._id
    })
    if(!existedLike){
       const like= await Like.create({
            video:videoId,
            likedBy:req.user?._id,

        })

        if(!like) throw new apiError(400,"video like failed")
        
        return res
        .status(200)
        .json(
            new apiResponse(200,"video liked successfully")
        )

    }else{
        await Like.deleteOne({_id:existedLike._id})
        return res
        .status(200)
        .json(
            new apiResponse(200,"video unliked successfully")
        )
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if(!commentId) throw new apiError(400,"commentID required")
        const existedLike= await Like.findOne({
            comment:commentId,
            likedBy:req.user?._id
        })
        if(!existedLike){
           const like= await Like.create({
                comment:commentId,
                likedBy:req.user?._id,
    
            })
    
            if(!like) throw new apiError(400,"comment like failed")
            
            return res
            .status(200)
            .json(
                new apiResponse(200,"comment liked successfully")
            )
    
        }else{
            await Like.deleteOne({_id:existedLike._id})
            return res
            .status(200)
            .json(
                new apiResponse(200,"comment unliked successfully")
            )
        }
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if(!tweetId) throw new apiError(400,"commentID required")
        const existedLike= await Like.findOne({
            tweet:tweetId,
            likedBy:req.user?._id
        })
        if(!existedLike){
           const like= await Like.create({
                tweet:tweetId,
                likedBy:req.user?._id,
    
            })
    
            if(!like) throw new apiError(400,"tweet like failed")
            
            return res
            .status(200)
            .json(
                new apiResponse(200,"tweet liked successfully")
            )
    
        }else{
            await Like.deleteOne({_id:existedLike._id})
            return res
            .status(200)
            .json(
                new apiResponse(200,"tweet unliked successfully")
            )
        }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const likedVideos= await Like.aggregate([
        {
            $match:{
                likedBy:req.user?._id
            }
        },
        {
            $lookup:{
                localField:"video",
                from:"videos",
                foreignField:"_id",
                as:"likedVideos"
            }
        },
        {
            $unwind:"$likedVideos"
        },
        {
            $project:{
                _id:0,
                title:"$likedVideos.title",
                thumbnail:"$likedVideos.thumbnail",
                videoId:"$likedVideos._id"
            }
        }
    ])
    if(!likedVideos) throw new apiError(400,"liked video not found")

    return res.status(200).json( new apiResponse(200,likedVideos,"liked video fetched sucessfully"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}