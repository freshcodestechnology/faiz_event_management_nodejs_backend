import { Request, Response } from "express";
import { successCreated, successResponse ,ErrorResponse } from "../../helper/apiResponse";
import countrySchema from "../../domain/schema/country.schema";
import stateSchema from "../../domain/schema/state.schema";
import citySchema from "../../domain/schema/city.schema";


interface FileWithBuffer extends Express.Multer.File {
buffer: Buffer;
}

export const getCountry = async (req: Request, res: Response) => {
    try {
        
        const country = await countrySchema.find();
        console.log(country);
        
        if (!country) {
            return ErrorResponse(res, "Countr not found");
        }

        return successResponse(res, 'Get Country List', {
            country,
        });
        
    } catch (error) {
        return ErrorResponse(res, "An error occurred during event retrieval.")
    }
};

export const getState = async (req: Request, res: Response) => {

    try {
        const { id } = req.params;
        console.log(id);
        const state = await stateSchema.find({ country_id: id });
        
        if (!state) {
            return ErrorResponse(res, "State not found");
        }

        return successResponse(res, 'Get State List', {
            state,
        });
        
    } catch (error) {
        return ErrorResponse(res, "An error occurred during event retrieval.")
    }
};

export const getCity = async (req: Request, res: Response) => {

    try {

        const { id } = req.params;

        const city = await citySchema.find({ state_id: id });
        
        if (!city) {
            return ErrorResponse(res, "City not found");
        }

        return successResponse(res, 'Get City List', {
            city,
        });
        
    } catch (error) {
        return ErrorResponse(res, "An error occurred during event retrieval.")
    }
};


