import Joi from 'joi';

export const EventParticipantUsers = Joi.object({
    email: Joi.string().required().messages({
        "any.required": "Email is required.",
        "string.base": "Email must be a string."
    }),
    first_name: Joi.string().required().messages({
        "any.required": "First Name is required.",
        "string.base": "First Name must be a string."
    }),
    user_token: Joi.string().messages({
    }),
    last_name: Joi.string().required().messages({
        "any.required": "Last Name is required.",
        "string.base": "Last Name must be a string."
    }),
    designation: Joi.string().required().messages({
        "any.required": "Designation is required.",
        "string.base": "Designation must be a string."
    }),
    organization: Joi.string().required().messages({
        "any.required": "Organization is required.",
        "string.base": "Organization must be a string."
    }),
    contact: Joi.string().required().messages({
        "any.required": "Contact is required.",
        "string.base": "Contact is required."
    }),
    country: Joi.string().required().messages({
        "any.required": "Country is required.",
        "string.base": "Country must be a string."
    }),
    state: Joi.string().required().messages({
        "any.required": "State is required.",
        "string.base": "State must be a string."
    }),
    city: Joi.string().required().messages({
        "any.required": "City is required.",
        "string.base": "City must be a string."
    }),
    address: Joi.string().required().messages({
        "any.required": "Address is required.",
        "string.base": "Address is required."
    }),
    visit_reason: Joi.string().required().messages({
        "any.required": "Visit Reason is required.",
        "string.base": "Visit Reason must be a string."
    }),
    referral_source: Joi.string().required().messages({
    }),
    event_id: Joi.string().required().messages({
    }),
    company_activity: Joi.string().required().messages({
        "any.required": "Company Activity is required.",
        "string.base": "Company Activity must be a string."
    })
});
