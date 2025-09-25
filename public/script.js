class ImageUploader {
    constructor() {
        this.selectedFiles = [];
        this.currentModalImage = null;
        this.initializeElements();
        this.setupEventListeners();
        this.loadGallery();
    }

    initializeElements() {
        this.dropZone = document.getElementById('dropZone');
        this.fileInput = document.getElementById('fileInput');
        this.browseBtn = document.getElementById('browseBtn');
        this.previewSection = document.getElementById('previewSection');
        this.previewContainer = document.getElementById('previewContainer');
        this.uploadBtn = document.getElementById('uploadBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.uploadProgress = document.getElementById('uploadProgress');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.gallery = document.getElementById('gallery');
        this.refreshBtn = document.getElementById('refreshBtn');
        this.imageCount = document.getElementById('imageCount');
        this.modal = document.getElementById('imageModal');
        this.modalImage = document.getElementById('modalImage');
        this.modalFilename = document.getElementById('modalFilename');
        this.deleteBtn = document.getElementById('deleteBtn');
        this.closeModal = document.querySelector('.close');
        this.notification = document.getElementById('notification');
    }

    setupEventListeners() {
        // Drag and drop events
        this.dropZone.addEventListener('dragover', this.handleDragOver.bind(this));
        this.dropZone.addEventListener('dragleave', this.handleDragLeave.bind(this));
        this.dropZone.addEventListener('drop', this.handleDrop.bind(this));
        this.dropZone.addEventListener('click', () => this.fileInput.click());

        // File input events
        this.fileInput.addEventListener('change', this.handleFileSelect.bind(this));
        this.browseBtn.addEventListener('click', () => this.fileInput.click());

        // Upload controls
        this.uploadBtn.addEventListener('click', this.uploadFiles.bind(this));
        this.clearBtn.addEventListener('click', this.clearFiles.bind(this));

        // Gallery controls
        this.refreshBtn.addEventListener('click', this.loadGallery.bind(this));

        // Modal events
        this.closeModal.addEventListener('click', this.closeImageModal.bind(this));
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeImageModal();
            }
        });
        this.deleteBtn.addEventListener('click', this.deleteCurrentImage.bind(this));

        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeImageModal();
            }
        });
    }

    handleDragOver(e) {
        e.preventDefault();
        this.dropZone.classList.add('drag-over');
    }

    handleDragLeave(e) {
        e.preventDefault();
        this.dropZone.classList.remove('drag-over');
    }

    handleDrop(e) {
        e.preventDefault();
        this.dropZone.classList.remove('drag-over');
        
        const files = Array.from(e.dataTransfer.files);
        this.addFiles(files);
    }

    handleFileSelect(e) {
        const files = Array.from(e.target.files);
        this.addFiles(files);
    }

    addFiles(files) {
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        
        if (imageFiles.length === 0) {
            this.showNotification('Please select only image files', 'error');
            return;
        }

        // Add new files to selected files array
        this.selectedFiles.push(...imageFiles);
        this.updatePreview();
    }

    updatePreview() {
        if (this.selectedFiles.length === 0) {
            this.previewSection.style.display = 'none';
            return;
        }

        this.previewSection.style.display = 'block';
        this.previewContainer.innerHTML = '';

        this.selectedFiles.forEach((file, index) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';

            const img = document.createElement('img');
            const reader = new FileReader();
            reader.onload = (e) => {
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);

            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn';
            removeBtn.innerHTML = '×';
            removeBtn.onclick = () => this.removeFile(index);

            const fileInfo = document.createElement('div');
            fileInfo.className = 'file-info';
            fileInfo.textContent = this.formatFileSize(file.size);

            previewItem.appendChild(img);
            previewItem.appendChild(removeBtn);
            previewItem.appendChild(fileInfo);
            this.previewContainer.appendChild(previewItem);
        });
    }

    removeFile(index) {
        this.selectedFiles.splice(index, 1);
        this.updatePreview();
    }

    clearFiles() {
        this.selectedFiles = [];
        this.fileInput.value = '';
        this.updatePreview();
    }

    async uploadFiles() {
        if (this.selectedFiles.length === 0) {
            this.showNotification('Please select files to upload', 'error');
            return;
        }

        const formData = new FormData();
        this.selectedFiles.forEach(file => {
            formData.append('images', file);
        });

        this.showUploadProgress();

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                this.showNotification(result.message, 'success');
                this.clearFiles();
                this.loadGallery();
            } else {
                this.showNotification(result.error || 'Upload failed', 'error');
            }
        } catch (error) {
            console.error('Upload error:', error);
            this.showNotification('Upload failed: ' + error.message, 'error');
        } finally {
            this.hideUploadProgress();
        }
    }

    showUploadProgress() {
        this.uploadProgress.style.display = 'block';
        this.uploadBtn.disabled = true;
        this.clearBtn.disabled = true;
        
        // Simulate progress animation
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 90) progress = 90;
            this.progressFill.style.width = progress + '%';
        }, 200);

        // Store interval to clear it later
        this.progressInterval = interval;
    }

    hideUploadProgress() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
        }
        
        this.progressFill.style.width = '100%';
        
        setTimeout(() => {
            this.uploadProgress.style.display = 'none';
            this.progressFill.style.width = '0%';
            this.uploadBtn.disabled = false;
            this.clearBtn.disabled = false;
        }, 500);
    }

    async loadGallery() {
        try {
            const response = await fetch('/api/images');
            const data = await response.json();

            this.gallery.innerHTML = '';
            this.imageCount.textContent = `${data.images.length} images`;

            data.images.forEach(image => {
                const galleryItem = document.createElement('div');
                galleryItem.className = 'gallery-item';
                galleryItem.onclick = () => this.openImageModal(image);

                const img = document.createElement('img');
                img.src = image.thumbnailPath || image.uploadPath;
                img.alt = image.filename;
                img.onerror = () => {
                    img.src = image.uploadPath; // Fallback to original if thumbnail fails
                };

                const overlay = document.createElement('div');
                overlay.className = 'overlay';

                const filename = document.createElement('div');
                filename.className = 'filename';
                filename.textContent = image.filename;

                overlay.appendChild(filename);
                galleryItem.appendChild(img);
                galleryItem.appendChild(overlay);
                this.gallery.appendChild(galleryItem);
            });
        } catch (error) {
            console.error('Error loading gallery:', error);
            this.showNotification('Failed to load gallery', 'error');
        }
    }

    openImageModal(image) {
        this.currentModalImage = image;
        this.modalImage.src = image.uploadPath;
        this.modalFilename.textContent = image.filename;
        this.modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    closeImageModal() {
        this.modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        this.currentModalImage = null;
    }

    async deleteCurrentImage() {
        if (!this.currentModalImage) return;

        if (!confirm(`Are you sure you want to delete ${this.currentModalImage.filename}?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/images/${this.currentModalImage.filename}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (result.success) {
                this.showNotification('Image deleted successfully', 'success');
                this.closeImageModal();
                this.loadGallery();
            } else {
                this.showNotification(result.error || 'Failed to delete image', 'error');
            }
        } catch (error) {
            console.error('Delete error:', error);
            this.showNotification('Failed to delete image', 'error');
        }
    }

    showNotification(message, type = 'success') {
        this.notification.textContent = message;
        this.notification.className = `notification ${type}`;
        this.notification.style.display = 'block';

        setTimeout(() => {
            this.notification.style.display = 'none';
        }, 4000);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Initialize the uploader when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ImageUploader();
});