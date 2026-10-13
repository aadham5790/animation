(function () {
  'use strict';

  var makeCanvas = window.SceneKit.makeCanvas;

function kaleidoscope() {
    var kit, ctx, size, stageEl, off, octx;

    return {
      start: function (stage) {
        stageEl = stage;
        kit = makeCanvas(stage);
        ctx = kit.ctx;
        size = kit.size;
        off = document.createElement('canvas');
        off.width = 220;
        off.height = 220;
        octx = off.getContext('2d');
      },

      frame: function (dt, t) {
        var w = size.w, h = size.h;
        ctx.fillStyle = 'rgba(10, 6, 20, 0.14)';
        ctx.fillRect(0, 0, w, h);

        octx.clearRect(0, 0, 220, 220);
        octx.globalCompositeOperation = 'lighter';
        for (var k = 0; k < 14; k++) {
          var ang = t * 0.0004 * (k + 1) + k * 1.31;
          var rr = 30 + 60 * (0.5 + 0.5 * Math.sin(t * 0.0008 + k));
          var x = 110 + Math.cos(ang) * rr;
          var y = 110 + Math.sin(ang * 1.3) * rr;
          var s = 3 + 3 * Math.sin(t * 0.002 + k);
          octx.fillStyle = 'hsla(' + ((k * 26 + t * 0.02) % 360).toFixed(0) + ', 95%, 62%, 0.85)';
          octx.beginPath();
          octx.arc(x, y, s, 0, Math.PI * 2);
          octx.fill();
        }

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.translate(w / 2, h / 2);
        var slice = (Math.PI * 2) / 10;
        var scale = Math.max(w, h) / 220 * 1.5;
        for (var m = 0; m < 10; m++) {
          ctx.rotate(slice);
          ctx.drawImage(off, 0, 0, 220, 220, -110 * scale, -110 * scale, 220 * scale, 220 * scale);
        }
        ctx.restore();
      },

      stop: function () {
        if (kit) kit.destroy();
        kit = null;
        off = null;
        octx = null;
        stageEl = null;
      }
    };
  }

  window.Scenes.kaleidoscope = kaleidoscope;
})();
