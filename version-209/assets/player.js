(function () {
  function attachPlayer(shell) {
    var video = shell.querySelector("video");
    var cover = shell.querySelector("[data-play-cover]");
    var buttons = Array.prototype.slice.call(shell.querySelectorAll("[data-play-button]"));
    var url = shell.getAttribute("data-video") || "";
    var loaded = false;
    var hls = null;

    function start() {
      if (!video || !url) {
        return;
      }

      if (!loaded) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(url);
          hls.attachMedia(video);
        } else {
          video.src = url;
        }
        loaded = true;
      }

      if (cover) {
        cover.classList.add("is-hidden");
      }

      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          if (cover) {
            cover.classList.remove("is-hidden");
          }
        });
      }
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", start);
    });

    if (cover) {
      cover.addEventListener("click", start);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (!loaded || video.paused) {
          start();
        }
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(attachPlayer);
    });
  } else {
    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(attachPlayer);
  }
})();
