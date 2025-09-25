# 🖼️ Trellis Image Uploader

A modern Node.js server application that supports multiple image uploads to local drive with drag-and-drop functionality and thumbnail previews.

## ✨ Features

- **Multiple Image Upload**: Upload multiple images simultaneously
- **Drag & Drop Interface**: Intuitive drag-and-drop functionality for easy file selection
- **Thumbnail Generation**: Automatic thumbnail creation using Sharp for fast preview loading
- **Preview Gallery**: Beautiful grid layout displaying uploaded images with thumbnails
- **Full-Size Image Modal**: Click any thumbnail to view the full-size image
- **Image Management**: Delete unwanted images with confirmation
- **Responsive Design**: Mobile-friendly interface that works on all devices
- **Real-time Updates**: Gallery refreshes automatically after uploads
- **File Validation**: Only accepts image files (JPEG, PNG, GIF, WebP)
- **Progress Indication**: Visual upload progress feedback

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/tejaswigowda/trellis-client.git
cd trellis-client
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

### Development Mode

For development with auto-restart on file changes:
```bash
npm run dev
```

## 📖 Usage

### Uploading Images

1. **Drag & Drop**: Simply drag image files from your computer directly onto the upload area
2. **Browse Files**: Click the "Browse Files" button to select images using the file picker
3. **Multiple Selection**: You can select and upload multiple images at once
4. **Preview**: Selected images will show preview thumbnails before upload
5. **Upload**: Click "Upload Images" to save them to the server

### Managing Images

- **View Gallery**: All uploaded images appear in the gallery with thumbnails
- **Full View**: Click any thumbnail to view the full-size image in a modal
- **Delete Images**: Use the delete button in the modal to remove unwanted images
- **Refresh**: Click the refresh button to update the gallery

## 🔧 API Endpoints

### Upload Images
```
POST /upload
Content-Type: multipart/form-data
```
Upload multiple images (max 10 files, 10MB each).

### Get Images List
```
GET /api/images
```
Returns JSON array of all uploaded images with metadata.

### Delete Image
```
DELETE /api/images/:filename
```
Deletes an image and its thumbnail.

## 📁 Project Structure

```
trellis-client/
├── server.js              # Main server application
├── package.json           # Project dependencies and scripts
├── public/                # Static files served to client
│   ├── index.html         # Main HTML interface
│   ├── styles.css         # CSS styling
│   └── script.js          # Client-side JavaScript
├── uploads/               # Uploaded images storage
├── thumbnails/            # Generated thumbnails storage
└── README.md             # This file
```

## 🛠️ Technologies Used

- **Backend**: Node.js, Express.js
- **File Upload**: Multer middleware
- **Image Processing**: Sharp (for thumbnail generation)
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Styling**: CSS Grid, Flexbox, CSS Gradients
- **Responsive**: Mobile-first design approach

## 🎨 Features in Detail

### Drag & Drop
- Visual feedback when dragging files over the drop zone
- Supports multiple file selection
- File type validation (images only)
- Smooth animations and transitions

### Thumbnail Generation
- Automatic 200x200px thumbnails using Sharp
- Maintains aspect ratio with smart cropping
- JPEG compression for optimal file size
- Fallback to original image if thumbnail fails

### Responsive Gallery
- CSS Grid layout adapts to screen size
- Hover effects for better user experience
- Smooth scaling animations
- Mobile-optimized touch interactions

### Image Modal
- Full-screen overlay for image viewing
- Click outside or press Escape to close
- Image filename display
- Delete functionality with confirmation

## 🔒 Security Features

- File type validation (images only)
- File size limits (10MB per file, max 10 files)
- Unique filename generation to prevent conflicts
- Input sanitization for security

## 📱 Browser Support

- Chrome 70+
- Firefox 65+ 
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Known Issues

- Large images may take time to process for thumbnail generation
- Browser file picker behavior varies across different browsers
- Maximum concurrent uploads limited by browser capabilities

## 🔮 Future Enhancements

- [ ] Image rotation and basic editing
- [ ] Bulk download functionality
- [ ] Image metadata display (EXIF data)
- [ ] User authentication and private galleries
- [ ] Cloud storage integration (AWS S3, Google Cloud)
- [ ] Image search and filtering
- [ ] Batch operations (select multiple, bulk delete)
- [ ] Progressive Web App (PWA) support