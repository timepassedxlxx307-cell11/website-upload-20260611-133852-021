(function () {
  var navButton = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.site-nav');

  if (navButton && nav) {
    navButton.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var currentSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === currentSlide);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === currentSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    showSlide(0);
    setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  var searchInput = document.querySelector('.movie-search');
  var yearFilter = document.querySelector('.movie-year-filter');
  var typeFilter = document.querySelector('.movie-type-filter');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
  var emptyState = document.querySelector('.empty-state');

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }

    var keyword = normalize(searchInput && searchInput.value);
    var year = yearFilter && yearFilter.value ? yearFilter.value : '';
    var type = typeFilter && typeFilter.value ? typeFilter.value : '';
    var visibleCount = 0;

    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-search'));
      var sameYear = !year || card.getAttribute('data-year') === year;
      var sameType = !type || card.getAttribute('data-type') === type;
      var sameKeyword = !keyword || text.indexOf(keyword) !== -1;
      var visible = sameYear && sameType && sameKeyword;
      card.style.display = visible ? '' : 'none';
      if (visible) {
        visibleCount += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visibleCount === 0);
    }
  }

  [searchInput, yearFilter, typeFilter].forEach(function (control) {
    if (control) {
      control.addEventListener('input', applyFilters);
      control.addEventListener('change', applyFilters);
    }
  });

  var player = document.querySelector('.movie-player');
  var layer = document.querySelector('.player-layer');

  if (player && layer) {
    var streamUrl = player.getAttribute('data-stream');
    var started = false;

    function attachStream() {
      if (!streamUrl || started) {
        return;
      }

      started = true;

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          lowLatencyMode: true,
          enableWorker: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(player);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          player.play().catch(function () {});
        });
      } else {
        player.src = streamUrl;
        player.play().catch(function () {});
      }
    }

    function startPlayer() {
      layer.classList.add('is-hidden');
      attachStream();
      player.setAttribute('controls', 'controls');
      if (!player.paused) {
        return;
      }
      player.play().catch(function () {});
    }

    layer.addEventListener('click', startPlayer);
    player.addEventListener('click', function () {
      if (!started) {
        startPlayer();
      }
    });
    player.addEventListener('play', function () {
      layer.classList.add('is-hidden');
    });
  }
})();
