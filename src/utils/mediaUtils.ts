import MediaService from "../services/mediaService";

export async function handleMediaFiles(files: Express.Multer.File[], fieldnamePattern: string): Promise<string[]> {
    // Filtrer les fichiers en fonction du pattern du fieldname
    const targetFiles = files.filter((file: Express.Multer.File) =>
        file.fieldname.startsWith(fieldnamePattern)
    );

    if (targetFiles.length > 0) {
        // Utiliser Promise.all pour télécharger tous les fichiers en parallèle
        try {
            const mediaUrls = await Promise.all(
                targetFiles.map(file => MediaService.uploadMedia(file))
            );
            return mediaUrls;
        } catch (error) {
            console.error('Erreur lors de l\'upload des médias:', error);
            throw new Error('Erreur lors de l\'upload des médias');
        }
    }

    return []; 
}
