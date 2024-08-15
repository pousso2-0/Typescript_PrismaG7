// src/config/env.js
import dotenv from 'dotenv';

// Charger les variables d'environnement depuis le fichier .env
dotenv.config();

// Exporter les variables d'environnement
export const PORT = process.env.PORT || 3000;
export const JWT_SECRET = process.env.JWT_SECRET || 'secret';
export const PREMIUM_COST: number = parseInt(process.env.PREMIUM_COST || '100', 10);
export const PREMIUM_DEFAULT_CREDITS: number = parseInt(process.env.PREMIUM_DEFAULT_CREDITS || '200', 10);
