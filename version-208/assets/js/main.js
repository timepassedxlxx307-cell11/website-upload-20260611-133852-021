document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector(".menu-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  document.querySelectorAll(".mobile-panel a").forEach(function (link) {
    link.addEventListener("click", function () {
      document.body.classList.remove("nav-open");
      if (toggle) {
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  });

  document.querySelectorAll("[data-hero]").forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(target) {
      if (!slides.length) {
        return;
      }
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  });

  var searchInput = document.querySelector("#siteSearch");
  var typeFilter = document.querySelector("#typeFilter");
  var regionFilter = document.querySelector("#regionFilter");
  var yearFilter = document.querySelector("#yearFilter");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));
  var empty = document.querySelector(".search-empty");
  var form = document.querySelector("[data-search-form]");

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function applySearch() {
    var keyword = normalize(searchInput && searchInput.value);
    var typeValue = normalize(typeFilter && typeFilter.value);
    var regionValue = normalize(regionFilter && regionFilter.value);
    var yearValue = normalize(yearFilter && yearFilter.value);
    var visible = 0;

    cards.forEach(function (card) {
      var text = normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-type"),
        card.getAttribute("data-region"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-year"),
        card.textContent
      ].join(" "));
      var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
      var matchType = !typeValue || normalize(card.getAttribute("data-type")).indexOf(typeValue) !== -1;
      var matchRegion = !regionValue || normalize(card.getAttribute("data-region")).indexOf(regionValue) !== -1;
      var matchYear = !yearValue || normalize(card.getAttribute("data-year")) === yearValue;
      var showCard = matchKeyword && matchType && matchRegion && matchYear;
      card.style.display = showCard ? "" : "none";
      if (showCard) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle("is-visible", visible === 0);
    }
  }

  if (searchInput) {
    var params = new URLSearchParams(window.location.search);
    if (params.get("q")) {
      searchInput.value = params.get("q");
    }
    if (typeFilter && params.get("type")) {
      typeFilter.value = params.get("type");
    }
    if (regionFilter && params.get("region")) {
      regionFilter.value = params.get("region");
    }
    if (yearFilter && params.get("year")) {
      yearFilter.value = params.get("year");
    }
  }

  [searchInput, typeFilter, regionFilter, yearFilter].forEach(function (field) {
    if (field) {
      field.addEventListener("input", applySearch);
      field.addEventListener("change", applySearch);
    }
  });

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      applySearch();
    });
  }

  applySearch();
});
