import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app=express()
app.use( cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true,
}))
app.use(express.json({limit:"16Kb"}))
app.use(express.urlencoded({extended:true,limit:"16Kb"}))
app.use(express.static("public"))

app.use(cookieParser())


//import routes
 import userRouter  from "./routes/user.routes.js"
 import videoRouter from "./routes/video.routes.js"
 import tweetRouter from "./routes/tweet.routes.js"
 import subscriptionRouter from "./routes/subscription.routes.js"
 import commentRoute from "./routes/comment.routes.js"
 import playlistRouter from "./routes/playlist.routes.js"



 //routes declaration
 app.use("/api/v1/users",userRouter)
 app.use("/api/v1/video",videoRouter)
 app.use("/api/v1/tweets", tweetRouter)
 app.use("/api/v1/subscriptions", subscriptionRouter)
 app.use("/api/v1/comments",commentRoute)
app.use("/api/v1/playlist",playlistRouter)
 
 //http://localhost:5000/api/v1/user/register
export {app}