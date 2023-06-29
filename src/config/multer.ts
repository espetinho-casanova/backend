import crypto from 'crypto';
import multer from "multer";

import { extname, resolve } from 'path';

export default{
    upload(folder: string){
        return{
            storage: multer.diskStorage({
                destination: resolve(__dirname, '..', '..', folder),
                filename: (request, file, callback) => {
                    const fileHash = crypto.randomBytes(4).toString("hex");
                    const nameWithoutExtension = file.originalname.split('.')[0];
                    const fileName = `${nameWithoutExtension}-${fileHash}.png`
                    return callback(null, fileName)
                }
            })
        }
    }
}