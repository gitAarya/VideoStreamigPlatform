import mongoose,{Schema} from "mongoose";
const playListSchema=new Schema(
    {
        name:{
            type:String,
            required:true,

        },
        description:{
            type:String,
            required:true,

        },
        videos:[
            {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
        owners:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    
    }
    ,{timestamps:true})

export const Playlist=mongoose.model("Playlist",playListSchema)