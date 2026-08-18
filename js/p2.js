/* Bull Bike — заряд энергии и эмоций · p2.js */
(function () {
  'use strict';
  var hasGSAP = typeof window.gsap !== 'undefined';
  if (!hasGSAP) document.documentElement.classList.add('no-gsap');

  /* ---- nav shrink ---- */
  var nav = document.getElementById('pnav');
  function onScroll(){ if(nav) nav.classList.toggle('scrolled', window.scrollY > 60); }
  window.addEventListener('scroll', onScroll, { passive:true });
  onScroll();

  /* ---- Card thumbs fill the whole card (cover). Booking photo keeps full-frame + blurred backdrop ---- */
  (function(){
    function bgUrl(el){ var s=el.style.backgroundImage||''; var m=s.match(/url\((.*?)\)/); if(!m) return null; return m[1].replace(/^['"]|['"]$/g,''); }
    document.querySelectorAll('.bcard__photo').forEach(function(box){
      var img=box.querySelector('img'); if(!img) return;
      var blur=document.createElement('div'); blur.className='bcard__blur'; blur.style.backgroundImage='url("'+img.getAttribute('src')+'")';
      box.insertBefore(blur, img);
    });
  })();

  /* ---- Lazy-load tour card backgrounds as they enter the viewport ---- */
  (function(){
    var els=[].slice.call(document.querySelectorAll('.lazy-bg[data-bg]'));
    if(!els.length) return;
    function load(el){
      var u=el.getAttribute('data-bg'); if(!u) return;
      el.removeAttribute('data-bg');
      var pre=new Image();
      pre.onload=pre.onerror=function(){ el.style.backgroundImage='url("'+u+'")'; el.classList.add('is-loaded'); };
      pre.src=u;
    }
    if(!('IntersectionObserver' in window)){ els.forEach(load); return; }
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if(e.isIntersecting){ load(e.target); io.unobserve(e.target); } });
    }, { rootMargin:'300px 0px' });
    els.forEach(function(el){ io.observe(el); });
  })();

  /* ---- Lenis smooth scroll ---- */
  var lenis = null;
  if (typeof window.Lenis !== 'undefined') {
    lenis = new window.Lenis({ lerp:0.1, smoothWheel:true });
    if (hasGSAP && window.ScrollTrigger) {
      lenis.on('scroll', window.ScrollTrigger.update);
      // Drive Lenis from GSAP's ticker so smooth-scroll and scrub animations
      // share ONE clock. A separate rAF loop desyncs them by a frame, which is
      // what made the page jerk/stutter while scrolling.
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      var raf = function (t) { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }

  /* ---- anchor links via Lenis ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var tgt = document.querySelector(id);
      if (!tgt) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(tgt, { offset:-70 });
      else tgt.scrollIntoView({ behavior:'smooth' });
    });
  });

  /* ---- GSAP animations ---- */
  if (hasGSAP && window.ScrollTrigger) {
    gsap.registerPlugin(window.ScrollTrigger);

    // hero photo: subtle cinematic zoom on load (stays covering, no edge reveal)
    gsap.from('.phero__bg', { scale:1.08, duration:1.6, ease:'power2.out' });

    // generic reveals
    gsap.utils.toArray('[data-reveal]').forEach(function (el) {
      gsap.from(el, { y:44, opacity:0, duration:1, ease:'power3.out',
        scrollTrigger:{ trigger:el, start:'top 86%' } });
    });

    // parallax layers (.ph inside media)
    gsap.utils.toArray('[data-parallax]').forEach(function (el) {
      var sp = parseFloat(el.getAttribute('data-parallax')) || 12;
      gsap.fromTo(el, { yPercent:-sp }, { yPercent:sp, ease:'none',
        scrollTrigger:{ trigger: el.closest('.fleet__media,.tour__media,.pgal__item,.about') || el, start:'top bottom', end:'bottom top', scrub:true } });
    });

    // about words highlight on scroll
    var about = document.querySelector('.about__text');
    if (about) gsap.from(about, { opacity:.15, duration:1.2, ease:'power2.out', scrollTrigger:{ trigger:about, start:'top 80%' } });
  }

  /* ---- Gallery lightbox ---- */
  var lb = document.getElementById('plb');
  var lbImg = lb ? lb.querySelector('.plb__img') : null;
  document.querySelectorAll('[data-full]').forEach(function (item) {
    item.addEventListener('click', function () {
      if (!lb) return;
      lbImg.style.backgroundImage = 'url("' + item.getAttribute('data-full') + '")';
      lb.classList.add('open');
      if (lenis) lenis.stop();
    });
  });
  function closeLb(){ if(!lb) return; lb.classList.remove('open'); if(lenis) lenis.start(); }
  if (lb) {
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('plb__close')) closeLb(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLb(); });
  }

  /* ---- Booking: live preview + channel + submit ---- */
  var form = document.getElementById('bform');
  if (form) {
    var chan = 'tg';
    var links = { tg:'https://t.me/BullBike', vk:'https://vk.com/bullbike', max:'https://t.me/BullBike' };
    var labels = { tg:'Telegram', vk:'VK', max:'MAX' };

    function setPrev(key, val) {
      var el = form.parentNode.parentNode.querySelector('[data-prev="' + key + '"]');
      if (!el) el = document.querySelector('[data-prev="' + key + '"]');
      if (!el) return;
      if (val && val.trim()) { el.textContent = val; el.classList.remove('empty'); }
      else { el.textContent = '—'; el.classList.add('empty'); }
    }
    function sync() {
      setPrev('name', form.name.value);
      setPrev('phone', form.phone.value);
      var d = form.date.value, t = form.time.value;
      setPrev('datetime', (d || t) ? ((d||'') + (t ? ' · ' + t : '')) : '');
      setPrev('type', form.type.value);
      setPrev('comment', form.comment.value);
    }
    form.addEventListener('input', sync);
    form.addEventListener('change', sync);

    document.querySelectorAll('.bchan').forEach(function (b) {
      b.addEventListener('click', function () {
        document.querySelectorAll('.bchan').forEach(function (x){ x.classList.remove('active'); });
        b.classList.add('active');
        chan = b.getAttribute('data-chan');
        var sub = form.querySelector('.bsubmit');
        if (sub) sub.textContent = '🏍 Отправить в ' + labels[chan];
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var hint = document.getElementById('bhint');
      if (!form.name.value.trim() || !form.phone.value.trim()) {
        if (hint) hint.textContent = 'Укажите имя и телефон — остальное по желанию.';
        return;
      }
      var msg = 'Заявка на заезд — Bull Bike%0A' +
        'Имя: ' + enc(form.name.value) + '%0A' +
        'Телефон: ' + enc(form.phone.value) + '%0A' +
        'Дата/время: ' + enc((form.date.value||'—') + ' ' + (form.time.value||'')) + '%0A' +
        'Что интересует: ' + enc(form.type.value||'—') + '%0A' +
        'Комментарий: ' + enc(form.comment.value||'—');
      // try to copy summary for convenience
      try { navigator.clipboard && navigator.clipboard.writeText(decodeURIComponent(msg)); } catch (er) {}
      window.open(links[chan] || links.tg, '_blank');
      if (hint) hint.textContent = 'Открыли ' + labels[chan] + '. Текст заявки скопирован — вставьте и отправьте.';
    });
    function enc(s){ return encodeURIComponent(s); }
  }

  /* ---- Tours: подробнее + модалка с галереей ---- */
  var TOURS = {
    "Почасовая аренда": {"photos": ["img/tours/svoboda-1.webp", "img/tours/pitbike-1.webp", "img/tours/enduro-1.webp", "img/tours/kvadro-1.webp", "img/tours/enduro-2.webp"], "eyebrow": "Аренда · от одного часа", "meta": [["Формат", "Почасовая"], ["От", "1 часа"], ["Права", "Не нужны"], ["Цена", "от 2 000 ₽/час"]], "desc": "Самый короткий путь к заряду эмоций: берёшь технику на час или больше и едешь по лесам, полям и карьерам. Права категории А не нужны — откатаешься даже если садишься впервые. Инструктор едет рядом и подстраивается под ваш темп.", "feats": ["<b>Ataki Crosser:</b> 2 000 ₽ — 1 час, 3 500 ₽ — 2 часа, 5 000 ₽ — 3 часа. Каждый последующий час +1 000 ₽", "<b>KEWS K16:</b> 2 500 ₽ — 1 час, 4 500 ₽ — 2 часа, 6 000 ₽ — 3 часа. Каждый последующий час +1 200 ₽", "<b>Питбайк:</b> 2 000 ₽ — 1 час, 3 500 ₽ — 2 часа, 5 000 ₽ — 3 часа. Каждый последующий час +1 000 ₽", "В стоимость входит: топливо, шлем, перчатки, наколенники, яркие джерси и сопровождение инструктором", "За доплату: мотоботы +500 ₽, черепаха +500 ₽ (при наличии размеров), второй шлем +500 ₽", "��зда по пересечённой местности (леса, поля, карьеры) без прав", "При наличии кат. А на Ataki можно выезжать на дороги общего пользования — мотоциклы с номерами и всеми документами", "При аренде заключается договор и проводится инструктаж по эксплуатации и мерам безопасности", "Залог 5 000 ₽ + документ на каждую единицу техники"]},
    "Мототур на целый день": {"photos": ["img/tours/enduro-2.webp", "img/tours/enduro-1.webp", "img/tours/svoboda-1.webp", "img/tours/kvadro-2.webp"], "eyebrow": "Организованный тур · с 9 до 21", "meta": [["Формат", "Мототур"], ["Время", "с 9 до 21"], ["Пробег", "Без ограничений"], ["Цена", "от 8 000 ₽"]], "desc": "Целый день в седле: маршрут собираем под вашу компанию и оговариваем отдельно. Озёра, лесные дороги, карьеры и остановки на фото — впечатлений хватит на всю зиму разговоров.", "feats": ["Стоимость аренды на день (с 9 до 21): <b>Ataki — 8 000 ₽</b>, <b>KEWS — 10 000 ₽</b>, <b>Питбайк — 8 000 ₽</b>", "Маршрут и детали тура оговариваются отдельно", "Мотоцикл забираете и возвращаете с полным баком, даём дополнительно 15 минут на заправку", "Без ограничения пробега", "Экипировка и сопровождение инструктором — в стоимости", "Залог 5 000 ₽ + документ на каждую единицу техники"]},
    "Обучение с нуля": {"photos": ["img/tours/school-1.webp", "img/tours/pitbike-2.webp", "img/tours/pitbike-1.webp"], "eyebrow": "Обучение · индивидуально", "meta": [["Формат", "Обучение"], ["Цена", "3 000 ₽/час"], ["Уровень", "С нуля"], ["Место", "Поле"]], "desc": "Ездите по полю с инструктором и получаете главное удовольствие — ощущение «у меня получается!». Обучаем с нуля, без криков и стресса, в своём темпе.", "feats": ["Стоимость обучения — <b>3 000 ₽ в час</b>", "Стоимость экипировки и бензина входит в аренду при обучении", "Обучаем с нуля — опыт не нужен", "При достижении необходимых навыков возможны совместные выезды по маршрутам", "При аренде заключается договор и проводится инструктаж по безопасности"]},
    "Квадроциклы": {"photos": ["img/tours/kvadro-1.webp", "img/tours/kvadro-2.webp"], "eyebrow": "Аренда · для всей семьи", "meta": [["1 час", "5 000 ₽"], ["2 часа", "7 000 ₽"], ["3 часа", "10 000 ₽"], ["Сутки", "20 000 ₽"]], "desc": "Можно кататься всей семьёй — с легкостью поместятся двое взрослых и ребёнок. Никаких навыков не нужно: сел, нажал — и уже смеёшься в лужах и на подъёмах.", "feats": ["1 час — <b>5 000 ₽</b>", "2 часа — <b>7 000 ₽</b>", "3 часа — <b>10 000 ₽</b>", "Сутки — <b>20 000 ₽</b>", "Двое суток (выходные) — <b>35 000 ₽</b>", "Дополнительный пассажир — без доплаты", "Залог за квадроцикл — <b>10 000 ₽</b> + документ"]},
    "Сноубайк": {"photos": ["img/tours/snow-1.webp"], "eyebrow": "Аренда · зимний сезон", "meta": [["1 час", "4 500 ₽"], ["2 часа", "7 500 ₽"], ["3 часа", "10 000 ₽"], ["Целый день", "15 000 ₽"]], "desc": "Зима, в которой невозможно скучать: мотоцикл на гусенице и лыже идёт там, где пешком по пояс снега. Снежная пыль, белые поля и огромные глаза после первого круга.", "feats": ["1 час — <b>4 500 ₽</b>", "2 часа — <b>7 500 ₽</b>", "3 часа — <b>10 000 ₽</b>", "Каждый следующий час — <b>+2 000 ₽</b>", "Целый день — <b>15 000 ₽</b>", "Залог <b>10 000 ₽</b> + документ"]},
    "SUP-борд": {"photos": ["img/tours/sup-1.webp"], "eyebrow": "Аренда · вода и тишина", "meta": [["Час от 2 часов", "500 ₽"], ["Сутки будни", "1 200 ₽"], ["Сутки выходные", "1 400 ₽"], ["4 дня", "3 800 ₽"]], "desc": "Самые светлые эмоции лета: закат, гладкая вода и полная перезагрузка головы. Выдаём всё необходимое — остаётся только выйти на воду.", "feats": ["В комплекте: сапборд, киль, весло, насос, страховочный лиш, рюкзак для переноски", "Дополнительно можно взять спасательный жилет", "<b>500 ₽</b> — час (от 2 часов)", "<b>1 200 ₽</b> — сутки будни (пн–пт)", "<b>1 400 ₽</b> — сутки выходные (сб–вс)", "<b>3 200 ₽</b> — с пятницы по воскресенье", "<b>3 800 ₽</b> — 4 дня. Возможна аренда на более длительный срок", "Залог <b>5 000 ₽</b> + документ"]},
    "Лодка на вёслах": {"photos": ["img/tours/boat-1.webp"], "eyebrow": "Аренда · свой маршрут", "meta": [["Будний день", "1 000 ₽"], ["Выходной", "1 200 ₽"], ["Неделя", "5 000 ₽"]], "desc": "Рыбалка на рассвете, закат с термосом или неспешная прогулка по заливам — выбираете сами. Гребная лодка с вёслами в комплекте, мотор можно взять отдельно.", "feats": ["<b>1 000 ₽</b> — будний день", "<b>1 200 ₽</b> — выходной день", "<b>5 000 ₽</b> — неделя", "Вёсла в комплекте, лодочный мотор — отдельной услугой", "Залог <b>5 000 ₽</b> + документ"]},
    "Лодочные моторы": {"photos": ["img/tours/motor-1.webp", "img/tours/boat-1.webp"], "eyebrow": "Аренда · отдельно от лодки", "meta": [["2,5 л.с. будни", "1 000 ₽"], ["9,9 л.с. будни", "2 500 ₽"], ["Неделя", "от 5 000 ₽"]], "desc": "Есть своя лодка — берите только мотор. Тихий четырёхтактный Suzuki 2,5 л.с. для спокойной рыбалки или бодрый двухтактный 9,9 л.с., чтобы быстро уходить на дальние точки.", "feats": ["<b>2,5 л.с. четырёхтактный Suzuki:</b> 1 000 ₽ — будний день, 1 200 ₽ — выходной, 5 000 ₽ — неделя", "<b>9,9 л.с. двухтактный:</b> 2 500 ₽ — будний день, 3 000 ₽ — выходной, 15 000 ₽ — неделя", "Залог за 2,5 л.с. — <b>5 000 ₽</b> + документ", "Залог за 9,9 л.с. — <b>10 000 ₽</b> + документ"]},
    "Скидки": {"photos": [{"src": "img/hero.webp", "pos": "50% 45%"}], "eyebrow": "Самое приятное · выгода", "meta": [["За 2 байка", "−10%"], ["За 3 байка", "−15%"], ["Постоянным", "до −20%"], ["День рождения", "−20%"]], "desc": "Мы любим, когда за эмоциями возвращаются снова и снова — и делаем это выгодным. Собирайте компанию, берите несколько байков или приезжайте в день рождения — скидка будет.", "feats": ["Аренда от двух байков — скидка <b>10%</b>, за три байка — <b>15%</b>", "Постоянным клиентам: <b>10%</b> на второй заказ, <b>15%</b> на третий, с четвёртого заказа — постоянная <b>20%</b> на всё, включая экип", "Скидка на день рождения — <b>20%</b> (неделя до и неделя после)", "Военнослужащим и ветеранам — <b>20%</b>", "При длительной аренде от трёх суток и выше стоимость обсуждается отдельно", "<b>*Скидки не суммируются</b>", "Доп. условия: залог <b>5 000 ₽</b> + документ на каждую единицу техники"]}
  };

  var modal = document.getElementById('tmodal');
  if (modal) {
    var track = document.getElementById('tgalTrack');
    var curEl = document.getElementById('tgalCur');
    var totEl = document.getElementById('tgalTotal');
    var dotsEl = document.getElementById('tgalDots');
    var idx = 0, total = 0;
    var grads = ['#1a1a20','#201a1c','#181c20','#1c1a20','#201d18','#1a201c','#181a1e'];

    function render(){
      if (track) track.style.transform = 'translateX(' + (-idx*100) + '%)';
      if (curEl) curEl.textContent = (idx+1);
      if (dotsEl) Array.prototype.forEach.call(dotsEl.children, function(d,i){ d.classList.toggle('active', i===idx); });
    }
    function go(n){ if(total<1) return; idx = (n%total+total)%total; render(); }

    function buildSlides(t){
      var photos = (t.photos && t.photos.length) ? t.photos : null;
      total = photos ? photos.length : 6;
      var html = '';
      for (var i=0;i<total;i++){
        if (photos){
          var _p = photos[i]; var _src = (typeof _p === 'string') ? _p : _p.src; var _pos = (typeof _p !== 'string' && _p.pos) ? (';background-position:' + _p.pos) : '';
          html += '<div class="tgal__slide" data-full="' + _src + '"><div class="tgal__bg" style="background-image:url(\'' + _src + '\')"></div><div class="tgal__fg" style="background-image:url(\'' + _src + '\')' + _pos + '"></div></div>';
        } else {
          html += '<div class="tgal__slide tgal__slide--ph" style="background:radial-gradient(130% 130% at 50% 0%, ' + grads[i%grads.length] + ', #0b0b0d)"><div class="tgal__phinner"><span class="tgal__phicon">\uD83D\uDCF7</span><span class="tgal__phlabel">\u0424\u043E\u0442\u043E ' + (i+1) + ' / ' + total + '</span><span class="tgal__phsub">\u0417\u0430\u0433\u043B\u0443\u0448\u043A\u0430 \u2014 \u0437\u0430\u043C\u0435\u043D\u0438\u043C \u043D\u0430 \u0432\u0430\u0448\u0438 \u0444\u043E\u0442\u043E</span></div></div>';
        }
      }
      if (track) track.innerHTML = html;
      if (totEl) totEl.textContent = total;
      if (dotsEl){
        var d='';
        for (var j=0;j<total;j++){ d += '<button class="tgal__dot" type="button" data-i="'+j+'" aria-label="\u0424\u043E\u0442\u043E '+(j+1)+'"></button>'; }
        dotsEl.innerHTML = d;
        Array.prototype.forEach.call(dotsEl.children, function(dot){ dot.addEventListener('click', function(e){ e.stopPropagation(); go(parseInt(dot.getAttribute('data-i'),10)); }); });
      }
      if (track) Array.prototype.forEach.call(track.children, function(sl){ sl.addEventListener('click', function(){ openZoom(sl); }); });
      idx=0; render();
    }

    function openTour(name){
      var t = TOURS[name] || {};
      var card = null;
      document.querySelectorAll('.tours__grid .tour').forEach(function(c){ var n=c.querySelector('.tour__name'); if(n && n.textContent.trim()===name) card=c; });
      var titleEl=document.getElementById('tmTitle'); if(titleEl) titleEl.textContent = name;
      var eyeEl=document.getElementById('tmEyebrow'); if(eyeEl) eyeEl.textContent = t.eyebrow || '\u041C\u0430\u0440\u0448\u0440\u0443\u0442';
      var descText = t.desc || (card && card.querySelector('.tour__desc') ? card.querySelector('.tour__desc').textContent : '');
      var descEl=document.getElementById('tmDesc'); if(descEl) descEl.textContent = descText;
      var meta = t.meta || [];
      var mh=''; meta.forEach(function(m){ mh += '<div class="tmodal__chip"><span class="k">'+m[0]+'</span><span class="v">'+m[1]+'</span></div>'; });
      var metaEl=document.getElementById('tmMeta'); if(metaEl) metaEl.innerHTML = mh;
      var feats = t.feats || [];
      var fh=''; feats.forEach(function(f){ fh += '<li>'+f+'</li>'; });
      var featsEl=document.getElementById('tmFeats'); if(featsEl) featsEl.innerHTML = fh;
      var subh=modal.querySelector('.tmodal__subh'); if(subh) subh.style.display = feats.length ? '' : 'none';
      buildSlides(t);
      modal.classList.add('open');
      modal.setAttribute('aria-hidden','false');
      lockBody();
      modal.scrollTop = 0;
      if (lenis) lenis.stop();
    }
    /* Lenis swallows wheel/touch events globally, so the modal needs its own
       scrolling. data-lenis-prevent handles most cases; this is the fallback. */
    (function(){
      function scroller(){
        return window.matchMedia('(max-width:760px)').matches ? modal : modal.querySelector('.tmodal__card');
      }
      modal.addEventListener('wheel', function(e){
        if(document.getElementById('tzoom') && document.getElementById('tzoom').classList.contains('open')) return;
        var sc = scroller(); if(!sc) return;
        var max = sc.scrollHeight - sc.clientHeight;
        if(max <= 0) return;
        sc.scrollTop = Math.max(0, Math.min(max, sc.scrollTop + e.deltaY));
        e.preventDefault(); e.stopPropagation();
      }, { passive:false });
      var ty = 0;
      modal.addEventListener('touchstart', function(e){ ty = e.touches[0].clientY; }, { passive:true });
      modal.addEventListener('touchmove', function(e){
        var sc = scroller(); if(!sc) return;
        var max = sc.scrollHeight - sc.clientHeight; if(max <= 0) return;
        var y = e.touches[0].clientY, d = ty - y; ty = y;
        sc.scrollTop = Math.max(0, Math.min(max, sc.scrollTop + d));
        e.stopPropagation();
      }, { passive:true });
      modal.addEventListener('keydown', function(e){
        var sc = scroller(); if(!sc) return;
        var step = e.key === 'PageDown' || e.key === 'PageUp' ? sc.clientHeight * 0.9 : 80;
        if(e.key === 'ArrowDown' || e.key === 'PageDown'){ sc.scrollTop += step; e.preventDefault(); }
        if(e.key === 'ArrowUp' || e.key === 'PageUp'){ sc.scrollTop -= step; e.preventDefault(); }
      });
    })();

    function closeTour(){ closeZoom(); modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); unlockBody(); if(lenis) lenis.start(); }

    /* ---- body scroll lock that also works on iOS ---- */
    var _lockY = 0;
    function lockBody(){
      _lockY = window.pageYOffset || document.documentElement.scrollTop || 0;
      document.body.classList.add('tmodal-open');
      if (window.matchMedia('(max-width:760px)').matches){
        document.body.style.top = (-_lockY) + 'px';
        document.body.classList.add('tmodal-lock');
      }
    }
    function unlockBody(){
      var wasLocked = document.body.classList.contains('tmodal-lock');
      document.body.classList.remove('tmodal-open');
      document.body.classList.remove('tmodal-lock');
      document.body.style.top = '';
      if (wasLocked){
        window.scrollTo(0, _lockY);
        if (lenis && lenis.scrollTo) { try { lenis.scrollTo(_lockY, { immediate:true }); } catch(e){} }
      }
    }

    // Fullscreen photo zoom inside the modal (tap a slide to expand, Back to return)
    var zoom=document.getElementById('tzoom'), zoomImg=document.getElementById('tzoomImg'), zoomBack=document.getElementById('tzoomBack');
    var zoomPrev=document.getElementById('tzoomPrev'), zoomNext=document.getElementById('tzoomNext');
    var zoomIdx=0;
    function showZoom(i){
      if(!zoom||!zoomImg||!track) return;
      var slides=track.children; if(!slides.length) return;
      zoomIdx=(i%slides.length+slides.length)%slides.length;
      var sl=slides[zoomIdx];
      idx=zoomIdx; render();
      if(sl.classList.contains('tgal__slide--ph')){
        zoomImg.classList.add('tzoom__img--ph'); zoomImg.style.backgroundImage=''; zoomImg.innerHTML=sl.innerHTML;
      } else {
        zoomImg.classList.remove('tzoom__img--ph'); zoomImg.innerHTML=''; zoomImg.style.backgroundImage='url("'+(sl.getAttribute('data-full')||'')+'")';
      }
    }
    function openZoom(sl){
      if(!zoom||!zoomImg||!sl||!track) return;
      var i=Array.prototype.indexOf.call(track.children, sl); if(i<0) i=0;
      showZoom(i);
      zoom.classList.add('open'); zoom.setAttribute('aria-hidden','false');
    }
    function closeZoom(){ if(!zoom) return; zoom.classList.remove('open'); zoom.setAttribute('aria-hidden','true'); }
    if(zoomBack) zoomBack.addEventListener('click', function(e){ e.stopPropagation(); closeZoom(); });
    if(zoomPrev) zoomPrev.addEventListener('click', function(e){ e.stopPropagation(); showZoom(zoomIdx-1); });
    if(zoomNext) zoomNext.addEventListener('click', function(e){ e.stopPropagation(); showZoom(zoomIdx+1); });

    var pv=document.getElementById('tgalPrev'), nx=document.getElementById('tgalNext');
    if(pv) pv.addEventListener('click', function(e){ e.stopPropagation(); go(idx-1); });
    if(nx) nx.addEventListener('click', function(e){ e.stopPropagation(); go(idx+1); });
    modal.addEventListener('click', function(e){ if(e.target.closest('[data-close]')) closeTour(); });
    var cta=modal.querySelector('.tmodal__cta'); if(cta) cta.addEventListener('click', function(){ closeTour(); });
    document.addEventListener('keydown', function(e){
      if(!modal.classList.contains('open')) return;
      var zoomOpen = zoom && zoom.classList.contains('open');
      if(e.key==='Escape'){ if(zoomOpen) closeZoom(); else closeTour(); }
      else if(e.key==='ArrowLeft'){ if(zoomOpen) showZoom(zoomIdx-1); else go(idx-1); }
      else if(e.key==='ArrowRight'){ if(zoomOpen) showZoom(zoomIdx+1); else go(idx+1); }
    });

    document.querySelectorAll('.tours__grid .tour').forEach(function(card){
      var body = card.querySelector('.tour__body');
      var nameEl = card.querySelector('.tour__name');
      if(!body || !nameEl) return;
      var name = nameEl.textContent.trim();
      var zap = body.querySelector('.tour__btn');
      var btns = document.createElement('div'); btns.className='tour__btns';
      var more = document.createElement('button'); more.type='button'; more.className='tour__more'; more.innerHTML='\u041F\u043E\u0434\u0440\u043E\u0431\u043D\u0435\u0435 <span>&rarr;</span>';
      if(zap){ body.insertBefore(btns, zap); btns.appendChild(more); btns.appendChild(zap); }
      else { body.appendChild(btns); btns.appendChild(more); }
      card.classList.add('tour--interactive');
      more.addEventListener('click', function(e){ e.stopPropagation(); openTour(name); });
      card.addEventListener('click', function(e){ if(e.target.closest('.tour__btn')) return; openTour(name); });
    });

    window.__openTour = openTour;
  }

  /* ---- Custom red dropdowns + calendar ---- */
  (function(){
    var bf=document.getElementById('bform'); if(!bf) return;
    function fire(el,t){ var ev; try{ev=new Event(t,{bubbles:true});}catch(e){ev=document.createEvent('Event');ev.initEvent(t,true,true);} el.dispatchEvent(ev); }
    var closers=[]; function closeAll(ex){ for(var i=0;i<closers.length;i++) closers[i](ex); }
    function enhance(sel){
      var wrap=document.createElement('div'); wrap.className='csel'+(sel.name==='time'?' csel--time':'');
      sel.parentNode.insertBefore(wrap,sel); wrap.appendChild(sel); sel.classList.add('csel__native'); sel.tabIndex=-1;
      var field=document.createElement('button'); field.type='button'; field.className='csel__field';
      var panel=document.createElement('div'); panel.className='csel__panel'; wrap.appendChild(field); wrap.appendChild(panel);
      function addOpt(op){ if(!op.value) return; var b=document.createElement('button'); b.type='button'; b.className='csel__opt'+(op.value===sel.value?' sel':''); b.textContent=op.text; b.addEventListener('click',function(e){ e.stopPropagation(); sel.value=op.value; fire(sel,'change'); close(); render(); }); panel.appendChild(b); }
      function render(){ var empty=!sel.value; field.innerHTML=''; var v=document.createElement('span'); v.className='csel__val'; v.textContent=empty?sel.options[0].text:sel.options[sel.selectedIndex].text; var a=document.createElement('span'); a.className='csel__arw'; field.appendChild(v); field.appendChild(a); field.classList.toggle('is-empty',empty); panel.innerHTML=''; Array.prototype.forEach.call(sel.children,function(node){ if(node.tagName==='OPTGROUP'){ var g=document.createElement('div'); g.className='csel__group'; g.textContent=node.label; panel.appendChild(g); Array.prototype.forEach.call(node.children,addOpt); } else addOpt(node); }); }
      function open(){ closeAll(wrap); wrap.classList.add('open'); } function close(){ wrap.classList.remove('open'); }
      closers.push(function(ex){ if(ex!==wrap) close(); });
      field.addEventListener('click',function(e){ e.stopPropagation(); wrap.classList.contains('open')?close():open(); });
      sel.addEventListener('change',render); render();
    }
    Array.prototype.forEach.call(bf.querySelectorAll('select'),enhance);
    var dinp=bf.querySelector('input[data-cal]');
    if(dinp){
      var MON=['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
      var GEN=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
      var WD=['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
      dinp.readOnly=true;
      var cw=document.createElement('div'); cw.className='caldd'; dinp.parentNode.insertBefore(cw,dinp); cw.appendChild(dinp);
      var cal=document.createElement('div'); cal.className='cal'; cw.appendChild(cal);
      var today=new Date(); today.setHours(0,0,0,0);
      var view=new Date(today.getFullYear(),today.getMonth(),1); var chosen=null;
      function draw(){ var y=view.getFullYear(),m=view.getMonth(); var sd=(new Date(y,m,1).getDay()+6)%7; var dn=new Date(y,m+1,0).getDate();
        var h='<div class="cal__head"><button type="button" class="cal__nav" data-d="-1">\u2039</button><span class="cal__title">'+MON[m]+' '+y+'</span><button type="button" class="cal__nav" data-d="1">\u203A</button></div><div class="cal__wd">';
        for(var w=0;w<7;w++) h+='<span>'+WD[w]+'</span>'; h+='</div><div class="cal__grid">';
        for(var i=0;i<sd;i++) h+='<span class="cal__cell empty"></span>';
        for(var d=1;d<=dn;d++){ var dt=new Date(y,m,d); var c='cal__cell'; if(dt<today)c+=' past'; if(dt.getTime()===today.getTime())c+=' today'; if(chosen&&dt.getTime()===chosen.getTime())c+=' sel'; h+='<button type="button" class="'+c+'" data-day="'+d+'"'+(dt<today?' disabled':'')+'>'+d+'</button>'; }
        h+='</div>'; cal.innerHTML=h; }
      function openC(){ closeAll(); draw(); cw.classList.add('open'); } function closeC(){ cw.classList.remove('open'); }
      closers.push(function(ex){ if(ex!==cw) closeC(); });
      dinp.addEventListener('click',function(e){ e.stopPropagation(); cw.classList.contains('open')?closeC():openC(); });
      cal.addEventListener('click',function(e){ e.stopPropagation(); var nav=e.target.closest('.cal__nav'); if(nav){ view.setMonth(view.getMonth()+parseInt(nav.getAttribute('data-d'),10)); draw(); return; } var cell=e.target.closest('.cal__cell'); if(!cell||cell.classList.contains('empty')||cell.disabled) return; var d=parseInt(cell.getAttribute('data-day'),10); chosen=new Date(view.getFullYear(),view.getMonth(),d); dinp.value=d+' '+GEN[view.getMonth()]; fire(dinp,'input'); fire(dinp,'change'); closeC(); });
    }
    document.addEventListener('click',function(){ closeAll(); });
  })();
})();
