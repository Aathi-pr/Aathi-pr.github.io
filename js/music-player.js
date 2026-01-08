const bgMusicPlayer = document.getElementById('bgMusicPlayer');
const musicToggle = document.getElementById('musicToggle');
const bgAudio = document.getElementById('bgAudio');
const iconPlay = document.querySelector('.icon-play');
const iconPause = document.querySelector('.icon-pause');

let isPlaying = false;

// Toggle Play/Pause
function toggleMusic() {
    if (isPlaying) {
        bgAudio.pause();
        isPlaying = false;
        bgMusicPlayer.classList.remove('playing');
        iconPlay.style.display = 'block';
        iconPause.style.display = 'none';
        localStorage.setItem('bgMusicPlaying', 'false');
    } else {
        bgAudio.play().then(() => {
            isPlaying = true;
            bgMusicPlayer.classList.add('playing');
            iconPlay.style.display = 'none';
            iconPause.style.display = 'block';
            localStorage.setItem('bgMusicPlaying', 'true');
        }).catch(error => {
            console.log('Playback prevented:', error);
        });
    }
}

// Event Listeners
musicToggle?.addEventListener('click', toggleMusic);

// Keyboard Shortcut (M key)
document.addEventListener('keydown', (e) => {
    if (e.key === 'm' || e.key === 'M') {
        if (!document.activeElement.matches('input, textarea')) {
            toggleMusic();
        }
    }
});

// Initialize
if (bgAudio) {
    bgAudio.volume = 0.6;
    
    // Remember user preference
    const wasPlaying = localStorage.getItem('bgMusicPlaying');
    if (wasPlaying === 'true') {
        setTimeout(() => {
            toggleMusic();
        }, 1000);
    }
}

// Fade in/out on visibility change
document.addEventListener('visibilitychange', () => {
    if (document.hidden && isPlaying) {
        bgAudio.volume = 0.1;
    } else if (!document.hidden && isPlaying) {
        bgAudio.volume = 0.3;
    }
});