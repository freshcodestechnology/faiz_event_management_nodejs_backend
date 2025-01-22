import { Request, Response } from "express";
import { successCreated, successResponse,ErrorResponse } from "../../helper/apiResponse";
import { storeUser,userLogin } from "../../domain/models/user.model";

export const registerUser = async (req: Request, res: Response) => {
   
    const { name, email, password, profilePicture,status } = req.body;
    
    storeUser(req.body, (error:any, result:any) => {
            if (error) {
                return res.status(500).json({
                    code: "INTERNAL_SERVER_ERROR",
                    message: error instanceof Error ? error.message : "An unexpected error occurred."
                });
            }
            return successCreated(res, result)
        });
}

//login

export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        userLogin(req.body, (error:any, result:any) => {
            if (error) {
                ErrorResponse(res,error.message);
            }
            return successResponse(res, "Login User Successfully", result);
        });
    } catch (error) {

        ErrorResponse(res,'An error occurred during user registration.');
       
    }
}
