(function () {
  'use strict';

  var makeCanvas = window.SceneKit.makeCanvas;

function ribbons() {
    var kit, ctx, size, stageEl, onMove, pointer = { x: -1e4, y: -1e4 };

    return {
      start: function (stage) {
        stageEl = stage;
        kit = makeCanvas(stage);
        ctx = kit.ctx;
        size = kit.size;
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
        ctx.clearRect(0, 0, w, h);
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineJoin = 'round';
        for (var i = 0; i < 7; i++) {
          var amp = 24 + i * 16;
          var base = h * (i + 1) / 8;
          var grad = ctx.createLinearGradient(0, 0, w, 0);
          var hue = 175 + i * 26;
          grad.addColorStop(0, 'hsla(' + hue.toFixed(0) + ', 95%, 60%, 0)');
          grad.addColorStop(0.5, 'hsla(' + hue.toFixed(0) + ', 95%, 62%, ' + (0.55 - i * 0.04).toFixed(3) + ')');
          grad.addColorStop(1, 'hsla(' + hue.toFixed(0) + ', 95%, 60%, 0)');
          ctx.strokeStyle = grad;
          ctx.lineWidth = 2 + i * 0.5;
          ctx.beginPath();
          for (var x = 0; x <= w + 12; x += 12) {
            var boost = 1;
            var dx = x - pointer.x, dy = base - pointer.y;
            var dd = Math.sqrt(dx * dx + dy * dy);
            if (dd < 260) boost = 1 + 0.9 * (1 - dd / 260);
            var y = base + Math.sin(x * 0.006 + t * 0.0006 * (i + 1) + i * 1.7) * amp * boost
              + Math.sin(x * 0.011 - t * 0.0004 * (i + 1)) * amp * 0.35 * boost;
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          }
          ctx.stroke();
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
      }
    };
  }

  window.Scenes.ribbons = ribbons;
})();
