import { loggerMsg } from "../../lib/logger";
import userSchema from "../schema/user.schema";
import companySchema from "../schema/company.schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

interface userData{
    email: string;
    password: string;
    name: string;
    profilePicture: string;
    role: string;
    status: boolean;
    company_id?:string;
}

interface UpdateUserData{
    email: string;
    password: string;
    name: string;
    profilePicture: string;
    role: string;
    status: boolean;
    user_id : string;
}

interface userLoginData{
    email: string;
    password: string;
    subdomain : string;
    company_id?:string;
}

interface loginUserData{
    user_id:string;
    company_id:string;
}

interface userStatus{
    user_id:string;
    status:number;
}

export const updateStatus = async (userStatus: userStatus, callback: (error: any, result: any) => void) => {
    try {
        const user_id = userStatus.user_id
        const updatedCompany = await userSchema.findByIdAndUpdate(
            user_id,
            {
                $set: {
                    status: userStatus.status,
                },
            },
            { new: true } 
        );

        if (!updatedCompany) {
            return callback(new Error("Company not found"), null);
        }

        return callback(null, { updatedCompany });

    } catch (error) {
        return callback(error, null); 
    }
};

export const userLogin = async (userData: userLoginData,  callback: (error:any, result: any) => void) => {
    try {

        const user = await userSchema.findOne({ email: { $regex: new RegExp(`^${userData.email}$`, 'i') } });
        if (!user) {
            const error = new Error("User not found with this email.");
            return callback(error, null);
        };

        if(user.role == "superadmin"){

            const isPasswordCorrect = await bcrypt.compare(userData.password, user.password);
            if (!isPasswordCorrect) {
                const error = new Error("Incorrect password.");
                return callback(error, null);
            };

            const token = jwt.sign(
                { userId: user._id, email: user.email ,name:user.name,company_id:"0"},
                process.env.JWT_SECRET_KEY || "defaultsecretkey", 
                { expiresIn: "8h" } 
            );

            const result = {
                message: "Login successful",
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    status: user.status,
                },
                token: token,
                user_role:"superadmin"
            };
            return callback(null, result);

        }else{

            const company_name = userData.subdomain;
            const subdomain = userData.subdomain;
            const company_details = await companySchema.findOne({ subdomain });
            
            if (!company_details) {
                const error = new Error("Company not found.");
                return callback(error, null);
            }
            
            if (company_details.status === 0) {
                const error = new Error("Company is inactive. Contact admin.");
                return callback(error, null);
            }
            
            if (user.status === 0) {
                const error = new Error("User is inactive. Contact admin.");
                return callback(error, null);
            }
            if (company_details.id != user.company_id) {
                const error = new Error("You dont have access to login in this admin panel");
                return callback(error, null);
            }

            const isPasswordCorrect = await bcrypt.compare(userData.password, user.password);
            if (!isPasswordCorrect) {
                const error = new Error("Incorrect password.");
                return callback(error, null);
            }
            
            const token = jwt.sign(
                { userId: user._id, email: user.email, name: user.name,company_id:company_details.id },
                process.env.JWT_SECRET_KEY || "defaultsecretkey", 
                { expiresIn: "8h" }
            );
            
            const result = {
                message: "Login successful",
                user,
                company_details,
                token: token,
                user_role:"companyadmin"
            };
            
            return callback(null, result);
        }

    } catch (error) {
        return callback(error, null);
    }
};

export const storeUser = async (loginuserData: loginUserData,userData: userData,  callback: (error:any, result: any) => void) => {
    try {
    
        const existingUser = await userSchema.findOne({ email: userData.email });
        if (existingUser) {
            const error = new Error("User with this email already exists.");
            return callback(error, null);
        }

        const hashedPassword = await bcrypt.hash(userData.password, 10);

        const newUser = new userSchema({
            name: userData.name,
            email: userData.email,
            company_id: userData.company_id ? userData.company_id :loginuserData.company_id,
            password: hashedPassword,
            profilePicture: userData.profilePicture,
            status: "1",
            role:userData.role
        });

        const savedUser = await newUser.save();
        return callback(null, newUser);
    } catch (error) {
        return callback(error, null);
    }
};

export const adminUserList = async (loginuserData: loginUserData,userData: userLoginData, page: number, pageSize: number, searchQuery: string, callback: (error: any, result: any) => void) => {
    try {

        const currentPage = page || 1;
        const size = pageSize || 10;

        const skip = (currentPage - 1) * size;

        if(loginuserData.company_id != "0"){

            const searchFilter = searchQuery
                ? {
                    $or: [
                        { name: { $regex: searchQuery, $options: 'i' } }, 
                        { email: { $regex: searchQuery, $options: 'i' } }, 
                        ],
                        company_id: loginuserData.company_id
                    }
                : { company_id: loginuserData.company_id };

            const users = await userSchema.find(searchFilter).skip(skip).limit(size);
            const totalUsers = await userSchema.countDocuments(searchFilter); 
            const result = {
                currentPage: currentPage,
                totalPages: Math.ceil(totalUsers / size),
                totalUsers: totalUsers,
                users: users,
            };
            return callback(null, result);
        }else{
           
            const searchFilter: any = {};

            if (searchQuery) {
                searchFilter.$or = [
                    { name: { $regex: searchQuery, $options: 'i' } },
                    { email: { $regex: searchQuery, $options: 'i' } }
                ];
            }

            if (userData.company_id != null) {
                searchFilter.company_id = userData.company_id;
            }

            const users = await userSchema.find(searchFilter).skip(skip).limit(size);
            const totalUsers = await userSchema.countDocuments(searchFilter);
            const result = {
                currentPage: currentPage,
                totalPages: Math.ceil(totalUsers / size),
                totalUsers: totalUsers,
                users: users,
            };
            return callback(null, result);
        }

        
    } catch (error) {
        return callback(error, null);
    }
}

export const updateUser = async (userData: UpdateUserData, callback: (error: any, result: any) => void) => {
    try {
            
        const existingUser = await userSchema.findById(userData.user_id);
        if (!existingUser) {
            const error = new Error("User not found.");
            return callback(error, null);
        }

        if (userData.email && userData.email !== existingUser.email) {
            const emailTaken = await userSchema.findOne({ email: userData.email });
            if (emailTaken) {
                const error = new Error("User with this email already exists.");
                return callback(error, null);
            }
        }

        existingUser.name = userData.name || existingUser.name;
        existingUser.email = userData.email || existingUser.email;
        existingUser.profilePicture = userData.profilePicture || existingUser.profilePicture;
        existingUser.role = userData.role || existingUser.role;

        if (userData.password && userData.password !== "") {
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            existingUser.password = hashedPassword;
        }

        const updatedUser = await existingUser.save();
        return callback(null, updatedUser);
    } catch (error) {
        return callback(error, null);
    }
};


