const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Serve static files
app.use('/style.css', express.static(path.join(__dirname, 'style.css')));
app.use('/script.js', express.static(path.join(__dirname, 'script.js')));

// API endpoint to get photos
app.get('/api/photos', (req, res) => {
    try {
        const publicDir = path.join(__dirname, 'public');
        
        // Read all image files from public directory
        const files = fs.readdirSync(publicDir);
        const imageFiles = files.filter(file => 
            file.match(/\.(jpg|jpeg|png|gif|webp)$/i)
        );
        
        const photos = imageFiles.map((file, index) => ({
            id: index + 1,
            url: `/public/${file}`,
            title: `Memory ${index + 1}`,
            filename: file
        }));
        
        res.json({
            success: true,
            count: photos.length,
            photos: photos
        });
    } catch (error) {
        console.error('Error reading photos:', error);
        res.json({
            success: false,
            photos: []
        });
    }
});

// API endpoint to get music
app.get('/api/music', (req, res) => {
    try {
        const publicDir = path.join(__dirname, 'public');
        const files = fs.readdirSync(publicDir);
        const musicFiles = files.filter(file => 
            file.match(/\.(mp3|wav|ogg|m4a)$/i)
        );
        
        if (musicFiles.length > 0) {
            res.json({
                success: true,
                music: `/public/${musicFiles[0]}`
            });
        } else {
            res.json({
                success: false,
                message: 'No music file found'
            });
        }
    } catch (error) {
        console.error('Error reading music:', error);
        res.json({
            success: false,
            message: 'Error reading music files'
        });
    }
});

// Serve main HTML file
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Open http://localhost:${PORT} in your browser`);
    console.log(`📁 Put your photos in the 'public' folder`);
});