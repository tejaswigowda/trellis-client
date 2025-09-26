const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 7860;

// Ensure uploads and thumbnails directories exist
const uploadsDir = path.join(__dirname, 'uploads');
const thumbnailsDir = path.join(__dirname, 'thumbnails');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(thumbnailsDir)) {
    fs.mkdirSync(thumbnailsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Serve static files
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
app.use('/thumbnails', express.static('thumbnails'));

// Generate thumbnail for uploaded image
async function generateThumbnail(imagePath, filename) {
    try {
        const thumbnailPath = path.join(thumbnailsDir, filename);
        await sharp(imagePath)
            .resize(200, 200, {
                fit: 'cover',
                position: 'center'
            })
            .jpeg({ quality: 80 })
            .toFile(thumbnailPath);
        return thumbnailPath;
    } catch (error) {
        console.error('Error generating thumbnail:', error);
        throw error;
    }
}

// Upload endpoint for multiple files
app.post('/upload', upload.array('images', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        const uploadedFiles = [];
        const hash = req.body.hash;
        console.log('Received hash:', hash);

        for (const file of req.files) {
            try {
                // Generate thumbnail
                const thumbnailFilename = 'thumb_' + file.filename;
                await generateThumbnail(file.path, thumbnailFilename);

                // mkdir /uploads/${hash}/ if not exists
                const userDir = path.join(uploadsDir, hash);
                if (!fs.existsSync(userDir)) {
                    fs.mkdirSync(userDir, { recursive: true });
                }
                uploadedFiles.push({
                    filename: file.filename,
                    originalName: file.originalname,
                    size: file.size,
                    mimeType: file.mimetype,
                    uploadPath: `/uploads/${hash}/${file.filename}`,
                    thumbnailPath: `/thumbnails/thumb_${file.filename}`
                });
            } catch (thumbnailError) {
                console.error('Error generating thumbnail for', file.filename, thumbnailError);
                // Still include the file even if thumbnail generation fails
                uploadedFiles.push({
                    filename: file.filename,
                    originalName: file.originalname,
                    size: file.size,
                    mimeType: file.mimetype,
                    uploadPath: `/uploads/${file.filename}`,
                    thumbnailPath: null,
                    thumbnailError: true
                });
            }
        }


        processFiles(path.join(uploadsDir, hash));

        res.json({
            success: true,
            message: `${uploadedFiles.length} file(s) uploaded successfully`,
            files: uploadedFiles
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed: ' + error.message });
    }
});

// Get list of uploaded images
app.get('/api/images', (req, res) => {
    try {
        const files = fs.readdirSync(uploadsDir);
        const imageFiles = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
        });

        const images = imageFiles.map(filename => {
            const filePath = path.join(uploadsDir, filename);
            const stats = fs.statSync(filePath);
            const thumbnailPath = `/thumbnails/thumb_${filename}`;
            const thumbnailExists = fs.existsSync(path.join(thumbnailsDir, `thumb_${filename}`));

            return {
                filename,
                uploadPath: `/uploads/${filename}`,
                thumbnailPath: thumbnailExists ? thumbnailPath : null,
                size: stats.size,
                uploadDate: stats.mtime
            };
        });

        res.json({ images });
    } catch (error) {
        console.error('Error getting images:', error);
        res.status(500).json({ error: 'Failed to get images' });
    }
});

// Delete image endpoint
app.delete('/api/images/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const imagePath = path.join(uploadsDir, filename);
        const thumbnailPath = path.join(thumbnailsDir, `thumb_${filename}`);

        // Delete main image
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        // Delete thumbnail
        if (fs.existsSync(thumbnailPath)) {
            fs.unlinkSync(thumbnailPath);
        }

        res.json({ success: true, message: 'Image deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: 'Failed to delete image' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Upload directory: ${uploadsDir}`);
    console.log(`Thumbnails directory: ${thumbnailsDir}`);
});


async function processFiles(folderPath) {
        const { exec } = require('child_process');
        const { promisify } = require('util');
        const execAsync = promisify(exec);

        try {
            // Wait for git commands to complete
            await execAsync(`python ../trellis-run.py ${folderPath}`);
            console.log(`File ${destination} created.`);
        } catch (err) {
            console.error(`Error processing`, err);
        }
    
}