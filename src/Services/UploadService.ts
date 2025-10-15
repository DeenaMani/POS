import { ResponseService } from "./ResponseService";
import path from "path";
import fs from "fs";

export class UploadService {
    /**
     * Handles file upload for images and documents.
     * @param req Express request object
     * @param fieldName The field name in the form-data
     * @param uploadDir Directory to save the uploaded file
     * @param allowedTypes Array of allowed mime types (e.g., ['image/jpeg', 'application/pdf'])
     * @returns Uploaded file info or throws error
     */
    static async FileUploader(req: any, fieldName: string, uploadDir: any, allowedTypes: string[], FileName: string): Promise<{ filename: string; path: string; mimetype: any }> {
        if (!req.files) {
            ResponseService.jsonResponse(400, "No files were uploaded.", req.res, req, "File upload error", false);
        }

        let file: any;

        if (Array.isArray(req.files)) {
            /* If req.files is an array, find the file by fieldName property if available */
            file = req.files.find((f: any) => f.fieldname === fieldName);
        } else {
            /*  If req.files is an object, access by fieldName */
            file = (req.files as { [fieldname: string]: any })[fieldName];
        }

        if (!file) {
            ResponseService.jsonResponse(400, { [file.fieldName]: "No files were uploaded." }, req.res, req, "File upload error", false);
        }

        if (!allowedTypes.includes(file.mimetype)) {
            ResponseService.jsonResponse(400, { [file.fieldname]: "Invalid file type: " + file.mimetype }, req.res, req, "File upload error", false);
        }

        if (!uploadDir) {
            uploadDir = path.join(__dirname, '../public/assets/images/users');
        }

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, FileName);

        await fs.promises.writeFile(filePath, file.buffer);

        return {
            filename: FileName,
            path: filePath,
            mimetype: file.mimetype,
        };

    }
}