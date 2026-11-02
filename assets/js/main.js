/* Headstart — interactions & scroll animations */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cfg = window.HEADSTART || {};

  /* Year ------------------------------------------------------------- */
  $$('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));

  /* Header, progress bar, back-to-top -------------------------------- */
  const header = $('[data-header]');
  const bar = $('[data-progress]');
  const toTop = $('[data-top]');
  let lastY = window.scrollY;
  let ticking = false;

  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle('is-scrolled', y > 20);
    const megaOpen = $('.has-mega:hover, .has-mega:focus-within');
    header.classList.toggle('is-hidden', y > lastY && y > 400 && !megaOpen && !document.body.classList.contains('nav-open'));
    lastY = y;
    if (bar) bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    if (toTop) toTop.classList.toggle('is-visible', y > 700);
    parallax();
    processLines();
    textReveal();
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  window.addEventListener('resize', () => requestAnimationFrame(onScroll));
  toTop && toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }));

  /* Mobile navigation ------------------------------------------------ */
  const burger = $('[data-burger]');
  const mnav = $('[data-mnav]');
  const setNav = (open) => {
    document.body.classList.toggle('nav-open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    mnav.setAttribute('aria-hidden', !open);
  };
  burger && burger.addEventListener('click', () => setNav(!document.body.classList.contains('nav-open')));
  $$('[data-acc]').forEach((b) => b.addEventListener('click', () => {
    const li = b.parentElement;
    const open = !li.classList.contains('is-open');
    $$('.mnav__group').forEach((g) => g.classList.remove('is-open'));
    li.classList.toggle('is-open', open);
  }));
  $$('.mnav a').forEach((a) => a.addEventListener('click', () => setNav(false)));
  document.addEventListener('keydown', (ev) => {
    if (ev.key !== 'Escape') return;
    setNav(false);
    if (document.activeElement && document.activeElement.closest('.has-mega')) document.activeElement.blur();
  });

  /* Split headline words -------------------------------------------- */
  $$('[data-split]').forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map((w, i) => `<span class="w"><span style="--i:${i}">${w}</span></span>`).join(' ');
    requestAnimationFrame(() => setTimeout(() => el.classList.add('is-in'), 60));
  });

  /* Text reveal (words light up on scroll) -------------------------- */
  const trEls = $$('[data-textreveal]').map((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map((w) => `<span class="tw">${w}</span>`).join(' ');
    return { el, words: $$('.tw', el) };
  });
  function textReveal() {
    const vh = window.innerHeight;
    trEls.forEach(({ el, words }) => {
      const r = el.getBoundingClientRect();
      const p = reduced ? 1 : Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
      const lit = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle('is-lit', i < lit));
    });
  }

  /* Reveal on scroll ------------------------------------------------- */
  $$('[data-stagger]').forEach((parent) => {
    $$(':scope > [data-reveal]', parent).forEach((child, i) => child.style.setProperty('--d', `${(i % 8) * 0.08}s`));
  });
  const revealEls = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !reduced) {
    // Wipe elements are fully clipped, which Chrome treats as never intersecting,
    // so observe their parent and reveal the element through this map.
    const targets = new Map();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        (targets.get(en.target) || []).forEach((el) => el.classList.add('is-in'));
        io.unobserve(en.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => {
      const watch = el.dataset.reveal === 'wipe' ? el.parentElement : el;
      if (!targets.has(watch)) targets.set(watch, []);
      targets.get(watch).push(el);
      io.observe(watch);
    });
  } else {
    revealEls.forEach((el) => el.classList.add('is-in'));
  }

  /* Counters --------------------------------------------------------- */
  const counters = $$('[data-count]');
  const runCount = (el) => {
    const target = +el.dataset.count;
    if (reduced) { el.textContent = target; return; }
    const dur = 1800;
    const t0 = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 4)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window) {
    const cio = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { runCount(en.target); cio.unobserve(en.target); }
    }), { threshold: 0.6 });
    counters.forEach((c) => cio.observe(c));
  } else counters.forEach(runCount);

  /* Parallax --------------------------------------------------------- */
  const pEls = $$('[data-parallax]');
  function parallax() {
    if (reduced || window.innerWidth < 720) return;
    const vh = window.innerHeight;
    pEls.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      const speed = parseFloat(el.dataset.parallax) || 0.05;
      const offset = (r.top + r.height / 2 - vh / 2) * -speed;
      const img = el.querySelector('img');
      if (img) img.style.translate = `0 ${offset.toFixed(1)}px`;
      if (img && !img.style.scale) img.style.scale = '1.12';
    });
  }

  /* Process line fill ----------------------------------------------- */
  const procs = $$('[data-process]');
  function processLines() {
    const vh = window.innerHeight;
    procs.forEach((el) => {
      const r = el.getBoundingClientRect();
      const p = reduced ? 1 : Math.min(1, Math.max(0, (vh * 0.75 - r.top) / (r.height + vh * 0.1)));
      el.style.setProperty('--p', p.toFixed(3));
      const steps = $$('.process__step', el);
      steps.forEach((s, i) => s.classList.toggle('is-active', p >= i / steps.length + 0.02));
    });
  }

  /* Rotating hero word ---------------------------------------------- */
  $$('[data-rotator]').forEach((rot) => {
    const items = $$('b', rot);
    if (items.length < 2 || reduced) return;
    let i = 0;
    setInterval(() => {
      const cur = items[i];
      i = (i + 1) % items.length;
      cur.classList.remove('is-on');
      cur.classList.add('is-out');
      items[i].classList.remove('is-out');
      items[i].classList.add('is-on');
      setTimeout(() => cur.classList.remove('is-out'), 700);
    }, 2600);
  });

  /* Tabs ------------------------------------------------------------- */
  $$('[data-tabs]').forEach((tabs) => {
    const btns = $$('[role="tab"]', tabs);
    const ink = $('.tabs__ink', tabs);
    const moveInk = (b) => {
      if (!ink) return;
      ink.style.width = `${b.offsetWidth}px`;
      ink.style.transform = `translateX(${b.offsetLeft}px)`;
    };
    const activate = (b, focus) => {
      btns.forEach((x) => {
        const on = x === b;
        x.classList.toggle('is-active', on);
        x.setAttribute('aria-selected', on);
        x.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(x.getAttribute('aria-controls'));
        panel.hidden = !on;
        panel.classList.toggle('is-active', on);
        if (on) $$('[data-reveal]', panel).forEach((r) => r.classList.add('is-in'));
      });
      moveInk(b);
      if (focus) b.focus();
    };
    btns.forEach((b, i) => {
      b.addEventListener('click', () => activate(b));
      b.addEventListener('keydown', (ev) => {
        if (ev.key === 'ArrowRight' || ev.key === 'ArrowLeft') {
          const n = btns[(i + (ev.key === 'ArrowRight' ? 1 : btns.length - 1)) % btns.length];
          activate(n, true);
        }
      });
    });
    const init = () => moveInk(btns.find((b) => b.classList.contains('is-active')) || btns[0]);
    init();
    window.addEventListener('resize', init);
    document.fonts && document.fonts.ready.then(init);
  });

  /* Works filter ----------------------------------------------------- */
  const filters = $('[data-filters]');
  const worksGrid = $('[data-works]');
  if (filters && worksGrid) {
    filters.addEventListener('click', (ev) => {
      const b = ev.target.closest('[data-filter]');
      if (!b) return;
      $$('[data-filter]', filters).forEach((x) => {
        x.classList.toggle('is-active', x === b);
        x.setAttribute('aria-pressed', x === b);
      });
      const f = b.dataset.filter;
      $$('.work', worksGrid).forEach((w) => {
        const show = f === 'all' || w.dataset.cat === f;
        w.classList.toggle('is-hidden', !show);
        if (show && !reduced) w.animate([{ opacity: 0, transform: 'translateY(20px)' }, { opacity: 1, transform: 'none' }], { duration: 500, easing: 'cubic-bezier(.22,1,.36,1)' });
      });
    });
  }

  /* Forms ------------------------------------------------------------ */
  const messages = {
    valueMissing: 'This field is required.',
    typeMismatch: { email: 'Please enter a valid email address.', url: 'Please enter a valid URL (https://…).' },
    tooShort: 'Please enter a little more detail.',
  };
  const phoneOk = (v) => !v || /^[+\d][\d\s()-]{6,}$/.test(v.trim());

  const validateField = (input) => {
    const field = input.closest('.field');
    if (!field) return true;
    const err = $('.field__err', field);
    let msg = '';
    if (input.validity.valueMissing) msg = input.type === 'checkbox' ? 'Please confirm to continue.' : messages.valueMissing;
    else if (input.validity.typeMismatch) msg = messages.typeMismatch[input.type] || 'Please check this value.';
    else if (input.type === 'tel' && !phoneOk(input.value)) msg = 'Please enter a valid phone number.';
    field.classList.toggle('is-invalid', !!msg);
    if (err) err.textContent = msg;
    return !msg;
  };

  const preselect = new URLSearchParams(location.search).get('service');

  $$('form[data-form]').forEach((form) => {
    const kind = form.dataset.form;
    const inputs = $$('input, select, textarea', form);

    if (preselect) {
      const sel = $('select[name="service"]', form);
      if (sel) [...sel.options].forEach((o) => { if (o.text === preselect) sel.value = o.value; });
    }

    inputs.forEach((i) => {
      i.addEventListener('blur', () => i.closest('.field.is-invalid') && validateField(i));
      i.addEventListener('input', () => i.closest('.field.is-invalid') && validateField(i));
      i.addEventListener('change', () => i.closest('.field.is-invalid') && validateField(i));
    });

    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();

      if (kind === 'newsletter') {
        const email = $('input[type="email"]', form);
        const msg = $('.form-msg', form);
        if (!email.value || !email.checkValidity()) { msg.textContent = 'Please enter a valid email address.'; email.focus(); return; }
        await send(form, kind);
        msg.textContent = 'Thank you for subscribing!';
        form.reset();
        return;
      }

      const ok = inputs.map(validateField).every(Boolean);
      if (!ok) {
        const first = $('.is-invalid input, .is-invalid select, .is-invalid textarea', form);
        first && first.focus();
        return;
      }
      form.classList.add('is-loading');
      const btnLabel = $('button[type="submit"] span', form);
      const label = btnLabel.textContent;
      btnLabel.textContent = 'Sending…';
      try {
        await send(form, kind);
        form.classList.add('is-sent');
        form.reset();
        $('.form__success', form).scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
      } catch (e) {
        alert('Sorry, something went wrong. Please try again or contact us on WhatsApp.');
      } finally {
        form.classList.remove('is-loading');
        btnLabel.textContent = label;
      }
    });
  });

  // Sends to the configured endpoint (e.g. Formspree). Without one, simulates success.
  async function send(form, kind) {
    const data = new FormData(form);
    data.append('form', kind);
    data.append('page', location.pathname);
    if (!cfg.formEndpoint) return new Promise((r) => setTimeout(r, 900));
    const res = await fetch(cfg.formEndpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error('Request failed');
  }

  /* Image fallback: keep the grey placeholder if an image fails ------ */
  $$('.media img').forEach((img) => {
    if (img.complete && img.naturalWidth === 0) img.remove();
  });

  onScroll();
})();
