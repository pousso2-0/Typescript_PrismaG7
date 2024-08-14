"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.specs = exports.swaggerUi = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
exports.swaggerUi = swagger_ui_express_1.default;
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Tailor API',
            version: '1.0.0',
            description: 'Documentation de notre API pour le réseau social des tailleurs',
        },
        servers: [
            {
                url: `https://backendg7-jhgt.onrender.com/`,
                description: 'Serveur de développement',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT', // Indique le format du token utilisé
                },
            },
        },
        security: [
            {
                bearerAuth: [], // Applique le schéma de sécurité par défaut à toutes les routes
            },
        ],
    },
    apis: ['./src/routes/*.js'], // Chemin vers vos fichiers de routes
};
const specs = (0, swagger_jsdoc_1.default)(options);
exports.specs = specs;
