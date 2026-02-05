/**
 * AskAgent Landing Page — Main JavaScript
 * Pure vanilla JS, no frameworks, no dependencies.
 * All features initialize on DOMContentLoaded.
 */

document.addEventListener('DOMContentLoaded', () => {
  /* ==========================================================================
     1. STICKY NAVBAR
     When the user scrolls past 50px, add a "scrolled" modifier to the navbar
     so CSS can apply a background / shadow / shrink effect.
     ========================================================================== */

  const navbar = document.getElementById('navbar');

  const handleStickyNavbar = () => {
    if (!navbar) return;
    if (window.scrollY > 50) {
      navbar.classList.add('navbar--scrolled');
    } else {
      navbar.classList.remove('navbar--scrolled');
    }
  };

  window.addEventListener('scroll', handleStickyNavbar, { passive: true });
  // Run once on load in case the page is already scrolled (e.g. after refresh)
  handleStickyNavbar();

  /* ==========================================================================
     2. BURGER MENU (Mobile Navigation)
     Toggle the mobile menu open/closed. Close it when any nav link is clicked.
     ========================================================================== */

  const burgerBtn = document.getElementById('burgerBtn');
  const navOverlay = document.getElementById('navOverlay');
  const navLinks = document.querySelectorAll('.navbar__link');

  function closeMenu() {
    if (navbar) {
      navbar.classList.remove('navbar--open');
      document.body.style.overflow = '';
    }
  }

  function openMenu() {
    if (navbar) {
      navbar.classList.add('navbar--open');
      document.body.style.overflow = 'hidden';
    }
  }

  if (burgerBtn && navbar) {
    burgerBtn.addEventListener('click', () => {
      if (navbar.classList.contains('navbar--open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  // Close menu when overlay is clicked
  if (navOverlay) {
    navOverlay.addEventListener('click', closeMenu);
  }

  // Close the mobile menu when any navigation link is clicked
  navLinks.forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  /* ==========================================================================
     3. SMOOTH SCROLL
     Intercept clicks on all anchor links that point to an on-page #hash.
     Smoothly scroll to the target section, accounting for the fixed navbar
     height (80px offset).
     ========================================================================== */

  const NAVBAR_OFFSET = 80;

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');

      // Ignore bare "#" links
      if (href === '#' || href.length < 2) return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      const targetPosition =
        target.getBoundingClientRect().top + window.scrollY - NAVBAR_OFFSET;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth',
      });
    });
  });

  /* ==========================================================================
     4. ANIMATED COUNTERS
     Elements with `.stat-card__number` hold a `data-count` target value.
     When the `.stats` section scrolls into view we animate each number
     from 0 to its target over ~2 seconds using requestAnimationFrame.
     IntersectionObserver ensures the animation fires only once.
     ========================================================================== */

  const statsSection = document.querySelector('.stats');
  const statNumbers = document.querySelectorAll('.stat-card__number');

  /**
   * Animate a single counter element from 0 to `target` over `duration` ms.
   * @param {HTMLElement} el       - the DOM element whose textContent to update
   * @param {number}      target   - the final number to reach
   * @param {number}      duration - animation length in milliseconds
   */
  const animateCounter = (el, target, duration = 2000) => {
    const start = performance.now();

    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out quad for a natural deceleration feel
      const eased = 1 - (1 - progress) * (1 - progress);

      const current = Math.floor(eased * target);
      el.textContent = current.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        // Ensure the final value is exact
        el.textContent = target.toLocaleString();
      }
    };

    requestAnimationFrame(step);
  };

  if (statsSection && statNumbers.length > 0) {
    const statsObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Kick off every counter animation
            statNumbers.forEach((el) => {
              const target = parseInt(el.getAttribute('data-count'), 10) || 0;
              animateCounter(el, target, 2000);
            });

            // Only animate once -- stop observing after trigger
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    statsObserver.observe(statsSection);
  }

  /* ==========================================================================
     5. TABS
     `.tabs__btn` buttons carry a `data-tab` attribute that corresponds to
     a pane with id `tab-{value}`. Clicking a button activates the matching
     pane and deactivates all others.
     ========================================================================== */

  const tabButtons = document.querySelectorAll('.tabs__btn');
  const tabPanes = document.querySelectorAll('.tabs__pane');

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');

      // Deactivate all buttons
      tabButtons.forEach((b) => b.classList.remove('tabs__btn--active'));

      // Deactivate all panes
      tabPanes.forEach((p) => p.classList.remove('tabs__pane--active'));

      // Activate the clicked button
      btn.classList.add('tabs__btn--active');

      // Activate the corresponding pane
      const targetPane = document.getElementById(`tab-${tabId}`);
      if (targetPane) {
        targetPane.classList.add('tabs__pane--active');
      }
    });
  });

  /* ==========================================================================
     6. FAQ ACCORDION
     Clicking `.accordion__trigger` toggles its parent `.accordion__item`.
     Only one item may be open at a time -- opening one closes all others.
     ========================================================================== */

  const accordionTriggers = document.querySelectorAll('.accordion__trigger');

  accordionTriggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const parentItem = trigger.closest('.accordion__item');
      if (!parentItem) return;

      const isOpen = parentItem.classList.contains('accordion__item--open');

      // Close every accordion item first
      document.querySelectorAll('.accordion__item').forEach((item) => {
        item.classList.remove('accordion__item--open');
      });

      // If the clicked item was NOT already open, open it
      if (!isOpen) {
        parentItem.classList.add('accordion__item--open');
      }
    });
  });

  /* ==========================================================================
     7. SCROLL REVEAL (AOS-like)
     Lightweight intersection-based reveal animations.

     Supported `data-aos` values:
       - "fade-up"    : translateY(30px)  -> translateY(0)
       - "fade-right" : translateX(-30px) -> translateX(0)
       - "fade-left"  : translateX(30px)  -> translateX(0)

     Optional `data-aos-delay` attribute adds a transition-delay (in ms).
     ========================================================================== */

  // Inject the minimal CSS rules needed for the reveal system.
  // This keeps the JS self-contained -- no extra stylesheet required.
  const aosStyle = document.createElement('style');
  aosStyle.textContent = `
    /* Initial hidden state applied by JS */
    .aos-init {
      opacity: 0;
      transition: opacity 0.6s ease, transform 0.6s ease;
    }
    .aos-init[data-aos="fade-up"]    { transform: translateY(30px); }
    .aos-init[data-aos="fade-right"] { transform: translateX(-30px); }
    .aos-init[data-aos="fade-left"]  { transform: translateX(30px); }

    /* Revealed state */
    .aos-animate {
      opacity: 1 !important;
      transform: translate(0, 0) !important;
    }
  `;
  document.head.appendChild(aosStyle);

  const aosElements = document.querySelectorAll('[data-aos]');

  // Prepare each element: mark as initialised and apply optional delay
  aosElements.forEach((el) => {
    el.classList.add('aos-init');

    const delay = el.getAttribute('data-aos-delay');
    if (delay) {
      el.style.transitionDelay = `${delay}ms`;
    }
  });

  if (aosElements.length > 0) {
    const aosObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('aos-animate');
            // Once revealed, no need to observe any longer
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    aosElements.forEach((el) => aosObserver.observe(el));
  }

  /* ==========================================================================
     8. CHAT ANIMATION (Hero Phone Mockup)
     After a short 500ms delay, add `.chat-visible` to `.phone-mock` so that
     CSS can begin the staggered chat-bubble entrance animations driven by
     the `--delay` custom property on each `.chat-msg--animated` element.
     ========================================================================== */

  const phoneMock = document.querySelector('.phone-mock');

  if (phoneMock) {
    setTimeout(() => {
      phoneMock.classList.add('chat-visible');
    }, 500);
  }
});
