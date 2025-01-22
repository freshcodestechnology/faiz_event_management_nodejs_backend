import Joi from 'joi';

export const adminEventSchema = Joi.object({
    event_id: Joi.string().messages({
    }),
    company_name: Joi.string().required().messages({
        "any.required": "Company Name is required.",
        "string.base": "Company Name must be a string."
    }),
    event_title: Joi.string().required().messages({
        "any.required": "Event Title is required.",
        "string.base": "Event Title must be a string."
    }),
    event_slug: Joi.string().required().messages({
        "any.required": "Event Slug is required.",
        "string.base": "Event Slug must be a string."
    }),
    reason_for_visiting: Joi.array()
    .items(
        Joi.string().required().messages({
            "any.required": "Each Reason for Visiting is required.",
            "string.base": "Each Reason for Visiting must be a string."
        })
    )
    .required()
    .messages({
        "any.required": "Reason for Visiting is required.",
        "array.base": "Reason for Visiting must be an array of strings."
    }),
    start_date: Joi.array()
    .items(
        Joi.string().required().messages({
            "any.required": "Each Reason for Visiting is required.",
            "string.base": "Each Reason for Visiting must be a string."
        })
    )
    .required()
    .messages({
        "any.required": "Reason for Visiting is required.",
        "array.base": "Reason for Visiting must be an array of strings."
    }),
    end_date: Joi.array()
    .items(
        Joi.string().required().messages({
            "any.required": "Each Reason for Visiting is required.",
            "string.base": "Each Reason for Visiting must be a string."
        })
    )
    .required()
    .messages({
        "any.required": "Reason for Visiting is required.",
        "array.base": "Reason for Visiting must be an array of strings."
    }),
    event_description: Joi.string().required().messages({
        "any.required": "Event Description is required.",
        "string.base": "Event Description must be a string."
    }),
    
    google_map_url: Joi.string().uri().required().messages({
        "any.required": "Google Map URL is required.",
        "string.uri": "Google Map URL must be a valid URI.",
        "string.base": "Google Map URL must be a string."
    }),
    address: Joi.string().required().messages({
        "any.required": "Address is required.",
        "string.base": "Address must be a string."
    }),
    event_type: Joi.string().required().messages({
        "any.required": "Event Type is required.",
        "string.base": "Event Type must be a string."
    }),
    company_activity: Joi.array()
    .items(
        Joi.string().required().messages({
            "any.required": "Each Company Activity is required.",
            "string.base": "Each Company Activity must be a string."
        })
    )
    .required()
    .messages({
        "any.required": "Company Activity is required.",
        "array.base": "Company Activity must be an array of strings."
    }),
    event_logo: Joi.string().uri().messages({
        "string.uri": "Event Logo must be a valid URI.",
        "string.base": "Event Logo must be a string."
    }),
    event_image: Joi.string().uri().messages({
        "string.uri": "Event Image must be a valid URI.",
        "string.base": "Event Image must be a string."
    }),
    organizer_name: Joi.string().required().messages({
        "any.required": "Organizer Name is required.",
        "string.base": "Organizer Name must be a string."
    }),
    organizer_email: Joi.string().email().required().messages({
        "any.required": "Organizer Email is required.",
        "string.email": "Organizer Email must be a valid email address.",
        "string.base": "Organizer Email must be a string."
    }),
    organizer_phone: Joi.string()
    .pattern(/^\d{10,15}$/)
    .required()
    .messages({
        "any.required": "Organizer Phone is required.",
        "string.pattern.base": "Organizer Phone must be a valid phone number with 10-15 digits.",
        "string.base": "Organizer Phone must be a string."
    }),
    sort_des_about_event: Joi.string().required().messages({
        "any.required": "Short Description About Event is required.",
        "string.base": "Short Description About Event must be a string."
    })
});


export const adminUpdateEventSchema = Joi.object({
    company_name: Joi.string().required().messages({
        "any.required": "Company Name is required.",
        "string.base": "Company Name must be a string."
    }),
    event_title: Joi.string().required().messages({
        "any.required": "Event Title is required.",
        "string.base": "Event Title must be a string."
    }),
    event_slug: Joi.string().required().messages({
        "any.required": "Event Slug is required.",
        "string.base": "Event Slug must be a string."
    }),
    event_id: Joi.string().required().messages({
        "any.required": "Event Slug is required.",
        "string.base": "Event Slug must be a string."
    }),
    reason_for_visiting: Joi.array()
    .items(
        Joi.string().required().messages({
            "any.required": "Each Reason for Visiting is required.",
            "string.base": "Each Reason for Visiting must be a string."
        })
    )
    .required()
    .messages({
        "any.required": "Reason for Visiting is required.",
        "array.base": "Reason for Visiting must be an array of strings."
    }),
    start_date: Joi.array()
    .items(
        Joi.string().required().messages({
            "any.required": "Each Reason for Visiting is required.",
            "string.base": "Each Reason for Visiting must be a string."
        })
    )
    .required()
    .messages({
        "any.required": "Reason for Visiting is required.",
        "array.base": "Reason for Visiting must be an array of strings."
    }),
    end_date: Joi.array()
    .items(
        Joi.string().required().messages({
            "any.required": "Each Reason for Visiting is required.",
            "string.base": "Each Reason for Visiting must be a string."
        })
    )
    .required()
    .messages({
        "any.required": "Reason for Visiting is required.",
        "array.base": "Reason for Visiting must be an array of strings."
    }),
    event_description: Joi.string().required().messages({
        "any.required": "Event Description is required.",
        "string.base": "Event Description must be a string."
    }),
    
    google_map_url: Joi.string().uri().required().messages({
        "any.required": "Google Map URL is required.",
        "string.uri": "Google Map URL must be a valid URI.",
        "string.base": "Google Map URL must be a string."
    }),
    address: Joi.string().required().messages({
        "any.required": "Address is required.",
        "string.base": "Address must be a string."
    }),
    event_type: Joi.string().required().messages({
        "any.required": "Event Type is required.",
        "string.base": "Event Type must be a string."
    }),
    company_activity: Joi.array()
    .items(
        Joi.string().required().messages({
            "any.required": "Each Company Activity is required.",
            "string.base": "Each Company Activity must be a string."
        })
    )
    .required()
    .messages({
        "any.required": "Company Activity is required.",
        "array.base": "Company Activity must be an array of strings."
    }),
    organizer_name: Joi.string().required().messages({
        "any.required": "Organizer Name is required.",
        "string.base": "Organizer Name must be a string."
    }),
    organizer_email: Joi.string().email().required().messages({
        "any.required": "Organizer Email is required.",
        "string.email": "Organizer Email must be a valid email address.",
        "string.base": "Organizer Email must be a string."
    }),
    organizer_phone: Joi.string()
    .pattern(/^\d{10,15}$/)
    .required()
    .messages({
        "any.required": "Organizer Phone is required.",
        "string.pattern.base": "Organizer Phone must be a valid phone number with 10-15 digits.",
        "string.base": "Organizer Phone must be a string."
    }),
    sort_des_about_event: Joi.string().required().messages({
        "any.required": "Short Description About Event is required.",
        "string.base": "Short Description About Event must be a string."
    })
});


