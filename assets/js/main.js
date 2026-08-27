/* ==========================================================================
   رؤية ستوديو — سكربت الصفحة
   ملاحظة: غيّر WHATSAPP_NUMBER لرقمك بصيغة دولية بدون + أو مسافات
   ========================================================================== */
(function () {
  'use strict';

  var WHATSAPP_NUMBER = '201000000000';

  /* ---------- القائمة على الموبايل ---------- */
  var nav = document.getElementById('nav');
  var navToggle = document.getElementById('navToggle');

  function closeNav() {
    nav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'فتح القائمة');
  }

  navToggle.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'إغلاق القائمة' : 'فتح القائمة');
  });

  nav.addEventListener('click', function (e) {
    if (e.target.closest('.nav__link')) closeNav();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeNav();
  });

  /* ---------- خلفية الهيدر عند التمرير ---------- */
  var header = document.getElementById('header');
  var onScroll = function () {
    header.classList.toggle('is-stuck', window.scrollY > 24);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- ظهور العناصر أثناء التمرير ---------- */
  var revealables = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    revealables.forEach(function (el, i) {
      el.style.transitionDelay = (i % 3) * 80 + 'ms';
      revealObserver.observe(el);
    });
  } else {
    revealables.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- عدّاد الأرقام ---------- */
  var statsBox = document.getElementById('stats');

  // أرقام عربية-هندية عشان تتماشى مع باقي أرقام الصفحة
  function arabicDigits(n) {
    return String(n).replace(/\d/g, function (d) {
      return '٠١٢٣٤٥٦٧٨٩'[d];
    });
  }
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function runCounters() {
    statsBox.querySelectorAll('.stat__num').forEach(function (el) {
      var target = parseInt(el.dataset.count, 10) || 0;
      var suffix = el.dataset.suffix || '';
      var duration = 1400;
      var start = null;

      // احترام تفضيل تقليل الحركة: نعرض الرقم النهائي على طول
      if (reduceMotion) {
        el.textContent = arabicDigits(target) + suffix;
        return;
      }

      function tick(now) {
        if (start === null) start = now;
        var p = Math.min((now - start) / duration, 1);
        // تباطؤ تدريجي في النهاية
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = arabicDigits(Math.round(target * eased)) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }

  if (statsBox && 'IntersectionObserver' in window) {
    var statsObserver = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      runCounters();
      statsObserver.disconnect();
    }, { threshold: 0.4 });
    statsObserver.observe(statsBox);
  }

  /* ---------- تصفية معرض الأعمال ---------- */
  var filters = document.querySelectorAll('.filter');
  var shots = document.querySelectorAll('#gallery .shot');

  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filters.forEach(function (b) {
        b.classList.toggle('is-active', b === btn);
        b.setAttribute('aria-selected', String(b === btn));
      });

      var cat = btn.dataset.filter;
      shots.forEach(function (shot) {
        var show = cat === 'all' || shot.dataset.cat === cat;
        shot.classList.toggle('is-hidden', !show);
      });
    });
  });

  /* ---------- تمييز رابط القسم الحالي ---------- */
  var sections = document.querySelectorAll('main section[id]');
  var navLinks = document.querySelectorAll('.nav__link');

  if ('IntersectionObserver' in window) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          link.classList.toggle('is-active', link.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(function (s) { sectionObserver.observe(s); });
  }

  /* ---------- اختيار باقة يملأ نموذج التواصل ---------- */
  var serviceField = document.getElementById('service');
  var detailsField = document.getElementById('details');

  document.querySelectorAll('[data-plan]').forEach(function (link) {
    link.addEventListener('click', function () {
      if (!detailsField) return;
      detailsField.value = 'مهتم بـ' + link.dataset.plan + '. ';
      setTimeout(function () { detailsField.focus(); }, 600);
    });
  });

  /* ---------- إرسال النموذج عبر واتساب ---------- */
  var form = document.getElementById('contactForm');
  var note = document.getElementById('formNote');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var name = form.name.value.trim();
    var phone = form.phone.value.trim();
    var invalid = false;

    [['name', name], ['phone', phone]].forEach(function (pair) {
      var field = form[pair[0]];
      var empty = pair[1] === '';
      field.classList.toggle('is-invalid', empty);
      if (empty) invalid = true;
    });

    if (invalid) {
      note.textContent = 'من فضلك اكتب الاسم ورقم الواتساب.';
      return;
    }

    var message =
      'السلام عليكم، عايز أستفسر عن خدماتكم.\n' +
      'الاسم: ' + name + '\n' +
      'رقم التواصل: ' + phone + '\n' +
      'الخدمة: ' + serviceField.value + '\n' +
      'الميزانية: ' + form.budget.value + '\n' +
      'التفاصيل: ' + (detailsField.value.trim() || 'لا يوجد');

    window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message), '_blank', 'noopener');
    note.textContent = 'تم فتح واتساب برسالتك — لو ما اتفتحش، كلمني على الرقم فوق.';
    form.reset();
  });

  /* ---------- سنة الحقوق ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();
})();
