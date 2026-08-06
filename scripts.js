// scripts.js – Redwood Restaurant – Premium interactive experience
// All interactions are progressively enhanced and fully accessible.

(function() {
  'use strict';

  // -------- UTILITY: wait for DOM to be ready --------
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    // -------- 1. MOBILE MENU TOGGLE (with slide + fade) --------
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuToggle && mobileMenu) {
      // Set initial state (hidden) – we use a CSS class for animation
      mobileMenu.classList.add('hidden');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Open menu');

      menuToggle.addEventListener('click', () => {
        const isHidden = mobileMenu.classList.contains('hidden');
        if (isHidden) {
          // Show with animation (class removal triggers CSS transition)
          mobileMenu.classList.remove('hidden');
          // Force a reflow before adding the open class for animation
          void mobileMenu.offsetWidth;
          mobileMenu.classList.add('open');
          menuToggle.setAttribute('aria-expanded', 'true');
          menuToggle.setAttribute('aria-label', 'Close menu');
        } else {
          // Hide (animate out)
          mobileMenu.classList.remove('open');
          // After transition ends, add hidden back
          const onTransitionEnd = () => {
            mobileMenu.classList.add('hidden');
            mobileMenu.removeEventListener('transitionend', onTransitionEnd);
          };
          mobileMenu.addEventListener('transitionend', onTransitionEnd);
          menuToggle.setAttribute('aria-expanded', 'false');
          menuToggle.setAttribute('aria-label', 'Open menu');
        }
      });

      // Close menu when any internal link is clicked
      mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          mobileMenu.classList.remove('open');
          const onTransitionEnd = () => {
            mobileMenu.classList.add('hidden');
            mobileMenu.removeEventListener('transitionend', onTransitionEnd);
          };
          mobileMenu.addEventListener('transitionend', onTransitionEnd);
          menuToggle.setAttribute('aria-expanded', 'false');
          menuToggle.setAttribute('aria-label', 'Open menu');
        });
      });
    }

    // -------- 2. MENU FILTERING (with fade animation) --------
    const filterButtons = document.querySelectorAll('.filter-btn');
    const menuCards = document.querySelectorAll('.menu-card');

    if (filterButtons.length && menuCards.length) {
      // Set initial state: show all
      menuCards.forEach(card => {
        card.classList.remove('hidden');
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      });

      // Active filter button highlight
      const setActiveFilter = (activeBtn) => {
        filterButtons.forEach(btn => {
          btn.classList.remove('active');
          btn.setAttribute('aria-pressed', 'false');
        });
        activeBtn.classList.add('active');
        activeBtn.setAttribute('aria-pressed', 'true');
      };

      const filterMenu = (filterValue) => {
        // First, hide all with a fade-out
        menuCards.forEach(card => {
          card.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
          card.style.opacity = '0';
          card.style.transform = 'translateY(8px)';
        });

        // After a short delay, apply the filter and fade in matching cards
        setTimeout(() => {
          menuCards.forEach(card => {
            const category = card.getAttribute('data-category');
            const shouldShow = (filterValue === 'all' || category === filterValue);
            if (shouldShow) {
              card.classList.remove('hidden');
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            } else {
              card.classList.add('hidden');
              card.style.opacity = '0';
              card.style.transform = 'translateY(8px)';
            }
          });
        }, 250); // matches the fade-out duration
      };

      // Attach click handlers to filter buttons
      filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          setActiveFilter(btn);
          const filter = btn.getAttribute('data-filter');
          filterMenu(filter);
        });
      });

      // Initial active filter is 'All'
      const defaultActive = document.querySelector('.filter-btn.active') || filterButtons[0];
      if (defaultActive) {
        setActiveFilter(defaultActive);
      }
    }

    // -------- 3. SCROLL REVEAL (Intersection Observer) --------
    // Adds a subtle fade-up animation to cards & testimonials when they enter the viewport.
    const revealElements = document.querySelectorAll(
      '.menu-card, .bg-dark-card .card-lift, .testimonial-card, .story-image'
    );
    // Also target the three-step cards in "How It Works"
    const stepCards = document.querySelectorAll('.grid.md\\:grid-cols-3 .flex-col');
    const allReveal = [...revealElements, ...stepCards];

    if ('IntersectionObserver' in window && allReveal.length) {
      // Set initial hidden state
      allReveal.forEach(el => {
        el.classList.add('reveal-hidden');
        el.style.opacity = '0';
        el.style.transform = 'translateY(24px)';
        el.style.transition = 'opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
      });

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            el.classList.remove('reveal-hidden');
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
            observer.unobserve(el); // only reveal once
          }
        });
      }, {
        root: null,
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.15
      });

      allReveal.forEach(el => observer.observe(el));
    } else {
      // Fallback: show all immediately if IntersectionObserver not supported
      allReveal.forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      });
    }

    // -------- 4. SMOOTH ANCHOR SCROLL (optional) --------
    // Enhance default smooth scrolling for internal links.
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          const headerOffset = 80; // adjust for sticky header
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }
})();