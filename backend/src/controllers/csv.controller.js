import fs from 'fs';
import crypto from 'crypto';
import { Student } from '../models/student.model.js';
import { sendMail } from '../utils/sendMail.js';
import { readCSV } from '../utils/readCSV.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const uploadStudents = asyncHandler( async (req, res) => {
    try {
        console.log(req.body);
        console.log("File received: ", req.file);
        if(!req.file){
            throw new ApiError(400, 'No file uploaded');
        }

        const csvData = await readCSV(req.file.path);
        console.log(csvData);
        
        const students = [];
        const errors = [];
        const duplicates = [];
        const inserted = [];

        for(let user of csvData){
            if(!user.name || !user.email || !user.rollNo || !user.department){
                errors.push({data: user, error: 'Missing required fields'});
                continue;
            }
            const existingUser = await Student.findOne({email: user.email});
            if(existingUser){
                duplicates.push(user);
                continue;
            }

            const password = crypto.randomBytes(8).toString('hex');
            console.log(password);
            const newUser = new Student({
                name: user.name,
                email: user.email,
                rollNo: user.rollNo,
                department: user.department,
                password: password,
                role: 'student',
                refreshToken: undefined
            })
            await newUser.save();
            inserted.push(newUser);
            
            try{
                await sendMail(user.email, password);
            }
            catch(err){
                console.log(`Failed to send email to ${user.email}: `, err);
                errors.push({data: user, error: 'Failed to send email'});
            }
        }

        fs.unlinkSync(req.file.path);

        return res.status(200).json(
            new ApiResponse(200, { insertedCount: inserted.length, duplicates, errors }, 'Students uploaded successfully')
        );
    } catch (error) {
        console.log("Upload error: ", error);
        throw new ApiError(500, 'Failed to upload students');
    }
})