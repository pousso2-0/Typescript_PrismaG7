import fs from 'fs';
import multer from 'multer';
import { RequestHandler } from 'express';
import path from 'path';

// Create uploads directory if it doesn't exist
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// File filter to allow image and video types
const fileFilter = (req: any, file: any, cb: any) => {
    const allowedTypes = ['image/', 'video/'];
    if (allowedTypes.some(type => file.mimetype.startsWith(type))) {
        cb(null, true);
    } else {
        cb(new Error('Only image and video files are allowed!'), false);
    }
};

// Dynamic multer handler to accept any number of files from any field
const upload = multer({ storage, fileFilter });

// Middleware to handle any number of files from any field dynamically
export const uploadMiddleware: RequestHandler = upload.any();
