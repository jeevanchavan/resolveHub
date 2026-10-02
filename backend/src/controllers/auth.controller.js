import userModel from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const isProduction = process.env.NODE_ENV === 'production';

export const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
};

export const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    const isAlreadyRegistered = await userModel.findOne({
        $or: [
            { email },
            { username }
        ]
    });

    if (isAlreadyRegistered) {
        return res.status(400).json({
            message: "User with same email or username already exists"
        });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await userModel.create({
        email,
        username,
        password: hash
    });

    const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '3d' }
    );

    res.cookie("token", token, COOKIE_OPTIONS);

    return res.status(201).json({
        message: "User registered successfully",
        token,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    });
};

export const loginUser = async (req, res) => {
    const { username, email, emailOrUsername, password } = req.body;
    const identifier = (email || username || emailOrUsername || '').toLowerCase().trim();

    const user = await userModel.findOne({
        $or: [
            { email: identifier },
            { username: identifier }
        ]
    }).select("+password");

    if (!user) {
        return res.status(400).json({
            message: "Invalid Credentials"
        });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return res.status(400).json({
            message: "Invalid Credentials"
        });
    }

    const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '3d' }
    );

    res.cookie("token", token, COOKIE_OPTIONS);

    return res.status(200).json({
        message: "user LoggedIn successfully",
        token,
        user: {
            id: user._id,
            email: user.email,
            username: user.username,
            name: user.name || user.username,
            role: user.role
        }
    });
};

export const getMeUser = async (req, res) => {
    const user = await userModel.findById(req.user.id);

    if (!user) {
        return res.status(404).json({
            message: "user not found"
        });
    }

    res.status(200).json({
        message: "user fetched successfully",
        user
    });
};

export const logoutUser = async (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(400).json({
            message: "token not provided"
        });
    }

    try {
        res.clearCookie("token", COOKIE_OPTIONS);

        res.status(200).json({
            message: "user logged out successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "server error",
            error: error.message
        });
    }
};
