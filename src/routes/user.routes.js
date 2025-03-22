import { Router } from "express";
import {registerUser,loginUser,LogOutUser,refeshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCover, getUserProfile, getUserWatchHIstory} from "../controllers/user.controller.js"
import {upload} from "../middleware/multer.middleware.js"
import { verifyJWT } from "../middleware/auth.middleware.js";


 const router =Router()
 router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            
            name:"coverImage",
            maxCount:1
        }
    ]
      
    )
    ,registerUser)
router.route("/login").post(loginUser)
//secured routes
router.route("/logout").post(verifyJWT,LogOutUser)
router.route("/refreshToken").post(refeshAccessToken)
router.route("/changePassword").post(verifyJWT,changeCurrentPassword)
router.route("/CurrentUser").get(verifyJWT,getCurrentUser)
router.route("/updateAccDetails").patch(verifyJWT,updateAccountDetails)

router.route("/updateAvatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)
router.route("/updateCover").patch(verifyJWT,upload.single("cover"),updateUserCover)

router.route("/c/:username").get(verifyJWT,getUserProfile)

router.route("/history").get(verifyJWT,getUserWatchHIstory)
 export default router