(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function getQuery(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || "";
  }

  function escapeText(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initMobileMenu() {
    var button = document.querySelector("[data-menu-button]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
      button.setAttribute("aria-expanded", menu.classList.contains("is-open") ? "true" : "false");
    });
  }

  function initHeaderSearch() {
    document.querySelectorAll("[data-site-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input");
        var value = input ? input.value.trim() : "";
        if (value) {
          window.location.href = "./search.html?q=" + encodeURIComponent(value);
        }
      });
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(index);
        start();
      });
    });

    show(0);
    start();
  }

  function initGridFilters() {
    document.querySelectorAll("[data-filter-input]").forEach(function (input) {
      var target = document.querySelector(input.getAttribute("data-filter-input"));
      if (!target) {
        return;
      }
      input.addEventListener("input", function () {
        var keyword = input.value.trim().toLowerCase();
        target.querySelectorAll("[data-card]").forEach(function (card) {
          var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
          card.classList.toggle("hidden-by-filter", keyword && text.indexOf(keyword) === -1);
        });
      });
    });
  }

  function cardTemplate(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return '<span class="pill light">' + escapeText(tag) + '</span>';
    }).join("");
    return '' +
      '<article class="movie-card" data-card data-search="' + escapeText([item.title, item.region, item.type, item.year, item.genre, (item.tags || []).join(" ")].join(" ")) + '">' +
        '<a class="movie-cover" href="' + escapeText(item.url) + '">' +
          '<img src="' + escapeText(item.cover) + '" alt="' + escapeText(item.title) + '" loading="lazy">' +
          '<span class="cover-shade"></span>' +
          '<span class="card-badge">' + escapeText(item.category) + '</span>' +
          '<span class="play-chip">▶</span>' +
        '</a>' +
        '<div class="card-body">' +
          '<h3 class="card-title"><a href="' + escapeText(item.url) + '">' + escapeText(item.title) + '</a></h3>' +
          '<div class="card-meta"><span>' + escapeText(item.year) + '</span><span>' + escapeText(item.region) + '</span><span>' + escapeText(item.type) + '</span></div>' +
          '<p class="card-desc">' + escapeText(item.description) + '</p>' +
          '<div class="card-tags">' + tags + '</div>' +
        '</div>' +
      '</article>';
  }

  function initSearchPage() {
    var grid = document.querySelector("[data-search-results]");
    if (!grid || !window.MOVIES_INDEX) {
      return;
    }
    var input = document.querySelector("[data-search-input]");
    var select = document.querySelector("[data-search-category]");
    var empty = document.querySelector("[data-search-empty]");
    var query = getQuery("q");
    if (input) {
      input.value = query;
    }

    function render() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var category = select ? select.value : "";
      var results = window.MOVIES_INDEX.filter(function (item) {
        var haystack = [item.title, item.region, item.type, item.year, item.genre, item.description, (item.tags || []).join(" ")].join(" ").toLowerCase();
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchCategory = !category || item.category === category;
        return matchKeyword && matchCategory;
      }).slice(0, 180);
      grid.innerHTML = results.map(cardTemplate).join("");
      if (empty) {
        empty.style.display = results.length ? "none" : "block";
      }
    }

    if (input) {
      input.addEventListener("input", render);
    }
    if (select) {
      select.addEventListener("change", render);
    }
    render();
  }

  window.initializeMoviePlayer = function (source) {
    var video = document.getElementById("movie-player");
    var overlay = document.getElementById("play-overlay");
    var errorBox = document.getElementById("player-error");
    if (!video || !source) {
      return;
    }
    var loaded = false;
    var hls = null;

    function showError(message) {
      if (errorBox) {
        errorBox.textContent = message;
        errorBox.classList.add("is-visible");
      }
    }

    function loadSource() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showError("视频加载失败，请稍后重试");
          }
        });
      } else {
        showError("您的浏览器不支持HLS视频播放");
      }
    }

    function startPlayback() {
      loadSource();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener("click", startPlayback);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      }
    });
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  ready(function () {
    initMobileMenu();
    initHeaderSearch();
    initHero();
    initGridFilters();
    initSearchPage();
  });
})();
