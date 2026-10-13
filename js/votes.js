(function () {
  'use strict';

  var STORE_KEY = 'sm:votes';
  var cache = null;

  function norm(v) {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      var like = typeof v.like === 'number' && v.like > 0 ? Math.floor(v.like) : 0;
      var dislike = typeof v.dislike === 'number' && v.dislike > 0 ? Math.floor(v.dislike) : 0;
      return { like: like, dislike: dislike };
    }
    if (v === 'like') return { like: 1, dislike: 0 };
    if (v === 'dislike') return { like: 0, dislike: 1 };
    return { like: 0, dislike: 0 };
  }

  function load() {
    if (cache) return cache;
    cache = {};
    try {
      var raw = window.localStorage.getItem(STORE_KEY);
      if (!raw) return cache;
      var parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        for (var key in parsed) {
          if (Object.prototype.hasOwnProperty.call(parsed, key)) {
            var n = norm(parsed[key]);
            if (n.like > 0 || n.dislike > 0) cache[key] = n;
          }
        }
      }
    } catch (err) {}
    return cache;
  }

  function save() {
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(load()));
    } catch (err) {}
  }

  window.Votes = {
    all: function () {
      var map = load();
      var copy = {};
      for (var k in map) {
        if (Object.prototype.hasOwnProperty.call(map, k)) {
          copy[k] = { like: map[k].like, dislike: map[k].dislike };
        }
      }
      return copy;
    },
    counts: function (sceneKey) {
      var entry = load()[sceneKey];
      if (!entry) return { like: 0, dislike: 0 };
      return { like: entry.like, dislike: entry.dislike };
    },
    adjust: function (sceneKey, type, delta) {
      if (type !== 'like' && type !== 'dislike') return { like: 0, dislike: 0 };
      var map = load();
      var entry = map[sceneKey] || { like: 0, dislike: 0 };
      var next = entry[type] + delta;
      entry[type] = next > 0 ? next : 0;
      if (entry.like === 0 && entry.dislike === 0) {
        delete map[sceneKey];
      } else {
        map[sceneKey] = entry;
      }
      save();
      var stored = map[sceneKey];
      if (!stored) return { like: 0, dislike: 0 };
      return { like: stored.like, dislike: stored.dislike };
    },
    rows: function () {
      var map = load();
      var out = [];
      var els = document.querySelectorAll('.scene[data-name]');
      for (var i = 0; i < els.length; i++) {
        var key = els[i].getAttribute('data-scene');
        var label = els[i].getAttribute('data-name');
        var entry = map[key];
        var likes = entry ? entry.like : 0;
        var dislikes = entry ? entry.dislike : 0;
        out.push({ key: key, label: label, likes: likes, dislikes: dislikes, order: i });
      }
      out.sort(function (a, b) {
        if (b.likes !== a.likes) return b.likes - a.likes;
        if (a.dislikes !== b.dislikes) return a.dislikes - b.dislikes;
        return a.order - b.order;
      });
      return out;
    }
  };
})();
