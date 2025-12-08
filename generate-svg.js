// Simple script to generate contributions SVG
const fs = require('fs');

// Import the generator (we'll compile the TS first or use a JS version)
// For now, let's create a simple inline version
class ContributionsSVGGenerator {
  constructor() {
    this.contributions = [];
    this.colors = {
      level0: '#ebedf0',
      level1: '#9be9a8',
      level2: '#40c463',
      level3: '#30a14e',
      level4: '#216e39'
    };
    this.generateSampleContributions();
  }

  generateSampleContributions() {
    const today = new Date();
    const startDate = new Date();
    startDate.setFullYear(today.getFullYear() - 1);

    const currentDate = new Date(startDate);
    while (currentDate <= today) {
      const count = Math.floor(Math.random() * 10);
      this.contributions.push({
        date: currentDate.toISOString().split('T')[0],
        count
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  getColor(count) {
    if (count === 0) return this.colors.level0;
    if (count <= 2) return this.colors.level1;
    if (count <= 4) return this.colors.level2;
    if (count <= 6) return this.colors.level3;
    return this.colors.level4;
  }

  generateAnimatedSVG(width = 800, boxSize = 12, gap = 3) {
    const weeks = Math.ceil(this.contributions.length / 7);
    const height = 8 * (boxSize + gap);
    
    let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">\n`;
    svg += `  <style>\n`;
    svg += `    .contrib-day { transition: opacity 0.3s; }\n`;
    svg += `    .contrib-day:hover { opacity: 0.7; }\n`;
    svg += `    @keyframes slideIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }\n`;
    svg += `    .contrib-day { animation: slideIn 0.5s ease-out forwards; opacity: 0; }\n`;
    svg += `  </style>\n`;

    let x = 0;
    let y = 0;
    let dayOfWeek = 0;

    this.contributions.forEach((contrib, index) => {
      const color = this.getColor(contrib.count);
      const xPos = x * (boxSize + gap);
      const yPos = y * (boxSize + gap);
      const delay = index * 0.01;

      svg += `  <rect class="contrib-day" x="${xPos}" y="${yPos}" width="${boxSize}" height="${boxSize}" fill="${color}" data-count="${contrib.count}" data-date="${contrib.date}" style="animation-delay: ${delay}s;"/>\n`;

      dayOfWeek++;
      if (dayOfWeek >= 7) {
        dayOfWeek = 0;
        x++;
        y = 0;
      } else {
        y++;
      }
    });

    svg += `</svg>`;
    return svg;
  }
}

// Generate the SVG
const generator = new ContributionsSVGGenerator();
const svg = generator.generateAnimatedSVG();
fs.writeFileSync('contributions.svg', svg);
console.log('Contributions SVG generated successfully!');

