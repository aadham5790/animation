(function () {
  'use strict';

function rank() {
    var stageEl, wrap, fills;

    return {
      start: function (stage) {
        stageEl = stage;
        wrap = document.createElement('div');
        wrap.className = 'rank';
        fills = [];

        var rows = window.Votes.rows();
        var maxLikes = 0;
        for (var m = 0; m < rows.length; m++) {
          if (rows[m].likes > maxLikes) maxLikes = rows[m].likes;
        }

        for (var i = 0; i < rows.length; i++) {
          var r = rows[i];

          var row = document.createElement('div');
          row.className = 'rank-row';

          var name = document.createElement('span');
          name.className = 'rank-name';
          name.textContent = r.label;
          row.appendChild(name);

          var track = document.createElement('div');
          track.className = 'rank-bar';
          var fill = document.createElement('div');
          fill.className = 'rank-fill';
          if (r.likes > 0) fill.classList.add('is-like');
          else if (r.dislikes > 0) fill.classList.add('is-dislike');
          else fill.classList.add('is-none');
          var pct;
          if (r.likes > 0 && maxLikes > 0) {
            pct = Math.max(4, Math.round((r.likes / maxLikes) * 100));
          } else if (r.dislikes > 0) {
            pct = 20;
          } else {
            pct = 3;
          }
          fill._target = pct;
          fills.push(fill);
          track.appendChild(fill);
          row.appendChild(track);

          var likesCell = document.createElement('span');
          likesCell.className = 'rank-count';
          if (r.likes > 0) likesCell.classList.add('is-like');
          likesCell.textContent = String(r.likes);
          row.appendChild(likesCell);

          var dislikesCell = document.createElement('span');
          dislikesCell.className = 'rank-count';
          if (r.dislikes > 0) dislikesCell.classList.add('is-dislike');
          dislikesCell.textContent = String(r.dislikes);
          row.appendChild(dislikesCell);

          wrap.appendChild(row);
        }

        stage.appendChild(wrap);

        window.requestAnimationFrame(function () {
          for (var k = 0; k < fills.length; k++) {
            fills[k].style.width = fills[k]._target + '%';
          }
        });
      },

      stop: function () {
        if (wrap && wrap.parentNode) wrap.parentNode.removeChild(wrap);
        wrap = null;
        fills = [];
        stageEl = null;
      }
    };
  }

  window.Scenes.rank = rank;
})();
