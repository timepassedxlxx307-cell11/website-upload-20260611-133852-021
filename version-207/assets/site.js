function initMenu() {
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-mobile-menu]');
  if (!toggle || !menu) {
    return;
  }
  toggle.addEventListener('click', () => {
    menu.classList.toggle('is-open');
  });
}

function initHero() {
  const hero = document.querySelector('[data-hero]');
  if (!hero) {
    return;
  }
  const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
  const prev = hero.querySelector('[data-hero-prev]');
  const next = hero.querySelector('[data-hero-next]');
  let active = 0;
  let timer = null;

  function show(index) {
    active = (index + slides.length) % slides.length;
    slides.forEach((slide, pos) => {
      slide.classList.toggle('is-active', pos === active);
    });
    dots.forEach((dot, pos) => {
      dot.classList.toggle('is-active', pos === active);
    });
  }

  function restart() {
    if (timer) {
      window.clearInterval(timer);
    }
    timer = window.setInterval(() => show(active + 1), 5000);
  }

  if (prev) {
    prev.addEventListener('click', () => {
      show(active - 1);
      restart();
    });
  }
  if (next) {
    next.addEventListener('click', () => {
      show(active + 1);
      restart();
    });
  }
  dots.forEach((dot, pos) => {
    dot.addEventListener('click', () => {
      show(pos);
      restart();
    });
  });
  show(0);
  restart();
}

function initFilters() {
  const panels = Array.from(document.querySelectorAll('[data-filter-panel]'));
  panels.forEach((panel) => {
    const scope = panel.parentElement || document;
    const input = panel.querySelector('[data-search-input]');
    const type = panel.querySelector('[data-filter-type]');
    const region = panel.querySelector('[data-filter-region]');
    const sort = panel.querySelector('[data-sort-cards]');
    const list = scope.querySelector('[data-card-list]');
    const empty = scope.querySelector('[data-empty-result]');
    if (!list) {
      return;
    }
    const original = Array.from(list.querySelectorAll('[data-card]'));

    function apply() {
      const query = (input && input.value ? input.value : '').trim().toLowerCase();
      const typeValue = type && type.value ? type.value : '';
      const regionValue = region && region.value ? region.value : '';
      let visible = 0;
      original.forEach((card) => {
        const text = `${card.dataset.title || ''} ${card.dataset.keywords || ''}`.toLowerCase();
        const matchQuery = !query || text.includes(query);
        const matchType = !typeValue || (card.dataset.type || '').includes(typeValue);
        const matchRegion = !regionValue || (card.dataset.region || '').includes(regionValue);
        const ok = matchQuery && matchType && matchRegion;
        card.classList.toggle('is-hidden', !ok);
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    function resort() {
      if (!sort || sort.value === 'default') {
        original.forEach((card) => list.appendChild(card));
        apply();
        return;
      }
      const cards = Array.from(list.querySelectorAll('[data-card]'));
      cards.sort((a, b) => {
        if (sort.value === 'views') {
          return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
        }
        if (sort.value === 'year') {
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        }
        return (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-Hans-CN');
      });
      cards.forEach((card) => list.appendChild(card));
      apply();
    }

    [input, type, region].forEach((control) => {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
    if (sort) {
      sort.addEventListener('change', resort);
    }

    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q && input) {
      input.value = q;
    }
    apply();
  });
}

async function attachStream(video, url) {
  if (video.dataset.ready === '1') {
    return;
  }
  video.dataset.ready = '1';
  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = url;
    return;
  }
  try {
    const module = await import('./hls.js');
    const Hls = module.H;
    if (Hls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      video.hlsInstance = hls;
      return;
    }
  } catch (error) {
    video.dataset.ready = '0';
  }
  video.src = url;
}

function initPlayers() {
  const players = Array.from(document.querySelectorAll('[data-player]'));
  players.forEach((player) => {
    const video = player.querySelector('video[data-play-url]');
    const button = player.querySelector('[data-play-button]');
    if (!video) {
      return;
    }
    const url = video.getAttribute('data-play-url');
    if (!url) {
      return;
    }

    attachStream(video, url);

    async function start() {
      await attachStream(video, url);
      try {
        await video.play();
        player.classList.add('is-playing');
      } catch (error) {
        player.classList.remove('is-playing');
      }
    }

    if (button) {
      button.addEventListener('click', start);
    }
    video.addEventListener('play', () => {
      player.classList.add('is-playing');
    });
    video.addEventListener('pause', () => {
      if (video.currentTime === 0 || video.ended) {
        player.classList.remove('is-playing');
      }
    });
    video.addEventListener('click', () => {
      if (video.paused) {
        start();
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initMenu();
  initHero();
  initFilters();
  initPlayers();
});
