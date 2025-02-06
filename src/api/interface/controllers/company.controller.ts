import { Request, Response } from "express";
import { Types } from 'mongoose';
import { successResponse ,ErrorResponse } from "../../helper/apiResponse";
import { storeCompany ,companyList ,updateCompany} from "../../domain/models/company.model";
import companySchema from "../../domain/schema/company.schema";


export const storeCompanyController = async (req: Request, res: Response) => {
    try {

        storeCompany(req.body, (error: any, result: any) => {
            if (error) {
                return ErrorResponse(res, error.message);
            }

            return successResponse(res, "Get Admin Event List", { result });
        });

    } catch (error) {
        console.log(error);
        return ErrorResponse(res, "An error occurred during event retrieval.");
    }
}

export const updateCompanyController = async (req: Request, res: Response) => {
    try {

        const { company_id } = req.params;

        if (!company_id) {
            return ErrorResponse(res, "Company ID is required.");
        }

        console.log(req.body);

        updateCompany(company_id, req.body, (error: any, result: any) => {
            if (error) {
                return ErrorResponse(res, error.message);
            }

            return successResponse(res, "Update Company Details Successfully", { result });
        });

    } catch (error) {
        console.log(error);
        return ErrorResponse(res, "An error occurred during event retrieval.");
    }
}

export const getCompanyDetails = async (req: Request, res: Response) => {
    try {
        const { company_id } = req.params;
        if (!company_id) {
            return ErrorResponse(res, "Company ID is required.");
        }
        const company = await companySchema.findById(company_id);

        if (!company) {
            return ErrorResponse(res, "Company not found.");
        }

        return successResponse(res, "Get Company details", { company });

    } catch (error) {
        console.log(error);
        return ErrorResponse(res, "An error occurred during event retrieval.");
    }
}

export const getCompany = async (req: Request, res: Response) => {
    try {
            const { page = 1, pageSize = 10, searchQuery = "" } = req.query;
            companyList(req.body,
            parseInt(page as string),
            parseInt(pageSize as string),
            searchQuery as string, (error:any, result:any) => {
                if (error) {
                    return res.status(500).json({
                        code: "INTERNAL_SERVER_ERROR",
                        message: error instanceof Error ? error.message : "An unexpected error occurred."
                    });
                }
                return successResponse(res, 'Get Admin Event List', 
                    result,
                )
            });

    } catch (error) {
        console.log(error);
        return ErrorResponse(res, "An error occurred during event retrieval.");
    }
}

export const deleteCompany = async (req: Request, res: Response) => {
    try {
        const { company_ids } = req.body; 
        console.log(company_ids);

        if (!company_ids || !Array.isArray(company_ids) || company_ids.length === 0) {
            return ErrorResponse(res, "Please provide at least one valid company ID.");
        }

        const result = await companySchema.deleteMany({ _id: { $in: company_ids } });

        if (result.deletedCount === 0) {
            return ErrorResponse(res, "No company found with the provided IDs.");
        }

        return successResponse(res, `Successfully deleted  company(ies).`,result.deletedCount);

    } catch (error) {
        console.log(error);
        return ErrorResponse(res, "An error occurred during event retrieval.");
    }
}