import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import fs from 'fs';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;

// Enable CORS for the frontend
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

// Helper to hash file buffer
function hashBuffer(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

// Multer storage config (destination and filename set dynamically)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
    }
  }
});

// Serve static files from the uploads directory
app.use('/usersproflesphotos', express.static(path.join(__dirname, 'public', 'usersproflesphotos')));

// API endpoint for image upload
app.post('/api/upload-profile-image', upload.single('image'), async (req, res) => {
  try {
    const userId = req.body.userId;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'Missing userId' });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    const userDir = path.join(__dirname, 'public', 'usersproflesphotos', userId);
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    const ext = path.extname(req.file.originalname).toLowerCase();
    const profileImagePath = path.join(userDir, 'profile' + ext);
    // Check for duplicate by hash
    let isDuplicate = false;
    if (fs.existsSync(profileImagePath)) {
      const existingBuffer = fs.readFileSync(profileImagePath);
      const existingHash = hashBuffer(existingBuffer);
      const newHash = hashBuffer(req.file.buffer);
      if (existingHash === newHash) {
        isDuplicate = true;
      }
    }
    if (!isDuplicate) {
      // Remove old images with different extensions
      const files = fs.readdirSync(userDir);
      files.forEach(f => {
        if (f.startsWith('profile') && f !== 'profile' + ext) {
          fs.unlinkSync(path.join(userDir, f));
        }
      });
      // Save new image
      fs.writeFileSync(profileImagePath, req.file.buffer);
    }
    // Return the relative path
    const relativePath = `/usersproflesphotos/${userId}/profile${ext}`;
    res.json({ success: true, path: relativePath, duplicate: isDuplicate });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to upload image' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, error: 'File size too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ success: false, error: err.message });
  }
  res.status(500).json({ success: false, error: err.message || 'Internal server error' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 