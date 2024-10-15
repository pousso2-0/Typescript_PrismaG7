import { v2 as cloudinary } from 'cloudinary';
import * as fs from "node:fs"; // Assurez-vous d'importer et configurer Cloudinary
import { extname } from 'path'; // Pour obtenir l'extension du fichier

class MediaService {
    static async uploadMedia(file: Express.Multer.File): Promise<string> {
        try {
            // Vérifiez le type de fichier
            const supportedFormats = [
                'image/jpeg',
                'image/png',
                'image/gif',
                'video/mp4',
                'video/quicktime',
                'video/x-msvideo',
                'video/webm'  // Ajout du format .webm ici
            ];

            // Vérifier si le type MIME du fichier est supporté
            if (!supportedFormats.includes(file.mimetype)) {
                throw new Error('Unsupported file type');
            }

            // Utilisation de resource_type: 'auto' pour permettre à Cloudinary de détecter le type de fichier
            const result = await cloudinary.uploader.upload(file.path, { resource_type: 'auto' });

            // Vérifiez si result.url est défini
            if (!result.url) {
                throw new Error('No URL returned from Cloudinary');
            }

            // Supprimez le fichier local après le téléchargement
            fs.unlinkSync(file.path); // Supprime le fichier local

            return result.url; // Retourne l'URL du fichier uploadé
        } catch (error) {
            // Vérification du type d'erreur pour obtenir un message d'erreur
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new Error(`Failed to upload media: ${errorMessage}`);
        }
    }
    static async deleteMedia(mediaUrl: string): Promise<void> {
        try {
            if (!mediaUrl) {
                throw new Error('mediaUrl is required to delete media.');
            }

            const publicId = mediaUrl.split('/').pop()?.split('.')[0]; // Extraire l'ID public

            if (!publicId) {
                throw new Error('Failed to extract public ID from mediaUrl.');
            }

            await cloudinary.uploader.destroy(publicId); // Supprimer l'image du cloud
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new Error(`Failed to delete media: ${errorMessage}`);
        }
    }

}

export default MediaService;
