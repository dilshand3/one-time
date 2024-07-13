import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../model/user.model.js";
import { uploadOnClodinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js"

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    return {accessToken,refreshToken}
  } catch (error) {
    throw new ApiError(501, "something went wrong while generating access and refresh tokens")
  }
}

const registerUser = asyncHandler(async (req, res) => {
  const { username, fullName, email, password } = req.body

  if ([fullName, username, password, email].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "all fields are required")
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }]
  })

  if (existedUser) {
    throw new ApiError(409, "User is already existed")
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar files is required")
  }

  const avatar = await uploadOnClodinary(avatarLocalPath)
  if (!avatar) {
    throw new ApiError(400, "avatar is required")
  }
  const coverImage = await uploadOnClodinary(coverImageLocalPath)

  if (!coverImage) {
    throw new ApiError(400, "coverImage is required")
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url || "",
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
  })

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  if (!createdUser) {
    throw new ApiError(500, "something went wrong while registering the user")
  }

  return res.status(200).json(
    new ApiResponse(200, createdUser, "user created succesfully")
  )

})

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body

  if (!username && !email) {
    throw new ApiError(400, "username or email is required")
  }

  const user = await User.findOne({
    $or: [{ username }, { email }]
  })

  if (!user) {
    throw new ApiError(404, "user didn't exist")
  }

  const isPasswordValid = await user.isPasswordCorrect(password)

  if (!isPasswordValid) {
    throw new ApiError(401, "password is not valid")
  }

const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id)

const loggedInUser = await User.findById(user._id).select("-password -refreshtoken")

const option = {
  httpOnly : true,
  secure : true
}

return res
.status(200)
.cookie("accessToken",accessToken,option)
.cookie("refreshToken",refreshToken,option)
.json(
  new ApiResponse(200,{
    user : loggedInUser,accessToken,refreshToken
  },
  "user loggedIn succesfully"
)
)

})

const logoutUser = asyncHandler(async(req,res) => {
   await  User.findByIdAndUpdate(
      req.user._id,{
        $set :{
          refreshToken : undefined
        }
      },{
        new : true
      }
     )

     const option = {
      httpOnly : true,
      secure : true
    }

    return res 
    .status(200)
    .clearCookie("accessToken",option)
    .clearCookie("refreshToken",option)

})

export { registerUser, loginUser,logoutUser}