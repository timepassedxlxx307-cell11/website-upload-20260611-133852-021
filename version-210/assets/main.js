(function () {
    var body = document.body;
    var menuToggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
            body.classList.toggle('menu-open');
        });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var active = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle('is-active', current === active);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle('is-active', current === active);
            });
        }

        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        show(0);
        start();
    });

    document.querySelectorAll('[data-filter-area]').forEach(function (area) {
        var input = area.querySelector('[data-filter-search]');
        var selects = Array.prototype.slice.call(area.querySelectorAll('[data-filter-select]'));
        var cards = Array.prototype.slice.call(area.querySelectorAll('.movie-card, .rank-row'));
        var emptyTip = area.querySelector('[data-empty-tip]') || document.querySelector('[data-empty-tip]');

        function getSelectValue(name) {
            var select = area.querySelector('[data-filter-select="' + name + '"]');
            return select ? select.value : 'all';
        }

        function runFilter() {
            var query = input ? input.value.trim().toLocaleLowerCase() : '';
            var category = getSelectValue('category');
            var type = getSelectValue('type');
            var year = getSelectValue('year');
            var visible = 0;

            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search') || '').toLocaleLowerCase();
                var cardType = card.getAttribute('data-type') || '';
                var cardYear = Number(card.getAttribute('data-year') || 0);
                var cardCategory = card.getAttribute('data-category') || '';
                var matchQuery = !query || text.indexOf(query) !== -1;
                var matchCategory = category === 'all' || cardCategory === category;
                var matchType = type === 'all' || cardType.indexOf(type) !== -1;
                var matchYear = year === 'all' || cardYear >= Number(year);
                var matched = matchQuery && matchCategory && matchType && matchYear;

                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });

            if (emptyTip) {
                emptyTip.classList.toggle('is-show', visible === 0);
            }
        }

        if (input) {
            input.addEventListener('input', runFilter);
        }
        selects.forEach(function (select) {
            select.addEventListener('change', runFilter);
        });
        runFilter();
    });

    document.querySelectorAll('[data-player]').forEach(function (panel) {
        var video = panel.querySelector('video');
        var cover = panel.querySelector('[data-play-trigger]');
        var streamUrl = panel.getAttribute('data-video-url') || '';
        var hlsInstance = null;
        var loaded = false;

        function attach() {
            if (!video || !streamUrl || loaded) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
                loaded = true;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
                loaded = true;
                return;
            }

            video.src = streamUrl;
            loaded = true;
        }

        function play() {
            attach();
            if (cover) {
                cover.classList.add('is-hidden');
            }
            video.controls = true;
            video.play().catch(function () {});
        }

        if (cover) {
            cover.addEventListener('click', play);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!loaded) {
                    play();
                }
            });
            video.addEventListener('play', function () {
                if (cover) {
                    cover.classList.add('is-hidden');
                }
            });
        }
    });
})();
