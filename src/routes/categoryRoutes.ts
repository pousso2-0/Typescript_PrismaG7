import express from 'express';
import CategoryController from '../controllers/categoryController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';
import {uploadMiddleware} from "../middlewares/uploadMiddleware";

const router = express.Router();

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Obtenir toutes les catégories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Liste de toutes les catégories
 *       500:
 *         description: Erreur serveur
 */
router.get('/', CategoryController.getAllCategories);
/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Créer une nouvelle catégorie
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: 'Tissu'
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image de la catégorie (optionnel)
 *     responses:
 *       201:
 *         description: Catégorie créée avec succès
 *       400:
 *         description: Erreur de requête
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé
 */
router.post('/', authMiddleware, roleMiddleware(['VENDEUR']), uploadMiddleware, CategoryController.createCategory);




/**
 * @swagger
 * /api/categories/name/{name}:
 *   get:
 *     summary: Récupérer une catégorie par son nom
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails de la catégorie
 *       404:
 *         description: Catégorie non èxistée
 */
router.get('/name/:name', CategoryController.getCategoryByName);


export default router;