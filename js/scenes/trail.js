(function () {
  'use strict';

  var rand = window.SceneKit.rand;
  var makeCanvas = window.SceneKit.makeCanvas;

function trail() {
    var ctx, size, stageEl, parts, pointer, lastMove, virtual, kit, onMove, onClick;

    return {
      start: function (stage) {
        stageEl = stage;
        kit = makeCanvas(stage);
        ctx = kit.ctx;
        size = kit.size;
        parts = [];
        pointer = { x: size.w / 2, y: size.h / 2 };
        lastMove = -1e4;
        virtual = true;

        onMove = function (e) {
          var rect = kit.canvas.getBoundingClientRect();
          pointer.x = e.clientX - rect.left;
          pointer.y = e.clientY - rect.top;
          lastMove = performance.now();
          virtual = false;
        };

        onClick = function (e) {
          var rect = kit.canvas.getBoundingClientRect();
          var x = e.clientX - rect.left, y = e.clientY - rect.top;
          for (var i = 0; i < 26; i++) {
            var ang = (Math.PI * 2 * i) / 26 + rand(-0.2, 0.2);
            var sp = rand(60, 260);
            parts.push({
              x: x, y: y, px: x, py: y,
              vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp,
              life: 1, decay: rand(0.6, 1.2), w: rand(1, 2.6)
            });
          }
        };

        stage.addEventListener('pointermove', onMove);
        stage.addEventListener('pointerdown', onClick);
      },

      frame: function (dt, t) {
        var w = size.w, h = size.h;
        ctx.clearRect(0, 0, w, h);
        if (virtual || performance.now() - lastMove > 1600) {
          pointer.x = w / 2 + Math.sin(t * 0.0006) * w * 0.33;
          pointer.y = h / 2 + Math.sin(t * 0.0009 + 1.3) * h * 0.3;
        }
        var spawn = Math.min(4, Math.max(1, Math.round(dt * 90)));
        for (var i = 0; i < spawn; i++) {
          var j = 6;
          parts.push({
            x: pointer.x + rand(-j, j),
            y: pointer.y + rand(-j, j),
            px: pointer.x, py: pointer.y,
            vx: rand(-30, 30), vy: rand(-30, 30),
            life: 1, decay: rand(0.8, 1.6), w: rand(1.2, 3)
          });
        }
        ctx.lineCap = 'round';
        var hueBase = 200 + 60 * Math.sin(t * 0.0004);
        for (var k = parts.length - 1; k >= 0; k--) {
          var p = parts[k];
          p.px = p.x;
          p.py = p.y;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vx *= 0.98;
          p.vy *= 0.98;
          p.vy += 12 * dt;
          p.life -= p.decay * dt;
          if (p.life <= 0) {
            parts.splice(k, 1);
            continue;
          }
          var hue = (hueBase + 60).toFixed(0);
          var light = (55 + 25 * p.life).toFixed(0);
          ctx.strokeStyle = 'hsla(' + hue + ', 100%, ' + light + '%, ' + (p.life * 0.75).toFixed(3) + ')';
          ctx.lineWidth = p.w * p.life;
          ctx.beginPath();
          ctx.moveTo(p.px, p.py);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }
        if (parts.length > 500) parts.splice(0, parts.length - 500);
      },

      stop: function () {
        if (stageEl) {
          stageEl.removeEventListener('pointermove', onMove);
          stageEl.removeEventListener('pointerdown', onClick);
          stageEl = null;
        }
        if (kit) kit.destroy();
        kit = null;
        parts = [];
      }
    };
  }

  window.Scenes.trail = trail;
})();
