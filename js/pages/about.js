/**
 * KK PHARMACY ONLINE PHARMACY - ABOUT US PAGE CONTROLLER (js/pages/about.js)
 * Implements smooth scroll-triggered counter ticker animations and reveal effects for statistics.
 */
const AboutPage = {
  isAnimating: false,
  hasAnimatedOnce: false,

  /**
   * Initialize About Page animations and scroll watchers
   */
  init: () => {
    console.log('📄 Initializing About KK PHARMACY Page Animations...');
    AboutPage.initScrollCounters();
  },

  /**
   * Scroll-triggered counting ticker animation
   */
  initScrollCounters: () => {
    const statsContainer = document.getElementById('aboutHeroStats') || document.querySelector('.about-hero-stats');
    const counters = document.querySelectorAll('.about-stat-number');

    if (!counters || counters.length === 0) return;

    // Reset initial visual state to start numbers
    counters.forEach(counter => {
      const suffix = counter.getAttribute('data-suffix') || '';
      const prefix = counter.getAttribute('data-prefix') || '';
      const start = counter.getAttribute('data-start') || '0';
      counter.textContent = prefix + start + suffix;
    });

    /**
     * Run smooth high-precision count-up ticker animation
     */
    const runCountingAnimation = () => {
      if (AboutPage.isAnimating) return;
      AboutPage.isAnimating = true;

      if (statsContainer) {
        statsContainer.classList.remove('stats-animated');
        void statsContainer.offsetWidth; // Force reflow to re-trigger CSS animations
        statsContainer.classList.add('stats-animated');
      }

      const duration = 2000; // 2 seconds total animation time
      const startTime = performance.now();

      counters.forEach(counter => {
        const target = parseFloat(counter.getAttribute('data-target')) || 0;
        const suffix = counter.getAttribute('data-suffix') || '';
        const prefix = counter.getAttribute('data-prefix') || '';
        const useComma = counter.getAttribute('data-format') === 'comma';
        const startVal = parseFloat(counter.getAttribute('data-start')) || 0;

        counter.classList.remove('counter-popped');

        const updateCounter = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);

          // Ease-out cubic curve: fast pickup, natural deceleration
          const easeProgress = 1 - Math.pow(1 - progress, 3);
          const currentVal = Math.floor(startVal + (target - startVal) * easeProgress);

          const formattedVal = useComma 
            ? currentVal.toLocaleString('en-US') 
            : currentVal.toString();

          counter.textContent = prefix + formattedVal + suffix;

          if (progress < 1) {
            requestAnimationFrame(updateCounter);
          } else {
            // Lock in exact final value at 100% completion
            const finalVal = useComma ? target.toLocaleString('en-US') : target.toString();
            counter.textContent = prefix + finalVal + suffix;
            counter.classList.add('counter-popped');
          }
        };

        requestAnimationFrame(updateCounter);
      });

      setTimeout(() => {
        AboutPage.isAnimating = false;
        AboutPage.hasAnimatedOnce = true;
      }, duration + 100);
    };

    // Use IntersectionObserver for scroll-triggered animation
    if ('IntersectionObserver' in window) {
      let isVisible = false;
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            if (!isVisible) {
              isVisible = true;
              runCountingAnimation();
            }
          } else {
            // When scrolled outside the viewport, allow re-animating when scrolled back into view
            if (entry.boundingClientRect.top > window.innerHeight || entry.boundingClientRect.bottom < 0) {
              isVisible = false;
            }
          }
        });
      }, {
        root: null,
        rootMargin: '0px 0px -40px 0px',
        threshold: 0.2
      });

      if (statsContainer) {
        observer.observe(statsContainer);
      } else {
        counters.forEach(c => observer.observe(c));
      }
    } else {
      // Fallback for older browsers
      runCountingAnimation();
    }
  }
};

// Self-initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => AboutPage.init());
} else {
  AboutPage.init();
}
