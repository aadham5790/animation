(function () {
  'use strict';

  var rand = window.SceneKit.rand;
  var makeCanvas = window.SceneKit.makeCanvas;

function starfield() {
    var kit, ctx, size, stageEl, stars, onMove, onResize, pointer = { x: 0, y: 0 };

    function build() {
      var count = Math.max(120, Math.min(400, Math.round((size.w * size.h) / 4000)));
      stars = [];
      for (var i = 0; i < count; i++) {
        stars.push({
          x: rand(-1, 1), y: rand(-1, 1), z: rand(0.05, 1), pz: 1
        });
      }
    }

    return {
      start: function (stage) {
        stageEl = stage;
        kit = makeCanvas(stage);
        ctx = kit.ctx;
        size = kit.size;
        build();
        pointer = { x: 0, y: 0 };
        onMove = function (e) {
          var rect = kit.canvas.getBoundingClientRect();
          pointer.x = (e.clientX - rect.left) / size.w * 2 - 1;
          pointer.y = (e.clientY - rect.top) / size.h * 2 - 1;
        };
        onResize = function () { build(); };
        stage.addEventListener('pointermove', onMove);
        window.addEventListener('resize', onResize);
      },

      frame: function (dt, t) {
        var w = size.w, h = size.h;
        ctx.fillStyle = 'rgba(5, 6, 14, 0.35)';
        ctx.fillRect(0, 0, w, h);
        var cx = w / 2 + pointer.x * w * 0.12;
        var cy = h / 2 + pointer.y * h * 0.12;
        var speed = 0.22 + 0.16 * Math.sin(t * 0.5);
        var fx = w * 0.5, fy = h * 0.5;
        ctx.lineCap = 'round';
        for (var i = 0; i < stars.length; i++) {
          var s = stars[i];
          s.pz = s.z;
          s.z -= dt * speed;
          if (s.z < 0.04) {
            s.x = rand(-1, 1);
            s.y = rand(-1, 1);
            s.z = 1;
            s.pz = 1;
            continue;
          }
          var x0 = cx + (s.x / s.pz) * fx;
          var y0 = cy + (s.y / s.pz) * fy;
          var x1 = cx + (s.x / s.z) * fx;
          var y1 = cy + (s.y / s.z) * fy;
          var a = 1 - s.z;
          ctx.strokeStyle = 'rgba(200, 220, 255, ' + (a * 0.85).toFixed(3) + ')';
          ctx.lineWidth = 0.5 + a * 2;
          ctx.beginPath();
          ctx.moveTo(x0, y0);
          ctx.lineTo(x1, y1);
          ctx.stroke();
          if (a > 0.7) {
            ctx.fillStyle = 'rgba(255, 255, 255, ' + ((a - 0.7) * 2).toFixed(3) + ')';
            ctx.beginPath();
            ctx.arc(x1, y1, 1 + a, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      },

      stop: function () {
        if (stageEl) {
          stageEl.removeEventListener('pointermove', onMove);
          stageEl = null;
        }
        window.removeEventListener('resize', onResize);
        if (kit) kit.destroy();
        kit = null;
        stars = [];
      }
    };
  }

  window.Scenes.starfield = starfield;
})();
