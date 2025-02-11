import { Request, Response } from "express";
import { successCreated, successResponse ,ErrorResponse } from "../../helper/apiResponse";
import scannermachineSchema from "../../domain/schema/scannerMachine.schema";
import { storeScannerMachineModel, updateScannerMachineModel ,scannerMachineList,assignScannerMachineModel} from "../../domain/models/scannerMachine.model";


export const storeScannerMachine = async (req: Request, res: Response) => {
    try {
        
        storeScannerMachineModel(req.body, (error:any, result:any) => {
            if (error) {
                return res.status(500).json({
                    code: "INTERNAL_SERVER_ERROR",
                    message: error instanceof Error ? error.message : "An unexpected error occurred."
                });
            }
            return successCreated(res, result)
        });
    } catch (error) {
       
    }
};

export const updateScannerMachine = async (req: Request, res: Response) => {
    try {
        
        updateScannerMachineModel(req.body, (error:any, result:any) => {
            if (error) {
                return res.status(500).json({
                    code: "INTERNAL_SERVER_ERROR",
                    message: error instanceof Error ? error.message : "An unexpected error occurred."
                });
            }
            return successCreated(res, result)
        });
    } catch (error) {
       
    }
};

export const deleteScannerMachine = async (req: Request, res: Response) => {
    try {
        
       const { scannerMachine_ids } = req.body; 
       
        if (!scannerMachine_ids || !Array.isArray(scannerMachine_ids) || scannerMachine_ids.length === 0) {
            return ErrorResponse(res, "Please provide at least one valid company ID.");
        }

        const result = await scannermachineSchema.deleteMany({ _id: { $in: scannerMachine_ids } });

        if (result.deletedCount === 0) {
            return ErrorResponse(res, "No company found with the provided IDs.");
        }

        return successResponse(res, `Successfully deleted  Scanner Machine(ies).`,result.deletedCount);
    } catch (error) {
       
    }
};

export const getScannerMachine = async (req: Request, res: Response) => {
    try {
            const { page = 1, pageSize = 10, searchQuery = "" } = req.query;
            scannerMachineList(req.body,
            parseInt(page as string),
            parseInt(pageSize as string),
            searchQuery as string, (error:any, result:any) => {
                if (error) {
                    return res.status(500).json({
                        code: "INTERNAL_SERVER_ERROR",
                        message: error instanceof Error ? error.message : "An unexpected error occurred."
                    });
                }
                return successResponse(res, 'Get Scanner Machine List List', 
                    result,
                )
            });

    } catch (error) {
        return ErrorResponse(res, "An error occurred during event retrieval.");
    }
}

export const assignScannerMachine = async (req: Request, res: Response) => {
    try {

        assignScannerMachineModel(req.body, (error:any, result:any) => {
            if (error) {
                return res.status(500).json({
                    code: "INTERNAL_SERVER_ERROR",
                    message: error instanceof Error ? error.message : "An unexpected error occurred."
                });
            }
            return successCreated(res, result)
        });

    } catch (error) {
        return ErrorResponse(res, "An error occurred during event retrieval.");
    }
}

export const removeAssignScannerMachine = async (req: Request, res: Response) => {
    try {

        const { scannerMachine_ids } = req.body; 
       
        if (!scannerMachine_ids || !Array.isArray(scannerMachine_ids) || scannerMachine_ids.length === 0) {
            return ErrorResponse(res, "Please provide at least one valid company ID.");
        }

        const result = await scannermachineSchema.updateMany(
            { _id: { $in: scannerMachine_ids } }, 
            { $set: { company_id: null, expired_date: null } } 
        );

        return successResponse(res, `Successfully deleted  Scanner Machine(ies).`,result.modifiedCount);

    } catch (error) {
        return ErrorResponse(res, "An error occurred during event retrieval.");
    }
}
