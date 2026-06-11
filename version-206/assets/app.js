(function () {
  var toggle = document.querySelector('[data-mobile-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var active = 0;
    var timer;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === active);
      });
    }

    function startHero() {
      timer = window.setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }

    function restartHero() {
      window.clearInterval(timer);
      startHero();
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        restartHero();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(active - 1);
        restartHero();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(active + 1);
        restartHero();
      });
    }

    startHero();
  }

  var filterList = document.querySelector('[data-filter-list]');

  if (filterList) {
    var input = document.querySelector('[data-filter-input]');
    var typeSelect = document.querySelector('[data-filter-type]');
    var yearSelect = document.querySelector('[data-filter-year]');
    var categorySelect = document.querySelector('[data-filter-category]');
    var emptyState = document.querySelector('[data-empty-state]');
    var cards = Array.prototype.slice.call(filterList.querySelectorAll('.movie-card, .rank-row'));
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (query && input) {
      input.value = query;
    }

    function includesValue(text, value) {
      return String(text || '').toLowerCase().indexOf(String(value || '').toLowerCase()) !== -1;
    }

    function applyFilters() {
      var term = input ? input.value.trim().toLowerCase() : '';
      var type = typeSelect ? typeSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var category = categorySelect ? categorySelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre')
        ].join(' ').toLowerCase();
        var matchesTerm = !term || includesValue(text, term);
        var matchesType = !type || includesValue(card.getAttribute('data-type'), type);
        var matchesYear = !year || card.getAttribute('data-year') === year;
        var matchesCategory = !category || card.getAttribute('data-category') === category;
        var isVisible = matchesTerm && matchesType && matchesYear && matchesCategory;

        card.style.display = isVisible ? '' : 'none';
        if (isVisible) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('visible', visible === 0);
      }
    }

    [input, typeSelect, yearSelect, categorySelect].forEach(function (item) {
      if (item) {
        item.addEventListener('input', applyFilters);
        item.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }

  function startPlayback(player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('[data-stream]');

    if (!video || !overlay) {
      return;
    }

    var url = overlay.getAttribute('data-stream');

    overlay.classList.add('is-hidden');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (video.src !== url) {
        video.src = url;
      }
      video.play().catch(function () {});
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (!video._hlsInstance) {
        video._hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        video._hlsInstance.loadSource(url);
        video._hlsInstance.attachMedia(video);
        video._hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.play().catch(function () {});
      }
      return;
    }

    if (video.src !== url) {
      video.src = url;
    }

    video.play().catch(function () {});
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (player) {
    var overlay = player.querySelector('[data-stream]');
    var video = player.querySelector('video');

    if (overlay) {
      overlay.addEventListener('click', function () {
        startPlayback(player);
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!video.src) {
          startPlayback(player);
        }
      });
    }
  });
})();
