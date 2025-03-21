import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} =req.body
    // console.log(req.body); takes raw data only
    
    
    if(!content){
        throw new apiError(400,"content not found")
    }
    const createdTweet=await Tweet.create({
        owner:req.user?._id,
        content:content.trim()
    })
    if(!createdTweet){
        throw new apiError(400,"unable to create a tweet")
    }

    return res
    .status(200)
    .json(
        new apiResponse(
            200,createdTweet,"tweet created successfully"
        )
    )
}
)

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userId }=req.params
    // console.log(userId);
    
    
    if (!isValidObjectId(userId)) {
        throw new apiError(400, "Invalid user ID ! cannot be casted to objectID");
    }

    const tweet = await Tweet.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id", // Corrected field name
                as:"UserDetails"
            }
        },
        {
            $project:{
                // _id:0,
                content:1,
            }
        }
    ])
    if(!tweet?.length){
        throw new apiError(400,"tweet doesnot exists")
    }

    return res
    .status(200)
    .json(
        new apiResponse(200,tweet,"tweets got successfully")
    )
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params
    const {content}= req.body
    if(!content){
        throw new apiError(400,"content not found")
    }
    if(!tweetId){
        throw new apiError(400,"tweet Id not found")
    }

    const tweet = await Tweet.findByIdAndUpdate(tweetId,{
        $set:{
            content:content
        }
    },{
        new:true
    }
)
// console.log(!tweet);

     if(!tweet){
        throw new apiError(400,"tweet update failed")
     }
    return res
    .status(200)
    .json(
    new apiResponse(
        200, tweet,"tweet updated successfully"
    )
)

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId }= req.params
    if(!tweetId){
        throw new apiError(400,"enter the valid tweet id")

    }
    const Res= await Tweet.deleteOne({
        _id:tweetId
    })

    return res
    .status(200)
    .json(
        new apiResponse(200,Res,"tweet deleted successfully")
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}