(function() {
  const menuButton = document.querySelector("[data-menu-toggle]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function() {
      mobileMenu.classList.toggle("is-open");
    });
  }

  const hero = document.querySelector("[data-hero]");

  if (hero) {
    const slides = Array.from(hero.querySelectorAll(".hero-slide"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const prev = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    let current = 0;
    let timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function schedule() {
      window.clearInterval(timer);
      timer = window.setInterval(function() {
        showSlide(current + 1);
      }, 5800);
    }

    dots.forEach(function(dot) {
      dot.addEventListener("click", function() {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        schedule();
      });
    });

    if (prev) {
      prev.addEventListener("click", function() {
        showSlide(current - 1);
        schedule();
      });
    }

    if (next) {
      next.addEventListener("click", function() {
        showSlide(current + 1);
        schedule();
      });
    }

    schedule();
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  document.querySelectorAll("[data-filter-root]").forEach(function(root) {
    const searchInput = root.querySelector("[data-card-search]");
    const filters = Array.from(root.querySelectorAll("[data-filter]"));
    const cards = Array.from(root.querySelectorAll(".searchable-card"));
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q");

    if (query && searchInput) {
      searchInput.value = query;
    }

    function applyFilter() {
      const q = normalize(searchInput ? searchInput.value : "");
      const filterValues = filters.map(function(filter) {
        return {
          key: filter.getAttribute("data-filter"),
          value: normalize(filter.value)
        };
      });

      cards.forEach(function(card) {
        const haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-category")
        ].join(" "));

        const textMatch = !q || haystack.indexOf(q) !== -1;
        const selectMatch = filterValues.every(function(item) {
          if (!item.value) {
            return true;
          }
          const dataValue = normalize(card.getAttribute("data-" + item.key));
          return dataValue.indexOf(item.value) !== -1 || haystack.indexOf(item.value) !== -1;
        });

        card.classList.toggle("is-hidden", !(textMatch && selectMatch));
      });
    }

    if (searchInput) {
      searchInput.addEventListener("input", applyFilter);
    }

    filters.forEach(function(filter) {
      filter.addEventListener("change", applyFilter);
    });

    applyFilter();
  });
})();
