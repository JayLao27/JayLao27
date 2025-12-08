/**
 * Fade-in animation script for README.md
 * Applies sequential fade-in transitions to all text elements
 */
class FadeInAnimation {
    constructor() {
        this.elements = [];
        this.delay = 100; // Delay between each element in milliseconds
        this.duration = 800; // Animation duration in milliseconds
        this.init();
    }
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.startAnimation());
        }
        else {
            this.startAnimation();
        }
    }
    startAnimation() {
        // Find all text elements (headings, paragraphs, lists, etc.)
        const selectors = [
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'p', 'li', 'a', 'span', 'div',
            'img', 'svg'
        ];
        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                // Skip if element is already processed or is a script/style tag
                if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') {
                    return;
                }
                // Set initial state
                el.style.opacity = '0';
                el.style.transition = `opacity ${this.duration}ms ease-in-out`;
                this.elements.push(el);
            });
        });
        // Animate elements sequentially
        this.animateElements();
    }
    animateElements() {
        this.elements.forEach((element, index) => {
            setTimeout(() => {
                element.style.opacity = '1';
            }, index * this.delay);
        });
    }
}
// Initialize animation when script loads
if (typeof window !== 'undefined') {
    new FadeInAnimation();
}
