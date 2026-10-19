/* ============================================================
   ENGAGEMENT WEBSITE — script.js
   Danushika & Thusitha · 01 January 2027
   ============================================================ */

/* ─── URL PARAMS ─── */
const urlParams = new URLSearchParams(window.location.search);
const GUEST_TITLE = (urlParams.get('title') || '').trim();
const GUEST_NAME = (urlParams.get('name') || '').trim();

/* ─── GUARD: both params must be present ─── */
if (!GUEST_TITLE || !GUEST_NAME) {
  document.getElementById('invalidScreen').classList.remove('hidden');
} else {
  // Valid invitation — show splash
  document.getElementById('welcome').classList.remove('hidden');
  spawnParticles();
  initAll();
}

/* ─── PARTICLES: floating hearts & bubbles ─── */
function spawnParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  const HEARTS = ['💕', '💍', '🌸', '❤️', '💖', '✨', '🌹'];

  function createParticle() {
    const isHeart = Math.random() > 0.38;
    const el = document.createElement('div');
    el.className = 'particle ' + (isHeart ? 'heart' : 'bubble');
    if (isHeart) {
      el.textContent = HEARTS[Math.floor(Math.random() * HEARTS.length)];
      el.style.fontSize = (0.9 + Math.random() * 1.4) + 'rem';
    } else {
      const size = (10 + Math.random() * 18) + 'px';
      el.style.width = size;
      el.style.height = size;
    }
    el.style.left = (Math.random() * 100) + '%';
    const dur = (5 + Math.random() * 8).toFixed(2) + 's';
    const delay = (Math.random() * 5).toFixed(2) + 's';
    el.style.animationDuration = dur;
    el.style.animationDelay = delay;
    container.appendChild(el);
    setTimeout(() => el.remove(), (parseFloat(dur) + parseFloat(delay)) * 1000 + 500);
  }

  // Initial burst
  for (let i = 0; i < 20; i++) createParticle();
  // Continuous drip
  setInterval(createParticle, 700);
}

function initAll() {

  /* ─── 0. WELCOME COUNTDOWN ─── */
  const TARGET = new Date('2027-01-01T10:00:00+05:30').getTime();
  function pad(n) { return String(n).padStart(2, '0'); }
  function tick() {
    const diff = TARGET - Date.now();
    if (diff <= 0) return;
    const s = Math.floor(diff / 1000);
    document.getElementById('wcd-days').textContent = pad(Math.floor(s / 86400));
    document.getElementById('wcd-hours').textContent = pad(Math.floor((s % 86400) / 3600));
    document.getElementById('wcd-minutes').textContent = pad(Math.floor((s % 3600) / 60));
    document.getElementById('wcd-seconds').textContent = pad(s % 60);
  }
  tick();
  setInterval(tick, 1000);

  /* ─── 1. DYNAMIC GREETING based on event time ─── */
  const banner = document.getElementById('guestGreeting');
  const cdWrap = document.querySelector('.welcome-countdown');
  const display = GUEST_TITLE + ' ' + GUEST_NAME;

  const EVENT_START = new Date('2027-01-01T10:00:00+05:30').getTime();
  const EVENT_END = new Date('2027-01-01T16:00:00+05:30').getTime();
  const now = Date.now();

  if (now < EVENT_START) {
    // ⏳ Before event — show countdown + invite message
    banner.textContent = '💍 Dear ' + display + ', you are warmly invited to our engagement — we look forward to celebrating with you!';
    // countdown stays visible (default)
  } else if (now >= EVENT_START && now <= EVENT_END) {
    // 🎉 During event — hide countdown, show welcome
    cdWrap.style.display = 'none';
    banner.textContent = '🌸 Dear ' + display + ', you are warmly welcomed! Today is our special day — we are so happy you are here with us! 💍';
  } else {
    // 💛 After event — hide countdown, show thank you
    cdWrap.style.display = 'none';
    banner.textContent = '💛 Dear ' + display + ', thank you so much for being part of our special day. Your presence made it truly unforgettable! ✨';
  }

  document.title = 'For ' + display + ' — Danushika & Thusitha';

  /* ─── 2. OPEN INVITATION ─── */
  const openBtn = document.getElementById('openInvitationBtn');
  const welcomeScreen = document.getElementById('welcome');
  const mainContent = document.getElementById('mainContent');

  // Push a history entry so browser Back returns to splash
  history.replaceState({ page: 'splash' }, '');

  openBtn.addEventListener('click', () => {
    // Push invitation state into browser history
    history.pushState({ page: 'invitation' }, '');

    welcomeScreen.style.transition = 'opacity 0.8s ease';
    welcomeScreen.style.opacity = '0';
    welcomeScreen.style.pointerEvents = 'none';
    setTimeout(() => {
      welcomeScreen.classList.add('hidden');
      mainContent.classList.remove('hidden');
      document.body.style.overflow = 'auto';
      renderInvitationCanvas();
      initScrollReveal();
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'instant' }), 50);
    }, 850);
  });

  // Browser back button — return to splash (URL params stay in address bar)
  window.addEventListener('popstate', (e) => {
    if (e.state && e.state.page === 'splash') {
      mainContent.classList.add('hidden');
      welcomeScreen.style.opacity = '1';
      welcomeScreen.style.transition = 'opacity 0.5s ease';
      welcomeScreen.style.pointerEvents = '';
      welcomeScreen.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  });

  /* ─── 3. BACKGROUND MUSIC ─── */
  const musicBtn = document.getElementById('musicBtn');
  const musicIcon = document.getElementById('musicIcon');
  const bgMusic = document.getElementById('bgMusic');
  let musicPlaying = false;

  function startMusic() {
    bgMusic.play().then(() => {
      musicPlaying = true;
      musicIcon.textContent = '🔇';
      musicBtn.title = 'Turn off music';
    }).catch(() => { });
  }

  // Try autoplay on load (works in some browsers)
  startMusic();

  // Guaranteed start: openBtn click is always a valid user gesture
  openBtn.addEventListener('click', () => {
    if (!musicPlaying) startMusic();
  }, { capture: true });

  // Toggle button
  musicBtn.addEventListener('click', () => {
    if (musicPlaying) {
      bgMusic.pause();
      musicIcon.textContent = '🎵';
      musicBtn.title = 'Turn on music';
      musicPlaying = false;
    } else {
      startMusic();
    }
  });
}

/* ─── 4. RENDER INVITATION CANVAS with guest name + QR overlay ─── */
function renderInvitationCanvas() {
  const canvas = document.getElementById('invitationCanvas');
  if (!canvas) return;

  // Load base invitation image
  const invImg = new Image();
  invImg.crossOrigin = 'anonymous';

  // Load the QR overlay image
  const qrImg = new Image();
  qrImg.crossOrigin = 'anonymous';

  let invLoaded = false;
  let qrLoaded = false;

  function tryRender() {
    if (!invLoaded || !qrLoaded) return;
    drawCanvas();
  }

  invImg.onload = () => { invLoaded = true; tryRender(); };
  qrImg.onload = () => { qrLoaded = true; tryRender(); };
  invImg.onerror = () => { invLoaded = true; tryRender(); };  // render anyway
  qrImg.onerror = () => { qrLoaded = true; tryRender(); };

  invImg.src = 'sample.jpg';
  qrImg.src = 'QR.png';

  async function drawCanvas() {
    try { await document.fonts.ready; } catch (e) { }

    const W = invImg.naturalWidth || 900;
    const H = invImg.naturalHeight || 1200;
    canvas.width = W;
    canvas.height = H;

    const ctx = canvas.getContext('2d');

    // 1. Draw the full invitation image
    ctx.drawImage(invImg, 0, 0, W, H);

    // 2. Overlay QR.png on top of the existing QR area (same coords as generator)
    if (qrImg.naturalWidth) {
      const qrX = Math.round(W * 0.100);
      const qrY = Math.round(H * 0.842);
      const qrSize = Math.round(W * 0.165);
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
    }

    // 3. Overlay guest TITLE — position: H * 0.358 (same as QR generator)
    if (GUEST_TITLE) {
      ctx.save();
      const pSize = Math.round(H * 0.022);
      ctx.font = `600 ${pSize}px 'Inter', Arial, sans-serif`;
      ctx.letterSpacing = Math.round(W * 0.004) + 'px';
      ctx.fillStyle = '#1a1208';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(GUEST_TITLE.toUpperCase(), W / 2, Math.round(H * 0.358));
      ctx.restore();
    }

    // 4. Overlay guest NAME — position: H * 0.393 (same as QR generator)
    if (GUEST_NAME) {
      ctx.save();
      const nSize = Math.round(H * 0.030);
      ctx.font = `600 ${nSize}px 'Playfair Display', Georgia, serif`;
      ctx.fillStyle = '#1a1208';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(GUEST_NAME.toUpperCase(), W / 2, Math.round(H * 0.393));
      ctx.restore();
    }
  }
}

/* ─── 5. SCROLL REVEAL ─── */
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        entry.target.style.transitionDelay = (i % 4) * 0.12 + 's';
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}
