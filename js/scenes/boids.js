(function () {
  'use strict';

  var rand = window.SceneKit.rand;
  var makeCanvas = window.SceneKit.makeCanvas;

function boids() {
    var kit, ctx, size, stageEl, agents, onMove, pointer = { x: -1e4, y: -1e4 };
    var MAXS = 155;

    return {
      start: function (stage) {
        stageEl = stage;
        kit = makeCanvas(stage);
        ctx = kit.ctx;
        size = kit.size;
        agents = [];
        for (var i = 0; i < 70; i++) {
          agents.push({
            x: rand(0, size.w), y: rand(0, size.h),
            vx: rand(-MAXS, MAXS), vy: rand(-MAXS, MAXS),
            px: 0, py: 0
          });
        }
        agents.forEach(function (a) { a.px = a.x; a.py = a.y; });
        pointer = { x: -1e4, y: -1e4 };
        onMove = function (e) {
          var rect = kit.canvas.getBoundingClientRect();
          pointer.x = e.clientX - rect.left;
          pointer.y = e.clientY - rect.top;
        };
        stage.addEventListener('pointermove', onMove);
      },

      frame: function (dt, t) {
        var w = size.w, h = size.h;
        ctx.fillStyle = 'rgba(6, 12, 14, 0.16)';
        ctx.fillRect(0, 0, w, h);
        var n = agents.length;

        for (var i = 0; i < n; i++) {
          var a = agents[i];
          var sx = 0, sy = 0, ax = 0, ay = 0, kx = 0, ky = 0, cnt = 0;
          for (var j = 0; j < n; j++) {
            if (j === i) continue;
            var b = agents[j];
            var dx = b.x - a.x, dy = b.y - a.y;
            var d2 = dx * dx + dy * dy;
            if (d2 < 90 * 90) {
              ax += b.vx; ay += b.vy;
              kx += b.x; ky += b.y;
              cnt++;
              if (d2 < 30 * 30 && d2 > 0.01) {
                var d = Math.sqrt(d2);
                sx -= dx / d;
                sy -= dy / d;
              }
            }
          }
          if (cnt > 0) {
            a.vx += ((ax / cnt - a.vx) * 0.5 + sx * 60 + (kx / cnt - a.x) * 0.5) * dt;
            a.vy += ((ay / cnt - a.vy) * 0.5 + sy * 60 + (ky / cnt - a.y) * 0.5) * dt;
          }
          var pdx = pointer.x - a.x, pdy = pointer.y - a.y;
          var pd2 = pdx * pdx + pdy * pdy;
          if (pd2 < 240 * 240 && pd2 > 1) {
            var pd = Math.sqrt(pd2);
            var f = (1 - pd / 240) * 120 * dt;
            a.vx += (pdx / pd) * f;
            a.vy += (pdy / pd) * f;
          }
          var sp = Math.sqrt(a.vx * a.vx + a.vy * a.vy);
          if (sp > MAXS) {
            a.vx = (a.vx / sp) * MAXS;
            a.vy = (a.vy / sp) * MAXS;
          }
          a.px = a.x;
          a.py = a.y;
          a.x += a.vx * dt;
          a.y += a.vy * dt;
          if (a.x < 0) { a.x += w; a.px = a.x; }
          if (a.x > w) { a.x -= w; a.px = a.x; }
          if (a.y < 0) { a.y += h; a.py = a.y; }
          if (a.y > h) { a.y -= h; a.py = a.y; }
        }

        ctx.globalCompositeOperation = 'lighter';
        ctx.lineWidth = 1.2;
        for (var q = 0; q < n; q++) {
          var g = agents[q];
          var hue = 150 + 90 * (0.5 + 0.5 * Math.sin(t * 0.0004 + q * 0.35));
          ctx.strokeStyle = 'hsla(' + hue.toFixed(0) + ', 95%, 62%, 0.55)';
          ctx.beginPath();
          ctx.moveTo(g.px, g.py);
          ctx.lineTo(g.x, g.y);
          ctx.stroke();
          var ang = Math.atan2(g.vy, g.vx);
          ctx.fillStyle = 'hsla(' + hue.toFixed(0) + ', 100%, 78%, 0.9)';
          ctx.beginPath();
          ctx.moveTo(g.x + Math.cos(ang) * 5, g.y + Math.sin(ang) * 5);
          ctx.lineTo(g.x + Math.cos(ang + 2.5) * 4, g.y + Math.sin(ang + 2.5) * 4);
          ctx.lineTo(g.x + Math.cos(ang - 2.5) * 4, g.y + Math.sin(ang - 2.5) * 4);
          ctx.closePath();
          ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';
      },

      stop: function () {
        if (stageEl) {
          stageEl.removeEventListener('pointermove', onMove);
          stageEl = null;
        }
        if (kit) kit.destroy();
        kit = null;
        agents = [];
      }
    };
  }

  window.Scenes.boids = boids;
})();
