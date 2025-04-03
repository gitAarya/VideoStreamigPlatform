
import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import {Subscription} from "../models/subscription.model.js"
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/ApiResponse.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import { channel, subscribe } from "diagnostics_channel";

const toggleSubscription= asyncHandler(async (req,res)=>{
    const {channelId} = req.params
    const subscriberId = req.user?._id
    //todo: toggle teh subscription
   
    const channel = await User.findById(channelId)
    if(!channel) throw new apiError(400,"channel not found")
    
    const existingSubscription= await Subscription.findOne({
        channel:channelId,
        subscriber:subscriberId
    })
    if(existingSubscription){
        await Subscription.deleteOne({_id:existingSubscription._id})

        return res
        .status(200)
        .json(
            new apiResponse(200,"unsubscribed successfully")
        )
    }
    else{
    
    const subscription= await Subscription.create({
        channel:channelId,
        subscriber:req.user?._id
    })
    if(!Subscription) throw new apiError(400,"error while making subscription ")

    return res
    .status(200)
    .json(
        new apiResponse(200,subscription,"subscription made successfully")
    )}


})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    console.log(channelId);
    
    if(!channelId) throw new apiError(400,"channel id required")

    const channel = await User.findById(channelId)
    if(!channel) throw new apiError(404,"channel not found")
    
    
    const subscribers= await Subscription.aggregate([
        {
            $match:{
                channel:new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"subscriber",
                foreignField:"_id",
                as:"subscriberDetails"
            }
        },{
            
                $unwind: "$subscriberDetails" // Convert array to object
            
        },
        {
            $project:{
                    _id:0,
                    username:"$subscriberDetails.username",
                    avatar:"$subscriberDetails.avatar",
                    UserId:"$subscriberDetails._id"
            }
        }

    ]);
    // console.log(subscribers);
    
    if(!subscribers.length) throw new apiError(400,"no subscribers found for this channel ")
    
        return res
        .status(200)
        .json(
            new apiResponse(200,subscribers,"subscribers fetched successfully")
        )
    
    
})
    

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if(!subscriberId) throw new apiError(400,"subscriberID required")
    
    const subscriber=await User.findById(subscriberId)
    if(!subscriber) throw new apiError(404,"User not found")
    
    const subscribedTo=await Subscription.aggregate([
        {
            $match:{
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup:{
                localField:"channel",
                from:"users",
                foreignField:"_id",
                as:"subscrbedChannels"
            }
        },
        {
            $unwind:"$subscrbedChannels"
        },
        {
            $project:{
                _id:0,
                username:"$subscrbedChannels.username",
                avatar:"$subscrbedChannels.avatar",
                channelID:"$subscrbedChannels._id"
            }
        }
    ])
    if(!subscribedTo.length) throw new apiError(404,"channels not found")

    return res
    .status(200)
    .json(
        new apiResponse(200,subscribedTo,"Subscribed channel fetched successfully")
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}