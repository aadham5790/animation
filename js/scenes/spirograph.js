(function () {
  'use strict';

  var makeCanvas = window.SceneKit.makeCanvas;

function spirograph() {
    var kit, ctx, size, stageEl, u, prev;

    return {
      start: function (stage) {
        stageEl = stage;
        kit = makeCanvas(stage);
        ctx = kit.ctx;
        size = kit.size;
        u = 0;
        prev = null;
      },

      point: function (a, R, r, d) {
        var k = (R - r) / r;
        return {
          x: (R - r) * Math.cos(a) + d * Math.cos(k * a),
          y: (R - r) * Math.sin(a) - d * Math.sin(k * a)
        };
      },

      frame: function (dt, t) {
        var w = size.w, h = size.h;
        ctx.fillStyle = 'rgba(11, 6, 22, 0.05)';
        ctx.fillRect(0, 0, w, h);
        var base = Math.min(w, h);
        var R = base * 0.33;
        var r = base * 0.085 * (1 + 0.18 * Math.sin(t * 0.00007));
        var d = base * 0.22 * (1 + 0.15 * Math.cos(t * 0.00005));
        u += dt * 0.55;

        ctx.globalCompositeOperation = 'lighter';
        ctx.lineWidth = 1.4;
        ctx.strokeStyle = 'hsla(' + (210 + 90 * Math.sin(u * 0.05)).toFixed(0) + ', 95%, 66%, 0.5)';
        ctx.beginPath();
        var steps = 8;
        for (var s = 0; s <= steps; s++) {
          var a = prev ? prev.u + (u - prev.u) * (s / steps) : u;
          var p = this.point(a, R, r, d);
          var x = w / 2 + p.x;
          var y = h / 2 + p.y;
          if (s === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();

        var head = this.point(u, R, r, d);
        var hx = w / 2 + head.x, hy = h / 2 + head.y;
        var g = ctx.createRadialGradient(hx, hy, 0, hx, hy, 10);
        g.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        g.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(hx, hy, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';

        prev = { u: u };
      },

      stop: function () {
        if (kit) kit.destroy();
        kit = null;
        prev = null;
        stageEl = null;
      }
    };
  }

  window.Scenes.spirograph = spirograph;
})();
