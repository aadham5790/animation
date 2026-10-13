(function () {
  'use strict';

  var makeCanvas = window.SceneKit.makeCanvas;

function wave() {
    var ctx, size, pointer, kit;

    return {
      start: function (stage) {
        kit = makeCanvas(stage);
        ctx = kit.ctx;
        size = kit.size;
        pointer = { x: -1e4, y: -1e4 };

        function onMove(e) {
          var rect = kit.canvas.getBoundingClientRect();
          pointer.x = e.clientX - rect.left;
          pointer.y = e.clientY - rect.top;
        }

        function onLeave() {
          pointer.x = -1e4;
          pointer.y = -1e4;
        }

        stage.addEventListener('pointermove', onMove);
        stage.addEventListener('pointerleave', onLeave);
      },

      frame: function (dt, t) {
        var w = size.w, h = size.h;
        ctx.clearRect(0, 0, w, h);
        var gap = Math.max(24, Math.min(w, h) / 22);
        var tt = t * 0.001;
        for (var x = gap / 2; x < w; x += gap) {
          for (var y = gap / 2; y < h; y += gap) {
            var v = Math.sin(x * 0.012 + tt * 1.6)
              + Math.sin(y * 0.016 - tt * 1.2)
              + Math.sin((x + y) * 0.008 + tt * 0.8);
            var dx = x - pointer.x, dy = y - pointer.y;
            var d = Math.sqrt(dx * dx + dy * dy);
            var infl = d < 170 ? (1 - d / 170) : 0;
            var sz = Math.max(0.6, (Math.abs(v) * 0.9 + 0.8 + infl * 2.6) * (gap / 34) * 1.6);
            var light = 45 + Math.max(0, v) * 10 + infl * 25;
            var hue = (170 + 80 * Math.sin(tt * 0.3 + x * 0.003 + y * 0.002)).toFixed(0);
            var a = (0.35 + Math.max(0, v) * 0.12 + infl * 0.5).toFixed(3);
            ctx.fillStyle = 'hsla(' + hue + ', 90%, ' + light.toFixed(0) + '%, ' + a + ')';
            ctx.beginPath();
            ctx.arc(x, y, sz, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      },

      stop: function () {
        if (kit) kit.destroy();
        kit = null;
      }
    };
  }

  window.Scenes.wave = wave;
})();
