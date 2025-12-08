/**
 * Generate animated README content as SVG
 * Similar to the example using dynamic image generation
 */

class AnimatedContentGenerator {
  private fontFamily: string = 'Geist';
  
  public generateSVG(): string {
    const width = 800;
    const height = 600;
    
    const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;600&display=swap');
      .fade-text {
        font-family: 'Geist', sans-serif;
        fill: #000;
        opacity: 0;
        animation: fadeIn 0.8s ease-in-out forwards;
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .heading-semibold { font-size: 24px; font-weight: 600; }
      .heading-regular { font-size: 18px; font-weight: 400; }
    </style>
  </defs>
  
  <text x="20" y="40" class="fade-text heading-semibold" style="animation-delay: 0.1s;">Let's connect</text>
  <text x="20" y="80" class="fade-text heading-regular" style="animation-delay: 0.2s;">LinkedIn | Gmail | GitHub | Kaggle</text>
  <text x="20" y="140" class="fade-text heading-regular" style="animation-delay: 0.3s;">Core Skills & Languages</text>
  <text x="20" y="180" class="fade-text heading-regular" style="animation-delay: 0.4s;">AI & Data Science</text>
  <text x="20" y="220" class="fade-text heading-regular" style="animation-delay: 0.5s;">Full-Stack & Web Development</text>
  <text x="20" y="260" class="fade-text heading-regular" style="animation-delay: 0.6s;">Databases & Cloud</text>
</svg>`;

    return svg;
  }

  public generateDataURI(): string {
    const svg = this.generateSVG();
    const encoded = encodeURIComponent(svg);
    return `data:image/svg+xml,${encoded}`;
  }
}

export default AnimatedContentGenerator;

// Generate if run directly
if (typeof require !== 'undefined') {
  const fs = require('fs');
  const generator = new AnimatedContentGenerator();
  const svg = generator.generateSVG();
  fs.writeFileSync('animated-content.svg', svg);
  console.log('Animated content SVG generated!');
}

