(function () {
  'use strict';

  var rand = window.SceneKit.rand;
  var makeCanvas = window.SceneKit.makeCanvas;

function ripples() {
    var kit, ctx, size, stageEl, rings, timer, onClick;

    function spawn(x, y, delay) {
      rings.push({
        x: x, y: y, r: delay * 40,
        speed: rand(60, 220),
        life: 1,
        span: rand(1.2, 2.2),
        hue: rand(170, 220),
        lw: rand(1.5, 3.5)
      });
    }

    return {
      start: function (stage) {
        stageEl = stage;
        kit = makeCanvas(stage);
        ctx = kit.ctx;
        size = kit.size;
        rings = [];
        timer = 0.2;
        onClick = function (e) {
          var rect = kit.canvas.getBoundingClientRect();
          var x = e.clientX - rect.left, y = e.clientY - rect.top;
          spawn(x, y, 0);
          spawn(x, y, 0.35);
          spawn(x, y, 0.7);
        };
        stage.addEventListener('pointerdown', onClick);
      },

      frame: function (dt) {
        var w = size.w, h = size.h;
        ctx.clearRect(0, 0, w, h);
        ctx.globalCompositeOperation = 'lighter';
        timer -= dt;
        if (timer <= 0) {
          timer = rand(0.4, 0.9);
          spawn(rand(w * 0.1, w * 0.9), rand(h * 0.1, h * 0.9), 0);
        }
        for (var i = rings.length - 1; i >= 0; i--) {
          var r = rings[i];
          r.r += r.speed * dt;
          r.life -= dt / r.span;
          if (r.life <= 0) {
            rings.splice(i, 1);
            continue;
          }
          ctx.strokeStyle = 'hsla(' + r.hue.toFixed(0) + ', 95%, 62%, ' + (r.life * 0.55).toFixed(3) + ')';
          ctx.lineWidth = r.lw + (1 - r.life) * 2.5;
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
          ctx.stroke();
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
        rings = [];
      }
    };
  }

  window.Scenes.ripples = ripples;
})();
