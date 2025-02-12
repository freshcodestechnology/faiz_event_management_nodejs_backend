import mongoose from "mongoose";
import bcrypt from "bcrypt";
import scannermachineSchema from "../schema/scannerMachine.schema";
import companySchema from "../schema/company.schema";
interface scannerMachineData{
    scanner_name:string;
    scanner_unique_id:string;
}

interface updateScannerMachineData{
    scanner_machine_id:string;
    scanner_name:string;
    scanner_unique_id:string;
}

interface assignScannerMachineData{
    scannerMachine_ids:any;
    expired_date:any;
    company_id:string;
    password:string;
}

export const storeScannerMachineModel = async (scannerData: scannerMachineData, callback: (error: any, result: any) => void) => {
    try {
        const existingScanner = await scannermachineSchema.findOne({ scanner_unique_id: scannerData.scanner_unique_id });

        if (existingScanner) {
            return callback({ message: "Scanner with this unique ID already exists" }, null);
        }

        const newScanner = new scannermachineSchema({
            scanner_name: scannerData.scanner_name,
            scanner_unique_id: scannerData.scanner_unique_id,
        });

        const savedScanner = await newScanner.save();

        return callback(null, { savedScanner });

    } catch (error) {
        console.log(error);
        return callback({ message: "An error occurred", error }, null);
    }
}

export const updateScannerMachineModel = async (scannerData: updateScannerMachineData, callback: (error: any, result: any) => void) => {
    try {
        const existingScanner = await scannermachineSchema.findOne({ _id: scannerData.scanner_machine_id });

        if (!existingScanner) {
            return callback({ message: "Scanner with this ID does not exist" }, null);
        }

        existingScanner.scanner_name = scannerData.scanner_name;
        existingScanner.scanner_unique_id = scannerData.scanner_unique_id;

        const updatedScanner = await existingScanner.save();

        return callback(null, { updatedScanner });

    } catch (error) {
        console.log(error);
        return callback({ message: "An error occurred", error }, null);
    }
}


export const scannerMachineList = async (scannerMachineData: updateScannerMachineData, page: number, pageSize: number, searchQuery: string, callback: (error: any, result: any) => void) => {
    try {

        const currentPage = page || 1;
        const size = pageSize || 10;

        const skip = (currentPage - 1) * size;

        const searchFilter = searchQuery
            ? {
                  $or: [
                      { scanner_name: { $regex: searchQuery, $options: 'i' } }, 
                      { scanner_unique_id: { $regex: searchQuery, $options: 'i' } }, 
                  ]
              }
            : {}; 
            const companies = await scannermachineSchema.find(searchFilter).skip(skip).limit(size);
            const companyIds = [...new Set(companies.map(c => c.company_id).filter(id => id))];

            const companyDetails = await companySchema.find({ _id: { $in: companyIds } }).select("_id company_name");
            const companyMap = new Map(companyDetails.map(c => [c.id.toString(), c.company_name]));
              console.log(companyMap);
        const formattedCompanies = companies.map(company => ({
            ...company.toObject(), 
            company_id: companyMap.get(company.company_id?.toString()) || "-",
            expired_date: company.expired_date || "-"
        }))

       
        const totalCompany = await scannermachineSchema.countDocuments(searchFilter); 
        const result = {
            currentPage: currentPage,
            totalPages: Math.ceil(totalCompany / size),
            totalUsers: totalCompany,
            scannermachine: formattedCompanies,
        };

        return callback(null, result);
    } catch (error) {
        console.error("Error fetching user list:", error);
        return callback(error, null);
    }
}

export const assignScannerMachineModel = async (scannerData: assignScannerMachineData, callback: (error: any, result: any) => void) => {
    try {
        const company_id = scannerData.company_id;
        const expired_date = scannerData.expired_date;
        const password = scannerData.password;
        const hashedPassword = await bcrypt.hash(password, 10);
        const updateResult = await scannermachineSchema.updateMany(
            { _id: { $in: scannerData.scannerMachine_ids } }, 
            { 
                $set: { 
                    company_id, 
                    expired_date, 
                    password: hashedPassword  
                }
            }
        );

        if (updateResult.modifiedCount === 0) {
            return callback(null, { message: "No records updated. Check scannerMachine_ids." });
        }

        return callback(null, { message: "Scanner machines updated successfully", updateResult });

    } catch (error) {
        console.log(error);
        return callback({ message: "An error occurred", error }, null);
    }
}

