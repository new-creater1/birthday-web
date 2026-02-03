// DOM Elements
const welcomeScreen = document.getElementById('welcomeScreen');
const mainContent = document.getElementById('mainContent');
const startBtn = document.getElementById('startBtn');
const birthdayNameInput = document.getElementById('birthdayName');
const displayName = document.getElementById('displayName');
const footerName = document.getElementById('footerName');
const photoCount = document.getElementById('photoCount');
const musicCount = document.getElementById('musicCount');
const uploadStatus = document.getElementById('uploadStatus');
const photoUpload = document.getElementById('photoUpload');
const musicUpload = document.getElementById('musicUpload');

// Music Player Elements
const backgroundMusic = document.getElementById('backgroundMusic');
const playBtn = document.getElementById('playBtn');
const playIcon = document.getElementById('playIcon');
const volumeSlider = document.getElementById('volumeSlider');
const currentSong = document.getElementById('currentSong');

// Gallery Elements
const galleryTrack = document.getElementById('galleryTrack');
const thumbnails = document.getElementById('thumbnails');
const photoCounter = document.getElementById('photoCounter');
const prevPhoto = document.getElementById('prevPhoto');
const nextPhoto = document.getElementById('nextPhoto');

// Countdown Elements
const daysEl = document.getElementById('days');
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');

// State Variables
let photos = [];
let currentPhotoIndex = 0;
let isPlaying = false;
let uploadedMusic = null;

// Initialize the application
async function init() {
    // Try to load photos from server
    await loadPhotosFromServer();
    
    // Try to load music from server
    await loadMusicFromServer();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize countdown
    startCountdown();
}

// Load photos from server
async function loadPhotosFromServer() {
    try {
        // Try to fetch photos from server
        const response = await fetch('/api/photos');
        if (response.ok) {
            const data = await response.json();
            photos = data.photos || [];
            photoCount.textContent = photos.length;
            
            if (photos.length > 0) {
                createGallery();
                updatePhotoCounter();
            } else {
                // If no photos from server, use default placeholders
                createDefaultPhotos();
            }
        } else {
            createDefaultPhotos();
        }
    } catch (error) {
        console.log('Error loading photos:', error);
        createDefaultPhotos();
    }
}

// Create default photo placeholders
function createDefaultPhotos() {
    photos = Array.from({length: 6}, (_, i) => ({
        id: i + 1,
        url: `https://picsum.photos/800/500?random=${i + 1}`,
        title: `Memory ${i + 1}`
    }));
    photoCount.textContent = '6 (using placeholders)';
    createGallery();
    updatePhotoCounter();
}

// Load music from server
async function loadMusicFromServer() {
    try {
        // Try to set music source
        backgroundMusic.src = '/music.mp3';
        
        // Check if music file exists
        const response = await fetch('/music.mp3');
        if (response.ok) {
            musicCount.textContent = '1';
            uploadStatus.textContent = 'Music loaded successfully!';
        } else {
            // Use default online music
            backgroundMusic.src = 'https://assets.mixkit.co/music/preview/mixkit-happy-birthday-to-you-443.mp3';
            musicCount.textContent = '1 (using default)';
            uploadStatus.textContent = 'Using default birthday music';
        }
    } catch (error) {
        console.log('Error loading music:', error);
        backgroundMusic.src = 'https://assets.mixkit.co/music/preview/mixkit-happy-birthday-to-you-443.mp3';
        musicCount.textContent = '1 (using default)';
        uploadStatus.textContent = 'Using default birthday music';
    }
}

// Create gallery with photos
function createGallery() {
    // Clear existing content
    galleryTrack.innerHTML = '';
    thumbnails.innerHTML = '';
    
    // Create slides and thumbnails
    photos.forEach((photo, index) => {
        // Create slide
        const slide = document.createElement('div');
        slide.className = 'gallery-slide';
        slide.innerHTML = `
            <img src="${photo.url}" alt="${photo.title}" onerror="this.src='https://picsum.photos/800/500?random=${index + 1}'">
            <div class="photo-title">${photo.title}</div>
        `;
        galleryTrack.appendChild(slide);
        
        // Create thumbnail
        const thumbnail = document.createElement('img');
        thumbnail.src = photo.url;
        thumbnail.alt = photo.title;
        thumbnail.className = 'thumbnail';
        if (index === 0) thumbnail.classList.add('active');
        
        thumbnail.onerror = function() {
            this.src = `https://picsum.photos/200/200?random=${index + 1}`;
        };
        
        thumbnail.addEventListener('click', () => {
            goToPhoto(index);
        });
        
        thumbnails.appendChild(thumbnail);
    });
    
    // Set gallery track width
    galleryTrack.style.width = `${photos.length * 100}%`;
}

// Update photo counter
function updatePhotoCounter() {
    photoCounter.textContent = `${currentPhotoIndex + 1} / ${photos.length}`;
    
    // Update active thumbnail
    document.querySelectorAll('.thumbnail').forEach((thumb, index) => {
        thumb.classList.toggle('active', index === currentPhotoIndex);
    });
}

// Navigate to specific photo
function goToPhoto(index) {
    currentPhotoIndex = index;
    galleryTrack.style.transform = `translateX(-${(currentPhotoIndex * 100) / photos.length}%)`;
    updatePhotoCounter();
}

// Setup event listeners
function setupEventListeners() {
    // Start button
    startBtn.addEventListener('click', startCelebration);
    
    // Enter key to start
    birthdayNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') startCelebration();
    });
    
    // Photo upload
    photoUpload.addEventListener('change', handlePhotoUpload);
    
    // Music upload
    musicUpload.addEventListener('change', handleMusicUpload);
    
    // Music controls
    playBtn.addEventListener('click', toggleMusic);
    volumeSlider.addEventListener('input', updateVolume);
    
    // Gallery navigation
    prevPhoto.addEventListener('click', () => {
        currentPhotoIndex = (currentPhotoIndex - 1 + photos.length) % photos.length;
        goToPhoto(currentPhotoIndex);
    });
    
    nextPhoto.addEventListener('click', () => {
        currentPhotoIndex = (currentPhotoIndex + 1) % photos.length;
        goToPhoto(currentPhotoIndex);
    });
    
    // Auto-play music when page is visible
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && isPlaying) {
            backgroundMusic.play().catch(() => {
                // Autoplay was prevented
            });
        }
    });
}

// Start celebration
function startCelebration() {
    const name = birthdayNameInput.value.trim() || 'Friend';
    
    // Update name display
    displayName.textContent = name;
    footerName.textContent = name;
    
    // Hide welcome screen and show main content
    welcomeScreen.classList.add('hidden');
    setTimeout(() => {
        mainContent.classList.add('show');
        // Play music automatically
        playMusic();
        // Create confetti
        createConfetti();
    }, 500);
}

// Handle photo upload
function handlePhotoUpload(event) {
    const files = Array.from(event.target.files);
    const newPhotos = [];
    
    files.forEach((file, index) => {
        if (index >= 8) return; // Limit to 8 photos
        
        const reader = new FileReader();
        reader.onload = (e) => {
            newPhotos.push({
                id: photos.length + index + 1,
                url: e.target.result,
                title: `Uploaded Photo ${index + 1}`
            });
            
            if (newPhotos.length === files.length || newPhotos.length === 8) {
                // Add new photos to existing ones
                photos = [...photos, ...newPhotos].slice(0, 8); // Keep max 8
                photoCount.textContent = photos.length;
                createGallery();
                uploadStatus.textContent = `Uploaded ${files.length} photos successfully!`;
                goToPhoto(0);
            }
        };
        reader.readAsDataURL(file);
    });
}

// Handle music upload
function handleMusicUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            backgroundMusic.src = e.target.result;
            currentSong.textContent = file.name.replace(/\.[^/.]+$/, "");
            musicCount.textContent = '1';
            uploadStatus.textContent = `Uploaded music: ${file.name}`;
            
            // Play if celebration has started
            if (mainContent.classList.contains('show') && isPlaying) {
                backgroundMusic.play();
            }
        };
        reader.readAsDataURL(file);
    }
}

// Toggle music play/pause
function toggleMusic() {
    if (!backgroundMusic.src) {
        uploadStatus.textContent = 'Please upload music first!';
        return;
    }
    
    if (isPlaying) {
        backgroundMusic.pause();
        playIcon.className = 'fas fa-play';
    } else {
        backgroundMusic.play()
            .then(() => {
                playIcon.className = 'fas fa-pause';
            })
            .catch(error => {
                uploadStatus.textContent = 'Click play button to start music';
            });
    }
    isPlaying = !isPlaying;
}

// Play music
function playMusic() {
    if (backgroundMusic.src) {
        backgroundMusic.play()
            .then(() => {
                isPlaying = true;
                playIcon.className = 'fas fa-pause';
            })
            .catch(() => {
                // Autoplay was prevented
                uploadStatus.textContent = 'Click play button to start music';
            });
    }
}

// Update volume
function updateVolume() {
    backgroundMusic.volume = volumeSlider.value / 100;
}

// Start countdown timer
function startCountdown() {
    function updateCountdown() {
        const now = new Date();
        const nextBirthday = new Date(now.getFullYear() + 1, 0, 1); // Next Jan 1
        
        const diff = nextBirthday - now;
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        daysEl.textContent = days.toString().padStart(2, '0');
        hoursEl.textContent = hours.toString().padStart(2, '0');
        minutesEl.textContent = minutes.toString().padStart(2, '0');
        secondsEl.textContent = seconds.toString().padStart(2, '0');
        
        setTimeout(updateCountdown, 1000);
    }
    
    updateCountdown();
}

// Create confetti effect
function createConfetti() {
    const confettiContainer = document.querySelector('.confetti');
    if (!confettiContainer) return;
    
    // Add more confetti
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: absolute;
            width: ${Math.random() * 10 + 5}px;
            height: ${Math.random() * 10 + 5}px;
            background: hsl(${Math.random() * 360}, 100%, 60%);
            top: -20px;
            left: ${Math.random() * 100}%;
            border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
            animation: confettiFall ${Math.random() * 3 + 2}s linear infinite;
            animation-delay: ${Math.random() * 2}s;
        `;
        
        confettiContainer.appendChild(confetti);
        
        // Remove after animation
        setTimeout(() => {
            confetti.remove();
        }, 5000);
    }
}

// Add CSS for confetti animation
const style = document.createElement('style');
style.textContent = `
    @keyframes confettiFall {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
    }
    
    .gallery-slide {
        width: ${100 / 6}%;
        flex-shrink: 0;
        position: relative;
    }
    
    .photo-title {
        position: absolute;
        bottom: 20px;
        left: 0;
        right: 0;
        text-align: center;
        background: rgba(0, 0, 0, 0.7);
        padding: 10px;
        font-size: 1.2rem;
        color: white;
    }
`;
document.head.appendChild(style);

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);