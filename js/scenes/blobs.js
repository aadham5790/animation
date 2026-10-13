(function () {
  'use strict';

  var rand = window.SceneKit.rand;
  var makeCanvas = window.SceneKit.makeCanvas;

function blobs() {
    var ctx, size, defs, kit;

    return {
      start: function (stage) {
        kit = makeCanvas(stage);
        ctx = kit.ctx;
        size = kit.size;
        var hues = [190, 280, 320, 150, 210];
        defs = [];
        for (var i = 0; i < 5; i++) {
          defs.push({
            ax: rand(0.12, 0.26),
            ay: rand(0.1, 0.24),
            sx: rand(0.00009, 0.0002),
            sy: rand(0.00008, 0.00018),
            r: rand(0.22, 0.42),
            rs: rand(0.0002, 0.0004),
            hue: hues[i],
            hueAmp: rand(20, 50),
            ph: rand(0, Math.PI * 2)
          });
        }
      },

      frame: function (dt, t) {
        var w = size.w, h = size.h;
        var base = Math.min(w, h);
        ctx.clearRect(0, 0, w, h);
        ctx.globalCompositeOperation = 'lighter';
        for (var i = 0; i < defs.length; i++) {
          var d = defs[i];
          var x = w / 2 + Math.sin(t * d.sx + d.ph) * w * d.ax;
          var y = h / 2 + Math.cos(t * d.sy + d.ph * 1.7) * h * d.ay;
          var r = base * d.r * (1 + 0.16 * Math.sin(t * d.rs + d.ph));
          var hue = (d.hue + Math.sin(t * 0.00007 + d.ph) * d.hueAmp).toFixed(0);
          var g = ctx.createRadialGradient(x, y, 0, x, y, r);
          g.addColorStop(0, 'hsla(' + hue + ', 95%, 62%, 0.55)');
          g.addColorStop(0.45, 'hsla(' + hue + ', 95%, 55%, 0.22)');
          g.addColorStop(1, 'hsla(' + hue + ', 95%, 50%, 0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';
      },

      stop: function () {
        if (kit) kit.destroy();
        kit = null;
      }
    };
  }

  window.Scenes.blobs = blobs;
})();
