// Clínica Patel · Saúde e Estética · prévia RK Performance · out/2026
document.documentElement.classList.add('js');

// Recarregar ou abrir o link começa sempre no topo (o navegador devolvia a pessoa ao meio da página).
// Só o botão voltar do navegador mantém a posição em que a pessoa estava.
const tipoNav = ((performance.getEntriesByType && performance.getEntriesByType('navigation')[0]) || {}).type || 'navigate';
// O navegador decide se restaura pela regra que a página tinha antes, então a restauração fica sempre manual:
// a posição é guardada ao sair e devolvida só quando a pessoa volta pelo botão voltar.
const chaveY = 'patel-y:' + location.pathname;
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
addEventListener('pagehide', () => { try { sessionStorage.setItem(chaveY, String(Math.round(scrollY))); } catch (e) {} });
if (tipoNav === 'back_forward') {
  let y = 0;
  try { y = parseInt(sessionStorage.getItem(chaveY), 10) || 0; } catch (e) {}
  const volta = () => scrollTo(0, y);
  if (y) { addEventListener('DOMContentLoaded', volta); addEventListener('load', volta); }
} else if (!location.hash) scrollTo(0, 0);

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const sai = t => 1 - Math.pow(1 - t, 3);

// ---------- abertura: o nome PATEL como janela da foto ----------
// A abertura roda sozinha: o símbolo se desenha, as letras crescem a partir da haste do T
// até a foto ocupar a tela inteira e aí entram o título e o botão (cerca de 2,5 s).
// Se a pessoa rolar ou usar o teclado antes do fim, a abertura acelera e termina.
const capa = document.getElementById('capa');
if (capa) {
  const pin = capa.querySelector('.capa-pin');
  const svg = capa.querySelector('.capa-mascara');
  const palavra = svg.querySelector('#palavra');
  const zoom = svg.querySelector('#zoom');
  const fotoBox = capa.querySelector('.capa-foto');
  const foto = fotoBox.querySelector('img');
  const veu = capa.querySelector('.capa-veu');
  const cab = capa.querySelector('.capa-cabeca');
  const sobre = cab.querySelector('.sobre');
  const sob = cab.querySelector('.sob');
  const simb = cab.querySelector('.simb');
  const cred = capa.querySelector('.capa-creditos');
  const txt = capa.querySelector('.capa-texto');
  let W = 0, H = 0, ox = 0, oy = 0;
  // P = andamento da abertura, de 0 (só o nome PATEL) a 1 (foto inteira com o título)
  let P = 0, t0 = 0, dur = 0, rodando = false, aberta = false, espera = null;
  const ESPERA = 1100, DURACAO = 1500, RAPIDA = 550;

  const capHeight = fs => {
    const c = document.createElement('canvas').getContext('2d');
    c.font = `400 ${fs}px Marcellus`;
    const m = c.measureText('PATEL');
    return m.actualBoundingBoxAscent || fs * 0.7;
  };

  function medir() {
    W = pin.clientWidth; H = pin.clientHeight;
    const cel = W < 861;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    palavra.setAttribute('x', W / 2);
    palavra.setAttribute('font-size', 100);
    const larg = palavra.getComputedTextLength() || 330;
    let fs = 100 * (W * (cel ? 0.9 : 0.84)) / larg;
    const cap100 = capHeight(100) / 100;
    fs = Math.min(fs, (H * (cel ? 0.3 : 0.4)) / cap100);
    const cap = cap100 * fs;
    const centro = H * (cel ? 0.4 : 0.47);
    const base = centro + cap / 2;
    palavra.setAttribute('font-size', fs.toFixed(1));
    palavra.setAttribute('y', base.toFixed(1));
    // contorno rosé por cima das letras (a palavra não some quando a foto é clara)
    const contorno = svg.querySelector('#contorno');
    if (contorno) ['x', 'y', 'font-size'].forEach(a => contorno.setAttribute(a, palavra.getAttribute(a)));
    // origem do zoom: meio da haste do T (3ª letra)
    let t = null;
    try { t = palavra.getExtentOfChar(2); } catch (e) { t = null; }
    ox = t ? t.x + t.width / 2 : W / 2;
    oy = base - cap * 0.42;
    const gap = Math.max(18, fs * 0.13);
    sobre.style.top = `${base - cap - gap - 14}px`;
    simb.style.top = `${base - cap - gap - 14 - (cel ? 52 : 74)}px`;
    sob.style.top = `${base + gap}px`;
    quadro();
  }

  function quadro() {
    const p = P;
    const z = clamp(p / 0.82);
    const s = 1 + Math.pow(z, 2.7) * 80;
    zoom.setAttribute('transform', `translate(${ox} ${oy}) scale(${s}) translate(${-ox} ${-oy})`);
    svg.style.opacity = 1 - clamp((z - 0.8) / 0.2);
    svg.style.visibility = z >= 1 ? 'hidden' : 'visible';
    const f = 1 - clamp(p / 0.18);
    cab.style.opacity = f;
    cred.style.opacity = f;
    cred.style.transform = `translateY(${(1 - f) * 24}px)`;
    cred.style.visibility = f <= 0 ? 'hidden' : 'visible';
    foto.style.transform = `scale(${(1.16 - 0.16 * sai(z)).toFixed(4)})`;
    const v = clamp((p - 0.72) / 0.28);
    veu.style.opacity = v;
    txt.style.opacity = v;
    txt.style.transform = `translateY(${((1 - v) * 26).toFixed(1)}px)`;
    txt.style.visibility = v <= 0 ? 'hidden' : 'visible';
  }

  addEventListener('resize', () => requestAnimationFrame(medir));

  const passo = agora => {
    P = clamp((agora - t0) / dur);
    quadro();
    if (P < 1) requestAnimationFrame(passo); else termina();
  };
  const comeca = d => {
    if (rodando || aberta) return;
    rodando = true; dur = d; t0 = performance.now();
    requestAnimationFrame(passo);
  };
  function termina() {
    if (aberta) return;
    aberta = true; P = 1; quadro();
    capa.classList.add('aberta');
    document.documentElement.classList.add('capa-aberta');
    dispatchEvent(new Event('scroll')); // atualiza o topo e o botão fixo
  }
  // rolou ou apertou tecla durante a abertura: termina rápido
  const apressa = ev => {
    if (aberta) return;
    if (ev && ev.type === 'scroll' && scrollY < 12) return; // o scrollTo(0, 0) do início não conta como rolagem
    clearTimeout(espera);
    if (!rodando) comeca(RAPIDA);
    else { dur = RAPIDA; t0 = performance.now() - P * dur; }
  };
  ['wheel', 'keydown', 'scroll'].forEach(ev => addEventListener(ev, apressa, { passive: true }));

  // símbolo: desenha o contorno e depois preenche
  const tracos = [...simb.querySelectorAll('path')];
  tracos.forEach(pth => { const L = pth.getTotalLength ? pth.getTotalLength() : 3000; pth.style.setProperty('--len', L); });

  let iniciou = false;
  const inicia = () => {
    if (iniciou) return; iniciou = true;
    medir();
    requestAnimationFrame(() => capa.classList.add('pronta'));
    const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
    // a abertura roda a cada visita e a cada recarga; só pula com movimento reduzido,
    // com o botão voltar do navegador ou com link direto para uma seção (#procedimentos etc.)
    if (reduz || tipoNav === 'back_forward' || location.hash || scrollY > innerHeight * 0.4) termina();
    else espera = setTimeout(() => comeca(DURACAO), ESPERA);
  };
  if (document.fonts && document.fonts.load) {
    Promise.all([document.fonts.load('400 100px Marcellus'), document.fonts.ready]).then(inicia, inicia);
    setTimeout(inicia, 2600);
  } else inicia();
  if (foto.complete) foto.classList.add('ok'); else foto.addEventListener('load', () => foto.classList.add('ok'));
}

// ---------- topo, menu, botão fixo ----------
const topo = document.getElementById('topo');
const flut = document.querySelector('.flut');
const marca = () => {
  if (topo && !document.body.classList.contains('pagina')) topo.classList.toggle('solido', scrollY > 30 || document.documentElement.classList.contains('capa-aberta'));
  if (flut) {
    const limite = capa ? capa.offsetHeight - innerHeight * 0.6 : innerHeight * 0.8;
    flut.classList.toggle('on', scrollY > limite);
  }
};
addEventListener('scroll', marca, { passive: true }); marca();

// botão fixo: sobre as seções cacau ele troca de cor para não sumir no fundo
if (flut) {
  const escuras = [...document.querySelectorAll('.cacau, .rodape')];
  const sobre = new Set();
  const obsC = new IntersectionObserver(es => {
    es.forEach(e => e.isIntersecting ? sobre.add(e.target) : sobre.delete(e.target));
    flut.classList.toggle('claro', sobre.size > 0);
  }, { rootMargin: '-88% 0px 0px 0px' });
  escuras.forEach(el => obsC.observe(el));
}

const menuBt = document.querySelector('.menu-bt');
const nav = document.querySelector('.topo nav');
if (menuBt && nav) {
  menuBt.addEventListener('click', () => {
    const aberto = nav.classList.toggle('aberto');
    menuBt.setAttribute('aria-expanded', aberto ? 'true' : 'false');
    menuBt.querySelector('span').textContent = aberto ? 'fechar' : 'menu';
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { nav.classList.remove('aberto'); menuBt.setAttribute('aria-expanded', 'false'); menuBt.querySelector('span').textContent = 'menu'; }));
}

// ---------- revelação ao rolar ----------
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
document.querySelectorAll('.rv, .varre, .linha-desenha, .arco').forEach(el => io.observe(el));

// ---------- parallax e anéis (não depende de "reduzir animações": o João usa o Windows com animações desligadas) ----------
const px = [...document.querySelectorAll('[data-parallax]')];
const giram = [...document.querySelectorAll('[data-gira]')];
let pedidoPx = false;
function movePx() {
  pedidoPx = false;
  const largo = innerWidth > 860;
  px.forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.bottom < -300 || r.top > innerHeight + 300) return;
    const f = parseFloat(el.dataset.parallax) || 0.08;
    const d = largo ? (r.top + r.height / 2 - innerHeight / 2) * f : 0;
    el.style.transform = `translate3d(0, ${d.toFixed(1)}px, 0)`;
  });
  giram.forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.bottom < -400 || r.top > innerHeight + 400) return;
    const g = (r.top + r.height / 2 - innerHeight / 2) * (parseFloat(el.dataset.gira) || 0.04);
    el.style.rotate = `${g.toFixed(2)}deg`;
  });
}
addEventListener('scroll', () => { if (!pedidoPx) { pedidoPx = true; requestAnimationFrame(movePx); } }, { passive: true });
addEventListener('resize', movePx); movePx();

// ---------- etapas do atendimento: a mais visível acende ----------
document.querySelectorAll('.etapas').forEach(lista => {
  const itens = [...lista.children];
  const vis = new Map();
  const obs = new IntersectionObserver(es => {
    es.forEach(e => vis.set(e.target, e.intersectionRatio));
    let melhor = null, m = 0;
    vis.forEach((r, el) => { if (r > m) { m = r; melhor = el; } });
    if (melhor && m > 0) { lista.classList.add('vivo'); itens.forEach(li => li.classList.toggle('ativo', li === melhor)); }
  }, { threshold: [0, .25, .5, .75, 1], rootMargin: '-30% 0px -30% 0px' });
  itens.forEach(li => obs.observe(li));
});

// ---------- página de procedimento: âncora ativa ----------
const ancoras = [...document.querySelectorAll('.ancoras a[href^="#"]')];
if (ancoras.length) {
  const alvos = ancoras.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const obsA = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) ancoras.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-35% 0px -55% 0px' });
  alvos.forEach(el => obsA.observe(el));
}

// ---------- aviso de demonstração ----------
// Na prévia, WhatsApp e telefone não ligam para a clínica (a página não é oficial).
// No site final, cada botão abre o WhatsApp da Clínica Patel com a mensagem daquela página.
const demo = document.getElementById('demo');
if (demo) {
  const tit = demo.querySelector('#demo-tit');
  const txt = demo.querySelector('#demo-txt');
  const msg = demo.querySelector('#demo-msg');
  const extra = demo.querySelector('#demo-extra');
  document.querySelectorAll('[data-demo]').forEach(el => el.addEventListener('click', e => {
    e.preventDefault();
    const tipo = el.dataset.demo;
    extra.hidden = true;
    if (tipo === 'tel') {
      tit.textContent = 'Ligar para a clínica';
      txt.textContent = 'No site final, este botão liga para o telefone da Clínica Patel.';
      msg.textContent = '(42) 99990-4435, o número da clínica no Google';
    } else if (tipo === 'proc') {
      tit.textContent = el.dataset.proc || 'Procedimento';
      txt.textContent = 'No site final, cada procedimento tem a própria página: o que é, para quem é e para quem não é, como é feito, cuidados, riscos, quem faz e as dúvidas mais comuns. Esta prévia mostra uma delas como exemplo.';
      msg.textContent = `Olá! Vi a página de ${(el.dataset.proc || 'procedimentos').toLowerCase()} no site e gostaria de agendar uma avaliação.`;
      extra.hidden = false;
    } else {
      tit.textContent = 'Agendar pelo WhatsApp';
      txt.textContent = 'No site final, este botão abre o WhatsApp da Clínica Patel com a mensagem já escrita. Assim a recepção sabe que a paciente veio pelo site e de qual página:';
      msg.textContent = el.dataset.msg || 'Olá! Vi o site da Clínica Patel e gostaria de agendar uma avaliação.';
    }
    if (typeof demo.showModal === 'function') demo.showModal(); else demo.setAttribute('open', '');
  }));
  demo.querySelectorAll('[data-fecha]').forEach(b => b.addEventListener('click', () => demo.close()));
  demo.addEventListener('click', e => { if (e.target === demo) demo.close(); });
}
