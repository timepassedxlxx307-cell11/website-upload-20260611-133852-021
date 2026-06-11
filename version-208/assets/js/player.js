function initMoviePlayer(videoId, sourceUrl) {
  var video = document.getElementById(videoId);
  if (!video || !sourceUrl) {
    return;
  }

  var frame = video.closest("[data-player]");
  var button = frame ? frame.querySelector("[data-play-toggle]") : null;
  var hls = null;

  function hideButton() {
    if (button) {
      button.classList.add("is-hidden");
    }
  }

  function showButton() {
    if (button) {
      button.classList.remove("is-hidden");
    }
  }

  if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = sourceUrl;
  } else if (window.Hls && window.Hls.isSupported()) {
    hls = new window.Hls({
      enableWorker: true,
      lowLatencyMode: true
    });
    hls.loadSource(sourceUrl);
    hls.attachMedia(video);
    hls.on(window.Hls.Events.ERROR, function (_, data) {
      if (!data || !data.fatal) {
        return;
      }
      if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
        hls.startLoad();
      } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
        hls.recoverMediaError();
      } else {
        hls.destroy();
      }
    });
  } else {
    video.src = sourceUrl;
  }

  function togglePlay() {
    if (video.paused) {
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {});
      }
    } else {
      video.pause();
    }
  }

  if (button) {
    button.addEventListener("click", togglePlay);
  }

  video.addEventListener("play", hideButton);
  video.addEventListener("pause", showButton);
  video.addEventListener("ended", showButton);
}
