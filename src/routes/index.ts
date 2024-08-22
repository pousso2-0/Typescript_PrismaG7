import { Express } from "express";
import userRoutes from "./userRoutes";
import postRoutes from "./postRoutes";
import commentRoutes from "./commentRoutes";
import messageRoutes from "./messageRoutes";
import feedRoutes from "./feedRoutes";
import reactionsRoutes from "./reactionRoutes";
import statusRoutes from "./statusRoutes";
import articleRoutes from "./articleRoutes";
import categoryRoutes from "./categoryRoutes";
import orderRoutes from "./orderRoutes";

export default function (app: Express) {
  app.use("/api/users", userRoutes);
  app.use("/api/posts", postRoutes);
  app.use("/api/comments", commentRoutes);
  app.use("/api/messages", messageRoutes);
  app.use("/api/articles", articleRoutes);
  app.use("/api/categories", categoryRoutes);
  app.use("/api/orders", orderRoutes);
  //   app.use('/api/', feedRoutes);
  app.use("/api/feed", feedRoutes);
  app.use("/api/reactions", reactionsRoutes);
  app.use("/api/status", statusRoutes);
}

console.log("index dans routes executé");
