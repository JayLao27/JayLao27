// Simple script to generate contributions SVG
const fs = require('fs');
const https = require('https');

// GitHub username - change this to your username
const GITHUB_USERNAME = 'Jaylao27';
// Optional: Add a GitHub personal access token for higher rate limits
// Get one at: https://github.com/settings/tokens
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

class ContributionsSVGGenerator {
  constructor(contributions = []) {
    this.contributions = contributions;
    this.colors = {
      level0: '#ebedf0',  // No contributions - light gray
      level1: '#8A9AE8',  // Low - lightest blue
      level2: '#6A7AC8',  // Mid-low - light blue
      level3: '#4A5AA8',  // Mid - medium blue
      level4: '#2A3A68',  // Mid-high - darker blue
      level5: '#1A2148'    // High - darkest blue
    };
  }

  async fetchGitHubContributions(username) {
    return new Promise((resolve, reject) => {
      // Query for the last year (from 1 year ago to today)
      const today = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      oneYearAgo.setMonth(0);
      oneYearAgo.setDate(1);
      
      const fromDate = oneYearAgo.toISOString();
      const toDate = today.toISOString();
      
      // Use the correct GraphQL query format
      const query = `
        query($username: String!, $from: DateTime!, $to: DateTime!) {
          user(login: $username) {
            contributionsCollection(from: $from, to: $to) {
              contributionCalendar {
                totalContributions
                weeks {
                  contributionDays {
                    date
                    contributionCount
                    color
                  }
                }
              }
            }
          }
        }
      `;

      const data = JSON.stringify({
        query: query,
        variables: { 
          username: username,
          from: fromDate,
          to: toDate
        }
      });

      const headers = {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'User-Agent': 'Node.js'
      };
      
      // Add authorization header if token is provided
      if (GITHUB_TOKEN) {
        headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
      }

      const options = {
        hostname: 'api.github.com',
        path: '/graphql',
        method: 'POST',
        headers: headers
      };

      const req = https.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          try {
            const result = JSON.parse(responseData);
            // Check for rate limit in the response
            if (result.message && result.message.includes('rate limit')) {
              console.error('\n❌ API Rate Limit Exceeded!');
              console.error('To fix this, add a GitHub Personal Access Token:');
              console.error('1. Go to: https://github.com/settings/tokens');
              console.error('2. Generate a new token (no permissions needed for public data)');
              console.error('3. Run: $env:GITHUB_TOKEN="your_token_here" (PowerShell) or export GITHUB_TOKEN="your_token_here" (Bash)');
              console.error('4. Then run this script again\n');
              reject(new Error('Rate limit exceeded'));
              return;
            }
            
            if (result.errors) {
              console.warn('GitHub API Error:', JSON.stringify(result.errors, null, 2));
              reject(new Error(result.errors[0]?.message || 'GraphQL error'));
              return;
            }
            
            // Check if user exists
            if (!result.data?.user) {
              console.warn(`User "${username}" not found or profile is private.`);
              reject(new Error(`User "${username}" not found`));
              return;
            }

            const contributions = [];
            const weeks = result.data?.user?.contributionsCollection?.contributionCalendar?.weeks || [];
            
            if (weeks.length === 0) {
              console.warn('No contribution data found. Check if the username is correct and the profile is public.');
            }
            
            let totalContributions = 0;
            weeks.forEach(week => {
              week.contributionDays.forEach(day => {
                contributions.push({
                  date: day.date,
                  count: day.contributionCount
                });
                totalContributions += day.contributionCount;
              });
            });

            console.log(`Total contributions found: ${totalContributions} across ${contributions.length} days`);

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
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    oneYearAgo.setDate(1); // Start from the 1st of the month
    
    const filled = [];

    const currentDate = new Date(oneYearAgo);
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
    if (count <= 1) return this.colors.level1;      // Low - lightest blue
    if (count <= 3) return this.colors.level2;      // Mid-low - light blue
    if (count <= 5) return this.colors.level3;      // Mid - medium blue
    if (count <= 8) return this.colors.level4;      // Mid-high - darker blue
    return this.colors.level5;                       // High - darkest blue #1A2148
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
  if (!GITHUB_TOKEN) {
    console.log('ℹ️  Tip: Add a GITHUB_TOKEN environment variable for higher rate limits');
  }
  
  const generator = new ContributionsSVGGenerator();
  
  try {
    const contributions = await generator.fetchGitHubContributions(GITHUB_USERNAME);
    generator.contributions = contributions;
    
    // Count non-zero contributions
    const daysWithContributions = contributions.filter(c => c.count > 0).length;
    const totalContributions = contributions.reduce((sum, c) => sum + c.count, 0);
    
    console.log(`✓ Found ${contributions.length} days of data`);
    console.log(`✓ ${daysWithContributions} days with contributions (${totalContributions} total)`);
    
    const svg = generator.generateAnimatedSVG();
    fs.writeFileSync('../contributions.svg', svg);
    console.log('✓ Contributions SVG generated successfully!');
  } catch (error) {
    if (error.message.includes('rate limit') || error.message.includes('Rate limit')) {
      console.error('\n⚠️  Using fallback data due to rate limit.');
      console.error('The SVG will be generated with placeholder data.');
      console.error('Add a GITHUB_TOKEN to fetch your real contributions.\n');
      
      // Generate with sample data as fallback
      const contributions = generator.generateSampleContributions();
      generator.contributions = contributions;
      const svg = generator.generateAnimatedSVG();
      fs.writeFileSync('../contributions.svg', svg);
      console.log('✓ Contributions SVG generated with placeholder data.');
      console.log('⚠️  Note: This is placeholder data. Add GITHUB_TOKEN for real contributions.');
    } else {
      console.error('Error generating SVG:', error.message);
      // Still generate with fallback data
      const contributions = generator.generateSampleContributions();
      generator.contributions = contributions;
      const svg = generator.generateAnimatedSVG();
      fs.writeFileSync('../contributions.svg', svg);
      console.log('✓ Contributions SVG generated with placeholder data.');
    }
  }
}

main();

