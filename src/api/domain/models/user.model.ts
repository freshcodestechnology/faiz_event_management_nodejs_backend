import mongoose from "mongoose";
import { generateAgoraToken, generateOtp, generateToken } from "../../helper/helper";
import { loggerMsg } from "../../lib/logger";
import userSchema from "../schema/user.schema";
import { userSocketMap } from "../../socket/initDemoSocketHandlers";
import { getIo } from "../../../infrastructure/webserver/express/v1";
import { env } from "../../../infrastructure/env";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

interface userData{
    email: string;
    password: string;
    name: string;
    profilePicture: string;
    role: string;
    status: boolean;
}

interface UpdateUserData{
    email: string;
    password: string;
    name: string;
    profilePicture: string;
    role: string;
    status: boolean;
    user_id : string;
}

interface userLoginData{
    email: string;
    password: string;
}

export const storeUser = async (userData: userData,  callback: (error:any, result: any) => void) => {
    try {
    
        const existingUser = await userSchema.findOne({ email: userData.email });
        if (existingUser) {
            const error = new Error("User with this email already exists.");
            return callback(error, null);
            
        }

        const hashedPassword = await bcrypt.hash(userData.password, 10);

        const newUser = new userSchema({
            name: userData.name,
            email: userData.email,
            password: hashedPassword, 
            profilePicture: userData.profilePicture,
            status: userData.status || false,
            role:userData.role
        });

        const savedUser = await newUser.save();
        return callback(null, newUser);
    } catch (error) {
        loggerMsg("error", `Error during user registration: ${error}`);
        return callback(error, null);
    }
};

export const adminUserList = async (userData: userLoginData, page: number, pageSize: number, searchQuery: string, callback: (error: any, result: any) => void) => {
    try {

        const currentPage = page || 1;
        const size = pageSize || 10;

        const skip = (currentPage - 1) * size;

        const searchFilter = searchQuery
            ? {
                  $or: [
                      { name: { $regex: searchQuery, $options: 'i' } }, 
                      { email: { $regex: searchQuery, $options: 'i' } }, 
                  ]
              }
            : {}; 

        const users = await userSchema.find(searchFilter).skip(skip).limit(size);
        const totalUsers = await userSchema.countDocuments(searchFilter); 
        const result = {
            currentPage: currentPage,
            totalPages: Math.ceil(totalUsers / size),
            totalUsers: totalUsers,
            users: users,
        };

        return callback(null, result);
    } catch (error) {
        console.error("Error fetching user list:", error);
        return callback(error, null);
    }
}

export const userLogin = async (userData: userLoginData,  callback: (error:any, result: any) => void) => {
    try {
        const user = await userSchema.findOne({ email: userData.email });
        if (!user) {
            const error = new Error("User not found with this email.");
            return callback(error, null);
        };

        const isPasswordCorrect = await bcrypt.compare(userData.password, user.password);
        if (!isPasswordCorrect) {
            const error = new Error("Incorrect password.");
            return callback(error, null);
        };

        const token = jwt.sign(
            { userId: user._id, email: user.email ,name:user.name},
            process.env.JWT_SECRET_KEY || "defaultsecretkey", 
            { expiresIn: "8h" } 
        );

        const result = {
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
            },
            token: token,
        };

        return callback(null, result);

    } catch (error) {
        loggerMsg("error", `Error during user registration: ${error}`);
        return callback(error, null);
    }
};

export const updateUser = async (userData: UpdateUserData, callback: (error: any, result: any) => void) => {
    try {
            
        const existingUser = await userSchema.findById(userData.user_id);
        if (!existingUser) {
            const error = new Error("User not found.");
            return callback(error, null);
        }

        if (userData.email && userData.email !== existingUser.email) {
            const emailTaken = await userSchema.findOne({ email: userData.email });
            if (emailTaken) {
                const error = new Error("User with this email already exists.");
                return callback(error, null);
            }
        }

        existingUser.name = userData.name || existingUser.name;
        existingUser.email = userData.email || existingUser.email;
        existingUser.profilePicture = userData.profilePicture || existingUser.profilePicture;
        existingUser.status = userData.status !== undefined ? userData.status : existingUser.status;
        existingUser.role = userData.role || existingUser.role;

        if (userData.password && userData.password !== "") {
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            existingUser.password = hashedPassword;
        }

        const updatedUser = await existingUser.save();
        return callback(null, updatedUser);
    } catch (error) {
        loggerMsg("error", `Error during user update: ${error}`);
        return callback(error, null);
    }
};


