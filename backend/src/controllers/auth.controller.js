import { Student } from '../models/student.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendMail } from '../utils/sendMail.js';

const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await Student.findById(userId);
        if(!user){
            throw new ApiError(404, 'User not found');
        }
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, 'Something went wrong while creating Tokens');
    }
}

const loginUser = asyncHandler( async (req, res) => {
    const { email, password } = req.body;

    if(!email || !password){
        throw new ApiError(400, 'Email and password is required');
    }

    const user = await Student.findOne({email: email});
    if(!user){
        throw new ApiError(404, 'User does not exist');
    }
    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if(!isPasswordCorrect){
        throw new ApiError(401, 'Invalid user credentials');
    }
    
    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id);
    // console.log(accessToken, refreshToken);
    await Student.findByIdAndUpdate(user._id, {
        $set: { refreshToken: refreshToken }
    });
    const loggedInUser = await Student.findById(user._id).select('-password -refreshToken');

    const cookieOptions = {
        httpOnly: true,
        secure: true
    }

    res.status(200).cookie('accessToken', accessToken, cookieOptions)
    .cookie('refreshToken', refreshToken, cookieOptions)
    .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, 'User logged in successfully'));
})

const logoutUser = asyncHandler( async (req, res) => {
    await Student.findByIdAndUpdate(req.user._id, {
        $unset: {refreshToken: 1}
    },{ new : true }
);

const cookieOptions = {
    httpOnly: true,
    secure: true
}

res.status(200)
.clearCookie('accessToken', cookieOptions)
.clearCookie('refreshToken', cookieOptions)
.json(new ApiResponse(200, {}, 'User logged out successfully'));

})

const refreshAccessToken = asyncHandler( async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if(!incomingRefreshToken){
        throw new ApiError(400, 'Unauthorized: Refresh token is missing');
    }
    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await Student.findById(decodedToken?._id);
        if(!user){
            throw new ApiError(404, 'Invalid refresh token: User not found');
        }
        if(user.refreshToken !== incomingRefreshToken){
            throw new ApiError(401, 'Invalid refresh token: Token is expired or used');
        }

        const accessToken = user.generateAccessToken();
        const cookieOptions = {
            httpOnly: true,
            secure: true
        }
        return res.status(200)
        .cookie('accessToken', accessToken, cookieOptions)
        .cookie('refreshToken', incomingRefreshToken, cookieOptions)
        .json(new ApiResponse(200, { accessToken, refreshToken: incomingRefreshToken }, 'Access token refreshed successfully'));

    } catch (error) {
        throw new ApiError(401, error?.message || 'Unauthorized: Invalid refresh token');
    }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    console.log(req.body);
    const { currentPassword, newPassword } = req.body;
    if(!currentPassword || !newPassword){
        throw new ApiError(400, 'Current password and new password is required');
    }

    const user = await Student.findById(req.user?._id);
    const isPasswordCorrect = await user.isPasswordCorrect(currentPassword);
    if(!isPasswordCorrect){
        throw new ApiError(401, 'Current password is incorrect');
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json(new ApiResponse(200, {}, 'Password changed successfully'));
})

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if(!email){
        throw new ApiError(400, 'Email is required');
    }
    const user = await Student.findOne({email: email});
    if(!user){
        throw new ApiError(404, 'User with this email does not exist');
    }
    const newPassword = crypto.randomBytes(8).toString('hex');
    user.password = newPassword;
    await user.save();

    try{
        await sendMail(email, newPassword);
        res.status(200).json(new ApiResponse(200, {}, 'A new password has been sent to your email address'));
    }
    catch(err){
        throw new ApiError(500, 'Failed to send email with new password');
    }
})

export { loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, forgotPassword };