// Generates the static Headstart website from build/data.js.
// Usage: node build/build.js
const fs = require('fs');
const path = require('path');
const { site, img, marketing, talent, works, industries } = require('./data');
const { icon, whatsapp, logo } = require('./icons');

const OUT = path.join(__dirname, '..');
const e = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pad = (n) => String(n).padStart(2, '0');

// ---------------------------------------------------------------------------
// Building blocks
// ---------------------------------------------------------------------------
const media = (id, alt, { w = 1400, h, cls = '', attrs = '', eager = false } = {}) =>
  `<figure class="media ${cls}" ${attrs}><img src="${img(id, w, h)}" alt="${e(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" onerror="this.remove()"></figure>`;

const btn = (href, label, variant = 'primary', ico = 'arrow-right') =>
  `<a class="btn btn--${variant}" href="${href}"><span>${e(label)}</span>${icon(ico)}</a>`;

const eyebrow = (t, light) => `<span class="eyebrow${light ? ' eyebrow--light' : ''}">${e(t)}</span>`;

const sectionHead = ({ eyebrow: eb, title, text, light, center, link }) => `
  <div class="shead${center ? ' shead--center' : ''}" data-reveal>
    <div>
      ${eb ? eyebrow(eb, light) : ''}
      <h2 class="shead__title">${title}</h2>
    </div>
    ${text ? `<p class="shead__text">${e(text)}</p>` : ''}
    ${link || ''}
  </div>`;

// ---------------------------------------------------------------------------
// Header / footer / layout
// ---------------------------------------------------------------------------
const megaItems = (list) =>
  list.map((s) => `
          <a class="mega__item" href="${s.slug}.html">
            <span class="mega__icon">${icon(s.icon)}</span>
            <span><strong>${e(s.short)}</strong><small>${e(s.blurb)}</small></span>
          </a>`).join('');

const megaMenu = (list, href, title, imageId, text, cols) => `
      <div class="mega" role="region" aria-label="${e(title)}">
        <div class="mega__inner container">
          <div class="mega__grid${cols === 1 ? ' mega__grid--one' : ''}">${megaItems(list)}
          </div>
          <a class="mega__feature" href="${href}">
            ${media(imageId, title, { w: 640, h: 420 })}
            <span class="mega__feature-body">
              <small>Overview</small>
              <strong>${e(title)}</strong>
              <span>${e(text)}</span>
              <em>Explore ${icon('arrow-right')}</em>
            </span>
          </a>
        </div>
      </div>`;

const header = (active) => {
  const cls = (k) => `nav__link${active === k ? ' is-active' : ''}`;
  return `
<div class="scroll-progress" aria-hidden="true"><span data-progress></span></div>
<a class="skip-link" href="#main">Skip to content</a>
<header class="header" data-header>
  <div class="container header__inner">
    <a class="logo" href="index.html" aria-label="Headstart home">${logo('lg-h')}</a>
    <nav class="nav" aria-label="Primary">
      <ul class="nav__list">
        <li><a class="${cls('about')}" href="about.html">About Us</a></li>
        <li class="has-mega">
          <a class="${cls('marketing')}" href="branding-marketing.html" aria-haspopup="true">Branding &amp; Marketing ${icon('chevron-down', 'nav__chev')}</a>
          ${megaMenu(marketing, 'branding-marketing.html', 'Branding & Marketing', '1533750349088-cd871a92f312', 'Integrated digital, B2B, events and on-ground marketing that builds brands and drives demand.')}
        </li>
        <li class="has-mega">
          <a class="${cls('talent')}" href="talent-recruitment.html" aria-haspopup="true">Talent &amp; Recruitment ${icon('chevron-down', 'nav__chev')}</a>
          ${megaMenu(talent, 'talent-recruitment.html', 'Talent & Recruitment', '1519085360753-af0119f7cbe7', 'Leadership search, board appointments, interim CXOs and talent intelligence.', 1)}
        </li>
        <li><a class="${cls('works')}" href="our-works.html">Our Works</a></li>
        <li><a class="${cls('partner')}" href="partner.html">Partner</a></li>
      </ul>
    </nav>
    <div class="header__actions">
      <a class="btn btn--primary btn--sm header__cta" href="contact.html"><span>Contact Us</span>${icon('arrow-up-right')}</a>
      <button class="burger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mnav" data-burger><span></span><span></span><span></span></button>
    </div>
  </div>
</header>

<div class="mnav" id="mnav" data-mnav aria-hidden="true">
  <div class="mnav__inner">
    <ul class="mnav__list">
      <li><a href="index.html">Home</a></li>
      <li><a href="about.html">About Us</a></li>
      <li class="mnav__group">
        <button type="button" data-acc>Branding &amp; Marketing ${icon('chevron-down')}</button>
        <div class="mnav__sub"><div>
          <a href="branding-marketing.html"><strong>Overview</strong></a>
          ${marketing.map((s) => `<a href="${s.slug}.html">${e(s.short)}</a>`).join('')}
        </div></div>
      </li>
      <li class="mnav__group">
        <button type="button" data-acc>Talent &amp; Recruitment ${icon('chevron-down')}</button>
        <div class="mnav__sub"><div>
          <a href="talent-recruitment.html"><strong>Overview</strong></a>
          ${talent.map((s) => `<a href="${s.slug}.html">${e(s.short)}</a>`).join('')}
        </div></div>
      </li>
      <li><a href="our-works.html">Our Works</a></li>
      <li><a href="partner.html">Partner</a></li>
      <li><a href="contact.html">Contact Us</a></li>
    </ul>
    <div class="mnav__foot">
      <a href="tel:${site.phoneHref}">${icon('phone')} ${e(site.phone)}</a>
      <a href="mailto:${site.email}">${icon('mail')} ${e(site.email)}</a>
    </div>
  </div>
</div>`;
};

const socials = () =>
  Object.entries(site.social)
    .map(([k, href]) => `<a href="${href}" aria-label="${k}" class="social">${icon(k)}</a>`)
    .join('');

const footer = () => `
<footer class="footer">
  <div class="container">
    <div class="footer__top">
      <div class="footer__brand">
        <a class="logo logo--light logo--footer" href="index.html" aria-label="Headstart home">${logo('lg-f')}</a>
        <p>Branding &amp; Marketing and Talent &amp; Recruitment, delivered as one growth partner. We help ambitious organisations build brands, generate demand and appoint the leaders who take them further.</p>
        <div class="socials">${socials()}</div>
      </div>
      <div class="footer__col">
        <h3>Branding &amp; Marketing</h3>
        <ul>${marketing.map((s) => `<li><a href="${s.slug}.html">${e(s.short)}</a></li>`).join('')}</ul>
      </div>
      <div class="footer__col">
        <h3>Talent &amp; Recruitment</h3>
        <ul>${talent.map((s) => `<li><a href="${s.slug}.html">${e(s.short)}</a></li>`).join('')}</ul>
        <h3 class="mt">Company</h3>
        <ul>
          <li><a href="about.html">About Us</a></li>
          <li><a href="our-works.html">Our Works</a></li>
          <li><a href="partner.html">Partner With Us</a></li>
          <li><a href="contact.html">Contact Us</a></li>
        </ul>
      </div>
      <div class="footer__col footer__news">
        <h3>Insights in your inbox</h3>
        <p>Occasional notes on marketing, growth and leadership hiring. No spam.</p>
        <form class="news-form" data-form="newsletter" novalidate>
          <label class="sr-only" for="news-email">Email address</label>
          <input id="news-email" type="email" name="email" placeholder="Your work email" required>
          <button class="btn btn--primary btn--icon" type="submit" aria-label="Subscribe">${icon('arrow-right')}</button>
          <p class="form-msg" role="status" aria-live="polite"></p>
        </form>
        <ul class="footer__contact">
          <li>${icon('phone')}<a href="tel:${site.phoneHref}">${e(site.phone)}</a></li>
          <li>${icon('mail')}<a href="mailto:${site.email}">${e(site.email)}</a></li>
          <li>${icon('pin')}<span>${e(site.address)}</span></li>
        </ul>
      </div>
    </div>
    <div class="footer__word" aria-hidden="true">headstart</div>
    <div class="footer__bottom">
      <p>&copy; <span data-year>2026</span> Headstart. All rights reserved.</p>
      <div><a href="#">Privacy Policy</a><a href="#">Terms of Use</a></div>
    </div>
  </div>
</footer>

<a class="wa-float" href="https://wa.me/${site.whatsapp}?text=${encodeURIComponent('Hello Headstart, I would like to know more about your services.')}" target="_blank" rel="noopener" aria-label="Chat with us on WhatsApp">
  ${whatsapp}<span class="wa-float__tip">Chat with us</span>
</a>
<button class="to-top" type="button" aria-label="Back to top" data-top>${icon('arrow-up')}</button>`;

const layout = ({ title, desc, active, body, page }) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${e(title)}</title>
<meta name="description" content="${e(desc)}">
<meta name="theme-color" content="#1B4A3E">
<meta property="og:title" content="${e(title)}">
<meta property="og:description" content="${e(desc)}">
<meta property="og:type" content="website">
<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://images.unsplash.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Montserrat:wght@800&family=Sora:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/style.css">
<script>document.documentElement.classList.add('js');window.HEADSTART={formEndpoint:${JSON.stringify(site.formEndpoint)},whatsapp:${JSON.stringify(site.whatsapp)}};</script>
</head>
<body class="page-${page}">
${header(active)}
<main id="main">
${body}
</main>
${footer()}
<script src="assets/js/main.js" defer></script>
</body>
</html>
`;

// ---------------------------------------------------------------------------
// Forms
// ---------------------------------------------------------------------------
const field = (name, label, { type = 'text', required = true, placeholder = '', full = false, auto = '' } = {}) => `
        <div class="field${full ? ' field--full' : ''}">
          <label for="f-${name}">${e(label)}${required ? ' <i>*</i>' : ''}</label>
          <input id="f-${name}" name="${name}" type="${type}" ${placeholder ? `placeholder="${e(placeholder)}"` : ''} ${auto ? `autocomplete="${auto}"` : ''} ${required ? 'required' : ''}>
          <span class="field__err"></span>
        </div>`;

const select = (name, label, options, { required = true, selected = '', full = false, groups } = {}) => {
  const opt = (o) => `<option${o === selected ? ' selected' : ''}>${e(o)}</option>`;
  const body = groups
    ? groups.map((g) => `<optgroup label="${e(g.label)}">${g.items.map(opt).join('')}</optgroup>`).join('')
    : options.map(opt).join('');
  return `
        <div class="field${full ? ' field--full' : ''}">
          <label for="f-${name}">${e(label)}${required ? ' <i>*</i>' : ''}</label>
          <div class="select"><select id="f-${name}" name="${name}" ${required ? 'required' : ''}><option value="" disabled ${selected ? '' : 'selected'}>Select an option</option>${body}</select>${icon('chevron-down')}</div>
          <span class="field__err"></span>
        </div>`;
};

const textarea = (name, label, placeholder, required = false) => `
        <div class="field field--full">
          <label for="f-${name}">${e(label)}${required ? ' <i>*</i>' : ''}</label>
          <textarea id="f-${name}" name="${name}" rows="4" placeholder="${e(placeholder)}" ${required ? 'required' : ''}></textarea>
          <span class="field__err"></span>
        </div>`;

const consent = (text = 'I agree to be contacted by Headstart regarding my enquiry.') => `
        <div class="field field--full field--check">
          <label class="check"><input type="checkbox" name="consent" required><span class="check__box">${icon('check')}</span><span>${e(text)}</span></label>
          <span class="field__err"></span>
        </div>`;

const serviceGroups = [
  { label: 'Branding & Marketing', items: marketing.map((s) => s.short) },
  { label: 'Talent & Recruitment', items: talent.map((s) => s.short) },
  { label: 'Other', items: ['Partnership enquiry', 'General enquiry'] },
];

const formShell = (kind, title, sub, fields, submit) => `
      <form class="form" data-form="${kind}" novalidate>
        <div class="form__head">
          <h3>${e(title)}</h3>
          <p>${e(sub)}</p>
        </div>
        <div class="form__grid">${fields}
        </div>
        <button class="btn btn--primary btn--block" type="submit"><span>${e(submit)}</span>${icon('arrow-right')}</button>
        <p class="form__note">${icon('lock')} Your information is kept confidential.</p>
        <div class="form__success" role="status" aria-live="polite">
          <span class="form__success-icon">${icon('check')}</span>
          <h3>Thank you — we've received your details.</h3>
          <p>Our team will review your enquiry and get in touch shortly. For anything urgent, message us on WhatsApp.</p>
          <a class="btn btn--dark" href="https://wa.me/${site.whatsapp}" target="_blank" rel="noopener"><span>Chat on WhatsApp</span>${icon('arrow-up-right')}</a>
        </div>
      </form>`;

const forms = {
  enquiry: (service) => formShell('enquiry', 'Start a conversation', 'Tell us about your goals and we will get back to you with ideas.',
    field('name', 'Full name', { auto: 'name', placeholder: 'Your name' }) +
    field('company', 'Company', { auto: 'organization', placeholder: 'Company name' }) +
    field('email', 'Work email', { type: 'email', auto: 'email', placeholder: 'name@company.com' }) +
    field('phone', 'Phone', { type: 'tel', auto: 'tel', placeholder: '+91' }) +
    select('service', 'Service of interest', [], { selected: service, groups: serviceGroups }) +
    select('budget', 'Monthly budget', ['Under ₹1 Lakh', '₹1 – 3 Lakh', '₹3 – 10 Lakh', 'Above ₹10 Lakh', 'Not sure yet'], { required: false }) +
    textarea('message', 'Project details', 'What would you like to achieve?') +
    consent(), 'Send Enquiry'),

  event: () => formShell('event', 'Plan your event with us', 'Share a few details and our events team will reach out.',
    field('name', 'Full name', { auto: 'name', placeholder: 'Your name' }) +
    field('company', 'Organisation', { auto: 'organization', placeholder: 'Organisation name' }) +
    field('email', 'Work email', { type: 'email', auto: 'email', placeholder: 'name@company.com' }) +
    field('phone', 'Phone', { type: 'tel', auto: 'tel', placeholder: '+91' }) +
    select('event_type', 'Event type', ['Corporate summit / conference', 'Leadership forum / CXO roundtable', 'Annual day / celebration', 'Award ceremony', 'Product launch', 'Industry conclave / networking', 'Other']) +
    field('event_date', 'Tentative date', { type: 'date', required: false }) +
    select('attendees', 'Expected attendees', ['Under 100', '100 – 300', '300 – 750', '750+'], { required: false }) +
    select('budget', 'Estimated budget', ['Under ₹5 Lakh', '₹5 – 15 Lakh', '₹15 – 50 Lakh', 'Above ₹50 Lakh', 'Not sure yet'], { required: false }) +
    textarea('message', 'Event objectives', 'Audience, format, city, sponsors, anything else we should know') +
    consent(), 'Submit Event Enquiry'),

  hiring: (service) => formShell('hiring', 'Submit a hiring brief', 'All briefs are handled in strict confidence.',
    field('name', 'Full name', { auto: 'name', placeholder: 'Your name' }) +
    field('designation', 'Your designation', { placeholder: 'e.g. Founder, CHRO' }) +
    field('company', 'Company', { auto: 'organization', placeholder: 'Company name' }) +
    field('email', 'Work email', { type: 'email', auto: 'email', placeholder: 'name@company.com' }) +
    field('phone', 'Phone', { type: 'tel', auto: 'tel', placeholder: '+91' }) +
    select('service', 'Service required', talent.map((s) => s.short), { selected: service }) +
    field('role', 'Role(s) to hire', { placeholder: 'e.g. CFO, Independent Director', required: false }) +
    select('timeline', 'Hiring timeline', ['Immediate', 'Within 1 month', '1 – 3 months', '3+ months', 'Exploring options'], { required: false }) +
    textarea('message', 'Brief description', 'Mandate, location, industry, team size or any other context') +
    consent('I agree to be contacted by Headstart. This brief will be treated as confidential.'), 'Submit Hiring Brief'),

  partner: () => formShell('partner', 'Become a partner', 'Tell us about your organisation and how you would like to collaborate.',
    field('name', 'Full name', { auto: 'name', placeholder: 'Your name' }) +
    field('company', 'Organisation', { auto: 'organization', placeholder: 'Organisation name' }) +
    field('email', 'Work email', { type: 'email', auto: 'email', placeholder: 'name@company.com' }) +
    field('phone', 'Phone', { type: 'tel', auto: 'tel', placeholder: '+91' }) +
    field('website', 'Website', { type: 'url', required: false, placeholder: 'https://' }) +
    select('partnership', 'Partnership type', ['Referral partner', 'Channel / reseller partner', 'Co-marketing partner', 'Event & sponsorship partner', 'Community / association partner', 'Other']) +
    textarea('message', 'How would you like to collaborate?', 'Your audience, offering and partnership idea') +
    consent(), 'Submit Partnership Request'),

  contact: () => formShell('contact', 'Send us a message', 'Fill in the form and the right team will get back to you.',
    field('name', 'Full name', { auto: 'name', placeholder: 'Your name' }) +
    field('company', 'Company', { auto: 'organization', placeholder: 'Company name', required: false }) +
    field('email', 'Email', { type: 'email', auto: 'email', placeholder: 'name@company.com' }) +
    field('phone', 'Phone', { type: 'tel', auto: 'tel', placeholder: '+91' }) +
    select('service', 'How can we help?', [], { full: true, groups: serviceGroups }) +
    textarea('message', 'Message', 'Tell us a little about your requirement', true) +
    consent(), 'Send Message'),
};

const ctaSection = ({ title, text, form, id = 'enquire' }) => `
<section class="section section--dark cta-form" id="${id}">
  <div class="glow glow--br" aria-hidden="true"></div>
  <div class="container cta-form__grid">
    <div class="cta-form__copy" data-reveal>
      ${eyebrow("Let's talk", true)}
      <h2 class="display-2">${e(title)}</h2>
      <p class="lead">${e(text)}</p>
      <ul class="contact-points">
        <li><span>${icon('phone')}</span><div><small>Call us</small><a href="tel:${site.phoneHref}">${e(site.phone)}</a></div></li>
        <li><span>${icon('mail')}</span><div><small>Email us</small><a href="mailto:${site.email}">${e(site.email)}</a></div></li>
        <li><span class="wa">${whatsapp}</span><div><small>WhatsApp</small><a href="https://wa.me/${site.whatsapp}" target="_blank" rel="noopener">Chat with our team</a></div></li>
      </ul>
    </div>
    <div class="cta-form__card" data-reveal="right">${form}
    </div>
  </div>
</section>`;

// ---------------------------------------------------------------------------
// Section renderers
// ---------------------------------------------------------------------------
const renderers = {
  cards: (s) => `
<section class="section section--gray">
  <div class="container">
    ${sectionHead({ eyebrow: s.eyebrow, title: e(s.title) })}
    <div class="cards" data-stagger>
      ${s.items.map((it, i) => `
      <article class="card" data-reveal>
        <div class="card__top"><span class="card__icon">${icon(it.icon)}</span><span class="card__num">${pad(i + 1)}</span></div>
        <h3 class="card__title">${e(it.t)}</h3>
        <p>${e(it.d)}</p>
      </article>`).join('')}
    </div>
  </div>
</section>`,

  chips: (s) => `
<section class="section">
  <div class="container chips-wrap">
    ${sectionHead({ eyebrow: s.eyebrow, title: e(s.title) })}
    <ul class="chips" data-stagger>
      ${s.items.map((t) => `<li class="chip" data-reveal="scale"><span class="chip__dot"></span>${e(t)}</li>`).join('')}
    </ul>
  </div>
</section>`,

  process: (s) => `
<section class="section section--dark process-sec">
  <div class="grid-lines" aria-hidden="true"></div>
  <div class="container">
    ${sectionHead({ eyebrow: s.eyebrow, title: e(s.title), light: true })}
    <ol class="process" data-process data-stagger>
      ${s.items.map((it, i) => `
      <li class="process__step" data-reveal>
        <span class="process__num">${pad(i + 1)}</span>
        <h3>${e(it.t)}</h3>
        <p>${e(it.d)}</p>
      </li>`).join('')}
    </ol>
  </div>
</section>`,

  promise: (s) => `
<section class="promise">
  <div class="container promise__inner" data-reveal>
    <span class="promise__label">${e(s.label)}</span>
    <p class="promise__text">${e(s.text)}</p>
  </div>
</section>`,

  split: (s) => `
<section class="section">
  <div class="container split">
    <div class="split__media">
      <div class="split__sticky">${media(s.image, s.title, { w: 1000, h: 1200, cls: 'media--tall', attrs: 'data-reveal="wipe"' })}</div>
    </div>
    <div class="split__body">
      ${sectionHead({ eyebrow: s.eyebrow, title: e(s.title) })}
      <ol class="numlist" data-stagger>
        ${s.items.map((it, i) => `
        <li data-reveal><span>${pad(i + 1)}</span><div><h3>${e(it.t)}</h3><p>${e(it.d)}</p></div></li>`).join('')}
      </ol>
    </div>
  </div>
</section>`,

  checklist: (s) => `
<section class="section section--gray">
  <div class="container checklist">
    <div>
      ${sectionHead({ eyebrow: s.eyebrow, title: e(s.title) })}
      <ul class="ticks" data-stagger>
        ${s.items.map((t) => `<li data-reveal><span>${icon('check')}</span>${e(t)}</li>`).join('')}
      </ul>
    </div>
    <div class="checklist__media">${media(s.image, s.title, { w: 1000, h: 1100, cls: 'media--tall', attrs: 'data-reveal="wipe"' })}</div>
  </div>
</section>`,

  roles: (s) => `
<section class="section ${s.compact ? 'section--tight' : 'section--gray'}">
  <div class="container">
    ${sectionHead({ eyebrow: s.eyebrow, title: e(s.title) })}
    <div class="roles${s.compact ? ' roles--compact' : ''}" data-stagger>
      ${s.items.map((it) => `
      <article class="role" data-reveal>
        <span class="role__abbr">${e(it.a)}</span>
        <h3>${e(it.t)}</h3>
        <p>${e(it.d)}</p>
      </article>`).join('')}
    </div>
  </div>
</section>`,

  pillars: (s) => `
<section class="section">
  <div class="container">
    ${sectionHead({ eyebrow: s.eyebrow, title: e(s.title) })}
    <div class="pillars${s.two || s.items.length === 2 ? ' pillars--two' : ''}" data-stagger>
      ${s.items.map((it, i) => `
      <article class="pillar" data-reveal>
        <span class="pillar__icon">${icon(it.icon)}</span>
        <span class="pillar__num">${pad(i + 1)}</span>
        <h3>${e(it.t)}</h3>
        <p>${e(it.d)}</p>
      </article>`).join('')}
    </div>
  </div>
</section>`,
};

// ---------------------------------------------------------------------------
// Page hero
// ---------------------------------------------------------------------------
const pageHero = ({ crumbs, eb, title, tagline, lead, buttons = '', image, floatIcon, floatText, compact }) => `
<section class="phero${compact ? ' phero--compact' : ''}">
  <div class="mesh" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
  <div class="pattern" aria-hidden="true"></div>
  <div class="container phero__inner">
    <div class="phero__content">
      <nav class="crumbs" aria-label="Breadcrumb">
        <a href="index.html">Home</a>${crumbs.map((c) => (c.href ? `<span>/</span><a href="${c.href}">${e(c.t)}</a>` : `<span>/</span><span aria-current="page">${e(c.t)}</span>`)).join('')}
      </nav>
      ${eyebrow(eb, true)}
      <h1 class="display-1" data-split>${e(title)}</h1>
      ${tagline ? `<p class="phero__tag" data-reveal>${e(tagline)}</p>` : ''}
      ${lead ? `<p class="lead" data-reveal>${e(lead)}</p>` : ''}
      ${buttons ? `<div class="btns" data-reveal>${buttons}</div>` : ''}
    </div>
    ${image ? `
    <div class="phero__media" data-reveal="right">
      ${media(image, title, { w: 1100, h: 1200, cls: 'media--hero', eager: true, attrs: 'data-parallax="0.06"' })}
      ${floatText ? `<div class="float-card float-card--a"><span>${icon(floatIcon)}</span><strong>${e(floatText)}</strong></div>` : ''}
    </div>` : ''}
  </div>
</section>`;

const statement = (text, ebText = 'Overview') => `
<section class="section statement">
  <div class="container">
    ${eyebrow(ebText)}
    <p class="statement__text" data-textreveal>${e(text)}</p>
  </div>
</section>`;

// ---------------------------------------------------------------------------
// Service detail page
// ---------------------------------------------------------------------------
const servicePage = (s, pillar) => {
  const isTalent = pillar === 'talent';
  const pillarName = isTalent ? 'Talent & Recruitment' : 'Branding & Marketing';
  const pillarHref = isTalent ? 'talent-recruitment.html' : 'branding-marketing.html';
  const list = isTalent ? talent : marketing;
  const related = list.filter((x) => x.slug !== s.slug).slice(0, 3);
  const formHtml = s.form === 'hiring' ? forms.hiring(s.short) : s.form === 'event' ? forms.event() : forms.enquiry(s.short);

  const overview = `
<section class="section overview">
  <div class="container overview__grid">
    <div class="overview__media">${media(s.image2, s.title, { w: 1000, h: 800, attrs: 'data-reveal="wipe"' })}</div>
    <div class="overview__body" data-reveal>
      ${eyebrow('What we do')}
      ${s.intro.slice(1).map((p) => `<p class="overview__p">${e(p)}</p>`).join('')}
      <ul class="highlights">
        ${s.highlights.map((h) => `<li>${icon('check-circle')}${e(h)}</li>`).join('')}
      </ul>
      ${btn('#enquire', s.ctaButton || 'Get in touch', 'dark')}
    </div>
  </div>
</section>`;

  const relatedHtml = `
<section class="section section--gray">
  <div class="container">
    ${sectionHead({ eyebrow: 'Explore More', title: `More ${e(pillarName)} services`, link: `<a class="link-arrow" href="${pillarHref}">View all ${icon('arrow-right')}</a>` })}
    <div class="svc-tiles" data-stagger>
      ${related.map((r) => serviceTile(r)).join('')}
    </div>
  </div>
</section>`;

  const body =
    pageHero({
      crumbs: [{ t: pillarName, href: pillarHref }, { t: s.short }],
      eb: pillarName,
      title: s.title,
      tagline: s.tagline,
      lead: s.blurb,
      buttons: btn('#enquire', s.ctaButton || 'Talk to an expert') + btn(pillarHref, `All ${pillarName}`, 'ghost', 'arrow-right'),
      image: s.image,
      floatIcon: s.icon,
      floatText: s.highlights[0],
    }) +
    statement(s.intro[0]) +
    overview +
    s.sections.map((sec) => renderers[sec.type](sec)).join('') +
    relatedHtml +
    ctaSection({ title: s.ctaTitle || s.cta, text: s.ctaTitle ? s.cta : 'Share a few details about your requirement and our team will get in touch.', form: formHtml });

  return layout({
    title: `${s.title} | Headstart`,
    desc: `${s.tagline} ${s.intro[0]}`.slice(0, 158),
    active: isTalent ? 'talent' : 'marketing',
    page: 'service',
    body,
  });
};

const serviceTile = (s) => `
      <a class="svc-tile" href="${s.slug}.html" data-reveal>
        ${media(s.image, s.title, { w: 800, h: 560 })}
        <div class="svc-tile__body">
          <span class="svc-tile__icon">${icon(s.icon)}</span>
          <h3>${e(s.short)}</h3>
          <p>${e(s.blurb)}</p>
          <span class="link-arrow">Learn more ${icon('arrow-right')}</span>
        </div>
      </a>`;

const serviceCard = (s, i) => `
      <a class="svc-card" href="${s.slug}.html" data-reveal>
        <div class="svc-card__top"><span class="svc-card__icon">${icon(s.icon)}</span><span class="svc-card__num">${pad(i + 1)}</span></div>
        <h3>${e(s.short)}</h3>
        <p>${e(s.blurb)}</p>
        <span class="svc-card__arrow">${icon('arrow-up-right')}</span>
      </a>`;

// ---------------------------------------------------------------------------
// Pillar overview pages
// ---------------------------------------------------------------------------
const serviceRows = (list) => `
<section class="section">
  <div class="container rows">
    ${list.map((s, i) => `
    <article class="row${i % 2 ? ' row--rev' : ''}">
      <a class="row__media" href="${s.slug}.html" aria-label="${e(s.title)}">${media(s.image, s.title, { w: 1100, h: 800, attrs: 'data-reveal="wipe"' })}</a>
      <div class="row__body" data-reveal>
        <span class="row__num">${pad(i + 1)} / ${pad(list.length)}</span>
        <h2 class="display-3">${e(s.title)}</h2>
        <p class="row__tag">${e(s.tagline)}</p>
        <p>${e(s.intro[0])}</p>
        <ul class="row__list">
          ${(s.sections.find((x) => x.type === 'cards' || x.type === 'roles') || { items: [] }).items.slice(0, 4).map((it) => `<li>${icon('check')}${e(it.t)}</li>`).join('')}
        </ul>
        ${btn(`${s.slug}.html`, 'Explore service', 'dark')}
      </div>
    </article>`).join('')}
  </div>
</section>`;

const marketingPage = () => layout({
  title: 'Branding & Marketing Services | Headstart',
  desc: 'Digital marketing, B2B lead generation, corporate events, brand activation, influencer, community, partnership and regional marketing — integrated by Headstart.',
  active: 'marketing',
  page: 'pillar',
  body:
    pageHero({
      crumbs: [{ t: 'Branding & Marketing' }],
      eb: 'Branding & Marketing',
      title: 'Build brands people trust. Create demand that converts.',
      lead: 'Eight integrated marketing disciplines — from performance campaigns and B2B pipeline to corporate events and on-ground activations — working together to grow your business.',
      buttons: btn('#services', 'Explore services') + btn('#enquire', 'Talk to us', 'ghost'),
      image: '1552664730-d307ca884978',
      floatIcon: 'trending',
      floatText: '8 integrated disciplines',
    }) +
    statement('Great marketing is not a single channel. It is the right message, reaching the right people, in the right place — online, in the room and on the ground. We bring strategy, creativity and execution together so every campaign moves your business forward.', 'Our perspective') +
    `<div id="services"></div>` +
    serviceRows(marketing) +
    renderers.process({ eyebrow: 'How We Work', title: 'One framework across every channel', items: marketing[0].sections[2].items }) +
    renderers.chips({ eyebrow: 'Industries We Serve', title: 'Experience across consumer and business markets', items: industries }) +
    ctaSection({ title: "Let's grow your brand together", text: 'Tell us about your goals and we will recommend the right mix of services for your business.', form: forms.enquiry('') }),
});

const talentPage = () => layout({
  title: 'Talent & Recruitment — Executive Search | Headstart',
  desc: 'C-level executive hiring, board and independent director search, interim and fractional CXOs, and talent mapping and market intelligence.',
  active: 'talent',
  page: 'pillar',
  body:
    pageHero({
      crumbs: [{ t: 'Talent & Recruitment' }],
      eb: 'Talent & Recruitment',
      title: 'Find the leaders who will take your business further.',
      lead: 'Confidential, research-led leadership search and talent intelligence — from the C-suite and the boardroom to interim leaders who step in when it matters most.',
      buttons: btn('#services', 'Explore services') + btn('#enquire', 'Submit a hiring brief', 'ghost'),
      image: '1519085360753-af0119f7cbe7',
      floatIcon: 'lock',
      floatText: 'Confidential leadership search',
    }) +
    statement('Leadership decisions shape everything that follows. We help organisations appoint executives, directors and interim leaders with the capability, integrity and cultural fit to drive strategy, growth and operational excellence.', 'Our perspective') +
    `<div id="services"></div>` +
    serviceRows(talent) +
    renderers.pillars({ eyebrow: 'Why Headstart', title: 'Leadership search built on trust', items: [
      { icon: 'lock', t: 'Confidential by Design', d: 'Discreet engagement with candidates and strict protection of client information at every stage.' },
      { icon: 'search', t: 'Research-Led', d: 'Every mandate starts with market mapping, so shortlists reflect the best available talent — not just active job seekers.' },
      { icon: 'user-check', t: 'Rigorous Assessment', d: 'Structured evaluation of leadership capability, track record and culture fit before candidates reach you.' },
    ] }) +
    renderers.process(talent[0].sections[2]) +
    ctaSection({ title: 'Share your leadership requirement', text: 'Tell us about the role or board position you are looking to fill. Every brief is handled in strict confidence.', form: forms.hiring('') }),
});

// ---------------------------------------------------------------------------
// Home
// ---------------------------------------------------------------------------
const marquee = (items) => `
<div class="marquee" aria-label="Industries we serve">
  <div class="marquee__track">
    ${[0, 1].map((k) => `<ul ${k ? 'aria-hidden="true"' : ''}>${items.map((t) => `<li>${e(t)}<span>${icon('sparkle')}</span></li>`).join('')}</ul>`).join('')}
  </div>
</div>`;

const workCard = (w) => `
      <article class="work" data-cat="${w.cat}" data-reveal>
        <div class="work__media">${media(w.image, w.t, { w: 900, h: 640 })}<span class="work__label">${e(w.label)}</span></div>
        <div class="work__body">
          <h3>${e(w.t)}</h3>
          <p>${e(w.d)}</p>
          <ul class="tags">${w.tags.map((t) => `<li>${e(t)}</li>`).join('')}</ul>
        </div>
      </article>`;

const homePage = () => layout({
  title: 'Headstart | Branding & Marketing and Talent & Recruitment',
  desc: 'Headstart helps organisations build brands, generate demand and hire exceptional leaders — through integrated branding & marketing and talent & recruitment services.',
  active: 'home',
  page: 'home',
  body: `
<section class="hero">
  <div class="mesh" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
  <div class="pattern" aria-hidden="true"></div>
  <div class="container hero__inner">
    <div class="hero__content">
      ${eyebrow('Branding & Marketing  ·  Talent & Recruitment', true)}
      <h1 class="hero__title">
        <span class="line"><span>Give your</span></span>
        <span class="line"><span class="rotator" data-rotator><b class="is-on">brand</b><b>growth</b><b>pipeline</b><b>leadership</b></span></span>
        <span class="line"><span>a head start<i>.</i></span></span>
      </h1>
      <p class="lead hero__lead">We build brands people remember, campaigns that generate measurable demand, and leadership teams that take businesses further — as one integrated growth partner.</p>
      <div class="btns hero__btns">
        ${btn('#services', 'Explore our services')}
        ${btn('contact.html', 'Book a consultation', 'ghost', 'arrow-up-right')}
      </div>
      <div class="hero__meta">
        <div><strong>12</strong><span>Specialised services</span></div>
        <div><strong>20+</strong><span>Industries served</span></div>
        <div><strong>2</strong><span>Integrated practices</span></div>
      </div>
    </div>
    <div class="hero__visual">
      ${media('1522071820081-009f0129c71c', 'Marketing team collaborating', { w: 1000, h: 1200, cls: 'hero__img hero__img--main', eager: true, attrs: 'data-parallax="0.08"' })}
      ${media('1519085360753-af0119f7cbe7', 'Senior executive', { w: 600, h: 700, cls: 'hero__img hero__img--sub', eager: true, attrs: 'data-parallax="-0.06"' })}
      <div class="float-card float-card--a"><span>${icon('trending')}</span><div><small>Branding &amp; Marketing</small><strong>Demand that converts</strong></div></div>
      <div class="float-card float-card--b"><span>${icon('crown')}</span><div><small>Talent &amp; Recruitment</small><strong>Leaders who deliver</strong></div></div>
      <div class="hero__badge" aria-hidden="true">
        <svg viewBox="0 0 120 120"><defs><path id="circ" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0"/></defs><text><textPath href="#circ">GROW AHEAD • STAY AHEAD • GROW AHEAD • STAY AHEAD • </textPath></text></svg>
        ${icon('arrow-up-right')}
      </div>
    </div>
  </div>
  <a class="hero__scroll" href="#intro" aria-label="Scroll down"><span></span></a>
</section>

${marquee(industries)}

<section class="section statement" id="intro">
  <div class="container">
    ${eyebrow('Who we are')}
    <p class="statement__text" data-textreveal>Headstart is a growth partner for ambitious organisations. We combine strategic marketing, memorable brand experiences and senior leadership hiring — so you can grow your market and your leadership team with one trusted partner.</p>
    <div class="statement__foot" data-reveal>${btn('about.html', 'More about Headstart', 'dark')}</div>
  </div>
</section>

<section class="section section--tight">
  <div class="container">
    ${sectionHead({ eyebrow: 'Our Practices', title: 'Two practices. <em>One growth partner.</em>' })}
    <div class="practices" data-stagger>
      <a class="practice" href="branding-marketing.html" data-reveal>
        ${media('1533750349088-cd871a92f312', 'Branding and marketing', { w: 1100, h: 1000 })}
        <div class="practice__body">
          <span class="practice__icon">${icon('megaphone')}</span>
          <span class="practice__count">08 Services</span>
          <h3>Branding &amp; Marketing</h3>
          <p>Digital growth, B2B pipeline, corporate events, brand activations, content, community, partnerships and regional market entry.</p>
          <span class="practice__cta">Explore practice ${icon('arrow-right')}</span>
        </div>
      </a>
      <a class="practice" href="talent-recruitment.html" data-reveal>
        ${media('1556761175-b413da4baf72', 'Talent and recruitment', { w: 1100, h: 1000 })}
        <div class="practice__body">
          <span class="practice__icon">${icon('users')}</span>
          <span class="practice__count">04 Services</span>
          <h3>Talent &amp; Recruitment</h3>
          <p>C-level executive hiring, board and independent director search, interim and fractional CXOs, and talent intelligence.</p>
          <span class="practice__cta">Explore practice ${icon('arrow-right')}</span>
        </div>
      </a>
    </div>
  </div>
</section>

<section class="section section--gray" id="services">
  <div class="container">
    ${sectionHead({ eyebrow: 'What We Do', title: 'Services designed to <em>move you forward</em>', text: 'Choose a single service or combine several. Every engagement is shaped around your objectives, audience and budget.' })}
    <div class="tabs" data-tabs>
      <div class="tabs__nav" role="tablist" data-reveal>
        <button role="tab" aria-selected="true" aria-controls="tab-mkt" id="tb-mkt" class="is-active">Branding &amp; Marketing <span>08</span></button>
        <button role="tab" aria-selected="false" aria-controls="tab-tal" id="tb-tal" tabindex="-1">Talent &amp; Recruitment <span>04</span></button>
        <i class="tabs__ink" aria-hidden="true"></i>
      </div>
      <div class="tabs__panel is-active" role="tabpanel" id="tab-mkt" aria-labelledby="tb-mkt">
        <div class="svc-grid" data-stagger>${marketing.map(serviceCard).join('')}</div>
      </div>
      <div class="tabs__panel" role="tabpanel" id="tab-tal" aria-labelledby="tb-tal" hidden>
        <div class="svc-grid svc-grid--four" data-stagger>${talent.map(serviceCard).join('')}</div>
      </div>
    </div>
  </div>
</section>

<section class="stats">
  <div class="container stats__grid" data-stagger>
    <div class="stat" data-reveal><strong><span data-count="12">0</span></strong><span>Specialised services across two practices</span></div>
    <div class="stat" data-reveal><strong><span data-count="20">0</span>+</strong><span>Industries served, from D2C to manufacturing</span></div>
    <div class="stat" data-reveal><strong><span data-count="360">0</span>&deg;</strong><span>Support from brand building to leadership hiring</span></div>
    <div class="stat" data-reveal><strong><span data-count="5">0</span></strong><span>Step framework behind every engagement</span></div>
  </div>
</section>

${renderers.process({ eyebrow: 'How We Work', title: 'A clear path from ambition to outcome', items: [
  { t: 'Understand', d: 'We start with your objectives, audience, market and the challenges standing in the way.' },
  { t: 'Strategise', d: 'We design a tailored plan — the right channels, people and partners for your goals.' },
  { t: 'Execute', d: 'Our specialists deliver campaigns, events and searches with care and precision.' },
  { t: 'Optimise', d: 'We measure what matters and refine continuously to improve results.' },
  { t: 'Grow', d: 'We track meaningful outcomes and scale what works, together.' },
] })}

<section class="section">
  <div class="container">
    ${sectionHead({ eyebrow: 'Our Works', title: 'Selected engagements', link: `<a class="link-arrow" href="our-works.html">View all works ${icon('arrow-right')}</a>` })}
    <div class="works works--three" data-stagger>
      ${works.slice(0, 3).map(workCard).join('')}
    </div>
  </div>
</section>

<section class="section section--gray why">
  <div class="container why__grid">
    <div class="why__media">
      ${media('1557804506-669a67965ba0', 'Headstart team in a strategy session', { w: 1000, h: 1200, cls: 'media--tall', attrs: 'data-reveal="wipe"' })}
      <div class="why__badge" data-reveal="scale"><strong>One</strong><span>partner for brand, demand &amp; leadership</span></div>
    </div>
    <div>
      ${sectionHead({ eyebrow: 'Why Headstart', title: 'Strategy-led. Execution-focused. <em>Outcome-driven.</em>' })}
      <div class="why__list" data-stagger>
        ${[
          ['layers', 'Integrated expertise', 'Marketing, events and leadership hiring under one roof — fewer handovers, more joined-up results.'],
          ['target', 'Strategy before activity', 'Every engagement begins with your business objectives, not a pre-packaged channel plan.'],
          ['network', 'Access to decision-makers', 'Relationships across industries, communities and leadership networks that open the right doors.'],
          ['bar', 'Measurable outcomes', 'Clear reporting on the metrics that matter — leads, pipeline, engagement and successful appointments.'],
        ].map(([ic, t, d]) => `
        <div class="why__item" data-reveal>
          <span class="why__icon">${icon(ic)}</span>
          <div><h3>${t}</h3><p>${d}</p></div>
        </div>`).join('')}
      </div>
    </div>
  </div>
</section>

<section class="section partner-band">
  <div class="container partner-band__inner" data-reveal>
    <div>
      ${eyebrow('Partner With Us')}
      <h2 class="display-3">Agencies, platforms, venues and communities — let's create shared growth.</h2>
    </div>
    ${btn('partner.html', 'Explore partnerships', 'dark')}
  </div>
</section>

${ctaSection({ title: 'Ready to get a head start?', text: 'Tell us what you are working towards — a campaign, an event, a new market or a key leadership hire — and we will show you how we can help.', form: forms.enquiry('') })}`,
});

// ---------------------------------------------------------------------------
// About
// ---------------------------------------------------------------------------
const aboutPage = () => layout({
  title: 'About Us | Headstart',
  desc: 'Headstart is an integrated branding & marketing and talent & recruitment partner helping organisations build brands, generate demand and hire exceptional leaders.',
  active: 'about',
  page: 'about',
  body:
    pageHero({
      crumbs: [{ t: 'About Us' }],
      eb: 'About Headstart',
      title: 'We help organisations get ahead — and stay ahead.',
      lead: 'Headstart brings together branding, marketing and leadership hiring expertise to help businesses grow with clarity, confidence and momentum.',
      buttons: btn('#story', 'Our story') + btn('contact.html', 'Work with us', 'ghost', 'arrow-up-right'),
      image: '1521737604893-d14cc237f11d',
      floatIcon: 'sparkle',
      floatText: 'Growth partner, not a vendor',
    }) +
    statement('Growth depends on two things: being known by the right people, and being led by the right people. Headstart exists to help organisations do both — building strong brands and markets on one side, and strong leadership teams on the other.', 'Our belief') + `
<section class="section" id="story">
  <div class="container story">
    <div class="story__media">
      ${media('1497215728101-856f4ea42174', 'Headstart office', { w: 1000, h: 1200, cls: 'media--tall', attrs: 'data-reveal="wipe" data-parallax="0.04"' })}
    </div>
    <div class="story__body" data-reveal>
      ${eyebrow('Our Story')}
      <h2 class="display-2">Built to give ambitious organisations a head start.</h2>
      <p>Headstart was founded on a simple observation: growing businesses often juggle many partners — one for digital marketing, another for events, another for B2B outreach, and yet another for senior hiring. The result is fragmented effort and lost momentum.</p>
      <p>We set out to change that. Today, Headstart operates two integrated practices — <strong>Branding &amp; Marketing</strong> and <strong>Talent &amp; Recruitment</strong> — giving clients a single, accountable partner for building their brand, generating demand and strengthening their leadership.</p>
      <p>We work with startups, growing businesses, enterprises, associations and institutions across sectors — bringing structured thinking, creative execution and a genuine commitment to outcomes.</p>
    </div>
  </div>
</section>

<section class="section section--gray">
  <div class="container">
    ${sectionHead({ eyebrow: 'Purpose', title: 'What drives us' })}
    <div class="mvv" data-stagger>
      <article class="mvv__card" data-reveal><span>${icon('target')}</span><small>Our Mission</small><h3>To help organisations grow by connecting them with the right audiences, opportunities and leaders.</h3></article>
      <article class="mvv__card mvv__card--accent" data-reveal><span>${icon('compass')}</span><small>Our Vision</small><h3>To be the most trusted growth partner for ambitious businesses — known for integrity, insight and impact.</h3></article>
      <article class="mvv__card" data-reveal><span>${icon('layers')}</span><small>Our Approach</small><h3>Strategy first, flawless execution, and transparent measurement of what truly matters.</h3></article>
    </div>
  </div>
</section>` +
    renderers.pillars({ eyebrow: 'Our Values', title: 'The principles behind every engagement', items: [
      { icon: 'shield', t: 'Integrity', d: 'We do what we say, communicate honestly and protect the trust our clients and candidates place in us.' },
      { icon: 'users', t: 'Partnership', d: 'We work as an extension of your team, invested in your goals as if they were our own.' },
      { icon: 'star', t: 'Excellence', d: 'We hold ourselves to high standards in strategy, creativity and execution.' },
      { icon: 'check-circle', t: 'Accountability', d: 'We take ownership of outcomes and report transparently on progress.' },
      { icon: 'lock', t: 'Confidentiality', d: 'We handle sensitive business and leadership information with complete discretion.' },
      { icon: 'zap', t: 'Creativity', d: 'We bring fresh ideas that help brands stand out and connect.' },
    ] }) + `
<section class="section section--tight">
  <div class="container">
    ${sectionHead({ eyebrow: 'What We Do', title: 'Two practices. <em>One growth partner.</em>' })}
    <div class="svc-tiles svc-tiles--two" data-stagger>
      <a class="svc-tile" href="branding-marketing.html" data-reveal>
        ${media('1533750349088-cd871a92f312', 'Branding & Marketing', { w: 1000, h: 640 })}
        <div class="svc-tile__body"><span class="svc-tile__icon">${icon('megaphone')}</span><h3>Branding &amp; Marketing</h3><p>${marketing.map((m) => e(m.short)).join(' · ')}</p><span class="link-arrow">Explore ${icon('arrow-right')}</span></div>
      </a>
      <a class="svc-tile" href="talent-recruitment.html" data-reveal>
        ${media('1519085360753-af0119f7cbe7', 'Talent & Recruitment', { w: 1000, h: 640 })}
        <div class="svc-tile__body"><span class="svc-tile__icon">${icon('users')}</span><h3>Talent &amp; Recruitment</h3><p>${talent.map((m) => e(m.short)).join(' · ')}</p><span class="link-arrow">Explore ${icon('arrow-right')}</span></div>
      </a>
    </div>
  </div>
</section>` +
    renderers.process({ eyebrow: 'How We Work', title: 'A proven way of working', items: [
      { t: 'Understand', d: 'Listen closely to your objectives, context and constraints.' },
      { t: 'Strategise', d: 'Build a clear, customised plan with defined outcomes.' },
      { t: 'Execute', d: 'Deliver with specialist teams and rigorous coordination.' },
      { t: 'Optimise', d: 'Measure, learn and continuously improve.' },
      { t: 'Grow', d: 'Scale what works and plan the next stage together.' },
    ] }) +
    renderers.chips({ eyebrow: 'Who We Work With', title: 'Organisations at every stage of growth', items: ['Startups and founders', 'Small and mid-sized businesses', 'Enterprises and corporates', 'PE and VC-backed companies', 'Professional associations and HR bodies', 'Educational institutions', 'Healthcare organisations', 'Consumer and D2C brands'] }) +
    ctaSection({ title: "Let's build what's next, together", text: 'Whether you need to grow your brand, your pipeline or your leadership team, we would love to hear from you.', form: forms.enquiry('') }),
});

// ---------------------------------------------------------------------------
// Our Works
// ---------------------------------------------------------------------------
const worksPage = () => {
  const filters = [['all', 'All Work'], ['digital', 'Digital & Regional'], ['b2b', 'B2B'], ['events', 'Events'], ['activation', 'Activation'], ['content', 'Content'], ['talent', 'Talent']];
  return layout({
    title: 'Our Works | Headstart',
    desc: 'Selected Headstart engagements across digital marketing, B2B lead generation, corporate events, brand activation, content and leadership hiring.',
    active: 'works',
    page: 'works',
    body:
      pageHero({
        crumbs: [{ t: 'Our Works' }],
        eb: 'Our Works',
        title: 'Work that moves brands, markets and leaders forward.',
        lead: 'A selection of engagements across our Branding & Marketing and Talent & Recruitment practices.',
        compact: true,
      }) + `
<!-- NOTE: The projects below are illustrative placeholders. Replace them with real case studies in build/data.js. -->
<section class="section">
  <div class="container">
    <div class="filters" role="group" aria-label="Filter works" data-filters data-reveal>
      ${filters.map(([k, l], i) => `<button type="button" data-filter="${k}" class="${i === 0 ? 'is-active' : ''}" aria-pressed="${i === 0}">${l}</button>`).join('')}
    </div>
    <div class="works" data-works data-stagger>
      ${works.map(workCard).join('')}
    </div>
  </div>
</section>

<section class="stats">
  <div class="container stats__grid" data-stagger>
    <div class="stat" data-reveal><strong><span data-count="8">0</span></strong><span>Marketing disciplines delivered end to end</span></div>
    <div class="stat" data-reveal><strong><span data-count="4">0</span></strong><span>Leadership and talent intelligence services</span></div>
    <div class="stat" data-reveal><strong><span data-count="20">0</span>+</strong><span>Industries across consumer and B2B markets</span></div>
    <div class="stat" data-reveal><strong><span data-count="1">0</span></strong><span>Accountable partner for every engagement</span></div>
  </div>
</section>` +
      ctaSection({ title: 'Your project could be next', text: 'Tell us about your goals and we will put together a tailored approach for your brand, event or leadership requirement.', form: forms.enquiry('') }),
  });
};

// ---------------------------------------------------------------------------
// Partner
// ---------------------------------------------------------------------------
const partnerPage = () => layout({
  title: 'Partner With Us | Headstart',
  desc: 'Partner with Headstart — referral, channel, co-marketing, event and community partnerships that create shared growth.',
  active: 'partner',
  page: 'partner',
  body:
    pageHero({
      crumbs: [{ t: 'Partner' }],
      eb: 'Partner With Us',
      title: 'Grow further, together.',
      tagline: 'Connecting Brands. Creating Shared Growth.',
      lead: 'We collaborate with agencies, technology platforms, venues, communities and advisors to create more value for our clients — and for each other.',
      buttons: btn('#enquire', 'Become a partner') + btn('#models', 'Partnership models', 'ghost'),
      image: '1600880292089-90a7e086ee0c',
      floatIcon: 'link',
      floatText: 'Shared growth, shared success',
    }) +
    statement('The best opportunities rarely come from working alone. Our partner network extends what we can offer clients — and gives our partners access to new audiences, projects and relationships built on trust.', 'Why partner') +
    renderers.cards({ eyebrow: 'Who We Partner With', title: 'A network built on complementary strengths', items: [
      { icon: 'briefcase', t: 'Agencies & Consultancies', d: 'Creative, PR, technology and management consultancies that complement our services.' },
      { icon: 'layout', t: 'Technology & SaaS Platforms', d: 'Marketing, HR and sales technology providers looking to reach new customers.' },
      { icon: 'calendar', t: 'Venues & Production Houses', d: 'Event venues, AV, staging and production partners for memorable experiences.' },
      { icon: 'network', t: 'Associations & Communities', d: 'Professional bodies and business networks that bring members together.' },
      { icon: 'play', t: 'Media & Creators', d: 'Publishers, regional creators and content studios that tell great stories.' },
      { icon: 'user-check', t: 'HR & Leadership Advisors', d: 'Independent consultants, coaches and assessment specialists.' },
    ] }) + `
<div id="models"></div>` +
    renderers.pillars({ eyebrow: 'Partnership Models', title: 'Flexible ways to work together', items: [
      { icon: 'refresh', t: 'Referral Partner', d: 'Introduce clients to Headstart and benefit from a structured referral programme.' },
      { icon: 'layers', t: 'Channel Partner', d: 'Offer Headstart services alongside your own to expand your client value.' },
      { icon: 'megaphone', t: 'Co-Marketing Partner', d: 'Run joint campaigns, webinars and content to reach shared audiences.' },
      { icon: 'award', t: 'Event & Sponsorship Partner', d: 'Collaborate on summits, roundtables and conclaves for mutual visibility.' },
    ] }) +
    renderers.checklist({ eyebrow: 'Partner Benefits', title: 'What partners gain', image: '1521791136064-7986c2920216', items: [
      'Access to new clients, sectors and decision-makers',
      'Joint visibility through events, content and campaigns',
      'Transparent, structured referral and revenue arrangements',
      'A dedicated point of contact for every partnership',
      'Collaborative planning and regular performance reviews',
      'Long-term relationships built on trust and shared values',
    ] }) +
    renderers.process({ eyebrow: 'How It Works', title: 'From first conversation to shared success', items: [
      { t: 'Apply', d: 'Share your details and partnership idea through the form.' },
      { t: 'Discover', d: 'We schedule a call to understand your goals and strengths.' },
      { t: 'Plan', d: 'Together we agree on the model, value exchange and success measures.' },
      { t: 'Launch', d: 'We kick off joint activities with clear ownership.' },
      { t: 'Grow', d: 'Regular reviews help us expand what works.' },
    ] }) +
    ctaSection({ title: "Let's build partnerships that create lasting value", text: 'Tell us about your organisation and how you would like to collaborate. Our partnerships team will be in touch.', form: forms.partner() }),
});

// ---------------------------------------------------------------------------
// Contact
// ---------------------------------------------------------------------------
const contactPage = () => layout({
  title: 'Contact Us | Headstart',
  desc: 'Contact Headstart for branding & marketing, corporate events, executive search and talent intelligence enquiries.',
  active: 'contact',
  page: 'contact',
  body:
    pageHero({
      crumbs: [{ t: 'Contact Us' }],
      eb: 'Contact Us',
      title: "Let's start a conversation.",
      lead: 'Whether you have a campaign in mind, an event to plan or a leadership role to fill, our team is ready to help.',
      compact: true,
    }) + `
<section class="section contact">
  <div class="container contact__grid">
    <aside class="contact__info" data-stagger>
      <div class="info-card" data-reveal><span>${icon('phone')}</span><div><small>Call us</small><a href="tel:${site.phoneHref}">${e(site.phone)}</a><p>${e(site.hours)}</p></div></div>
      <div class="info-card" data-reveal><span>${icon('mail')}</span><div><small>Email us</small><a href="mailto:${site.email}">${e(site.email)}</a><p>We reply to every enquiry.</p></div></div>
      <div class="info-card info-card--wa" data-reveal><span>${whatsapp}</span><div><small>WhatsApp</small><a href="https://wa.me/${site.whatsapp}" target="_blank" rel="noopener">Chat with our team</a><p>Quick questions, quick answers.</p></div></div>
      <div class="info-card" data-reveal><span>${icon('pin')}</span><div><small>Visit us</small><span class="info-card__strong">${e(site.address)}</span><p>By appointment.</p></div></div>
      <div class="socials socials--dark" data-reveal>${socials()}</div>
    </aside>
    <div class="contact__form" data-reveal="right">${forms.contact()}
    </div>
  </div>
</section>

<section class="map" aria-label="Office location">
  <div class="map__ph"><span>${icon('pin')}</span><p>Map placeholder — embed your Google Maps location here</p></div>
</section>

<section class="section section--gray">
  <div class="container faq">
    ${sectionHead({ eyebrow: 'FAQ', title: 'Frequently asked questions' })}
    <div class="faq__list" data-stagger>
      ${[
        ['Do you work with startups as well as large enterprises?', 'Yes. We work with startups, growing businesses, enterprises, associations and institutions. Every engagement is scoped to your stage, objectives and budget.'],
        ['Can Headstart handle both marketing and hiring for the same company?', 'Absolutely — that is one of our strengths. Many clients work with both our Branding & Marketing and Talent & Recruitment practices through a single point of contact.'],
        ['How do you keep executive searches confidential?', 'All mandates are handled under strict confidentiality. Candidate approaches are discreet, and client information is shared only with your approval and on a need-to-know basis.'],
        ['Do you offer one-off projects or only retainers?', 'Both. We deliver one-off projects such as events, launches and specific searches, as well as ongoing retainers for marketing, lead generation and content.'],
        ['What happens after I submit an enquiry?', 'Our team reviews your requirement and contacts you to schedule a discovery conversation. We then share a tailored proposal with scope, timelines and investment.'],
      ].map(([q, a], i) => `
      <details class="faq__item" data-reveal${i === 0 ? ' open' : ''}>
        <summary>${e(q)}<span>${icon('chevron-down')}</span></summary>
        <div class="faq__a"><p>${e(a)}</p></div>
      </details>`).join('')}
    </div>
  </div>
</section>`,
});

// ---------------------------------------------------------------------------
// Write files
// ---------------------------------------------------------------------------
const pages = {
  'index.html': homePage(),
  'about.html': aboutPage(),
  'branding-marketing.html': marketingPage(),
  'talent-recruitment.html': talentPage(),
  'our-works.html': worksPage(),
  'partner.html': partnerPage(),
  'contact.html': contactPage(),
};
marketing.forEach((s) => (pages[`${s.slug}.html`] = servicePage(s, 'marketing')));
talent.forEach((s) => (pages[`${s.slug}.html`] = servicePage(s, 'talent')));

for (const [file, html] of Object.entries(pages)) fs.writeFileSync(path.join(OUT, file), html);
console.log(`Built ${Object.keys(pages).length} pages.`);
