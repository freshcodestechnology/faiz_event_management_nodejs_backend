import { Request, Response } from "express";
import { Types } from 'mongoose';
import { successResponse ,ErrorResponse } from "../../helper/apiResponse";
import { adminUserList,storeUser,updateUser } from "../../domain/models/user.model";
import userSchema from "../../domain/schema/user.schema";

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

        let user;
       
        if (id && typeof id === 'string') {
            user = await userSchema.findOne({ email: email, _id: id });
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



