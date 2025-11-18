import express from 'express';
import { db } from '../config/database.js';
import { users, notes } from '../config/schema.js';
import { authMiddleware } from '../middleware/auth.js';
import { eq, and, count, desc, isNull } from 'drizzle-orm';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const user = await db.select({
      id: users.id,
      email: users.email,
      username: users.username,
      createdAt: users.createdAt,
      lastLogin: users.lastLogin,
    }).from(users).where(eq(users.id, req.userId));

    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get user statistics
    const totalNotes = await db.select({ count: count() })
      .from(notes)
      .where(
        and(
          eq(notes.userId, req.userId),
          isNull(notes.deletedAt)
        )
      );

    const pinnedNotes = await db.select({ count: count() })
      .from(notes)
      .where(
        and(
          eq(notes.userId, req.userId),
          eq(notes.isPinned, true),
          isNull(notes.deletedAt)
        )
      );

    res.json({
      success: true,
      data: {
        user: user[0],
        stats: {
          totalNotes: totalNotes[0].count,
          pinnedNotes: pinnedNotes[0].count,
        },
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
    });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const { username } = req.body;

    if (!username || username.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Username must be at least 3 characters',
      });
    }

    const updatedUser = await db.update(users)
      .set({
        username: username.trim(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, req.userId))
      .returning({
        id: users.id,
        email: users.email,
        username: users.username,
        updatedAt: users.updatedAt,
      });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser[0],
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
    });
  }
});

export default router;
