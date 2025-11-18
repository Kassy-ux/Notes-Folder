import express from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { db } from '../config/database.js';
import { users } from '../config/schema.js';
import { generateToken } from '../middleware/auth.js';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Register
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('username').trim().isLength({ min: 3, max: 100 }),
    body('password').isLength({ min: 6 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { email, username, password } = req.body;

      // Check if user exists
      const existingUser = await db.select().from(users).where(eq(users.email, email));
      if (existingUser.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered',
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const newUser = await db.insert(users).values({
        email,
        username,
        password: hashedPassword,
      }).returning({
        id: users.id,
        email: users.email,
        username: users.username,
        createdAt: users.createdAt,
      });

      // Generate token
      const token = generateToken(newUser[0].id);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: newUser[0],
          token,
        },
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed',
      });
    }
  }
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { email, password } = req.body;

      // Find user
      const user = await db.select().from(users).where(eq(users.email, email));
      if (user.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user[0].password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      // Check if account is active
      if (!user[0].isActive) {
        return res.status(403).json({
          success: false,
          message: 'Account is inactive',
        });
      }

      // Update last login
      await db.update(users)
        .set({ lastLogin: new Date() })
        .where(eq(users.id, user[0].id));

      // Generate token
      const token = generateToken(user[0].id);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user[0].id,
            email: user[0].email,
            username: user[0].username,
            createdAt: user[0].createdAt,
          },
          token,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed',
      });
    }
  }
);

export default router;
