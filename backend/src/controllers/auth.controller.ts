import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { config } from '../config/env';
import { zpdService } from '../services/zpd.service';
import { AuthRequest } from '../middleware/auth.middleware';

export class AuthController {
  async register(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email, password, name, role = 'student', level = 'elementary' } = req.body;

      if (!email || !password || !name) {
        res.status(400).json({ error: 'Email, password, and name are required' });
        return;
      }

      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        res.status(400).json({ error: 'Email already registered' });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const initialZPD = await zpdService.getInitialZPD(level);

      const user = new User({
        email: email.toLowerCase(),
        passwordHash,
        name,
        role,
        level,
        currentZPD: initialZPD,
      });

      await user.save();

      const token = jwt.sign(
        { userId: user._id },
        config.jwtSecret,
        { expiresIn: '7d' as any }
      );

      res.status(201).json({
        message: 'Registration successful',
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          level: user.level,
          currentZPD: user.currentZPD,
        },
      });
    } catch (error: any) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }

  async login(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const token = jwt.sign(
        { userId: user._id },
        config.jwtSecret,
        { expiresIn: '7d' as any }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          level: user.level,
          currentZPD: user.currentZPD,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }

  async getMe(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      res.json({
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        level: user.level,
        currentZPD: user.currentZPD,
        createdAt: user.createdAt,
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get user info' });
    }
  }

  async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, level, targetScenarioIds } = req.body;
      const user = req.user!;

      if (name) user.name = name;
      if (level) user.level = level;
      if (targetScenarioIds) user.targetScenarioIds = targetScenarioIds;

      await user.save();

      res.json({
        message: 'Profile updated',
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          level: user.level,
          currentZPD: user.currentZPD,
        },
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }

  async getTeachers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const teachers = await User.find({ role: { $in: ['teacher', 'admin'] } })
        .select('name email role')
        .limit(20);

      res.json({ teachers });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get teachers' });
    }
  }
}

export const authController = new AuthController();
