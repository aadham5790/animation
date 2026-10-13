(function () {
  'use strict';

  var makeCanvas = window.SceneKit.makeCanvas;

function dunes() {
    var kit, ctx, size, stageEl, layers;

    function build() {
      layers = [];
      for (var i = 0; i < 6; i++) {
        layers.push({
          base: size.h * (0.32 + i * 0.11),
          amp: 26 + i * 12,
          f1: 0.0042 + i * 0.0011,
          s1: 0.07 + i * 0.045,
          hue: 255 + i * 9
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
      },

      frame: function (dt, t) {
        var w = size.w, h = size.h;
        ctx.clearRect(0, 0, w, h);
        for (var i = 0; i < layers.length; i++) {
          var L = layers[i];
          var grad = ctx.createLinearGradient(0, L.base - L.amp * 2, 0, h);
          grad.addColorStop(0, 'hsla(' + L.hue.toFixed(0) + ', 70%, 34%, 0.95)');
          grad.addColorStop(1, 'hsla(' + L.hue.toFixed(0) + ', 65%, 9%, 0.98)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.moveTo(0, h);
          for (var x = 0; x <= w + 8; x += 8) {
            var y = L.base - L.amp * (Math.sin(x * L.f1 + t * L.s1) + 0.5 * Math.sin(x * L.f1 * 2.3 - t * L.s1 * 0.7));
            ctx.lineTo(x, y);
          }
          ctx.lineTo(w, h);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = 'hsla(' + L.hue.toFixed(0) + ', 95%, 68%, 0.5)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          for (var x2 = 0; x2 <= w + 8; x2 += 8) {
            var y2 = L.base - L.amp * (Math.sin(x2 * L.f1 + t * L.s1) + 0.5 * Math.sin(x2 * L.f1 * 2.3 - t * L.s1 * 0.7));
            if (x2 === 0) ctx.moveTo(x2, y2); else ctx.lineTo(x2, y2);
          }
          ctx.stroke();
        }
      },

      stop: function () {
        if (kit) kit.destroy();
        kit = null;
        layers = [];
        stageEl = null;
      }
    };
  }

  window.Scenes.dunes = dunes;
})();
