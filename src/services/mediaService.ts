import { v2 as cloudinary } from 'cloudinary';
import * as fs from "node:fs"; // Assurez-vous d'importer et configurer Cloudinary

class MediaService {
    static async uploadMedia(file: Express.Multer.File): Promise<string> {
        try {
            const result = await cloudinary.uploader.upload(file.path);
            // Vérifiez si result.url est défini
            if (!result.url) {
                throw new Error('No URL returned from Cloudinary');
            }
            // Supprimez le fichier local après le téléchargement
            fs.unlinkSync(file.path); // Supprime le fichier local
            return result.url; // Ici, nous savons que c'est une chaîne de caractères
        } catch (error) {
            // Vérification du type d'erreur pour obtenir un message d'erreur
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new Error(`Failed to upload media: ${errorMessage}`);
        }
    }
}

export default MediaService;
