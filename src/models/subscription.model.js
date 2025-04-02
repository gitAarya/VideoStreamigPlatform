import mongoose, { Schema } from "mongoose";
import { User } from "./user.model.js";
const SubscriptionSchema=new mongoose.Schema(
    {
        channel:{
            type:Schema.Types.ObjectId,
            ref:"User"

        },
        subscriber:{
            type:Schema.Types.ObjectId,
            ref:"User"
        }
    }
    ,{timestamps:true})

    export const Subscription=mongoose.model("Subscription",SubscriptionSchema)