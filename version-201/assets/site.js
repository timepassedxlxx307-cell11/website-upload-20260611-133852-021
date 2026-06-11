(function () {
  var mobileToggle = document.querySelector('[data-mobile-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        restart();
      });
    }

    restart();
  }

  var searchInput = document.querySelector('[data-search-input]');
  var resultCount = document.querySelector('[data-result-count]');
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
  var currentFilter = '';

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilter() {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-item]'));
    var query = searchInput ? normalize(searchInput.value) : '';
    var filter = normalize(currentFilter);
    var visible = 0;

    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-text'));
      var matchesQuery = !query || text.indexOf(query) !== -1;
      var matchesFilter = !filter || text.indexOf(filter) !== -1;
      var shouldShow = matchesQuery && matchesFilter;

      card.classList.toggle('is-hidden', !shouldShow);

      if (shouldShow) {
        visible += 1;
      }
    });

    if (resultCount) {
      resultCount.textContent = '当前显示 ' + visible + ' 部影片';
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilter);
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      filterButtons.forEach(function (item) {
        item.classList.remove('active');
      });
      button.classList.add('active');
      currentFilter = button.getAttribute('data-filter') || '';
      applyFilter();
    });
  });

  applyFilter();
})();
