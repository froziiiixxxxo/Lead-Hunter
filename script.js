/* Lead Hunter — интерактив лендинга (vanilla JS, без зависимостей).
   Соответствует премиум-версии index.html; подключается с defer. */
(function () {
  'use strict';

  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- Шапка: фон с блюром при скролле --- */
  var header = document.getElementById('header');
  if (header) {
    var onScroll = function () { header.classList.toggle('scrolled', scrollY > 10); };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* --- Появление блоков: fade + translate с каскадом --- */
  var els = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    /* анимации отключены или observer недоступен — показываем сразу */
    els.forEach(function (el) { el.classList.add('in'); el.classList.remove('reveal'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        el.classList.add('in');
        /* после анимации снимаем класс, чтобы hover-подъём карточек работал без конфликтов */
        el.addEventListener('transitionend', function () {
          el.classList.remove('reveal');
          el.style.removeProperty('--d');
        }, { once: true });
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  /* --- Счётчики цифр в KPI-плитках макета --- */
  var nums = document.querySelectorAll('[data-count]');
  if (nums.length && !reduced && 'IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var target = parseInt(el.dataset.count, 10) || 0;
        var start = null;
        el.textContent = '0';
        function step(ts) {
          if (start === null) start = ts;
          var p = Math.min((ts - start) / 1100, 1);
          el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        co.unobserve(el);
      });
    }, { threshold: 0.5 });
    nums.forEach(function (el) { co.observe(el); });
  }
})();