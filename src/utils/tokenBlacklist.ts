// src/utils/tokenBlacklist.js

let blacklist = new Set();

export const addToBlacklist = (token:string) => {
    if (typeof token === 'string' && token.trim() !== '') {
        blacklist.add(token.trim());
    }
};

export const isBlacklisted = (token:string) => {
    return typeof token === 'string' && blacklist.has(token.trim());
};

export const removeFromBlacklist = (token:string) => {
    if (typeof token === 'string') {
        blacklist.delete(token.trim());
    }
};

export const clearBlacklist = () => {
    blacklist.clear();
};

// Nettoyer la liste noire périodiquement
const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 heures en millisecondes
setInterval(clearBlacklist, CLEANUP_INTERVAL);