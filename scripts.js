/* =============================================================
   scripts.js — Redwood Restaurant
   Progressive enhancement only. No dependencies.

   NOTE: 254702555093 is a DEMO WhatsApp number for portfolio
   purposes. Replace it in WA_NUMBER below before any commercial
   use. All WhatsApp links on the page read from the template
   system in this file, so a single edit updates every CTA.
   ============================================================= */

(function () {
  'use strict';

  /* ============================================================
     WhatsApp template system
     ------------------------------------------------------------
     Every link with a `data-wa="<key>"` attribute gets its href
     composed from these templates at runtime. To change the
     message for any CTA, edit the corresponding template here.
     ============================================================ */
  const WA_NUMBER = '254702555093';

  const WA_TEMPLATES = {
    // Generic order — hero, header, mobile menu, bottom bar, contact.
    // Leaves blank prompts so the customer fills them in on WhatsApp.
    general: () =>
      `Hi Redwood! I'd like to place an order.\n\n` +
      `• Items: \n` +
      `• Delivery location: \n` +
      `• Preferred time: `,

    // Single dish — reads data-item / data-price from the CTA
    // and, if present, the value of the sibling .spice-select.
    dish: (d) => {
      const qty = d.qty && d.qty > 1 ? `${d.qty}× ` : '';
      const spice = d.spice ? ` — ${d.spice}` : '';
      return `Hi Redwood! I'd like ${qty}${d.item} (${d.price})${spice}.`;
    },

    // Today's promo — matches the Special section copy.
    special: () =>
      `Hi Redwood! I'd like to claim today's special:\n\n` +
      `• 2× Nyama Choma Platters + free ugali — KES 850\n\n` +
      `Delivery location: `,

    // Group / catering enquiries — FAQ.
    group: () =>
      `Hi Redwood! I'd like to place a group order.\n\n` +
      `• Headcount: \n` +
      `• Preferred time: \n` +
      `• Delivery location: \n` +
      `• Items: `,

    // Delivery-zone check — Contact section.
    deliveryZone: () =>
      `Hi Redwood! Quick check — do you deliver to my area?\n\n` +
      `• My location: `,

    // Friday specials list signup — footer.
    specialsList: () =>
      `Hi Redwood! Please add me to the Friday specials list.`,
  };

  function buildWaUrl(key, data) {
    const tpl = WA_TEMPLATES[key] || WA_TEMPLATES.general;
    const text = tpl(data || {});
    return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
  }

  /* Shared: live reduced-motion check */
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const prefersReducedMotion = () => reducedMotionQuery.matches;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    initWhatsAppTemplates();
    initMobileMenu();
    initMenuFilter();
    initBackToTop();
    initFaqAccordion();
    initScrollReveal();
    initSmoothScroll();
    initSpecialDay();
    initExternalLinkHints();
    initYear();
  }

  /* -----------------------------------------------------------
     1. WhatsApp template wiring
        Any <a data-wa="..."> gets its href composed here. Menu-card
        CTAs read the spice level from the sibling .spice-select if
        present, and stay in sync when the select changes.
     ----------------------------------------------------------- */
  function initWhatsAppTemplates() {
    document.querySelectorAll('a[data-wa]').forEach(el => {
      const key = el.getAttribute('data-wa');
      const card = el.closest('.menu-card');
      const select = card ? card.querySelector('.spice-select') : null;

      const ctx = {
        item: el.getAttribute('data-item') || '',
        price: el.getAttribute('data-price') || '',
        qty: parseInt(el.getAttribute('data-qty') || '1', 10),
        spice: select
          ? select.value
          : (el.getAttribute('data-spice-fixed') || ''),
      };

      el.href = buildWaUrl(key, ctx);

      if (select) {
        select.addEventListener('change', () => {
          ctx.spice = select.value;
          el.href = buildWaUrl(key, ctx);
        });
      }
    });
  }

  /* -----------------------------------------------------------
     2. Mobile menu toggle
        Escape closes, outside-click closes, focus is trapped while
        open, body scroll is locked with scrollbar-width compensation.
        Adds `menu-open` to <body> so floating UI (back-to-top,
        mobile order bar) can hide while the menu is expanded.
     ----------------------------------------------------------- */
  function initMobileMenu() {
    const toggle = document.getElementById('menu-toggle');
    const menu = document.getElementById('mobile-menu');
    if (!toggle || !menu) return;

    toggle.setAttribute('aria-controls', 'mobile-menu');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    menu.classList.add('hidden');

    let isOpen = false;
    let closeTimer = null;

    const lockScroll = () => {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = scrollbarWidth + 'px';
      }
      document.body.style.overflow = 'hidden';
    };

    const unlockScroll = () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };

    const openMenu = () => {
      if (isOpen) return;
      isOpen = true;
      clearTimeout(closeTimer);
      menu.classList.remove('hidden');
      void menu.offsetWidth;
      menu.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close menu');
      document.body.classList.add('menu-open');
      lockScroll();

      const firstFocusable = menu.querySelector('a, button, [tabindex]:not([tabindex="-1"])');
      if (firstFocusable) firstFocusable.focus();
    };

    const closeMenu = ({ returnFocus = true } = {}) => {
      if (!isOpen) return;
      isOpen = false;
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
      document.body.classList.remove('menu-open');
      unlockScroll();

      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        if (!isOpen) menu.classList.add('hidden');
        menu.removeEventListener('transitionend', onEnd);
        clearTimeout(closeTimer);
      };
      const onEnd = (e) => {
        if (e.target === menu && e.propertyName === 'max-height') finish();
      };
      menu.addEventListener('transitionend', onEnd);
      closeTimer = setTimeout(finish, 500);

      if (returnFocus) toggle.focus();
    };

    toggle.addEventListener('click', () => {
      isOpen ? closeMenu() : openMenu();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) closeMenu();
    });

    document.addEventListener('click', (e) => {
      if (!isOpen) return;
      if (menu.contains(e.target) || toggle.contains(e.target)) return;
      closeMenu({ returnFocus: false });
    });

    menu.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab' || !isOpen) return;
      const focusables = menu.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });

    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => closeMenu({ returnFocus: false }));
    });

    const mql = window.matchMedia('(min-width: 1024px)');
    const onWide = (e) => { if (e.matches && isOpen) closeMenu({ returnFocus: false }); };
    if (typeof mql.addEventListener === 'function') mql.addEventListener('change', onWide);
    else if (typeof mql.addListener === 'function') mql.addListener(onWide);
  }

  /* -----------------------------------------------------------
     3. Menu filtering
        Toggles .hidden; announces result count via #menu-status.
     ----------------------------------------------------------- */
  function initMenuFilter() {
    const buttons = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.menu-card');
    const status = document.getElementById('menu-status');
    if (!buttons.length || !cards.length) return;

    const setActive = (activeBtn) => {
      buttons.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      });
      activeBtn.classList.add('active');
      activeBtn.setAttribute('aria-pressed', 'true');
    };

    const filter = (value) => {
      let visible = 0;
      cards.forEach(card => {
        const cat = card.getAttribute('data-category');
        const show = value === 'all' || cat === value;
        card.classList.toggle('hidden', !show);
        if (show) visible++;
      });
      if (status) {
        status.textContent = `Showing ${visible} of ${cards.length} menu items.`;
      }
    };

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        setActive(btn);
        filter(btn.getAttribute('data-filter'));
      });
    });

    const defaultActive = document.querySelector('.filter-btn.active') || buttons[0];
    if (defaultActive) setActive(defaultActive);
  }

  /* -----------------------------------------------------------
     4. Back-to-top button
        Appears after 600px of scroll. Smooth scrolls to top
        (respects reduced motion) and moves focus back to the H1
        for keyboard / AT users. Hidden while the mobile menu is
        open via the body.menu-open class.
     ----------------------------------------------------------- */
  function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;

    const SHOW_AFTER = 600;
    let ticking = false;

    const update = () => {
      const visible = window.scrollY > SHOW_AFTER;
      btn.classList.toggle('is-visible', visible);
      if (visible) {
        btn.removeAttribute('tabindex');
      } else {
        btn.setAttribute('tabindex', '-1');
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    update();

    btn.addEventListener('click', () => {
      const behavior = prefersReducedMotion() ? 'auto' : 'smooth';
      window.scrollTo({ top: 0, behavior });

      const target = document.getElementById('hero-heading');
      if (target) {
        if (!target.hasAttribute('tabindex')) {
          target.setAttribute('tabindex', '-1');
          target.addEventListener('blur', function once() {
            target.removeAttribute('tabindex');
            target.removeEventListener('blur', once);
          });
        }
        target.focus({ preventScroll: true });
      }
    });
  }

  /* -----------------------------------------------------------
     5. FAQ accordion
        Layered on top of native <details>:
        - Click outside any open item closes all open items
        - Escape closes the currently open item, focus returns
          to its summary
        - Opening a second item closes the first (true accordion)
     ----------------------------------------------------------- */
  function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    if (!faqItems.length) return;

    const closeAll = (except) => {
      faqItems.forEach(item => {
        if (item !== except) item.removeAttribute('open');
      });
    };

    document.addEventListener('click', (e) => {
      const clickedItem = e.target.closest('.faq-item');

      if (!clickedItem) {
        closeAll();
        return;
      }

      const summary = e.target.closest('summary');
      if (summary && !clickedItem.hasAttribute('open')) {
        closeAll(clickedItem);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      const openItem = document.querySelector('.faq-item[open]');
      if (!openItem) return;
      openItem.removeAttribute('open');
      const summary = openItem.querySelector('summary');
      if (summary) summary.focus();
    });
  }

  /* -----------------------------------------------------------
     6. Scroll reveal
        Menu cards own their own CSS animation, so they're excluded.
        A 2-second failsafe reveals everything if the observer
        callback never fires.
     ----------------------------------------------------------- */
  function initScrollReveal() {
    if (!('IntersectionObserver' in window)) return;
    if (prefersReducedMotion()) return;

    const targets = document.querySelectorAll(
      '.card-lift:not(.menu-card), .faq-item, .step-number'
    );
    if (!targets.length) return;

    targets.forEach(el => {
      el.classList.add('reveal-hidden');
      el.style.transition =
        'opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), ' +
        'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          el.classList.remove('reveal-hidden');
          observer.unobserve(el);
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.15
    });

    targets.forEach(el => observer.observe(el));

    setTimeout(() => {
      targets.forEach(el => el.classList.remove('reveal-hidden'));
    }, 2000);
  }

  /* -----------------------------------------------------------
     7. Smooth anchor scroll
        Reads header height dynamically. Respects reduced motion.
        Moves focus to the target for keyboard / AT users.
     ----------------------------------------------------------- */
  function initSmoothScroll() {
    const header = document.querySelector('.header-bg');

    const getOffset = () => {
      const h = header ? header.getBoundingClientRect().height : 80;
      return h + 8;
    };

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (!href || href === '#' || href.length < 2) return;

        let target = null;
        try { target = document.querySelector(href); } catch (_) { /* invalid selector */ }
        if (!target) return;

        e.preventDefault();

        const top = target.getBoundingClientRect().top + window.pageYOffset - getOffset();
        const behavior = prefersReducedMotion() ? 'auto' : 'smooth';
        window.scrollTo({ top, behavior });

        if (!target.hasAttribute('tabindex')) {
          target.setAttribute('tabindex', '-1');
          target.addEventListener('blur', function once() {
            target.removeAttribute('tabindex');
            target.removeEventListener('blur', once);
          });
        }
        target.focus({ preventScroll: true });
      });
    });
  }

  /* -----------------------------------------------------------
     8. Inject current weekday into special headline
     ----------------------------------------------------------- */
  function initSpecialDay() {
    const el = document.getElementById('special-day');
    if (!el) return;
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    el.textContent = days[new Date().getDay()];
  }

  /* -----------------------------------------------------------
     9. Append "(opens in a new tab)" hint to external links
        Skipped for wa.me links — WhatsApp opening in a new tab is
        the expected behaviour and the hint just adds noise.
     ----------------------------------------------------------- */
  function initExternalLinkHints() {
    document.querySelectorAll('a[target="_blank"]').forEach(link => {
      const href = link.getAttribute('href') || '';
      if (href.startsWith('https://wa.me/')) return;
      if (link.querySelector('.sr-only')) return;
      const span = document.createElement('span');
      span.className = 'sr-only';
      span.textContent = ' (opens in a new tab)';
      link.appendChild(span);
    });
  }

  /* -----------------------------------------------------------
     10. Current year in footer
     ----------------------------------------------------------- */
  function initYear() {
    const el = document.getElementById('year');
    if (el) el.textContent = String(new Date().getFullYear());
  }

})();