const express = require('express');
const multer = require('multer');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// POST /api/upload/image - Upload image to Firebase Storage
router.post('/image', 
  authenticateToken,
  upload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      // Placeholder for Firebase Storage upload
      // In production, this would upload to Firebase Storage and return the URL
      
      // For now, we'll return a placeholder URL
      // TODO: Implement actual Firebase Storage upload
      const imageUrl = `https://firebasestorage.googleapis.com/placeholder/${Date.now()}_${req.file.originalname}`;

      res.json({
        message: 'Image uploaded successfully',
        image_url: imageUrl,
        filename: req.file.originalname,
        size: req.file.size
      });

      // TODO: Actual Firebase Storage implementation would look like:
      /*
      const admin = require('firebase-admin');
      const bucket = admin.storage().bucket();
      
      const fileName = `food-images/${Date.now()}_${req.file.originalname}`;
      const file = bucket.file(fileName);
      
      await file.save(req.file.buffer, {
        metadata: {
          contentType: req.file.mimetype
        }
      });
      
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: '03-01-2500'
      });
      
      res.json({
        message: 'Image uploaded successfully',
        image_url: url
      });
      */

    } catch (error) {
      console.error('Image upload error:', error);
      res.status(500).json({ error: 'Failed to upload image' });
    }
  }
);

// Error handling for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size too large. Maximum size is 5MB.' });
    }
  }
  
  if (error.message === 'Only image files are allowed') {
    return res.status(400).json({ error: 'Only image files are allowed' });
  }
  
  next(error);
});

module.exports = router; 