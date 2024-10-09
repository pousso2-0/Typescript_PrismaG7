import multer from 'multer';
import { RequestHandler } from 'express';
import path from 'path';

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Specify the destination folder for uploads
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname); // Extract file extension
        cb(null, Date.now() + '-' + file.originalname); // Unique name with timestamp
    }
});

// File filter to allow only specific file types if needed
const fileFilter = (req: any, file: any, cb: any) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// Dynamic multer handler to accept any number of files from any field
const upload = multer({ storage, fileFilter });

// Middleware to handle any number of files from any field dynamically
export const uploadMiddleware: RequestHandler = upload.any();
