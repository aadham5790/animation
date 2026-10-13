(function () {
  'use strict';

  var makeCanvas = window.SceneKit.makeCanvas;

function helix() {
    var kit, ctx, size, stageEl;

    return {
      start: function (stage) {
        stageEl = stage;
        kit = makeCanvas(stage);
        ctx = kit.ctx;
        size = kit.size;
      },

      frame: function (dt, t) {
        var w = size.w, h = size.h;
        ctx.fillStyle = 'rgba(6, 8, 22, 0.3)';
        ctx.fillRect(0, 0, w, h);
        var R = Math.min(w, h) * 0.2;
        var cx = w / 2;
        var step = 16;

        ctx.globalCompositeOperation = 'lighter';
        for (var y = -step; y <= h + step; y += step) {
          var phase = y * 0.018 + t * 0.9;
          var x1 = cx + Math.sin(phase) * R;
          var x2 = cx + Math.sin(phase + Math.PI) * R;
          var depth = Math.cos(phase);

          var isRung = (Math.round((y + step) / step) % 3) === 0;
          if (isRung) {
            var rungA = 0.1 + 0.25 * Math.abs(depth);
            ctx.strokeStyle = 'hsla(280, 90%, 68%, ' + rungA.toFixed(3) + ')';
            ctx.lineWidth = 1 + Math.abs(depth) * 2;
            ctx.beginPath();
            ctx.moveTo(x1, y);
            ctx.lineTo(x2, y);
            ctx.stroke();
          }

          var sz = 2 + depth * 1.6;
          ctx.fillStyle = 'hsla(185, 100%, ' + (55 + depth * 20).toFixed(0) + '%, ' + (0.45 + depth * 0.4).toFixed(3) + ')';
          ctx.beginPath();
          ctx.arc(x1, y, Math.max(1.2, sz), 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'hsla(310, 100%, ' + (55 - depth * 20).toFixed(0) + '%, ' + (0.45 - depth * 0.4).toFixed(3) + ')';
          ctx.beginPath();
          ctx.arc(x2, y, Math.max(1.2, 2 - depth * 1.6), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';
      },

      stop: function () {
        if (kit) kit.destroy();
        kit = null;
        stageEl = null;
      }
    };
  }

  window.Scenes.helix = helix;
})();
