import { Request, Response } from "express";
import { Types } from 'mongoose';
import { successResponse ,ErrorResponse } from "../../helper/apiResponse";
import { storeCompany ,companyList ,updateCompany,updateStatus} from "../../domain/models/company.model";
import BLogSchema from "../../domain/schema/eventblog.schema";
import { storeBlog , eventBlogdList , updateEventBlog , eventBlogdLocationList} from "../../domain/models/eventBlog.models";


export const getEventBlog = async (req: Request, res: Response) => {
    try {
        const { page = 1, pageSize = 10, searchQuery = "" } = req.query;
        eventBlogdList(req.body,
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

export const storeBlogController = async (req: Request, res: Response) => {
    try {

        console.log(req.body)

        storeBlog(req.body, (error: any, result: any) => {
            if (error) {
                return ErrorResponse(res, error.message);
            }

            return successResponse(res, "added blogs sucessfully!", []);
        });

    } catch (error) {
        return ErrorResponse(res, "An error occurred during add event.");
    }
}

export const eventBlogDetailsController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const blog = await BLogSchema.findById(id);
        if (!blog) {
            return ErrorResponse(res, "Blog not found")
        }
        return successResponse(res, 'Get Blog List',blog)
    } catch (error) {
        return  ErrorResponse(res,'An error occurred during get blog.')
    }
}

export const updateBlogController = async (req: Request, res: Response) => {
    try {
        updateEventBlog(req.body, (error:any, result:any) => {
            if (error) {
                return ErrorResponse(res, "An unexpected error occurred.")
            }
            return successResponse(res,'success', result)
        });
       } catch (error) {
           return  ErrorResponse(res,'An error occurred during get blog.')
       }
 }

 export const locationWiseEventList = async (req: Request, res: Response) => {
    try {
       
        const { page = 1, pageSize = 10, searchQuery = "" } = req.query;
        const currentLocation = "surat";
        eventBlogdLocationList(req.body,
            parseInt(page as string),
            parseInt(pageSize as string),
            searchQuery as string, currentLocation as string, (error:any, result:any) => {
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

 export const locationWiseBlogDetails = async (req: Request, res: Response) => {
    try {
        const currentLocation = "";
        console.log(req.body);
        const { blog_slug } = req.body;


        if (!blog_slug) {
            return ErrorResponse(res, "Blog slug is required.");
        }

        const blog = await BLogSchema.findOne({ blog_slug: blog_slug });
        
        if (!blog) {
            return ErrorResponse(res, "Blog not found");
        }

        blog.description = blog.description?.replace(/\{LOCATION\}/g, currentLocation ? currentLocation : '') || ""

        return successResponse(res, "Get Blog List", blog);
    } catch (error) {
        console.error("Error fetching blog:", error);
        return ErrorResponse(res, "An error occurred while fetching the blog.");
    }
};




