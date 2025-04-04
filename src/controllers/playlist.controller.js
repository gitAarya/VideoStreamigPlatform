import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    console.log(name,description);
    

    //TODO: create playlist
    if(!name || !description) throw new apiError(200,"title or description not found")
    
    const playlist = await Playlist.create({
        name,
        description,
        owners:req.user?._id
    })
    if(!playlist) throw new apiError(402,"playlist was not created")
    
    return res
    .status(200)
    .json(
        new apiResponse(200,playlist,"playlist created succesfully")
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    if(!userId) throw new apiError(400,"userID required")
     const playlists= await Playlist.find({owners:userId})
    if(!playlists) throw new apiError(400,"playlists not found")
    
    return res
    .status(200)
    .json(
        new apiResponse(200,playlists,"playlist fetchecd successfully")
    )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if(!playlistId) throw new apiError(400,"playlist ID required")
    
    const playlist=await Playlist.findById(playlistId).populate("videos","title thumbnail ").populate("owners","username")
    if(!playlist) throw new apiError(400,"playlist not found")
    
    
    return res
    .status(200)
    .json(
        new apiResponse(200,playlist,"playlist fetched successfully")
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!playlistId|| !videoId) throw new apiError(400,"playlistID or videoID not found")
    const playlist = await Playlist.findByIdAndUpdate(playlistId,{
        $addToSet:{
            videos:videoId
        }
    },
    {
        new:true
    })

    const populatedPlaylist = await Playlist.findById(playlistId).populate("videos","title thumbnail").populate("owners","username")
return res
.status(200)
.json(
    new apiResponse(200,populatedPlaylist,"playlist fetched successfully")
)

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if(!playlistId|| !videoId) throw new apiError(400,"playlistID or videoID not found")
        const playlist = await Playlist.findByIdAndUpdate(playlistId,{
    $pull:{
        videos:videoId
    }
    },
    {
        new:true
    })

    const populatedPlaylist = await Playlist.findById(playlistId).populate("videos","title thumbnail").populate("owners","username")


    return res
    .status(200)
    .json(
        new apiResponse(200,populatedPlaylist,"playlist fetched successfully")
    )

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if(!playlistId) throw new apiError(400,"playlist ID required")
    const delRes= await Playlist.deleteOne({ _id:playlistId})
    console.log(delRes);
    

    return res
    .status(200)
    .json(
        new apiResponse(200,delRes,"playlist deleted successfully")
    )

})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    if(!playlistId) throw new apiError(400,"playlist ID required")
    if(!name || !description) throw new apiError(200,"title or description not found")
    
     const playlist= await Playlist.findByIdAndUpdate(playlistId,{
            $set:{
                name,
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
        new apiResponse(200,playlist,"playlist updates successfully")
    )


})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}