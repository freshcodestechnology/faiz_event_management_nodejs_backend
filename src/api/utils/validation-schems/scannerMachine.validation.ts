import Joi from 'joi';

export const addScannerMachineSchema = Joi.object({
    scanner_name: Joi.string().required().messages({
        "any.required": "scanner_name is required."
    }),
    scanner_unique_id: Joi.string().required().messages({
        "any.required": "scanner_unique_id is required."
    }),
});

export const updateScannerMachineSchema = Joi.object({
    scanner_machine_id: Joi.string().required().messages({
        "any.required": "scanner_machine_id is required."
    }),
    scanner_name: Joi.string().required().messages({
        "any.required": "scanner_name is required."
    }),
    scanner_unique_id: Joi.string().required().messages({
        "any.required": "scanner_unique_id is required."
    }),
});


export const deleteScannerMachineSchema = Joi.object({
    scannerMachine_ids: Joi.array().required().messages({
        "any.required": "scannerMachine_ids is required."
    })
});

export const assignScannerMachineSchema = Joi.object({
    company_id: Joi.string().required().messages({
        "any.required": "company_id is required."
    }),
    password: Joi.string().required().messages({
        "any.required": "password is required."
    }),
    expired_date: Joi.any().required().messages({
        "any.required": "Expired date is required."
    }),
    scannerMachine_ids: Joi.array().required().messages({
        "any.required": "scannerMachine_ids is required."
    })
});





