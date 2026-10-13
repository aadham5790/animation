(function () {
  'use strict';

function tunnel() {
    var gl, canvas, stageEl, program, uniforms, onResize, onMove, ok = false;
    var pointer = { x: 0, y: 0 };

    var VERT = [
      'attribute vec2 aPos;',
      'void main() {',
      '  gl_Position = vec4(aPos, 0.0, 1.0);',
      '}'
    ].join('\n');

    var FRAG = [
      'precision mediump float;',
      'uniform vec2 uRes;',
      'uniform float uTime;',
      'uniform vec2 uPtr;',

      'void main() {',
      '  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / min(uRes.x, uRes.y);',
      '  uv += uPtr * 0.25;',
      '  float r = length(uv);',
      '  float a = atan(uv.y, uv.x);',
      '  vec3 col = vec3(0.0);',
      '  for (int i = 0; i < 5; i++) {',
      '    float fi = float(i);',
      '    float depth = fract(uTime * 0.12 + fi * 0.2);',
      '    float ring = smoothstep(0.42, 0.0, abs(r - depth * 1.3)) * (1.0 - depth);',
      '    float arms = 0.5 + 0.5 * sin(a * 6.0 + uTime * 0.6 + fi * 1.7 + depth * 9.0);',
      '    vec3 tint = 0.5 + 0.5 * cos(6.28318 * (fi * 0.17 + vec3(0.0, 0.33, 0.67)) + uTime * 0.15);',
      '    col += tint * ring * (0.35 + 0.65 * arms);',
      '  }',
      '  float core = smoothstep(0.5, 0.0, r) * 0.35;',
      '  col += vec3(0.7, 0.85, 1.0) * core;',
      '  float vig = smoothstep(1.15, 0.25, r);',
      '  col *= vig;',
      '  gl_FragColor = vec4(col, 1.0);',
      '}'
    ].join('\n');

    function makeShader(type, src) {
      var sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        return null;
      }
      return sh;
    }

    function setup() {
      var vs = makeShader(gl.VERTEX_SHADER, VERT);
      var fs = makeShader(gl.FRAGMENT_SHADER, FRAG);
      if (!vs || !fs) return false;
      program = gl.createProgram();
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return false;
      gl.useProgram(program);

      var buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      var loc = gl.getAttribLocation(program, 'aPos');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

      uniforms = {
        res: gl.getUniformLocation(program, 'uRes'),
        time: gl.getUniformLocation(program, 'uTime'),
        ptr: gl.getUniformLocation(program, 'uPtr')
      };
      return true;
    }

    function resize() {
      if (!gl) return;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = Math.max(1, Math.round((stageEl.clientWidth || window.innerWidth) * dpr));
      var h = Math.max(1, Math.round((stageEl.clientHeight || window.innerHeight) * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      canvas.style.width = (stageEl.clientWidth || window.innerWidth) + 'px';
      canvas.style.height = (stageEl.clientHeight || window.innerHeight) + 'px';
      gl.viewport(0, 0, w, h);
    }

    return {
      start: function (stage) {
        stageEl = stage;
        canvas = document.createElement('canvas');
        canvas.className = 'scene-canvas';
        stage.appendChild(canvas);
        try {
          gl = canvas.getContext('webgl', { antialias: false, alpha: false })
            || canvas.getContext('experimental-webgl', { antialias: false, alpha: false });
        } catch (err) {
          gl = null;
        }
        if (!gl) {
          canvas.remove();
          canvas = null;
          return;
        }
        if (!setup()) {
          canvas.remove();
          canvas = null;
          gl = null;
          return;
        }
        ok = true;
        resize();
        onResize = resize;
        onMove = function (e) {
          pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
          pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
        };
        window.addEventListener('resize', onResize);
        window.addEventListener('pointermove', onMove);
      },

      frame: function (dt, t) {
        if (!ok || !gl) return;
        if (gl.isContextLost && gl.isContextLost()) {
          ok = false;
          return;
        }
        gl.uniform2f(uniforms.res, canvas.width, canvas.height);
        gl.uniform1f(uniforms.time, t);
        gl.uniform2f(uniforms.ptr, pointer.x, pointer.y);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      },

      stop: function () {
        window.removeEventListener('resize', onResize);
        window.removeEventListener('pointermove', onMove);
        ok = false;
        if (canvas) canvas.remove();
        canvas = null;
        gl = null;
        stageEl = null;
      }
    };
  }

  window.Scenes.tunnel = tunnel;
})();
