// Preload dog bark sound
const barkAudio = new Audio('https://www.soundjay.com/communication/sounds/dog-bark-1.mp3');
barkAudio.preload = 'auto';

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    initClickPrank();
});

// Click/Tap Prank logic
function initClickPrank() {
    // Standard click listener for desktop
    window.addEventListener('click', handlePageClick);
    
    // Touchstart listener for mobile compatibility
    window.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) {
            handlePageClick(e.touches[0]);
        }
    });
}

function handlePageClick(e) {
    const count = 45; // A heavy rain shower!
    for (let i = 0; i < count; i++) {
        // Create the floating text element
        const floatingText = document.createElement('div');
        floatingText.className = 'floating-text';
        
        // Playfully alternate text styling/emoji
        const randomVal = Math.random();
        if (randomVal > 0.8) {
            floatingText.textContent = 'CON CHÓ THỐI! 🐶💨';
        } else if (randomVal > 0.6) {
            floatingText.textContent = 'CON CHÓ THỐI! 🐶';
        } else if (randomVal > 0.4) {
            floatingText.textContent = 'CON CHÓ THỐI! 🐾';
        } else if (randomVal > 0.2) {
            floatingText.textContent = 'CON CHÓ THỐI! 🐩';
        } else {
            floatingText.textContent = 'CON CHÓ THỐI! 🦴';
        }

        // Falling rain properties
        const left = (Math.random() * 95).toFixed(2); // Random X coordinate on screen: 0% to 95%
        const duration = (Math.random() * 1.5 + 1.8).toFixed(2); // Speed: 1.8s to 3.3s
        const opacity = (Math.random() * 0.75 + 0.25).toFixed(2); // Depth: 0.25 to 1.0 opacity
        const rotStart = Math.floor(Math.random() * 30) - 15; // -15deg to 15deg
        const rotEnd = Math.floor(Math.random() * 70) - 35; // -35deg to 35deg
        
        // Diverse font sizes for 3D layout feel
        const fontSizes = ['0.85rem', '1.1rem', '1.35rem', '1.6rem', '2rem', '2.5rem', '3rem'];
        const fontSize = fontSizes[Math.floor(Math.random() * fontSizes.length)];

        // Set inline variables to pass to CSS
        floatingText.style.setProperty('--left', `${left}vw`);
        floatingText.style.setProperty('--duration', `${duration}s`);
        floatingText.style.setProperty('--opacity', opacity);
        floatingText.style.setProperty('--rot-start', `${rotStart}deg`);
        floatingText.style.setProperty('--rot-end', `${rotEnd}deg`);
        floatingText.style.setProperty('--font-size', fontSize);

        // Staggered delays to cascade the rain over time
        const delay = (Math.random() * 1.2).toFixed(2); // 0s to 1.2s delay
        floatingText.style.animationDelay = `${delay}s`;

        document.body.appendChild(floatingText);

        // Clean up element after it falls off the screen (duration + delay)
        const totalDurationMs = (parseFloat(duration) + parseFloat(delay)) * 1000;
        setTimeout(() => {
            floatingText.remove();
        }, totalDurationMs + 100);
    }

    // Play funny dog bark sound effect
    playBarkSound();
}

// Play preloaded dog bark sound
function playBarkSound() {
    try {
        const playClone = barkAudio.cloneNode(true);
        playClone.volume = 0.35;
        playClone.play().catch(err => {
            console.warn("Audio play blocked, falling back to synthesizer:", err);
            playPopSound();
        });
    } catch (e) {
        playPopSound();
    }
}

// Audio Synthesis (Bubbly / Pop Sound Effect - Fallback)
function playPopSound() {
    try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;

        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

        osc.start();
        osc.stop(ctx.currentTime + 0.15);
    } catch (error) {
        console.warn("AudioContext blocked or failed", error);
    }
}
