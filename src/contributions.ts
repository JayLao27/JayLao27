/**
 * Animated Contributions Timeline
 * Creates a beautiful sliding animation showing contributions over the years
 */

interface Contribution {
  year: number;
  month: number;
  day: number;
  count: number;
  message: string;
}

class ContributionsTimeline {
  private container: HTMLElement;
  private contributions: Contribution[] = [];
  private currentYear: number;
  private animationSpeed: number = 5000; // milliseconds per year
  private boxSize: number = 12;
  private boxGap: number = 3;
  private isPlaying: boolean = false;
  private currentYearIndex: number = 0;

  constructor(containerId: string) {
    this.container = document.getElementById(containerId)!;
    this.currentYear = new Date().getFullYear();
    this.init();
  }

  private init(): void {
    this.generateSampleContributions();
    this.render();
  }

  private generateSampleContributions(): void {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    // Generate contributions for the last 5 years
    for (let year = currentYear - 4; year <= currentYear; year++) {
      // Generate random contributions for each month
      for (let month = 1; month <= 12; month++) {
        const daysInMonth = new Date(year, month, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
          const count = Math.floor(Math.random() * 10);
          if (count > 0) {
            this.contributions.push({
              year,
              month,
              day,
              count,
              message: `${count} contributions on ${this.formatDate(year, month, day)}`
            });
          }
        }
      }
    }

    // Sort by date
    this.contributions.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      if (a.month !== b.month) return a.month - b.month;
      return a.day - b.day;
    });
  }

  private formatDate(year: number, month: number, day: number): string {
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  private getIntensityColor(count: number): string {
    // GitHub-style intensity colors
    if (count === 0) return '#ebedf0';
    if (count <= 2) return '#9be9a8';
    if (count <= 4) return '#40c463';
    if (count <= 6) return '#30a14e';
    return '#216e39';
  }

  private render(): void {
    this.container.innerHTML = '';
    
    // Create header
    const header = document.createElement('div');
    header.className = 'contributions-header';
    header.innerHTML = `
      <h2>📊 My Contributions Timeline</h2>
      <div class="year-indicator">
        <span id="current-year-display">${this.currentYear - 4}</span>
        <button id="play-pause-btn" class="play-btn">▶️ Play</button>
        <button id="reset-btn" class="reset-btn">🔄 Reset</button>
      </div>
      <div class="legend">
        <span>Less</span>
        <div class="legend-boxes">
          <div class="legend-box" style="background: #ebedf0;"></div>
          <div class="legend-box" style="background: #9be9a8;"></div>
          <div class="legend-box" style="background: #40c463;"></div>
          <div class="legend-box" style="background: #30a14e;"></div>
          <div class="legend-box" style="background: #216e39;"></div>
        </div>
        <span>More</span>
      </div>
    `;
    this.container.appendChild(header);

    // Create timeline container
    const timeline = document.createElement('div');
    timeline.className = 'contributions-timeline';
    timeline.id = 'timeline-container';
    this.container.appendChild(timeline);

    // Group contributions by year
    const contributionsByYear: { [year: number]: Contribution[] } = {};
    this.contributions.forEach(contrib => {
      if (!contributionsByYear[contrib.year]) {
        contributionsByYear[contrib.year] = [];
      }
      contributionsByYear[contrib.year].push(contrib);
    });

    // Create year sections
    const years = Object.keys(contributionsByYear).map(Number).sort();
    years.forEach(year => {
      const yearSection = document.createElement('div');
      yearSection.className = 'year-section';
      yearSection.dataset.year = year.toString();
      
      const yearLabel = document.createElement('div');
      yearLabel.className = 'year-label';
      yearLabel.textContent = year.toString();
      yearSection.appendChild(yearLabel);

      const boxesContainer = document.createElement('div');
      boxesContainer.className = 'boxes-container';
      
      const yearContribs = contributionsByYear[year];
      yearContribs.forEach(contrib => {
        const box = document.createElement('div');
        box.className = 'contribution-box';
        box.style.backgroundColor = this.getIntensityColor(contrib.count);
        box.title = contrib.message;
        box.dataset.year = year.toString();
        boxesContainer.appendChild(box);
      });

      yearSection.appendChild(boxesContainer);
      timeline.appendChild(yearSection);
    });

    // Add event listeners
    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    const playPauseBtn = document.getElementById('play-pause-btn')!;
    const resetBtn = document.getElementById('reset-btn')!;

    playPauseBtn.addEventListener('click', () => this.toggleAnimation());
    resetBtn.addEventListener('click', () => this.resetAnimation());
  }

  private toggleAnimation(): void {
    if (this.isPlaying) {
      this.pauseAnimation();
    } else {
      this.startAnimation();
    }
  }

  private startAnimation(): void {
    this.isPlaying = true;
    const playPauseBtn = document.getElementById('play-pause-btn')!;
    playPauseBtn.textContent = '⏸️ Pause';
    playPauseBtn.className = 'pause-btn';

    this.animate();
  }

  private pauseAnimation(): void {
    this.isPlaying = false;
    const playPauseBtn = document.getElementById('play-pause-btn')!;
    playPauseBtn.textContent = '▶️ Play';
    playPauseBtn.className = 'play-btn';
  }

  private resetAnimation(): void {
    this.pauseAnimation();
    this.currentYearIndex = 0;
    this.updateDisplay();
  }

  private animate(): void {
    if (!this.isPlaying) return;

    const years = Array.from(document.querySelectorAll('.year-section'))
      .map(el => parseInt(el.getAttribute('data-year')!))
      .sort();
    
    if (this.currentYearIndex < years.length) {
      this.updateDisplay();
      this.currentYearIndex++;
      
      setTimeout(() => {
        if (this.isPlaying) {
          this.animate();
        }
      }, this.animationSpeed);
    } else {
      // Loop back to beginning
      this.currentYearIndex = 0;
      setTimeout(() => {
        if (this.isPlaying) {
          this.animate();
        }
      }, this.animationSpeed);
    }
  }

  private updateDisplay(): void {
    const years = Array.from(document.querySelectorAll('.year-section'))
      .map(el => parseInt(el.getAttribute('data-year')!))
      .sort();
    
    const currentYearDisplay = document.getElementById('current-year-display')!;
    
    years.forEach((year, index) => {
      const yearSection = document.querySelector(`[data-year="${year}"]`) as HTMLElement;
      if (!yearSection) return;

      const boxesContainer = yearSection.querySelector('.boxes-container') as HTMLElement;
      if (!boxesContainer) return;

      if (index <= this.currentYearIndex) {
        // Show this year and slide it in
        yearSection.style.opacity = '1';
        yearSection.style.transform = 'translateX(0)';
        boxesContainer.classList.add('visible');
        
        // Add continuous sliding animation when playing
        if (this.isPlaying && index === this.currentYearIndex) {
          boxesContainer.classList.add('sliding');
        } else {
          boxesContainer.classList.remove('sliding');
        }
        
        if (index === this.currentYearIndex) {
          currentYearDisplay.textContent = year.toString();
          
          // Animate boxes sliding in one by one
          const boxes = boxesContainer.querySelectorAll('.contribution-box');
          boxes.forEach((box, boxIndex) => {
            setTimeout(() => {
              (box as HTMLElement).style.opacity = '1';
              (box as HTMLElement).style.transform = 'translateX(0) scale(1)';
            }, boxIndex * 10); // Stagger the animation
          });
        }
      } else {
        // Hide future years
        yearSection.style.opacity = '0.3';
        yearSection.style.transform = 'translateX(-50px)';
        boxesContainer.classList.remove('visible');
        
        const boxes = boxesContainer.querySelectorAll('.contribution-box');
        boxes.forEach(box => {
          (box as HTMLElement).style.opacity = '0';
          (box as HTMLElement).style.transform = 'translateX(-20px) scale(0.8)';
        });
      }
    });
  }

  public addContribution(year: number, month: number, day: number, count: number, message?: string): void {
    this.contributions.push({
      year,
      month,
      day,
      count,
      message: message || `${count} contributions on ${this.formatDate(year, month, day)}`
    });
    this.contributions.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      if (a.month !== b.month) return a.month - b.month;
      return a.day - b.day;
    });
    this.render();
  }
}

// Initialize when DOM is ready
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    const timeline = new ContributionsTimeline('contributions-container');
    
    // Export for global access
    (window as any).contributionsTimeline = timeline;
  });
}

