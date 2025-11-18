import express from 'express';
import { body, validationResult } from 'express-validator';
import { db } from '../config/database.js';
import { notes, attachments } from '../config/schema.js';
import { authMiddleware } from '../middleware/auth.js';
import { eq, and, desc, asc, like, or, isNull } from 'drizzle-orm';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get all notes for the authenticated user
router.get('/', async (req, res) => {
  try {
    const { search, category, sortBy = 'date', order = 'desc' } = req.query;

    let query = db.select().from(notes).where(
      and(
        eq(notes.userId, req.userId),
        isNull(notes.deletedAt)
      )
    );

    // Apply search filter
    if (search) {
      query = query.where(
        or(
          like(notes.title, `%${search}%`),
          like(notes.content, `%${search}%`)
        )
      );
    }

    // Apply category filter
    if (category && category !== 'all') {
      query = query.where(eq(notes.category, category));
    }

    // Apply sorting
    const sortField = sortBy === 'title' ? notes.title : notes.updatedAt;
    query = order === 'asc' ? query.orderBy(asc(sortField)) : query.orderBy(desc(sortField));

    // Always show pinned notes first
    query = query.orderBy(desc(notes.isPinned));

    const userNotes = await query;

    res.json({
      success: true,
      data: userNotes,
      count: userNotes.length,
    });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notes',
    });
  }
});

// Get a single note by ID
router.get('/:id', async (req, res) => {
  try {
    const note = await db.select()
      .from(notes)
      .where(
        and(
          eq(notes.id, req.params.id),
          eq(notes.userId, req.userId),
          isNull(notes.deletedAt)
        )
      );

    if (note.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    // Get attachments for this note
    const noteAttachments = await db.select()
      .from(attachments)
      .where(eq(attachments.noteId, req.params.id));

    res.json({
      success: true,
      data: {
        ...note[0],
        attachments: noteAttachments,
      },
    });
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch note',
    });
  }
});

// Create a new note
router.post(
  '/',
  [
    body('title').trim().notEmpty().isLength({ max: 255 }),
    body('content').trim().notEmpty(),
    body('category').optional().isIn(['general', 'work', 'personal', 'ideas', 'study']),
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

      const { title, content, category = 'general', isPinned = false, color, reminderDate } = req.body;

      const newNote = await db.insert(notes).values({
        userId: req.userId,
        title,
        content,
        category,
        isPinned,
        color,
        reminderDate: reminderDate ? new Date(reminderDate) : null,
      }).returning();

      res.status(201).json({
        success: true,
        message: 'Note created successfully',
        data: newNote[0],
      });
    } catch (error) {
      console.error('Create note error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create note',
      });
    }
  }
);

// Update a note
router.put('/:id', async (req, res) => {
  try {
    const { title, content, category, isPinned, color, reminderDate } = req.body;

    // Check if note exists and belongs to user
    const existingNote = await db.select()
      .from(notes)
      .where(
        and(
          eq(notes.id, req.params.id),
          eq(notes.userId, req.userId),
          isNull(notes.deletedAt)
        )
      );

    if (existingNote.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    const updatedNote = await db.update(notes)
      .set({
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(category !== undefined && { category }),
        ...(isPinned !== undefined && { isPinned }),
        ...(color !== undefined && { color }),
        ...(reminderDate !== undefined && { reminderDate: reminderDate ? new Date(reminderDate) : null }),
        updatedAt: new Date(),
      })
      .where(eq(notes.id, req.params.id))
      .returning();

    res.json({
      success: true,
      message: 'Note updated successfully',
      data: updatedNote[0],
    });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update note',
    });
  }
});

// Toggle pin status
router.patch('/:id/pin', async (req, res) => {
  try {
    const note = await db.select()
      .from(notes)
      .where(
        and(
          eq(notes.id, req.params.id),
          eq(notes.userId, req.userId),
          isNull(notes.deletedAt)
        )
      );

    if (note.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    const updatedNote = await db.update(notes)
      .set({
        isPinned: !note[0].isPinned,
        updatedAt: new Date(),
      })
      .where(eq(notes.id, req.params.id))
      .returning();

    res.json({
      success: true,
      message: `Note ${updatedNote[0].isPinned ? 'pinned' : 'unpinned'} successfully`,
      data: updatedNote[0],
    });
  } catch (error) {
    console.error('Toggle pin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle pin',
    });
  }
});

// Soft delete a note
router.delete('/:id', async (req, res) => {
  try {
    const note = await db.select()
      .from(notes)
      .where(
        and(
          eq(notes.id, req.params.id),
          eq(notes.userId, req.userId),
          isNull(notes.deletedAt)
        )
      );

    if (note.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    await db.update(notes)
      .set({ deletedAt: new Date() })
      .where(eq(notes.id, req.params.id));

    res.json({
      success: true,
      message: 'Note deleted successfully',
    });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete note',
    });
  }
});

// Restore a deleted note
router.patch('/:id/restore', async (req, res) => {
  try {
    const updatedNote = await db.update(notes)
      .set({ deletedAt: null })
      .where(
        and(
          eq(notes.id, req.params.id),
          eq(notes.userId, req.userId)
        )
      )
      .returning();

    if (updatedNote.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    res.json({
      success: true,
      message: 'Note restored successfully',
      data: updatedNote[0],
    });
  } catch (error) {
    console.error('Restore note error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to restore note',
    });
  }
});

// Get deleted notes (trash)
router.get('/trash/all', async (req, res) => {
  try {
    const deletedNotes = await db.select()
      .from(notes)
      .where(
        and(
          eq(notes.userId, req.userId),
          isNull(notes.deletedAt).not()
        )
      )
      .orderBy(desc(notes.deletedAt));

    res.json({
      success: true,
      data: deletedNotes,
      count: deletedNotes.length,
    });
  } catch (error) {
    console.error('Get trash error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch deleted notes',
    });
  }
});

export default router;
