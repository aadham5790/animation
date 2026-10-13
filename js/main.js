(function () {
  'use strict';

  var sceneEls = Array.prototype.slice.call(document.querySelectorAll('.scene'));
  var dotsWrap = document.querySelector('.dots');
  var progressBar = document.querySelector('.progress-bar');
  var AUTO_MS = 6000;
  var IDLE_MS = 8000;
  var reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');

  var current = null;
  var currentIndex = -1;
  var lastTime = 0;
  var elapsed = 0;
  var autoPaused = false;
  var lastInteraction = 0;
  var progGuardUntil = 0;
  var reduced = reduceMQ.matches;

  var dots = sceneEls.map(function (el, i) {
    var dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'dot';
    dot.tabIndex = -1;
    dot.setAttribute('aria-hidden', 'true');
    dot.addEventListener('click', function () {
      engaged();
      goTo(i);
    });
    dotsWrap.appendChild(dot);
    return dot;
  });

  var voteWrap = document.querySelector('.vote');
  var voteBtns = Array.prototype.slice.call(document.querySelectorAll('.vote-btn'));
  var currentSceneKey = null;
  var scenePending = {};

  function paintVote(counts) {
    voteBtns.forEach(function (btn) {
      var type = btn.getAttribute('data-vote');
      var n = counts && counts[type] ? counts[type] : 0;
      var span = btn.querySelector('.vote-count');
      if (span) span.textContent = String(n);
      btn.classList.toggle('is-active', n > 0);
      btn.setAttribute('aria-pressed', n > 0 ? 'true' : 'false');
    });
  }

  function paintVoteForScene(key) {
    if (key && window.Votes) {
      voteWrap.classList.remove('is-hidden');
      paintVote(window.Votes.counts(key));
    } else {
      voteWrap.classList.add('is-hidden');
      paintVote(null);
    }
  }

  voteBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!currentSceneKey || !window.Votes) return;
      var type = btn.getAttribute('data-vote');
      var current = window.Votes.counts(currentSceneKey);
      var delta = current[type] > 0 ? -1 : 1;
      var next = window.Votes.adjust(currentSceneKey, type, delta);
      paintVote(next);
      if (delta > 0) {
        btn.classList.remove('is-pop');
        void btn.offsetWidth;
        btn.classList.add('is-pop');
      }
    });
  });

  paintVoteForScene(null);

  function ensureScene(name, cb) {
    if (window.Scenes[name]) {
      cb();
      return;
    }
    if (scenePending[name]) {
      scenePending[name].push(cb);
      return;
    }
    scenePending[name] = [cb];
    var s = document.createElement('script');
    s.src = 'js/scenes/' + name + '.js';
    s.onload = function () {
      var queue = scenePending[name];
      scenePending[name] = null;
      for (var i = 0; i < queue.length; i++) queue[i]();
    };
    s.onerror = function () {
      scenePending[name] = null;
    };
    document.body.appendChild(s);
  }

  function engaged() {
    autoPaused = true;
    lastInteraction = performance.now();
  }

  function resetTimer() {
    elapsed = 0;
    progressBar.style.transform = 'scaleX(0)';
  }

  function setActive(i) {
    if (i === currentIndex) {
      resetTimer();
      return;
    }
    if (current) current.stop();
    current = null;
    currentIndex = i;
    var el = sceneEls[i];
    var name = el.getAttribute('data-scene');
    currentSceneKey = el.hasAttribute('data-name') ? name : null;
    paintVoteForScene(currentSceneKey);
    for (var k = 0; k < dots.length; k++) {
      dots[k].classList.toggle('is-active', k === i);
    }
    resetTimer();
    ensureScene(name, function () {
      if (currentIndex !== i || !window.Scenes[name]) return;
      current = window.Scenes[name]();
      current.start(el.querySelector('.stage'));
      if (reduced && current.frame) current.frame(0, 0);
      var nextName = sceneEls[(i + 1) % sceneEls.length].getAttribute('data-scene');
      ensureScene(nextName, function () {});
    });
  }

  function goTo(i) {
    var n = sceneEls.length;
    var idx = ((i % n) + n) % n;
    progGuardUntil = performance.now() + 900;
    sceneEls[idx].scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    setActive(idx);
  }

  function detectActive() {
    var mid = window.innerHeight / 2;
    var best = 0;
    var bestDist = Infinity;
    for (var i = 0; i < sceneEls.length; i++) {
      var r = sceneEls[i].getBoundingClientRect();
      var d = Math.abs(r.top + r.height / 2 - mid);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    }
    return best;
  }

  function loop(now) {
    window.requestAnimationFrame(loop);
    if (!lastTime) lastTime = now;
    var dms = Math.min(now - lastTime, 50);
    lastTime = now;
    var dt = dms / 1000;

    var idx = detectActive();
    if (idx !== currentIndex) setActive(idx);
    if (current && current.frame) current.frame(dt, now / 1000);

    if (autoPaused && !reduced) {
      if (now - lastInteraction > IDLE_MS) {
        autoPaused = false;
        resetTimer();
      }
    } else if (!reduced) {
      elapsed += dms;
      progressBar.style.transform = 'scaleX(' + Math.min(elapsed / AUTO_MS, 1).toFixed(4) + ')';
      if (elapsed >= AUTO_MS) goTo(currentIndex + 1);
    }
  }

  ['wheel', 'touchstart', 'pointerdown', 'keydown'].forEach(function (type) {
    window.addEventListener(type, engaged, { passive: true });
  });

  window.addEventListener('scroll', function () {
    if (performance.now() > progGuardUntil) engaged();
  }, { passive: true });

  window.addEventListener('keydown', function (e) {
    var k = e.key;
    if (k === 'ArrowDown' || k === 'PageDown' || k === ' ') {
      e.preventDefault();
      engaged();
      goTo(currentIndex + 1);
    } else if (k === 'ArrowUp' || k === 'PageUp') {
      e.preventDefault();
      engaged();
      goTo(currentIndex - 1);
    } else if (k === 'Home') {
      e.preventDefault();
      engaged();
      goTo(0);
    } else if (k === 'End') {
      e.preventDefault();
      engaged();
      goTo(sceneEls.length - 1);
    }
  });

  reduceMQ.addEventListener('change', function (e) {
    reduced = e.matches;
    resetTimer();
    if (reduced && current && current.frame) current.frame(0, 0);
  });

  setActive(detectActive());
  window.requestAnimationFrame(loop);
})();
