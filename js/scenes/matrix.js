(function () {
  'use strict';

  var rand = window.SceneKit.rand;
  var makeCanvas = window.SceneKit.makeCanvas;

function matrix() {
    var kit, ctx, size, stageEl, cols, onResize;
    var glyphs = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789=+<>*:･';

    function build() {
      var step = Math.max(14, Math.min(22, size.w / 60));
      var n = Math.ceil(size.w / step);
      cols = [];
      for (var i = 0; i < n; i++) {
        cols.push({
          x: i * step + step / 2,
          y: -rand(0, size.h),
          speed: rand(120, 380),
          len: Math.round(rand(8, 22)),
          hue: rand(105, 165)
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
        ctx.font = '16px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        onResize = function () { build(); };
        window.addEventListener('resize', onResize);
      },

      frame: function (dt, t) {
        var w = size.w, h = size.h;
        ctx.fillStyle = 'rgba(4, 10, 8, 0.28)';
        ctx.fillRect(0, 0, w, h);
        ctx.font = Math.max(12, Math.min(20, w / 62)) + 'px monospace';
        var step = Math.max(14, Math.min(22, w / 60));
        for (var i = 0; i < cols.length; i++) {
          var c = cols[i];
          c.y += c.speed * dt;
          if (c.y - c.len * step > h) {
            c.y = -rand(0, h * 0.4);
            c.speed = rand(120, 380);
            c.len = Math.round(rand(8, 22));
            c.hue = rand(105, 165);
          }
          for (var k = 0; k < c.len; k++) {
            var y = c.y - k * step;
            if (y < -step || y > h + step) continue;
            var f = 1 - k / c.len;
            var light = k === 0 ? 88 : 45 + 35 * f;
            var alpha = k === 0 ? 1 : f * 0.85;
            ctx.fillStyle = 'hsla(' + c.hue.toFixed(0) + ', 100%, ' + light.toFixed(0) + '%, ' + alpha.toFixed(3) + ')';
            var g = glyphs[(Math.random() * glyphs.length) | 0];
            ctx.fillText(g, c.x, y);
          }
        }
      },

      stop: function () {
        window.removeEventListener('resize', onResize);
        if (kit) kit.destroy();
        kit = null;
        stageEl = null;
      }
    };
  }

  window.Scenes.matrix = matrix;
})();
