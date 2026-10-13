(function () {
  'use strict';

  var makeCanvas = window.SceneKit.makeCanvas;

function attractor() {
    var kit, ctx, size, stageEl, pts, lx, ly, lz, yaw, onMove, pointer = { x: 0, y: 0 };
    var MAXPTS = 1800;
    var SCALE = 10;

    return {
      start: function (stage) {
        stageEl = stage;
        kit = makeCanvas(stage);
        ctx = kit.ctx;
        size = kit.size;
        pts = [];
        lx = 0.1; ly = 0; lz = 0;
        yaw = 0;
        for (var s = 0; s < 400; s++) this.step();
        pointer = { x: 0, y: 0 };
        onMove = function (e) {
          pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
          pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
        };
        window.addEventListener('pointermove', onMove);
      },

      step: function () {
        var dt = 0.005;
        var dx = SCALE * (ly - lx);
        var dy = lx * (28 - lz) - ly;
        var dz = lx * ly - (8 / 3) * lz;
        lx += dx * dt;
        ly += dy * dt;
        lz += dz * dt;
        pts.push({ x: lx, y: ly, z: lz });
        if (pts.length > MAXPTS) pts.splice(0, pts.length - MAXPTS);
      },

      frame: function (dt, t) {
        var w = size.w, h = size.h;
        ctx.fillStyle = 'rgba(9, 5, 16, 0.1)';
        ctx.fillRect(0, 0, w, h);
        for (var s = 0; s < 8; s++) this.step();

        yaw += dt * (0.12 + pointer.x * 0.25);
        var cs = Math.cos(yaw), sn = Math.sin(yaw);
        var tilt = 0.32;
        var ct = Math.cos(tilt), st = Math.sin(tilt);
        var scale = Math.min(w, h) / 62;
        var cx = w / 2, cy = h / 2;

        ctx.globalCompositeOperation = 'lighter';
        for (var i = 0; i < pts.length; i++) {
          var p = pts[i];
          var rx = p.x * cs - p.y * sn;
          var ry = p.x * sn + p.y * cs;
          var px = cx + rx * scale;
          var py = cy + (ry * ct - p.z * st) * scale;
          var f = i / pts.length;
          var hue = 200 + 120 * (p.z / 50);
          ctx.fillStyle = 'hsla(' + hue.toFixed(0) + ', 95%, ' + (45 + 25 * f).toFixed(0) + '%, ' + (0.12 + 0.5 * f).toFixed(3) + ')';
          ctx.fillRect(px, py, 1.4, 1.4);
        }
        ctx.globalCompositeOperation = 'source-over';
      },

      stop: function () {
        window.removeEventListener('pointermove', onMove);
        if (kit) kit.destroy();
        kit = null;
        pts = [];
        stageEl = null;
      }
    };
  }

  window.Scenes.attractor = attractor;
})();
