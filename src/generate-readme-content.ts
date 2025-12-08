/**
 * Generate README content with fade-in animation as SVG
 * This creates an SVG that can be embedded in README.md
 */

interface TextElement {
  text: string;
  type: 'heading' | 'link' | 'badge' | 'text';
  weight?: 'regular' | 'semibold';
  delay: number;
}

class ReadmeContentGenerator {
  private elements: TextElement[] = [];
  private fontFamily: string = 'Geist, sans-serif';
  private baseDelay: number = 100; // milliseconds between each element

  constructor() {
    this.initializeContent();
  }

  private initializeContent(): void {
    // "Let's connect" heading - semibold
    this.elements.push({
      text: "Let's connect",
      type: 'heading',
      weight: 'semibold',
      delay: 0
    });

    // Social links
    this.elements.push({
      text: 'LinkedIn',
      type: 'link',
      weight: 'regular',
      delay: 100
    });

    this.elements.push({
      text: 'Gmail',
      type: 'link',
      weight: 'regular',
      delay: 200
    });

    this.elements.push({
      text: 'GitHub',
      type: 'link',
      weight: 'regular',
      delay: 300
    });

    this.elements.push({
      text: 'Kaggle',
      type: 'link',
      weight: 'regular',
      delay: 400
    });

    // Section headings
    this.elements.push({
      text: 'Core Skills & Languages',
      type: 'heading',
      weight: 'regular',
      delay: 500
    });

    this.elements.push({
      text: 'AI & Data Science',
      type: 'heading',
      weight: 'regular',
      delay: 600
    });

    this.elements.push({
      text: 'Full-Stack & Web Development',
      type: 'heading',
      weight: 'regular',
      delay: 700
    });

    this.elements.push({
      text: 'Databases & Cloud',
      type: 'heading',
      weight: 'regular',
      delay: 800
    });
  }

  private getFontWeight(element: TextElement): string {
    return element.weight === 'semibold' ? '600' : '400';
  }

  private getFontSize(element: TextElement): string {
    if (element.type === 'heading') {
      return element.text === "Let's connect" ? '24px' : '18px';
    }
    return '14px';
  }

  public generateSVG(): string {
    const width = 800;
    const height = 600;
    const padding = 40;
    
    let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">\n`;
    svg += `  <defs>\n`;
    svg += `    <style>\n`;
    svg += `      @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;600&display=swap');\n`;
    svg += `      .text-element { font-family: '${this.fontFamily}'; fill: #000; }\n`;
    svg += `      .fade-in { animation: fadeIn 0.8s ease-in-out forwards; opacity: 0; }\n`;
    svg += `      @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }\n`;
    svg += `    </style>\n`;
    svg += `  </defs>\n`;

    let yPosition = padding + 30;
    
    this.elements.forEach((element, index) => {
      const fontSize = this.getFontSize(element);
      const fontWeight = this.getFontWeight(element);
      const animationDelay = element.delay / 1000; // Convert to seconds
      
      svg += `  <text x="${padding}" y="${yPosition}" class="text-element fade-in" `;
      svg += `font-size="${fontSize}" font-weight="${fontWeight}" `;
      svg += `style="animation-delay: ${animationDelay}s;">${element.text}</text>\n`;
      
      yPosition += parseInt(fontSize) + 20;
    });

    svg += `</svg>`;
    return svg;
  }

  public generateHTML(): string {
    // Generate HTML with embedded TypeScript animation
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>README Content</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;600&display=swap');
    body {
      font-family: 'Geist', sans-serif;
      background: white;
      padding: 20px;
    }
  </style>
</head>
<body>
  <div id="content"></div>
  <script src="fade-in.js"></script>
</body>
</html>`;
    return html;
  }
}

// Export for use
export default ReadmeContentGenerator;

// If run directly, generate SVG
if (require.main === module) {
  const fs = require('fs');
  const generator = new ReadmeContentGenerator();
  const svg = generator.generateSVG();
  fs.writeFileSync('readme-content.svg', svg);
  console.log('README content SVG generated!');
}

