(function () {
  'use strict';

  var rand = window.SceneKit.rand;
  var makeCanvas = window.SceneKit.makeCanvas;

function physics() {
    var kit, ctx, size, stageEl, balls, onClick;
    var GRAV = 520;
    var E = 0.92;
    var MAX = 40;

    function spawn(x, y) {
      if (balls.length >= MAX) return;
      var r = rand(8, 24);
      balls.push({
        x: x, y: y,
        vx: rand(-220, 220), vy: rand(-320, -60),
        r: r, m: r * r
      });
    }

    return {
      start: function (stage) {
        stageEl = stage;
        kit = makeCanvas(stage);
        ctx = kit.ctx;
        size = kit.size;
        balls = [];
        for (var i = 0; i < 16; i++) {
          spawn(rand(size.w * 0.15, size.w * 0.85), rand(size.h * 0.1, size.h * 0.5));
        }
        onClick = function (e) {
          var rect = kit.canvas.getBoundingClientRect();
          spawn(e.clientX - rect.left, e.clientY - rect.top);
        };
        stage.addEventListener('pointerdown', onClick);
      },

      frame: function (dt) {
        var w = size.w, h = size.h;
        ctx.fillStyle = 'rgba(6, 8, 18, 0.22)';
        ctx.fillRect(0, 0, w, h);

        for (var i = 0; i < balls.length; i++) {
          var b = balls[i];
          b.vy += GRAV * dt;
          b.x += b.vx * dt;
          b.y += b.vy * dt;
          if (b.x - b.r < 0) { b.x = b.r; b.vx = Math.abs(b.vx) * E; }
          if (b.x + b.r > w) { b.x = w - b.r; b.vx = -Math.abs(b.vx) * E; }
          if (b.y - b.r < 0) { b.y = b.r; b.vy = Math.abs(b.vy) * E; }
          if (b.y + b.r > h) {
            b.y = h - b.r;
            b.vy = -Math.abs(b.vy) * E;
            b.vx *= 0.985;
          }
        }

        for (var a = 0; a < balls.length; a++) {
          var ba = balls[a];
          for (var c = a + 1; c < balls.length; c++) {
            var bb = balls[c];
            var dx = bb.x - ba.x, dy = bb.y - ba.y;
            var dist = Math.sqrt(dx * dx + dy * dy);
            var minD = ba.r + bb.r;
            if (dist > 0.001 && dist < minD) {
              var nx = dx / dist, ny = dy / dist;
              var overlap = minD - dist;
              var total = ba.m + bb.m;
              ba.x -= nx * overlap * (bb.m / total);
              ba.y -= ny * overlap * (bb.m / total);
              bb.x += nx * overlap * (ba.m / total);
              bb.y += ny * overlap * (ba.m / total);
              var rvx = bb.vx - ba.vx, rvy = bb.vy - ba.vy;
              var vn = rvx * nx + rvy * ny;
              if (vn < 0) {
                var jImp = (-(1 + E) * vn) / (1 / ba.m + 1 / bb.m);
                ba.vx -= (jImp * nx) / ba.m;
                ba.vy -= (jImp * ny) / ba.m;
                bb.vx += (jImp * nx) / bb.m;
                bb.vy += (jImp * ny) / bb.m;
              }
            }
          }
        }

        ctx.globalCompositeOperation = 'lighter';
        for (var k = 0; k < balls.length; k++) {
          var p = balls[k];
          var hue = 190 + (p.r - 8) * 4;
          var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
          g.addColorStop(0, 'hsla(' + hue.toFixed(0) + ', 100%, 72%, 0.95)');
          g.addColorStop(0.6, 'hsla(' + hue.toFixed(0) + ', 100%, 60%, 0.35)');
          g.addColorStop(1, 'hsla(' + hue.toFixed(0) + ', 100%, 55%, 0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';
      },

      stop: function () {
        if (stageEl) {
          stageEl.removeEventListener('pointerdown', onClick);
          stageEl = null;
        }
        if (kit) kit.destroy();
        kit = null;
        balls = [];
      }
    };
  }

  window.Scenes.physics = physics;
})();
