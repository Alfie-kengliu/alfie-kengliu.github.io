(() => {
  const revealItems = document.querySelectorAll('.reveal');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !('IntersectionObserver' in window)) {
    revealItems.forEach(item => item.classList.add('visible'));
  } else {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {threshold: .12});
    revealItems.forEach(item => observer.observe(item));
  }

  const dock = document.querySelector('.dock');
  const slider = document.querySelector('.dock-slider');
  const dockItems = [...document.querySelectorAll('[data-dock]')];
  const setDock = name => {
    const index = dockItems.findIndex(item => item.dataset.dock === name);
    dockItems.forEach(item => item.classList.toggle('active', item.dataset.dock === name));
    if (index >= 0) slider.style.transform = `translateX(${index * dockItems[index].offsetWidth}px)`;
  };
  dockItems.forEach(item => item.addEventListener('click', () => setDock(item.dataset.dock)));
  addEventListener('resize', () => {
    const active = document.querySelector('[data-dock].active');
    if (active) setDock(active.dataset.dock);
  });

  const toast = document.querySelector('.toast');
  let toastTimer;
  const showToast = message => {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  };
  document.querySelectorAll('[data-prototype-action]').forEach(button => {
    button.addEventListener('click', () => showToast('Case pages are outside this homepage prototype.'));
  });
  document.querySelector('[data-resume]').addEventListener('click', () => showToast('Resume PDF will be connected in the production site.'));

  const about = document.querySelector('#about');
  const work = document.querySelector('#work');
  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setDock(entry.target.id === 'about' ? 'about' : 'work');
      });
    }, {threshold: .35});
    navObserver.observe(work);
    navObserver.observe(about);
  }

  dock.addEventListener('keydown', event => {
    if (!['ArrowLeft','ArrowRight'].includes(event.key)) return;
    const focusables = [...dock.querySelectorAll('a,button')];
    const current = focusables.indexOf(document.activeElement);
    if (current < 0) return;
    event.preventDefault();
    const next = event.key === 'ArrowRight' ? (current + 1) % focusables.length : (current - 1 + focusables.length) % focusables.length;
    focusables[next].focus();
  });
})();
