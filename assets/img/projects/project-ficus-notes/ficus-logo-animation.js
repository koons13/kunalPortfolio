/**
 * Ficus Logo Morphing Animation
 * Creates a continuous morphing animation between 5 ellipses
 * Each ellipse morphs to the next one in sequence simultaneously
 */

// Ficus Logo Simultaneous Morphing Animation
function initFicusLogoAnimation() {
    const ellipses = [
        document.getElementById('ellipse-1'),
        document.getElementById('ellipse-2'),
        document.getElementById('ellipse-3'),
        document.getElementById('ellipse-4'),
        document.getElementById('ellipse-5')
    ];
    
    // Check if all ellipses exist
    if (ellipses.some(ellipse => !ellipse)) {
        console.warn('Ficus Logo Animation: Some ellipses not found');
        return;
    }
    
    // Define the 5 ellipse paths in order with corrected alignment
    const ellipsePaths = [
        // Ellipse 1 (starting shape) - corrected bottom alignment
        "M83.3247 125.74C115.189 157.604 142.254 228.229 133.923 236.56C131.33 239.442 130.286 239.797 128.502 240.059C107.796 240.687 71.5288 232.279 46.3056 204.044C12.4238 169.033 13.6787 116.328 21.3334 101.52C29.6645 93.1892 51.4599 93.8748 83.3247 125.74Z",
        // Ellipse 2 - corrected bottom alignment
        "M165.867 119.59C188.857 158.348 139.1 232.954 133.871 236.626C132.962 237.412 131.429 239.792 128.597 240.059C121.946 240.686 92.0631 219.642 75.1034 181.292C52.1137 142.534 60.3314 33.7561 82.7938 26.6033C106.26 16.5643 142.877 80.8319 165.867 119.59Z",
        // Ellipse 3 - corrected bottom alignment to match others
        "M191.779 76.9692C191.779 138.651 140.557 240.823 128.499 240.059C124.777 240.059 122.05 237.302 118.231 226.324C111.636 207.364 107.167 170.693 107.167 128.499C107.167 66.8178 116.718 16.8149 128.5 16.8149C140.282 16.8149 191.779 15.2875 191.779 76.9692Z",
        // Ellipse 4 - corrected bottom alignment
        "M202.114 158.192C178.641 209.887 141.529 240.264 128.502 240.059C127.768 239.961 127.098 239.845 126.492 239.682C115.112 236.633 121.159 188.736 136.561 131.253C151.963 73.7713 206.516 62.8834 217.896 65.9327C228.563 69.07 240.388 100.216 202.114 158.192Z",
        // Ellipse 5 - shifted starting node to next position
        "M233.659 111.81C241.314 126.618 248.839 172.22 212.828 201.564C167.5 238.5 128.499 240.059 128.499 240.059C128.499 240.059 121.5 240.501 121.636 230.798C124.208 209.729 155.283 152.84 182.446 125.677C214.311 93.812 226.38 101.646 233.659 111.81Z"
    ];
    
    // Track current state of each ellipse
    let currentStates = [0, 1, 2, 3, 4]; // Each ellipse starts with its corresponding shape
    
    function morphAllEllipses() {
        // Each ellipse morphs to the next one in sequence
        // Ellipse 1 → 2, Ellipse 2 → 3, Ellipse 3 → 4, Ellipse 4 → 5, Ellipse 5 → 1
        ellipses.forEach((ellipse, index) => {
            // Move to next state
            currentStates[index] = (currentStates[index] + 1) % ellipsePaths.length;
            // Apply the new shape
            ellipse.setAttribute('d', ellipsePaths[currentStates[index]]);
        });
    }
    
    // Start the animation loop
    const animationInterval = setInterval(morphAllEllipses, 2000); // Change every 2 seconds
    
    // Return cleanup function
    return function stopAnimation() {
        clearInterval(animationInterval);
    };
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the Ficus project page
    if (document.getElementById('ellipse-1')) {
        initFicusLogoAnimation();
    }
});

// Export for manual initialization if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initFicusLogoAnimation };
}
