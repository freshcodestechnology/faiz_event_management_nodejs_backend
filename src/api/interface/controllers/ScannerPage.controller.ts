import { Request, Response } from "express";
import { Types } from 'mongoose';
import { loggerMsg } from "../../lib/logger";
import { successResponse ,ErrorResponse } from "../../helper/apiResponse";
import { adminUserList,storeUser,updateUser,updateStatus } from "../../domain/models/user.model";
import companySchema from "../../domain/schema/company.schema";
import eventSchema from "../../domain/schema/event.schema";
import Scannermachine from "../../domain/schema/scannerMachine.schema";
import { scannerLogin } from "../../domain/models/user.model";
import nodemailer from 'nodemailer';
import bcrypt from "bcrypt";

    export const getEventDetailsSlug = async (req: Request, res: Response) => {
        try {
            const { event_slug, sub_domain } = req.body;
            const company_details = await companySchema.findOne({subdomain:sub_domain});

            if(!company_details){
                return  ErrorResponse(res,'Company not found.')
            }

            if (company_details.status != 1) {
                return ErrorResponse(res, 'Company is not active.');
            }

            const event_details = await eventSchema.findOne({event_slug:event_slug});
            if(!event_details){
                return  ErrorResponse(res,'Event not found.')
            }

            if(event_details.company_id != company_details._id){    
                return  ErrorResponse(res,'Event not found.')
            }

            if (!Array.isArray(event_details.end_date)) {
                return ErrorResponse(res, 'Invalid event end date.');
            }

            const currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0);

            const allExpired = event_details.end_date.every(date => new Date(date) < currentDate);

            if (allExpired) {
                return ErrorResponse(res, 'event expired.');
            }
            console.log('company_details._id',company_details._id)
            const scanner_machine_list = await Scannermachine.find({company_id:company_details._id});

            const result = {
                event_details,
                scanner_machine_list
            }
            return successResponse(res, 'Event details.', result);

        } catch (error) {
            console.log(error)
        return  ErrorResponse(res,'An error occurred during user registration.')
        }
    }

    export const scannerPageLogin = async (req: Request, res: Response) => {
        try {
            const { email, password,machine_id,type,subdomain } = req.body;
    
            scannerLogin(req.body, (error:any, result:any) => {
                if (error) {
                    return ErrorResponse(res,error.message);
                }
                return successResponse(res, "Login User Successfully", result);
            });
        } catch (error) {
    
            return ErrorResponse(res,'An error occurred during user registration.');
           
        }
    }




