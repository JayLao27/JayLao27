// Simple script to generate contributions SVG
const fs = require('fs');
const https = require('https');

// GitHub username - change this to your username
const GITHUB_USERNAME = 'Jaylao27';

class ContributionsSVGGenerator {
  constructor(contributions = []) {
    this.contributions = contributions;
    this.colors = {
      level0: '#ebedf0',
      level1: '#9be9a8',
      level2: '#40c463',
      level3: '#30a14e',
      level4: '#216e39'
    };
  }

  async fetchGitHubContributions(username) {
    return new Promise((resolve, reject) => {
      const query = `
        query($username: String!) {
          user(login: $username) {
            contributionsCollection(from: "${new Date(new Date().getFullYear(), 0, 1).toISOString()}", to: "${new Date().toISOString()}") {
              contributionCalendar {
                weeks {
                  contributionDays {
                    date
                    contributionCount
                  }
                }
              }
            }
          }
        }
      `;

      const data = JSON.stringify({
        query: query,
        variables: { username: username }
      });

      const options = {
        hostname: 'api.github.com',
        path: '/graphql',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length,
          'User-Agent': 'Node.js'
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          try {
            const result = JSON.parse(responseData);
            if (result.errors) {
              console.warn('GitHub API Error:', result.errors);
              // Fallback to sample data if API fails
              resolve(this.generateSampleContributions());
              return;
            }

            const contributions = [];
            const weeks = result.data?.user?.contributionsCollection?.contributionCalendar?.weeks || [];
            
            weeks.forEach(week => {
              week.contributionDays.forEach(day => {
                contributions.push({
                  date: day.date,
                  count: day.contributionCount
                });
              });
            });

            // Fill in any missing dates with 0 contributions
            const filledContributions = this.fillMissingDates(contributions);
            resolve(filledContributions);
          } catch (error) {
            console.warn('Error parsing GitHub API response:', error.message);
            // Fallback to sample data
            resolve(this.generateSampleContributions());
          }
        });
      });

      req.on('error', (error) => {
        console.warn('Error fetching from GitHub API:', error.message);
        console.warn('Falling back to sample data...');
        // Fallback to sample data
        resolve(this.generateSampleContributions());
      });

      req.write(data);
      req.end();
    });
  }

  fillMissingDates(contributions) {
    const contributionMap = new Map();
    contributions.forEach(c => {
      contributionMap.set(c.date, c.count);
    });

    const today = new Date();
    const startDate = new Date(new Date().getFullYear(), 0, 1);
    const filled = [];

    const currentDate = new Date(startDate);
    while (currentDate <= today) {
      const dateStr = currentDate.toISOString().split('T')[0];
      filled.push({
        date: dateStr,
        count: contributionMap.get(dateStr) || 0
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return filled;
  }

  generateSampleContributions() {
    // Fallback method if API fails
    const today = new Date();
    const startDate = new Date(new Date().getFullYear(), 0, 1);

    const contributions = [];
    const currentDate = new Date(startDate);
    while (currentDate <= today) {
      contributions.push({
        date: currentDate.toISOString().split('T')[0],
        count: 0
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return contributions;
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

// Main function to generate SVG with real GitHub data
async function main() {
  console.log(`Fetching contributions for ${GITHUB_USERNAME}...`);
  const generator = new ContributionsSVGGenerator();
  
  try {
    const contributions = await generator.fetchGitHubContributions(GITHUB_USERNAME);
    generator.contributions = contributions;
    console.log(`Found ${contributions.length} days of contribution data`);
    
    const svg = generator.generateAnimatedSVG();
    fs.writeFileSync('contributions.svg', svg);
    console.log('Contributions SVG generated successfully!');
  } catch (error) {
    console.error('Error generating SVG:', error.message);
    process.exit(1);
  }
}

main();

