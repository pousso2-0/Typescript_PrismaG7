import { Router } from 'express';
import ArticleController from '../controllers/articleController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Articles
 *   description: Article management
 */
/**
 * @swagger
 * /api/articles/category/{categoryId}:
 *   get:
 *     summary: List articles by category for a store
 *     tags: [Articles]
 *     parameters:
 *       - name: categoryId
 *         in: path
 *         required: true
 *         description: Category ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of articles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CatalogueResponse'
 *       404:
 *         description: Not found
 */
router.get('/stores/:storeId/category/:categoryId', authMiddleware, ArticleController.listArticlesByCategoryForStore);

/**
 * @swagger
 * /api/articles/categories:
 *   get:
 *     summary: List all categories and articles
 *     tags: [Articles]
 *     responses:
 *       200:
 *         description: List of categories and articles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CategoryWithArticlesResponse'
 *       500:
 *         description: Internal server error
 */
router.get('/categories' , authMiddleware, ArticleController.listAllCategoriesAndArticles);

/**
 * @swagger
 * /api/articles/store/{storeId}:
 *   post:
 *     summary: Add an article to a store
 *     tags: [Articles]
 *     parameters:
 *       - name: storeId
 *         in: path
 *         required: true
 *         description: Store ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ArticleData'
 *     responses:
 *       201:
 *         description: Article added
 *       500:
 *         description: Internal server error
 */
router.post('/store/:storeId' , roleMiddleware(['VENDEUR']), authMiddleware, ArticleController.addArticleToStore);
/**
 * @swagger
 * /api/articles/store/{storeId}/category/{categoryId}:
 *   delete:
 *     summary: Delete a category for a store
 *     tags: [Articles]
 *     parameters:
 *       - name: storeId
 *         in: path
 *         required: true
 *         description: Store ID
 *         schema:
 *           type: integer
 *       - name: categoryId
 *         in: path
 *         required: true
 *         description: Category ID
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Category deleted
 *       500:
 *         description: Internal server error
 */
router.delete('/store/:storeId/category/:categoryId',roleMiddleware(['VENDEUR']), authMiddleware, ArticleController.deleteCategoryForStore);

/**
 * @swagger
 * /api/articles/store/{storeId}/category/{categoryId}:
 *   delete:
 *     summary: Delete store
 *     tags: [Articles]
 *     parameters:
 *       - name: storeId
 *         in: path
 *         required: true
 *         description: Store ID
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: store deleted
 *       500:
 *         description: Internal server error
 */
router.delete('/store/:storeId/' , roleMiddleware(['VENDEUR']), authMiddleware, ArticleController.deleteCategoryForStore);

/**
 * @swagger
 * /api/articles/store/{storeId}/categories:
 *   get:
 *     summary: List all categories and articles for a store
 *     tags: [Articles]
 *     parameters:
 *       - name: storeId
 *         in: path
 *         required: true
 *         description: Store ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of categories and articles for a store
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CategoryWithArticlesResponse'
 *       500:
 *         description: Internal server error
 */
router.get('/store/:storeId/categories', authMiddleware, ArticleController.listAllCategoriesForStore);


export default router;
