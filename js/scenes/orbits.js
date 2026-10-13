(function () {
  'use strict';

function orbits() {
    var stageEl, wrap, ringEls, dotsEls, core, pointer, onMove, onResize;

    var ringDefs = [
      { r: 0.16, dots: 2, speed: 0.12, tilt: 68, hue: 190 },
      { r: 0.25, dots: 3, speed: -0.18, tilt: 74, hue: 280 },
      { r: 0.34, dots: 2, speed: 0.22, tilt: 62, hue: 330 },
      { r: 0.43, dots: 4, speed: -0.14, tilt: 78, hue: 150 }
    ];

    function layout() {
      var scale = Math.min(stageEl.clientWidth, stageEl.clientHeight);
      for (var i = 0; i < ringEls.length; i++) {
        var r = Math.round(scale * ringDefs[i].r);
        var ring = ringEls[i];
        ring.style.width = r * 2 + 'px';
        ring.style.height = r * 2 + 'px';
        ring.style.marginLeft = -r + 'px';
        ring.style.marginTop = -r + 'px';
        var dots = dotsEls[i];
        for (var k = 0; k < dots.length; k++) {
          dots[k]._r = r;
        }
      }
    }

    return {
      start: function (stage) {
        stageEl = stage;
        wrap = document.createElement('div');
        wrap.className = 'orbits';
        ringEls = [];
        dotsEls = [];

        for (var i = 0; i < ringDefs.length; i++) {
          var d = ringDefs[i];
          var ring = document.createElement('div');
          ring.className = 'orbit-ring';
          ring.style.borderColor = 'hsla(' + d.hue + ', 90%, 70%, 0.16)';
          var dots = [];
          for (var k = 0; k < d.dots; k++) {
            var dot = document.createElement('div');
            dot.className = 'orbit-dot';
            var s = 9 + (4 - i) * 1.5;
            dot.style.width = s + 'px';
            dot.style.height = s + 'px';
            dot.style.marginLeft = -s / 2 + 'px';
            dot.style.marginTop = -s / 2 + 'px';
            dot.style.background = 'hsla(' + d.hue + ', 95%, 68%, 0.95)';
            dot.style.boxShadow = '0 0 ' + (8 + i * 3) + 'px hsla(' + d.hue + ', 95%, 65%, 0.9)';
            dot._angle = (Math.PI * 2 * k) / d.dots;
            dots.push(dot);
            ring.appendChild(dot);
          }
          ringEls.push(ring);
          dotsEls.push(dots);
          wrap.appendChild(ring);
        }

        core = document.createElement('div');
        core.className = 'orbit-core';
        wrap.appendChild(core);
        stage.appendChild(wrap);

        pointer = { x: 0, y: 0 };
        onMove = function (e) {
          pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
          pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
        };
        window.addEventListener('pointermove', onMove);
        onResize = function () {
          layout();
        };
        window.addEventListener('resize', onResize);
        layout();
      },

      frame: function (dt, t) {
        wrap.style.transform = 'rotateX(' + (-pointer.y * 8).toFixed(2) + 'deg) rotateY(' + (pointer.x * 10).toFixed(2) + 'deg)';
        for (var i = 0; i < ringEls.length; i++) {
          var d = ringDefs[i];
          var a = t * d.speed;
          var tilt = d.tilt + 4 * Math.sin(t * 0.0002 + i);
          ringEls[i].style.transform = 'rotateX(' + tilt.toFixed(2) + 'deg) rotateZ(' + a.toFixed(4) + 'rad)';
          var dots = dotsEls[i];
          for (var k = 0; k < dots.length; k++) {
            var dot = dots[k];
            dot.style.transform = 'rotateZ(' + dot._angle.toFixed(4) + 'rad) translateX(' + dot._r + 'px)';
          }
        }
        var pulse = 1 + 0.12 * Math.sin(t * 1.4);
        core.style.transform = 'translate(-50%, -50%) scale(' + pulse.toFixed(3) + ')';
        core.style.opacity = (0.75 + 0.2 * Math.sin(t * 1.1)).toFixed(3);
      },

      stop: function () {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('resize', onResize);
        if (wrap) wrap.remove();
        wrap = null;
        ringEls = [];
        dotsEls = [];
      }
    };
  }

  window.Scenes.orbits = orbits;
})();
