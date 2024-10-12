// Fonction pour convertir des durées dynamiques
export function parseDuration(duration: string): number | null {
    const totalMilliseconds = duration.split(' ').reduce((total, part) => {
        const regex = /^(\d+)([smhd])$/; // Format : nombre + unité (s, m, h, d)
        const match = part.match(regex);
        if (!match) return total; // Ignorer les parties invalides

        const value = parseInt(match[1], 10);
        const unit = match[2];

        switch (unit) {
            case 's': return total + value * 1000; // secondes
            case 'm': return total + value * 60 * 1000; // minutes
            case 'h': return total + value * 60 * 60 * 1000; // heures
            case 'd': return total + value * 24 * 60 * 60 * 1000; // jours
            default: return total; // Ne devrait pas arriver
        }
    }, 0);

    return totalMilliseconds > 0 ? totalMilliseconds : null; // Retourne null si aucune durée valide
}