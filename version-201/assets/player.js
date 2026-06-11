import { H as Hls } from './hls-vendor-dru42stk.js';

export function initMoviePlayer(source) {
  var video = document.querySelector('[data-player]');
  var shell = document.querySelector('[data-player-shell]');
  var trigger = document.querySelector('[data-play-trigger]');
  var attached = false;
  var hls = null;

  if (!video || !shell || !trigger || !source) {
    return;
  }

  function attachSource() {
    if (attached) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      attached = true;
      return;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      attached = true;
      return;
    }

    video.src = source;
    attached = true;
  }

  function startPlayback(event) {
    if (event) {
      event.preventDefault();
    }

    attachSource();
    shell.classList.add('is-playing');
    video.controls = true;

    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        shell.classList.remove('is-playing');
      });
    }
  }

  trigger.addEventListener('click', startPlayback);

  video.addEventListener('play', function () {
    shell.classList.add('is-playing');
  });

  video.addEventListener('error', function () {
    shell.classList.remove('is-playing');
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}
