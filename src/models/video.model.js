import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const VideoSchema = new mongoose.Schema( 
    {
        VideoFile:{
            type:String,//cloudnary url
            required:true,
        },
        thumbnail:{
            type:String,//cloudnary url
            required:true,

        },
        owner:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        title:{
            type:String,
            required:true,
        },
        description:{
            type:String,
            required:true,

        },
        duration:{
            type:Number,

        },
        views: {
                type:Number,
                default:0,
            },
        isPublished:{
            type:Boolean,
            default:true
        },


    }
,{timestamps:true})
VideoSchema.plugin(mongooseAggregatePaginate)
export const Video=mongoose.model("Video",VideoSchema)