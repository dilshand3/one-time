import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async (req, res) => {
    console.log("hello world")
    res.status(200).json({
        message: "ok this working"
    })
})

export {registerUser}