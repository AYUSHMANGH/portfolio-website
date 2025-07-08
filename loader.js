// Create stars for the loading screen
document.addEventListener('DOMContentLoaded', function() {
    // Use sessionStorage to show loader only once per session
    const loaderWrapper = document.querySelector('.loader-wrapper');
    const loaderProgress = document.querySelector('.loader-progress');
    const loaderAudio = document.querySelector('.loader-audio');

    if (sessionStorage.getItem('loaderShown')) {
        // Loader already shown this session: remove/hide immediately
        if (loaderWrapper) loaderWrapper.style.display = 'none';
        document.body.style.overflow = '';
        if (typeof AOS !== 'undefined') {
            AOS.init({ once: true, disable: 'phone' });
        }
        return;
    }
    // Create stars
    createStars();
    // Initially hide overflow to prevent scrolling during loading
    document.body.style.overflow = 'hidden';
    // Set a fixed loading time of 8 seconds
    let progress = 0;
    const totalLoadingTime = 6700; // 8 seconds
    const updateInterval = 100; // Update every 100ms
    const progressIncrement = 100 / (totalLoadingTime / updateInterval);
    const interval = setInterval(() => {
        progress += progressIncrement;
        progress = Math.min(progress, 100); // Ensure progress doesn't exceed 100
        
        // Update the progress text
        if (loaderProgress) {
            loaderProgress.textContent = `${Math.floor(progress)}%`;
        }
        
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            // Hide loader after completing the progress
            setTimeout(() => {
                loaderWrapper.classList.add('hidden');
                
                // Enable scrolling on the body
                document.body.style.overflow = '';
                
                // Fade out and stop loader audio after 2 seconds
                if (loaderAudio) {
                    const fadeAudio = setInterval(() => {
                        if (loaderAudio.volume > 0.1) {
                            loaderAudio.volume -= 0.1;
                        } else {
                            loaderAudio.pause();
                            clearInterval(fadeAudio);
                        }
                    }, 200);
                }
                
                // Remove loader from DOM after transition
                setTimeout(() => {
                    loaderWrapper.remove();
                    
                    // Set session flag so loader does not show again this session
                    sessionStorage.setItem('loaderShown', 'true');
                    
                    // Initialize AOS animations after loader is removed
                    if (typeof AOS !== 'undefined') {
                        AOS.init({
                            once: true,
                            disable: 'phone',
                            startEvent: 'DOMContentLoaded',
                            offset: 120,
                            delay: 0,
                            duration: 1000
                        });
                    }
                }, 500);
            }, 500);
        }
    }, updateInterval);
});

// Function to create stars
function createStars() {
    const starsContainer = document.querySelector('.stars');
    if (!starsContainer) return;
    
    const starCount = 100;
    
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        
        // Random position
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        
        // Random size
        const size = Math.random() * 3;
        
        // Random duration
        const duration = Math.random() * 3 + 2;
        
        // Random delay
        const delay = Math.random() * 5;
        
        star.style.left = `${x}%`;
        star.style.top = `${y}%`;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.setProperty('--duration', `${duration}s`);
        star.style.animationDelay = `${delay}s`;
        
        starsContainer.appendChild(star);
    }
}
