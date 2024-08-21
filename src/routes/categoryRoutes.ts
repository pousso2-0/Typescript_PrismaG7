import express from 'express';
import CategoryController from '../controllers/categoryController';
import { roleMiddleware } from '../middlewares/roleMiddleware';
import { UserType } from '@prisma/client';

const router = express.Router();

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
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nom de la catégorie
 *     responses:
 *       201:
 *         description: Catégorie créée avec succès
 *       400:
 *         description: Erreur lors de la création de la catégorie
 */
router.post('/', roleMiddleware(['VENDEUR']), CategoryController.createCategory);

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Récupérer toutes les catégories
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des catégories
 *       400:
 *         description: Erreur lors de la récupération des catégories
 */
router.get('/', roleMiddleware([UserType.VENDEUR]), CategoryController.getCategories);

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Récupérer une catégorie spécifique
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Catégorie trouvée
 *       404:
 *         description: Catégorie non trouvée
 *       400:
 *         description: Erreur lors de la récupération de la catégorie
 */
router.get('/:id', roleMiddleware([UserType.VENDEUR]), CategoryController.getCategory);

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Supprimer une catégorie
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Catégorie supprimée avec succès
 *       400:
 *         description: Erreur lors de la suppression de la catégorie
 */
router.delete('/:id', roleMiddleware([UserType.VENDEUR]), CategoryController.deleteCategory);


export default router;