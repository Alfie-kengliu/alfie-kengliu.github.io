// Exhibit loops retain their poster behavior and share the case-study play/pause control.
(() => {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const states = [...document.querySelectorAll('[data-exhibit-loop]')].map(video => {
    const button = document.createElement('button');
    button.className = 'video-toggle';
    button.type = 'button';
    button.textContent = 'Play';
    video.parentElement.append(button);
    return { video, button, visible: false, pending: false, blocked: false, userPaused: motion.matches };
  });
  const allowed = state => state.visible && !document.hidden && !state.userPaused && !state.blocked;
  const poster = state => state.video.parentElement.classList.remove('is-playing');
  const updateToggle = state => {
    const playing = !state.video.paused;
    state.button.textContent = playing ? 'Pause' : 'Play';
    state.button.setAttribute('aria-label', `${playing ? 'Pause' : 'Play'} ${state.video.getAttribute('aria-label') || 'exhibit animation'}`);
    state.button.setAttribute('aria-pressed', String(playing));
  };
  const sync = state => {
    const video = state.video;
    if (!allowed(state)) {
      video.pause();
      if (motion.matches || state.blocked) poster(state);
      return;
    }
    if (state.pending || !video.paused) return;
    state.pending = true;
    video.play().then(() => {
      if (!allowed(state)) video.pause();
    }).catch(error => {
      // A scroll or visibility change may cancel an in-flight play request.
      if (error.name !== 'AbortError') {
        state.blocked = true;
        poster(state);
      }
    }).finally(() => {
      state.pending = false;
      if (allowed(state) && video.paused) sync(state);
    });
  };
  states.forEach(state => {
    const video = state.video;
    video.muted = true;
    video.defaultMuted = true;
    const togglePlayback = () => {
      if (video.paused) {
        state.userPaused = false;
        state.blocked = false;
        sync(state);
      } else {
        state.userPaused = true;
        sync(state);
      }
      updateToggle(state);
    };
    state.button.addEventListener('click', togglePlayback);
    video.addEventListener('click', togglePlayback);
    video.addEventListener('playing', () => {
      if (allowed(state)) video.parentElement.classList.add('is-playing');
      else sync(state);
      updateToggle(state);
    });
    video.addEventListener('pause', () => updateToggle(state));
    video.addEventListener('error', () => {
      state.blocked = true;
      sync(state);
    });
    updateToggle(state);
  });
  if ('IntersectionObserver' in window) {
    const byVideo = new Map(states.map(state => [state.video, state]));
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const state = byVideo.get(entry.target);
        state.visible = entry.intersectionRatio >= .25;
        sync(state);
      });
    }, { threshold: [0, .25] });
    states.forEach(state => observer.observe(state.video));
  }
  // Without visibility observation, retain the static posters.
  document.addEventListener('visibilitychange', () => states.forEach(sync));
  motion.addEventListener('change', event => states.forEach(state => {
    if (event.matches) state.userPaused = true;
    sync(state);
  }));
})();
