/* Lead Hunter — интерактив лендинга (vanilla JS, без зависимостей) */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- Шапка: компактный режим при скролле --- */
  var header = document.querySelector('.site-header');
  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* --- Мобильное меню (бургер) --- */
  var burger = document.querySelector('.burger');
  var nav = document.getElementById('site-nav');
  function closeNav() {
    header.classList.remove('nav-open');
    burger.setAttribute('aria-expanded', 'false');
  }
  burger.addEventListener('click', function () {
    var opened = header.classList.toggle('nav-open');
    burger.setAttribute('aria-expanded', opened ? 'true' : 'false');
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) closeNav();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeNav();
  });

  /* --- Каскадная задержка для reveal-блоков внутри групп --- */
  document.querySelectorAll('[data-stagger]').forEach(function (group) {
    Array.prototype.forEach.call(group.children, function (child, i) {
      child.style.setProperty('--d', (i * 90) + 'ms');
    });
  });

  /* --- Появление блоков: fade + translate через IntersectionObserver --- */
  var revealEls = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    /* анимации отключены или observer недоступен — показываем сразу */
    revealEls.forEach(function (el) { el.classList.add('in'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add('in');
        /* после анимации снимаем классы, чтобы hover-эффекты карточек работали без задержек */
        el.addEventListener('animationend', function () {
          el.classList.remove('in', 'reveal');
          el.style.removeProperty('--d');
        }, { once: true });
        revealObserver.unobserve(el);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* --- Счётчики цифр (KPI-плитки макета, скоринг в карточке) --- */
  var counters = document.querySelectorAll('[data-count]');
  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    if (reduced) { el.textContent = String(target); return; }
    var duration = 1200;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3); /* easeOutCubic */
      el.textContent = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (!('IntersectionObserver' in window)) {
    counters.forEach(function (el) { el.textContent = el.getAttribute('data-count'); });
  } else {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) {
      if (!reduced) el.textContent = '0'; /* старт с нуля только при включённых анимациях */
      counterObserver.observe(el);
    });
  }

  /* --- FAQ-аккордеон (aria-expanded + плавная высота через grid-template-rows) --- */
  document.querySelectorAll('.faq-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq-item');
      var opened = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  });

  /* --- Чек-лист «Первый день охотника»: все 5 пунктов — появляется сообщение --- */
  var boxes = document.querySelectorAll('.check-item input[type="checkbox"]');
  var doneMsg = document.getElementById('check-done');
  function refreshChecklist() {
    var allChecked = Array.prototype.every.call(boxes, function (b) { return b.checked; });
    if (doneMsg) doneMsg.hidden = !allChecked;
  }
  boxes.forEach(function (b) { b.addEventListener('change', refreshChecklist); });
})();