import mongoose, { Schema } from "mongoose";
import { User } from "./user.model";
const SubscriptionSchema=new mongoose.Schema(
    {
        channel:{
            type:Schema.Types.ObjectId,
            ref:"user"

        },
        subscriber:{
            type:Schema.Types.ObjectId,
            ref:"User"
        }
    }
    ,{timestamps:true})

    export const Subscription=mongoose.model("Subscription",SubscriptionSchema)