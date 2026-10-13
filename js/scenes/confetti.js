(function () {
  'use strict';

  var rand = window.SceneKit.rand;
  var makeCanvas = window.SceneKit.makeCanvas;

function confetti() {
    var ctx, size, stageEl, parts, timer, onClick, kit;

    var palette = ['#ff5d8f', '#ffd166', '#06d6a0', '#4cc9f0', '#b388ff', '#ff8fab'];

    function burst(x, y, n) {
      for (var i = 0; i < n; i++) {
        var a = rand(-Math.PI * 0.85, -Math.PI * 0.15);
        var sp = rand(200, 620);
        parts.push({
          x: x, y: y,
          vx: Math.cos(a) * sp * rand(0.6, 1.2),
          vy: Math.sin(a) * sp,
          rot: rand(0, Math.PI * 2),
          vr: rand(-8, 8),
          w: rand(5, 10), h: rand(8, 16),
          color: palette[(Math.random() * palette.length) | 0],
          life: 1, decay: rand(0.25, 0.45)
        });
      }
    }

    return {
      start: function (stage) {
        stageEl = stage;
        kit = makeCanvas(stage);
        ctx = kit.ctx;
        size = kit.size;
        parts = [];
        timer = 0.3;

        onClick = function (e) {
          var rect = kit.canvas.getBoundingClientRect();
          burst(e.clientX - rect.left, e.clientY - rect.top, 60);
        };
        stage.addEventListener('pointerdown', onClick);
      },

      frame: function (dt) {
        var w = size.w, h = size.h;
        ctx.clearRect(0, 0, w, h);
        timer -= dt;
        if (timer <= 0) {
          timer = rand(0.5, 1.1);
          burst(rand(w * 0.15, w * 0.85), h * rand(0.75, 0.95), 50);
        }
        for (var i = parts.length - 1; i >= 0; i--) {
          var p = parts[i];
          p.vy += 700 * dt;
          p.vx *= 0.99;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.rot += p.vr * dt;
          p.life -= p.decay * dt;
          if (p.life <= 0 || p.y > h + 40) {
            parts.splice(i, 1);
            continue;
          }
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 1.4));
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        }
      },

      stop: function () {
        if (stageEl) stageEl.removeEventListener('pointerdown', onClick);
        if (kit) kit.destroy();
        kit = null;
        parts = [];
      }
    };
  }

  window.Scenes.confetti = confetti;
})();
