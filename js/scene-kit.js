(function () {
  'use strict';

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function makeCanvas(stage) {
    var canvas = document.createElement('canvas');
    canvas.className = 'scene-canvas';
    stage.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    var size = { w: 1, h: 1 };

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = Math.max(1, stage.clientWidth || window.innerWidth);
      var h = Math.max(1, stage.clientHeight || window.innerHeight);
      size.w = w;
      size.h = h;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    window.addEventListener('resize', resize);

    return {
      canvas: canvas,
      ctx: ctx,
      size: size,
      destroy: function () {
        window.removeEventListener('resize', resize);
        canvas.remove();
      }
    };
  }

  window.Scenes = window.Scenes || {};

  window.SceneKit = {
    rand: rand,
    makeCanvas: makeCanvas
  };
})();
