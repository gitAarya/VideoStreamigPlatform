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


 //routes declaration
 app.use("/api/v1/users",userRouter)
 app.use("/api/v1/video",videoRouter)
 app.use("/api/v1/tweets", tweetRouter)
 //http://localhost:5000/api/v1/user/register
export {app}