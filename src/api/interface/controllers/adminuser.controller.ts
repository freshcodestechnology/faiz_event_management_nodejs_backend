import { Request, Response } from "express";
import { Types } from 'mongoose';
import { successResponse ,ErrorResponse } from "../../helper/apiResponse";
import { adminUserList,storeUser,updateUser } from "../../domain/models/user.model";
import userSchema from "../../domain/schema/user.schema";
import nodemailer from 'nodemailer';
import bcrypt from "bcrypt";

export const getAdminUser = async (req: Request, res: Response) => {
    try {
        const { page = 1, pageSize = 10, searchQuery = "" } = req.query;
        adminUserList(req.body,
            parseInt(page as string),
            parseInt(pageSize as string),
            searchQuery as string, (error:any, result:any) => {
            if (error) {
                return res.status(500).json({
                    code: "INTERNAL_SERVER_ERROR",
                    message: error instanceof Error ? error.message : "An unexpected error occurred."
                });
            }
            return successResponse(res, 'success', 
                result,
            )
        });
    } catch (error) {
       return  ErrorResponse(res,'An error occurred during user registration.')
    }
}

export const storeAdminUser = async (req: Request, res: Response) => {
    try {
         const { name, email, password, profilePicture,status } = req.body;
            storeUser(req.body, (error:any, result:any) => {
                    if (error) {
                        return ErrorResponse(res,'An unexpected error occurred.')
                        
                    }
                    return successResponse(res, 'success',  result)
                });
    } catch (error) {
        return  ErrorResponse(res,'An error occurred during user registration.')
    }
}

export const getSingleAdminUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = await userSchema.findById(id);
        if (!user) {
            return ErrorResponse(res, "User not found")
        }
        return successResponse(res, 'Get Admin User List',user)
    } catch (error) {
        return  ErrorResponse(res,'An error occurred during user registration.')
    }
}

export const updateAdminUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        updateUser(req.body, (error:any, result:any) => {
            if (error) {
                return ErrorResponse(res, "An unexpected error occurred.")
            }
            return successResponse(res,'success', result)
        });
    } catch (error) {
        return  ErrorResponse(res,'An error occurred during user registration.')
    }
}

export const checkEmailUser = async (req: Request, res: Response) => {
    try {
        const { email, id } = req.query; 

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required.' });
        }

       
         if (id && typeof id === 'string') {
            if (!Types.ObjectId.isValid(id)) {
                return ErrorResponse(res, 'Invalid user ID format.');
            }
        }

        let user;
        if (id && typeof id === 'string') {
            user = await userSchema.findOne({ email: email, _id: { $ne: id } });
        } else {
            user = await userSchema.findOne({ email: email });
        }

        if (user) {
            return res.status(409).json({ success: false, message: 'Email is already in use.' });
        }

        return res.status(200).json({ success: true, message: 'Email is available.' });
    } catch (error) {
        console.error('Error in checkEmailUser:', error);
        return res.status(500).json({ success: false, message: 'An internal server error occurred.' });
    }
};

export const deleteAdminUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user  = await userSchema.findById(id);          
        if (!user) {
            return ErrorResponse(res, "User not found")
        }
         await userSchema.findByIdAndDelete(id);
        return successResponse(res, 'User deleted successfully',[])   
    } catch (error) {
        return  ErrorResponse(res,'An error occurred during user registration.')
    }           
}   

export const forgetPassword = async (req: Request, res: Response) => {
    try {

        const generateOTP = (): string => Math.floor(100000 + Math.random() * 900000).toString();
        const transporter = nodemailer.createTransport({
                host: "in-v3.mailjet.com", 
                port: 587, 
                secure: false, 
                auth: {
                    user: "4ef2e51393517b21366a21e504b1c3b1", 
                    pass: "bef9b85cbbe942dc8bce3d8fcddea51a", 
                },
                });

        const { email } = req.body;

        // Validate email input
        if (!email) {
            return ErrorResponse(res, "Email is required.");
        }

        // Find user by email
        const user = await userSchema.findOne({ email });

        if (!user) {
            return ErrorResponse(res, "User not found.");
        }

        // Generate OTP
        const otp = generateOTP();
        user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        user.otp = otp;
        await user.save();

        const mailOptions = {
            from: "rentaltest0@gmail.com", // Your sender email
            to: user.email,
            subject: "Password Reset OTP",
            text: `Your OTP for password reset is: ${otp}. It expires in 10 minutes.`,
            html: `<p>Your OTP for password reset is: <strong>${otp}</strong>. It expires in 10 minutes.</p>`,
        };

        // Send email
        await transporter.sendMail(mailOptions);

        return successResponse(res, 'forget password OTP successfully',[])   
    } catch (error) {
        console.log(error);
        return  ErrorResponse(res,'An error occurred during user registration.')
    }           
}   

export const setPassword = async (req: Request, res: Response) => {
    try {
        const { email, otp, password } = req.body;
        // console.log(otp,password);
        if (!email || !otp || !password) {
            return ErrorResponse(res, "Email, OTP, and new password are required.");
        }

        const user = await userSchema.findOne({ email });

        if (!user) {
            return ErrorResponse(res, "User not found.");
        }

        if (user.otp !== otp) {
            return ErrorResponse(res, "Invalid OTP.");
        }

        if (user.otpExpires && user.otpExpires < new Date()) {
            return ErrorResponse(res, "OTP has expired.");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        user.password = hashedPassword;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        return successResponse(res, "Password updated successfully.",[]); 
    } catch (error) {
        console.log(error);
        return  ErrorResponse(res,'An error occurred during user registration.')
    }           
}   

