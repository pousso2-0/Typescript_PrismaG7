import { Request, Response } from 'express';
import FollowService from '../services/followService';

class FollowController {
  static async followUser(req: Request, res: Response): Promise<void> {
    try {
      const followerId = req.userId as number
      const { followingId } = req.body;

      const follow = await FollowService.followUser(followerId, followingId);
      res.status(201).json({ message: 'User followed successfully', follow });
    } catch (error:any) {
      res.status(400).json({ message: `Failed to follow user: ${error.message}`});
    }
  }

  static async unfollowUser(req: Request, res: Response): Promise<void> {
    try {
      const unfollowerId = req.userId as number;
      const { unfollowingId } = req.body;

      await FollowService.unfollowUser(unfollowerId, unfollowingId);
      res.status(200).json({ message: 'User unfollowed successfully' });
    } catch (error:any) {
      res.status(400).json({message: `Failed to unfollow user: ${error.message}`});
    }
  }

  static async getFollowers(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId as number;

      const followers = await FollowService.getFollowers(userId);
      res.status(200).json(followers);
    } catch (error:any) {
      res.status(400).json({ message: `Failed to get followers: ${error.message}` });
    }
  }

  static async getFollowing(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId as number;

      const following = await FollowService.getFollowing(userId);
      res.status(200).json(following);
    } catch (error:any) {
      res.status(400).json({ message: `Failed to get following: ${error.message}` });
    }
  }
}

export default FollowController;
