const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const pool = require('../db');
const auth = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/messages');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files per upload
  },
  fileFilter: (req, file, cb) => {
    // Allow images and documents
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and documents are allowed.'));
    }
  }
});

// Get message threads for owner
router.get('/threads', auth, async (req, res) => {
  try {
    const ownerId = req.owner.id;
    
    const threadsQuery = `
      SELECT DISTINCT
        b.id as booking_id,
        p.name as property_title,
        c.full_name as guest_name,
        c.email as guest_email,
        (
          SELECT COUNT(*) 
          FROM messages m 
          WHERE m.booking_id = b.id 
          AND m.sender_type = 'guest' 
          AND m.is_read = false
        ) as unread_count,
        (
          SELECT row_to_json(last_msg)
          FROM (
            SELECT id, message, message_type, created_at, sender_type
            FROM messages
            WHERE booking_id = b.id
            ORDER BY created_at DESC
            LIMIT 1
          ) last_msg
        ) as last_message
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      JOIN customers c ON b.customer_id = c.id
      WHERE p.owner_id = $1
      AND EXISTS (
        SELECT 1 FROM messages m WHERE m.booking_id = b.id
      )
      ORDER BY COALESCE(
        (SELECT created_at FROM messages WHERE booking_id = b.id ORDER BY created_at DESC LIMIT 1),
        b.created_at
      ) DESC
    `;
    
    const result = await pool.query(threadsQuery, [ownerId]);
    
    const threads = result.rows.map(row => ({
      bookingId: row.booking_id,
      propertyTitle: row.property_title,
      guestName: row.guest_name,
      guestEmail: row.guest_email,
      unreadCount: parseInt(row.unread_count),
      lastMessage: row.last_message
    }));
    
    res.json(threads);
  } catch (error) {
    console.error('Error fetching message threads:', error);
    res.status(500).json({ error: 'Failed to fetch message threads' });
  }
});

// Get messages for a specific booking
router.get('/booking/:bookingId', auth, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const ownerId = req.owner.id;
    
    // Verify owner has access to this booking
    const bookingCheck = await pool.query(`
      SELECT b.id FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE b.id = $1 AND p.owner_id = $2
    `, [bookingId, ownerId]);
    
    if (bookingCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const messagesQuery = `
      SELECT 
        m.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', ma.id,
              'filename', ma.filename,
              'originalName', ma.original_name,
              'fileType', ma.file_type,
              'fileSize', ma.file_size,
              'fileUrl', ma.file_url,
              'createdAt', ma.created_at
            )
          ) FILTER (WHERE ma.id IS NOT NULL),
          '[]'
        ) as attachments
      FROM messages m
      LEFT JOIN message_attachments ma ON m.id = ma.message_id
      WHERE m.booking_id = $1
      GROUP BY m.id
      ORDER BY m.created_at ASC
    `;
    
    const result = await pool.query(messagesQuery, [bookingId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching booking messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send message
router.post('/', auth, upload.array('attachments', 5), async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const {
      bookingId,
      message,
      messageType = 'text',
      templateId,
      isScheduled = false,
      scheduledFor
    } = req.body;
    
    const ownerId = req.owner.id;
    
    // Verify owner has access to this booking
    const bookingCheck = await client.query(`
      SELECT b.id FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE b.id = $1 AND p.owner_id = $2
    `, [bookingId, ownerId]);
    
    if (bookingCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Get template content if using template
    let finalMessage = message;
    if (templateId) {
      const templateResult = await client.query(
        'SELECT content FROM message_templates WHERE id = $1 AND owner_id = $2',
        [templateId, ownerId]
      );
      
      if (templateResult.rows.length > 0) {
        // TODO: Replace template variables with actual data
        finalMessage = templateResult.rows[0].content;
      }
    }
    
    // Insert message
    const messageResult = await client.query(`
      INSERT INTO messages (
        booking_id, sender_id, sender_type, message, message_type,
        is_scheduled, scheduled_for, template_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      bookingId, ownerId, 'owner', finalMessage, messageType,
      isScheduled, isScheduled ? scheduledFor : null, templateId
    ]);
    
    const newMessage = messageResult.rows[0];
    
    // Handle file attachments
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await client.query(`
          INSERT INTO message_attachments (
            message_id, filename, original_name, file_type, file_size, file_url
          ) VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          newMessage.id,
          file.filename,
          file.originalname,
          file.mimetype,
          file.size,
          `/uploads/messages/${file.filename}`
        ]);
      }
    }
    
    await client.query('COMMIT');
    
    // Get complete message with attachments
    const completeMessageResult = await client.query(`
      SELECT 
        m.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', ma.id,
              'filename', ma.filename,
              'originalName', ma.original_name,
              'fileType', ma.file_type,
              'fileSize', ma.file_size,
              'fileUrl', ma.file_url,
              'createdAt', ma.created_at
            )
          ) FILTER (WHERE ma.id IS NOT NULL),
          '[]'
        ) as attachments
      FROM messages m
      LEFT JOIN message_attachments ma ON m.id = ma.message_id
      WHERE m.id = $1
      GROUP BY m.id
    `, [newMessage.id]);
    
    const messageWithAttachments = completeMessageResult.rows[0];
    
    // TODO: Send real-time notification via WebSocket
    // TODO: Send email/SMS notification to guest if not scheduled
    
    res.json(messageWithAttachments);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  } finally {
    client.release();
  }
});

// Mark messages as read
router.patch('/mark-read', auth, async (req, res) => {
  try {
    const { messageIds } = req.body;
    const ownerId = req.owner.id;
    
    // Only mark messages as read if they belong to owner's properties
    await pool.query(`
      UPDATE messages 
      SET is_read = true, read_at = CURRENT_TIMESTAMP
      WHERE id = ANY($1::int[])
      AND booking_id IN (
        SELECT b.id FROM bookings b
        JOIN properties p ON b.property_id = p.id
        WHERE p.owner_id = $2
      )
    `, [messageIds, ownerId]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

// Get message templates
router.get('/templates', auth, async (req, res) => {
  try {
    const ownerId = req.owner.id;
    const result = await pool.query(
      'SELECT * FROM message_templates WHERE owner_id = $1 AND is_active = true ORDER BY name',
      [ownerId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// Create message template
router.post('/templates', auth, async (req, res) => {
  try {
    const { name, subject, content, category } = req.body;
    const ownerId = req.owner.id;
    
    const result = await pool.query(`
      INSERT INTO message_templates (owner_id, name, subject, content, category)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [ownerId, name, subject, content, category]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

// Update message template
router.put('/templates/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, subject, content, category } = req.body;
    const ownerId = req.owner.id;
    
    const result = await pool.query(`
      UPDATE message_templates 
      SET name = $1, subject = $2, content = $3, category = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5 AND owner_id = $6
      RETURNING *
    `, [name, subject, content, category, id, ownerId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

// Delete message template
router.delete('/templates/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.owner.id;
    
    const result = await pool.query(
      'DELETE FROM message_templates WHERE id = $1 AND owner_id = $2',
      [id, ownerId]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

// Get scheduled messages
router.get('/scheduled', auth, async (req, res) => {
  try {
    const ownerId = req.owner.id;
    
    const result = await pool.query(`
      SELECT sm.*, mt.name as template_name, b.confirmation_code, p.name as property_name
      FROM scheduled_messages sm
      JOIN bookings b ON sm.booking_id = b.id
      JOIN properties p ON b.property_id = p.id
      LEFT JOIN message_templates mt ON sm.template_id = mt.id
      WHERE p.owner_id = $1
      ORDER BY sm.created_at DESC
    `, [ownerId]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching scheduled messages:', error);
    res.status(500).json({ error: 'Failed to fetch scheduled messages' });
  }
});

// Upload attachment
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    res.json({
      url: `/uploads/messages/${req.file.filename}`,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      type: req.file.mimetype
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Search messages
router.get('/search', auth, async (req, res) => {
  try {
    const { query, bookingId } = req.query;
    const ownerId = req.owner.id;
    
    let searchQuery = `
      SELECT m.*, p.name as property_name, c.full_name as guest_name
      FROM messages m
      JOIN bookings b ON m.booking_id = b.id
      JOIN properties p ON b.property_id = p.id
      JOIN customers c ON b.customer_id = c.id
      WHERE p.owner_id = $1
      AND m.message ILIKE $2
    `;
    
    const params = [ownerId, `%${query}%`];
    
    if (bookingId) {
      searchQuery += ' AND m.booking_id = $3';
      params.push(bookingId);
    }
    
    searchQuery += ' ORDER BY m.created_at DESC LIMIT 50';
    
    const result = await pool.query(searchQuery, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error searching messages:', error);
    res.status(500).json({ error: 'Failed to search messages' });
  }
});

// Get message statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const ownerId = req.owner.id;
    
    const statsQuery = `
      SELECT 
        COUNT(*) as total_messages,
        COUNT(*) FILTER (WHERE sender_type = 'guest' AND is_read = false) as unread_messages,
        COUNT(DISTINCT booking_id) as active_threads,
        AVG(
          EXTRACT(EPOCH FROM (
            SELECT MIN(m2.created_at) 
            FROM messages m2 
            WHERE m2.booking_id = m.booking_id 
            AND m2.sender_type = 'owner' 
            AND m2.created_at > m.created_at
          ) - m.created_at) / 60
        ) FILTER (WHERE sender_type = 'guest') as avg_response_time_minutes
      FROM messages m
      JOIN bookings b ON m.booking_id = b.id
      JOIN properties p ON b.property_id = p.id
      WHERE p.owner_id = $1
      AND m.created_at >= CURRENT_DATE - INTERVAL '30 days'
    `;
    
    const result = await pool.query(statsQuery, [ownerId]);
    const stats = result.rows[0];
    
    res.json({
      totalMessages: parseInt(stats.total_messages),
      unreadMessages: parseInt(stats.unread_messages),
      activeThreads: parseInt(stats.active_threads),
      responseTime: Math.round(parseFloat(stats.avg_response_time_minutes) || 0)
    });
  } catch (error) {
    console.error('Error fetching message stats:', error);
    res.status(500).json({ error: 'Failed to fetch message statistics' });
  }
});

module.exports = router;