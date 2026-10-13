(function () {
  'use strict';

  var rand = window.SceneKit.rand;
  var makeCanvas = window.SceneKit.makeCanvas;

function particles() {
    var ctx, size, ps, pointer, kit, stageEl, onMove, onLeave;

    return {
      start: function (stage) {
        stageEl = stage;
        kit = makeCanvas(stage);
        ctx = kit.ctx;
        size = kit.size;
        var count = Math.max(40, Math.min(110, Math.round((size.w * size.h) / 16000)));
        ps = [];
        for (var i = 0; i < count; i++) {
          ps.push({
            x: Math.random() * size.w,
            y: Math.random() * size.h,
            vx: rand(-30, 30),
            vy: rand(-30, 30),
            r: rand(1, 2.6)
          });
        }
        pointer = { x: 0, y: 0, active: false };

        onMove = function (e) {
          var rect = kit.canvas.getBoundingClientRect();
          pointer.x = e.clientX - rect.left;
          pointer.y = e.clientY - rect.top;
          pointer.active = true;
        };

        onLeave = function () {
          pointer.active = false;
        };

        stage.addEventListener('pointermove', onMove);
        stage.addEventListener('pointerleave', onLeave);
      },
      frame: function (dt) {
        var w = size.w, h = size.h;
        ctx.clearRect(0, 0, w, h);
        var R = 150, R2 = R * R;

        for (var i = 0; i < ps.length; i++) {
          var p = ps[i];
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          if (p.x < -30) p.x = w + 30; else if (p.x > w + 30) p.x = -30;
          if (p.y < -30) p.y = h + 30; else if (p.y > h + 30) p.y = -30;
          if (pointer.active) {
            var dx = pointer.x - p.x, dy = pointer.y - p.y;
            var d2 = dx * dx + dy * dy;
            if (d2 < R2 && d2 > 1) {
              var d = Math.sqrt(d2);
              var f = (1 - d / R) * 55 * dt;
              p.vx += (dx / d) * f;
              p.vy += (dy / d) * f;
            }
          }
          var sp = Math.sqrt(p.vx * p.vx + p.vy * p.vy), max = 55;
          if (sp > max) {
            p.vx = (p.vx / sp) * max;
            p.vy = (p.vy / sp) * max;
          } else if (sp < 6) {
            p.vx += rand(-20, 20) * dt;
            p.vy += rand(-20, 20) * dt;
          }
        }

        var link = Math.min(130, Math.max(80, Math.min(w, h) / 9));
        ctx.lineWidth = 1;
        for (var a = 0; a < ps.length; a++) {
          var pa = ps[a];
          for (var b = a + 1; b < ps.length; b++) {
            var pb = ps[b];
            var ldx = pa.x - pb.x, ldy = pa.y - pb.y;
            var ld2 = ldx * ldx + ldy * ldy;
            if (ld2 < link * link) {
              var alpha = (1 - Math.sqrt(ld2) / link) * 0.5;
              ctx.strokeStyle = 'rgba(140, 190, 255, ' + alpha.toFixed(3) + ')';
              ctx.beginPath();
              ctx.moveTo(pa.x, pa.y);
              ctx.lineTo(pb.x, pb.y);
              ctx.stroke();
            }
          }
        }

        for (var q = 0; q < ps.length; q++) {
          var dot = ps[q];
          ctx.fillStyle = 'rgba(220, 235, 255, 0.9)';
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
          ctx.fill();
        }
      },

      stop: function () {
        if (stageEl) {
          stageEl.removeEventListener('pointermove', onMove);
          stageEl.removeEventListener('pointerleave', onLeave);
          stageEl = null;
        }
        if (kit) kit.destroy();
        kit = null;
      }
    };
  }

  window.Scenes.particles = particles;
})();
