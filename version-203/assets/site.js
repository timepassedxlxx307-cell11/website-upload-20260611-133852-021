
(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var toggle = qs('.menu-toggle');
    var panel = qs('.mobile-panel');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('.hero-slide', hero);
    var dots = qsa('.hero-dot', hero);
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute('data-slide') || 0));
        start();
      });
    });

    start();
  }

  function initFilters() {
    var grid = qs('.filterable-grid');
    if (!grid) {
      return;
    }
    var input = qs('.page-filter');
    var year = qs('.year-filter');
    var empty = qs('.empty-state');
    var cards = qsa('.movie-card', grid);

    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var selectedYear = year ? year.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-text') || ''
        ].join(' ').toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var matched = (!keyword || text.indexOf(keyword) !== -1) && (!selectedYear || cardYear === selectedYear);
        card.classList.toggle('is-hidden', !matched);
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    if (input) {
      input.addEventListener('input', apply);
    }
    if (year) {
      year.addEventListener('change', apply);
    }
  }

  function loadPlayer(player) {
    var video = qs('video', player);
    var cover = qs('.player-cover', player);
    var json = qs('.stream-json', player.parentNode);
    if (!video || !cover || !json) {
      return;
    }
    var config;
    try {
      config = JSON.parse(json.textContent || '{}');
    } catch (error) {
      config = {};
    }
    var src = config.src;
    var hls;
    var loaded = false;

    function attach() {
      if (!src || loaded) {
        return Promise.resolve();
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        return Promise.resolve();
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        return Promise.resolve();
      }
      video.src = src;
      return Promise.resolve();
    }

    function play() {
      attach().then(function () {
        player.classList.add('is-playing');
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      });
    }

    cover.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (!loaded || video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      player.classList.add('is-playing');
    });
    window.addEventListener('beforeunload', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  }

  function initPlayers() {
    qsa('[data-player]').forEach(loadPlayer);
    qsa('.scroll-play').forEach(function (button) {
      button.addEventListener('click', function () {
        var cover = qs('.player-cover');
        if (cover) {
          window.setTimeout(function () {
            cover.click();
          }, 220);
        }
      });
    });
  }

  function cardHtml(movie) {
    var text = movie.oneLine || movie.summary || '';
    var meta = [movie.region, movie.genre || movie.type].filter(Boolean).join(' · ');
    return [
      '<a class="movie-card" href="', movie.url, '" data-title="', escapeHtml(movie.title), '" data-text="', escapeHtml([movie.summary, movie.genre, (movie.tags || []).join(' ')].join(' ')), '" data-year="', escapeHtml(movie.year || ''), '">',
      '<span class="poster-frame"><img src="', movie.image, '" alt="', escapeHtml(movie.title), '" loading="lazy"><span class="poster-shade"></span><span class="poster-play">▶</span><span class="poster-badge">', escapeHtml(movie.year || ''), '</span></span>',
      '<span class="movie-info"><strong>', escapeHtml(movie.title), '</strong><em>', escapeHtml(meta), '</em><span>', escapeHtml(text), '</span></span>',
      '</a>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (ch) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[ch];
    });
  }

  function initSearchPage() {
    var results = qs('#search-results');
    if (!results || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    var input = qs('#search-input');
    var title = qs('#search-title');
    var empty = qs('#search-empty');
    if (input) {
      input.value = query;
    }
    var normalized = query.trim().toLowerCase();
    var source = window.SEARCH_MOVIES;
    var items = normalized ? source.filter(function (movie) {
      return [
        movie.title,
        movie.year,
        movie.region,
        movie.genre,
        movie.type,
        movie.category,
        movie.oneLine,
        movie.summary,
        (movie.tags || []).join(' ')
      ].join(' ').toLowerCase().indexOf(normalized) !== -1;
    }) : source.slice(0, 24);
    results.innerHTML = items.slice(0, 120).map(cardHtml).join('');
    if (title) {
      title.textContent = normalized ? '相关影片' : '推荐内容';
    }
    if (empty) {
      empty.hidden = items.length !== 0;
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
    initSearchPage();
  });
})();
