const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  }), { threshold: 0.08 });
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('visible'));
}

const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
// The Home copy resolves once; only the adjective in the headline keeps moving.
const homeHero = document.querySelector('[data-hero-motion]');
if (homeHero) {
  const introWords = [...homeHero.querySelectorAll('[data-hero-stream]')].flatMap((block) => {
    const words = block.textContent.trim().split(/\s+/);
    block.textContent = '';
    return words.map((word, index) => {
      const span = document.createElement('span');
      span.className = 't-stream-w is-in';
      span.textContent = word;
      block.appendChild(span);
      if (index < words.length - 1) block.appendChild(document.createTextNode(' '));
      return span;
    });
  });
  const streamWords = [...homeHero.querySelectorAll('#hero-title .t-stream-w'), ...introWords];
  const headlineWords = [...homeHero.querySelectorAll('[data-hero-word]')];
  const wordSlot = homeHero.querySelector('[data-hero-word-slot]');
  const highlight = homeHero.querySelector('.hero-highlight');
  const motionTokens = getComputedStyle(document.documentElement);
  const streamGap = parseFloat(motionTokens.getPropertyValue('--stream-gap')) || 60;
  const streamFade = parseFloat(motionTokens.getPropertyValue('--stream-fade')) || 350;
  const wordCycle = parseFloat(motionTokens.getPropertyValue('--hero-word-cycle')) || 3600;
  const wordDuration = parseFloat(motionTokens.getPropertyValue('--hero-word-duration')) || 320;
  let inView = false;
  let started = false;
  let finished = false;
  let highlighted = false;
  let running = false;
  let index = 0;
  let wordIndex = 0;
  let streamTimer;
  let highlightTimer;
  let cycleTimer;
  let swapTimer;
  const isActive = () => inView && !document.hidden && !motionPreference.matches;

  const setWordSlotWidth = (position, immediate = false) => {
    if (!wordSlot || !headlineWords[position]) return;
    if (immediate) wordSlot.style.transition = 'none';
    wordSlot.style.width = `${Math.ceil(headlineWords[position].getBoundingClientRect().width)}px`;
    if (immediate) {
      void wordSlot.offsetWidth;
      wordSlot.style.transition = '';
    }
  };

  const stopTimers = () => {
    window.clearTimeout(streamTimer);
    window.clearTimeout(highlightTimer);
    window.clearTimeout(cycleTimer);
    window.clearTimeout(swapTimer);
    streamTimer = highlightTimer = cycleTimer = swapTimer = undefined;
  };

  const settleWord = () => {
    headlineWords.forEach((word, position) => {
      word.classList.remove('is-leaving', 'is-preparing');
      word.classList.toggle('is-active', position === wordIndex);
    });
    swapTimer = undefined;
  };

  const scheduleWord = () => {
    if (!isActive() || !finished || !highlighted || cycleTimer || swapTimer) return;
    cycleTimer = window.setTimeout(() => {
      cycleTimer = undefined;
      if (!isActive()) return;
      const outgoing = headlineWords[wordIndex];
      wordIndex = (wordIndex + 1) % headlineWords.length;
      const incoming = headlineWords[wordIndex];
      setWordSlotWidth(wordIndex);
      incoming.classList.add('is-preparing');
      void incoming.offsetHeight;
      outgoing.classList.remove('is-active');
      outgoing.classList.add('is-leaving');
      incoming.classList.remove('is-preparing');
      incoming.classList.add('is-active');
      swapTimer = window.setTimeout(() => {
        settleWord();
        scheduleWord();
      }, wordDuration);
    }, wordCycle);
  };

  const scheduleHighlight = () => {
    if (!isActive() || !finished || highlighted || highlightTimer) return;
    highlightTimer = window.setTimeout(() => {
      highlightTimer = undefined;
      if (!isActive()) return;
      highlight?.classList.add('is-complete');
      highlighted = true;
      scheduleWord();
    }, streamFade);
  };

  const revealAll = () => {
    stopTimers();
    streamWords.forEach((word) => word.classList.add('is-in'));
    index = streamWords.length;
    started = true;
    finished = true;
    highlighted = true;
    running = false;
    wordIndex = 0;
    settleWord();
    setWordSlotWidth(wordIndex, true);
    highlight?.classList.add('is-complete');
  };
  const nextWord = () => {
    streamTimer = undefined;
    if (!running) return;
    if (index < streamWords.length) streamWords[index++].classList.add('is-in');
    if (index < streamWords.length) streamTimer = window.setTimeout(nextWord, streamGap);
    else {
      finished = true;
      running = false;
      scheduleHighlight();
    }
  };
  const syncHeroMotion = () => {
    const active = isActive();
    homeHero.dataset.motion = active ? 'running' : 'paused';
    if (motionPreference.matches) {
      revealAll();
      return;
    }
    if (!active) {
      stopTimers();
      settleWord();
      setWordSlotWidth(wordIndex, true);
      running = false;
      return;
    }
    if (!started) {
      started = true;
      streamWords.forEach((word) => {
        word.style.transition = 'none';
        word.classList.remove('is-in');
      });
      void homeHero.offsetWidth;
      streamWords.forEach((word) => { word.style.transition = ''; });
    }
    if (!finished && !running) {
      running = true;
      nextWord();
    } else if (finished && !highlighted) {
      scheduleHighlight();
    } else if (finished) {
      scheduleWord();
    }
  };

  setWordSlotWidth(wordIndex, true);
  document.fonts?.ready.then(() => setWordSlotWidth(wordIndex, true));
  window.addEventListener('resize', () => setWordSlotWidth(wordIndex, true));

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncHeroMotion();
    }, { threshold: 0.08 }).observe(homeHero);
  } else {
    const checkView = () => {
      const bounds = homeHero.getBoundingClientRect();
      inView = bounds.bottom > 0 && bounds.top < window.innerHeight;
      syncHeroMotion();
    };
    window.addEventListener('scroll', checkView, { passive: true });
    window.addEventListener('resize', checkView);
    checkView();
  }
  document.addEventListener('visibilitychange', syncHeroMotion);
  motionPreference.addEventListener?.('change', syncHeroMotion);
}

document.querySelectorAll('[data-loop-video]').forEach((video) => {
  const figure = video.closest('figure');
  const toggle = figure?.querySelector('[data-video-toggle]');
  const subject = toggle?.getAttribute('aria-label')?.replace(/^(Play|Pause)\s+/, '') || 'animation';
  let userPaused = motionPreference.matches;

  const updateToggle = () => {
    if (!toggle) return;
    const isPlaying = !video.paused;
    toggle.textContent = isPlaying ? 'Pause' : 'Play';
    toggle.setAttribute('aria-label', `${isPlaying ? 'Pause' : 'Play'} ${subject}`);
    toggle.setAttribute('aria-pressed', String(isPlaying));
  };

  const play = () => {
    if (document.hidden) return;
    video.play().then(updateToggle).catch(updateToggle);
  };
  const pause = () => {
    video.pause();
    updateToggle();
  };

  const togglePlayback = () => {
    if (video.paused) {
      userPaused = false;
      play();
    } else {
      userPaused = true;
      pause();
    }
  };
  toggle?.addEventListener('click', togglePlayback);
  video.addEventListener('click', togglePlayback);

  video.addEventListener('play', updateToggle);
  video.addEventListener('pause', updateToggle);
  updateToggle();

  if ('IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) {
        pause();
      } else if (!document.hidden && !motionPreference.matches && !userPaused) {
        play();
      }
    }, { threshold: 0.45 });
    videoObserver.observe(video);
  } else if (!motionPreference.matches) {
    play();
  }

  motionPreference.addEventListener?.('change', (event) => {
    if (event.matches) {
      userPaused = true;
      pause();
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pause();
    else if (!motionPreference.matches && !userPaused && video.getBoundingClientRect().bottom > 0 && video.getBoundingClientRect().top < window.innerHeight) play();
  });
});

const caseNavigations = [...document.querySelectorAll('[data-case-navigation]')];
if (caseNavigations.length) {
  const menuItems = [...document.querySelectorAll('[data-case-nav-target]')];
  const sections = [...new Set([
    ...document.querySelectorAll('[data-case-section], [data-progress-section]'),
    ...menuItems.map((item) => document.getElementById(item.dataset.caseNavTarget)).filter(Boolean),
  ])];
  const mobileNavigation = document.querySelector('.case-navigation-mobile');
  const trigger = mobileNavigation?.querySelector('.progress-trigger');
  const label = mobileNavigation?.querySelector('.progress-label');
  const percent = mobileNavigation?.querySelector('.progress-percent');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let activeId = '';
  let hideTimer;
  let labelTimer;
  let ticking = false;

  sections.forEach((section) => {
    section.setAttribute('data-case-section', '');
    if (!section.dataset.caseLabel) {
      const matchingItem = menuItems.find((item) => item.dataset.caseNavTarget === section.id);
      section.dataset.caseLabel = section.dataset.progressLabel || matchingItem?.textContent.trim() || '';
    }
  });

  const closeMenu = () => {
    if (!trigger || !mobileNavigation) return;
    mobileNavigation.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');
  };

  const setActiveSection = (section, force = false) => {
    if (!section || (!force && section.id === activeId)) return;
    activeId = section.id;
    const nextLabel = section.dataset.caseLabel || section.querySelector('h2,h1')?.textContent || 'Overview';

    window.clearTimeout(labelTimer);
    if (label && label.textContent !== nextLabel) {
      if (reducedMotion) {
        label.textContent = nextLabel;
      } else {
        label.classList.add('is-changing');
        labelTimer = window.setTimeout(() => {
          label.textContent = nextLabel;
          label.classList.remove('is-changing');
        }, 110);
      }
    }

    menuItems.forEach((item) => {
      const isActive = item.dataset.caseNavTarget === activeId;
      item.classList.toggle('is-active', isActive);
      if (isActive) item.setAttribute('aria-current', 'location');
      else item.removeAttribute('aria-current');
    });
  };

  const updateProgress = () => {
    const scrollable = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    const value = Math.min(100, Math.max(0, Math.round((window.scrollY / scrollable) * 100)));
    if (percent) percent.textContent = `${value}%`;

    const activationLine = Math.min(220, window.innerHeight * 0.3);
    let current = sections[0];
    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= activationLine) current = section;
    });
    const isAtPageEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
    if (isAtPageEnd) current = sections[sections.length - 1];
    setActiveSection(current);
    ticking = false;
  };

  const showWhileScrolling = () => {
    if (mobileNavigation) {
      if (window.scrollY > 100) mobileNavigation.classList.add('is-visible');
      else mobileNavigation.classList.remove('is-visible');

      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => {
        if (!mobileNavigation.classList.contains('is-open')) mobileNavigation.classList.remove('is-visible');
      }, 1500);
    }

    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updateProgress);
    }
  };

  trigger?.addEventListener('click', () => {
    const willOpen = !mobileNavigation.classList.contains('is-open');
    mobileNavigation.classList.toggle('is-open', willOpen);
    trigger.setAttribute('aria-expanded', String(willOpen));
    if (willOpen) mobileNavigation.classList.add('is-visible');
  });

  menuItems.forEach((item) => item.addEventListener('click', (event) => {
    const target = document.getElementById(item.dataset.caseNavTarget);
    if (!target) return;
    event.preventDefault();
    closeMenu();
    mobileNavigation?.classList.add('is-visible');
    setActiveSection(target, true);
    target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    window.history.replaceState(null, '', `#${target.id}`);
  }));

  document.addEventListener('click', (event) => {
    if (mobileNavigation && !mobileNavigation.contains(event.target)) closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (trigger && event.key === 'Escape' && mobileNavigation?.classList.contains('is-open')) {
      closeMenu();
      trigger.focus();
    }
  });

  window.addEventListener('scroll', showWhileScrolling, { passive: true });
  window.addEventListener('resize', updateProgress);
  window.addEventListener('load', updateProgress, { once: true });

  const hashTarget = window.location.hash ? document.getElementById(window.location.hash.slice(1)) : null;
  setActiveSection(hashTarget && sections.includes(hashTarget) ? hashTarget : sections[0], true);
  updateProgress();
}

const aboutPhotos = [...document.querySelectorAll('[data-about-photo]')];
if (aboutPhotos.length) {
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const syncPhotoPointer = () => {
    const enabled = finePointer.matches && !motionPreference.matches;
    document.documentElement.classList.toggle('has-about-photo-pointer', enabled);
    if (!enabled) aboutPhotos.forEach((photo) => photo.classList.remove('is-pointer-active'));
  };

  aboutPhotos.forEach((photo) => {
    const caption = photo.querySelector('figcaption');
    photo.addEventListener('pointerenter', () => {
      if (finePointer.matches && !motionPreference.matches) photo.classList.add('is-pointer-active');
    });
    photo.addEventListener('pointermove', (event) => {
      if (!finePointer.matches || motionPreference.matches || !caption) return;
      const bounds = photo.getBoundingClientRect();
      const viewportX = Math.max(12, Math.min(event.clientX + 12, window.innerWidth - caption.offsetWidth - 12));
      const viewportY = Math.max(12, Math.min(event.clientY + 12, window.innerHeight - caption.offsetHeight - 12));
      photo.style.setProperty('--photo-caption-x', `${viewportX - bounds.left}px`);
      photo.style.setProperty('--photo-caption-y', `${viewportY - bounds.top}px`);
    });
    photo.addEventListener('pointerleave', () => photo.classList.remove('is-pointer-active'));
  });

  finePointer.addEventListener?.('change', syncPhotoPointer);
  motionPreference.addEventListener?.('change', syncPhotoPointer);
  syncPhotoPointer();
}
