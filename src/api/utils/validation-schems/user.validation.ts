import Joi from 'joi';

export const registerUserSchema = Joi.object({
    email: Joi.string().required().messages({
        "string.email": "Please enter a valid email.",
        "any.required": "email is required."
    }),
    name: Joi.string().required().messages({
        "string.phone": "Please enter a valid name.",
        "any.required": "name is required."
    }),
    password: Joi.string().required().messages({
        "string.password": "Please enter a valid password.",
        "any.required": "password is required."
    }),
    role: Joi.string().required().messages({
        "string.role": "Please enter a valid role.",
        "any.required": "role is required."
    })
});
export const updateUserSchema = Joi.object({
    email: Joi.string().required().messages({
        "string.email": "Please enter a valid email.",
        "any.required": "email is required."
    }),
    user_id: Joi.string().required().messages({
        "any.required": "user id is required."
    }),
    name: Joi.string().required().messages({
        "string.phone": "Please enter a valid name.",
        "any.required": "name is required."
    }),
    role: Joi.string().required().messages({
        "string.role": "Please enter a valid role.",
        "any.required": "role is required."
    })
});



export const loginUserSchema = Joi.object({
   
    email: Joi.string().required().messages({
        "string.email": "Please enter a valid email.",
        "any.required": "email is required."
    }),
    password: Joi.string().required().messages({
        "string.password": "Please enter a valid password.",
        "any.required": "password is required."
    })
});

export const forgetPasswordSchema = Joi.object({
    email: Joi.string().required().messages({
        "string.email": "Please enter a valid email.",
        "any.required": "email is required."
    })
});
export const setPasswordSchema = Joi.object({
    email: Joi.string().required().messages({
        "string.email": "Please enter a valid email.",
        "any.required": "email is required."
    }),
    otp: Joi.string().required().messages({
        "string.otp": "Please enter a valid otp.",
        "any.required": "otp is required."
    }),
    password: Joi.string().required().messages({
        "string.password": "Please enter a valid password.",
        "any.required": "password is required."
    })
});

