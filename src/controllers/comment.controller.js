import mongoose from "mongoose";
import {Comment} from "../models/comment.model.js"
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/ApiResponse.js";

import { asyncHandler } from "../utils/asyncHandler.js";

// const getVideoComments = asyncHandler(async (req, res) => {
//     //TODO: get all comments for a video
//     const {videoId} = req.params
//     const {page = 1, limit = 10,query} = req.query

//     const pageNumber=parseInt(page,10)
//     const limitNumber= parseInt(limit,10)

//     const filter={};
//     if(videoId) filter.videoId=videoId
//     if (query) filter.title = { $regex: query , $options: "i" };

//     // console.log(typeof(filter));
    
//     // let totalComments = await Comment.countDocuments(filter);
//     // console.log(totalComments);
    


//     const comments= await Comment.find({video:filter})
//     .skip((pageNumber - 1) * limitNumber)
//     .limit(limitNumber);

//     console.log(typeof(comments));  
//     console.log(comments);
    
    
    

//     if(!comments) throw new apiError(400,'unable to find comments')
   
  

// //  const totalComments = await Comment.countDocuments(filter);

//  return res
//  .status(200)
//  .json(
//     new apiResponse( 200,comments,"comments fetched successfully")
//  )
    
// //  ,{comments,totalComments}


// })
const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10, query } = req.query;

    // Convert page and limit to numbers
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Validate videoId is provided
    if (!videoId) {
        throw new apiError(400, 'Video ID is required');
    }

    // Create filter object
    const filter = { video: videoId }; // Directly use videoId for the video field
    
    // Add text search if query exists
    if (query) {
        filter.content = { $regex: query, $options: "i" }; // Assuming comments have a 'content' field
    }

    // Get total count for pagination
    const totalComments = await Comment.countDocuments(filter);

    // Find comments with pagination
    const comments = await Comment.find(filter)
         .populate("owner",'username avatar')
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber)
        .sort({ createdAt: -1 }); // Optional: sort by newest first

    if (!comments || comments.length === 0) {
        throw new apiError(404, 'No comments found for this video');
    }

    return res.status(200).json(
        new apiResponse(200, {
            comments,
            totalComments,
            currentPage: pageNumber,
            totalPages: Math.ceil(totalComments / limitNumber)
        }, "Comments fetched successfully")
    );
});
const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
        const{videoId} =req.params

        const{content}=req.body
        if(!content)throw new apiError(400,"add something to commnet");

        const comment= await Comment.create({
            content,
            video:videoId,
            owner:req.user?._id
        })

        if(!comment) throw new apiError(400,"error while creating comment!")
        

    return res
    .status(200)
    .json(
        new apiResponse(200,comment,"comment added successfully")
    )


})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const{commentId}=req.params
    const {content}=req.body
    if(!content)throw new apiError(400,"add something to commnet");


    const comment=await Comment.findByIdAndUpdate(commentId,{
        content

    },{
        new:true
    })

    return res
    .status(200)
    .json(
        new apiResponse(200,comment,"comment updated successfully")
    )


})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params

    const del= await Comment.deleteOne({
        _id:commentId
    })



    return res
    .status(200)
    .json(
        new apiResponse(200,"comment deleted successfully")
    )
    


})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }