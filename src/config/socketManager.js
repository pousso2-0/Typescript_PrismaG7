import { Server } from 'socket.io';
import { createClient } from 'redis';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, originEnv } from "./env";

const redisClient = createClient({
    password: 'FkjAEobjHOTmrsP8ieRtQEHkBiGOM9lh',
    socket: {
        host: 'redis-14004.c54.ap-northeast-1-2.ec2.redns.redis-cloud.com',
        port: 14004
    }
});

// Créez une fonction asynchrone pour initialiser Redis
const initializeRedis = async () => {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
            console.log('Connected to Redis');
        }
    } catch (error) {
        console.error('Error connecting to Redis:', error);
    }
};

const PRESENCE_EXPIRATION = 120; // 2 minutes en secondes

const initSocketIO = (server) => {
    const io = new Server(server, {
        cors: {
            origin: originEnv,
            credentials: true,
        },
    });

    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) return next(new Error("Authentication required"));

            const decoded = jwt.verify(token, JWT_SECRET);
            socket.userId = decoded.userId;
            next();
        } catch (err) {
            next(new Error("Authentication failed"));
        }
    });

    io.on('connection', async (socket) => {
        const userId = socket.userId;
        console.log(`User connected: ${userId}`);

        // Assurez-vous que Redis est connecté
        await initializeRedis();

        // Gérer les mises à jour de présence
        socket.on('updatePresence', async ({ status }) => {
            try {
                console.log(`Received updatePresence: ${userId} is ${status}`);
                const presenceData = {
                    status,
                    lastSeen: Date.now().toString()
                };

                if (redisClient.isOpen) {
                    // Sauvegarder dans Redis avec expiration
                    await redisClient.hSet(`user:${userId}:presence`, presenceData);
                    await redisClient.expire(`user:${userId}:presence`, PRESENCE_EXPIRATION);

                    // Informer les autres utilisateurs
                    socket.broadcast.emit('userStatus', {
                        userId,
                        ...presenceData
                    });
                }
            } catch (error) {
                console.error('Error updating presence:', error);
            }
        });

        // Répondre aux demandes de statut
        socket.on('getUserStatus', async (targetUserId) => {
            try {
                console.log(`Fetching status for user: ${targetUserId}`);

                if (redisClient.isOpen) {
                    const presenceData = await redisClient.hGetAll(`user:${targetUserId}:presence`);

                    if (!presenceData || Object.keys(presenceData).length === 0) {
                        socket.emit('userStatus', {
                            userId: targetUserId,
                            status: 'offline',
                            lastSeen: null
                        });
                        return;
                    }

                    console.log(`Status for user ${targetUserId}:`, presenceData);
                    socket.emit('userStatus', {
                        userId: targetUserId,
                        status: presenceData.status,
                        lastSeen: parseInt(presenceData.lastSeen)
                    });
                }
            } catch (error) {
                console.error('Error fetching user status:', error);
            }
        });

        // Nettoyer à la déconnexion
        socket.on('disconnect', async () => {
            console.log(`User disconnected: ${userId}`);
            const presenceData = {
                status: 'offline',
                lastSeen: Date.now().toString()
            };

            if (redisClient.isOpen) {
                await redisClient.hSet(`user:${userId}:presence`, presenceData);
                socket.broadcast.emit('userStatus', {
                    userId,
                    ...presenceData
                });
            }
        });
    });
}

export { initSocketIO };

// Ajoutez un gestionnaire d'erreurs global
process.on('unhandledRejection', async (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    if (redisClient.isOpen) {
        await redisClient.disconnect();
    }
});
