/* =====================================================
   POKERCIN — SCRIPT PRINCIPAL
   ===================================================== */

// ===== NAVEGACIÓN TABS =====
function initNav() {
  const btns = document.querySelectorAll('.nav-btn');
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('mainNav');

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
      document.getElementById('tab-' + tab).classList.add('active');
      if (nav.classList.contains('open')) nav.classList.remove('open');
    });
  });

  hamburger.addEventListener('click', () => nav.classList.toggle('open'));
}

// ===== RANGOS =====
const RANKS = ['A','K','Q','J','T','9','8','7','6','5','4','3','2'];

// Rangos de apertura RFI por posición (manos clave)
const OPEN_RANGES = {
  UTG: {
    open: new Set([
      'AA','KK','QQ','JJ','TT','99','88',
      'AKs','AQs','AJs','ATs','A9s','KQs','KJs','KTs','QJs','QTs','JTs',
      'AKo','AQo','AJo',
    ]),
    call3b: new Set(['TT','99','88','AQo','AJs','KQs'])
  },
  MP: {
    open: new Set([
      'AA','KK','QQ','JJ','TT','99','88','77',
      'AKs','AQs','AJs','ATs','A9s','A8s','KQs','KJs','KTs','QJs','QTs','JTs','T9s',
      'AKo','AQo','AJo','ATo','KQo',
    ]),
    call3b: new Set(['TT','99','88','77','AQo','AJo','KQo','ATs'])
  },
  HJ: {
    open: new Set([
      'AA','KK','QQ','JJ','TT','99','88','77','66',
      'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','KQs','KJs','KTs','K9s','QJs','QTs','Q9s','JTs','J9s','T9s','98s',
      'AKo','AQo','AJo','ATo','A9o','KQo','KJo',
    ]),
    call3b: new Set(['TT','99','88','77','66','AJo','ATo','KQo','KJs','QJs'])
  },
  CO: {
    open: new Set([
      'AA','KK','QQ','JJ','TT','99','88','77','66','55',
      'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s',
      'KQs','KJs','KTs','K9s','K8s','QJs','QTs','Q9s','JTs','J9s','J8s','T9s','T8s','98s','87s',
      'AKo','AQo','AJo','ATo','A9o','A8o','KQo','KJo','KTo','QJo',
    ]),
    call3b: new Set(['TT','99','88','77','66','55','A9s','A8s','ATo','A9o','KQo','KTs'])
  },
  BTN: {
    open: new Set([
      'AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22',
      'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s',
      'KQs','KJs','KTs','K9s','K8s','K7s','K6s','K5s','QJs','QTs','Q9s','Q8s','JTs','J9s','J8s','J7s','T9s','T8s','T7s','98s','97s','87s','76s','65s',
      'AKo','AQo','AJo','ATo','A9o','A8o','A7o','A6o','A5o','A4o','KQo','KJo','KTo','K9o','QJo','QTo','JTo',
    ]),
    call3b: new Set(['JJ','TT','99','88','77','66','55','AQo','AJo','ATo','KQo','KJo','QJo','A9s','A8s'])
  },
  SB: {
    open: new Set([
      'AA','KK','QQ','JJ','TT','99','88','77','66','55','44',
      'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s',
      'KQs','KJs','KTs','K9s','K8s','QJs','QTs','Q9s','JTs','J9s','T9s','T8s','98s','87s','76s',
      'AKo','AQo','AJo','ATo','A9o','KQo','KJo','KTo','QJo',
    ]),
    call3b: new Set(['TT','99','88','77','AJo','ATo','KQo','A9s','KTs','QJs'])
  },
  BB: {
    open: new Set([ // BB defense (call vs steal)
      'AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22',
      'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s',
      'KQs','KJs','KTs','K9s','K8s','K7s','K6s','K5s','QJs','QTs','Q9s','Q8s','Q7s',
      'JTs','J9s','J8s','J7s','T9s','T8s','T7s','98s','97s','87s','86s','76s','75s','65s','64s','54s',
      'AKo','AQo','AJo','ATo','A9o','A8o','A7o','A6o','A5o','A4o','A3o',
      'KQo','KJo','KTo','K9o','K8o','QJo','QTo','Q9o','JTo','J9o','T9o',
    ]),
    call3b: new Set([])
  }
};

const RANGE_DESCRIPTIONS = {
  UTG: { pct: '~14%', desc: 'Rango muy ajustado. Con muchos jugadores atrás, solo las manos premium y conectores de alta calidad justifican la apertura.' },
  MP: { pct: '~18%', desc: 'Algo más amplio que UTG. Añadimos pares medios y algún conector suited más.' },
  HJ: { pct: '~24%', desc: 'Comenzamos a ampliar con conectores suited, Ax suited y pares pequeños.' },
  CO: { pct: '~30%', desc: 'Posición ventajosa. Ampliamos significativamente: todo el Ax suited, conectores y pares.' },
  BTN: { pct: '~45%', desc: 'La mejor posición preflop. Solo el BB y SB actúan después. Máxima amplitud de rango.' },
  SB: { pct: '~35%', desc: 'Última posición preflop pero primera postflop (OOP vs BB). Rango amplio pero cuidado: siempre en desventaja posicional postflop.' },
  BB: { pct: '~65%', desc: 'Como BB puedes defender muy amplio porque ya tienes dinero invertido. Muestra rangos de call defensivo vs steal.' }
};

function buildHandGrid(pos) {
  const grid = document.getElementById('handGrid');
  const info = document.getElementById('rangeInfo');
  grid.innerHTML = '';

  const desc = RANGE_DESCRIPTIONS[pos];
  const range = OPEN_RANGES[pos];
  info.innerHTML = `<strong>${pos}</strong> — apertura ~${desc.pct} de manos. ${desc.desc}`;

  for (let i = 0; i < 13; i++) {
    for (let j = 0; j < 13; j++) {
      const r1 = RANKS[i];
      const r2 = RANKS[j];
      let hand, suited = false;
      if (i === j) {
        hand = r1 + r2; // pair
      } else if (i < j) {
        hand = r1 + r2 + 's'; suited = true; // suited (top-right)
      } else {
        hand = r2 + r1 + 'o'; // offsuit (bottom-left)
      }

      const cell = document.createElement('div');
      cell.className = 'hand-cell';
      if (suited) cell.classList.add('suited');

      // Display name
      const display = i === j ? hand : (i < j ? r1 + r2 + 's' : r2 + r1 + 'o');
      cell.textContent = display.replace(/[so]$/, '');

      // Color
      const baseHand = i < j ? r1 + r2 + 's' : r2 + r1 + 'o';
      const pairHand = i === j ? r1 + r2 : null;
      const lookupHand = pairHand || baseHand;

      if (range.open.has(lookupHand)) {
        cell.classList.add('open');
      } else if (range.call3b && range.call3b.has(lookupHand)) {
        cell.classList.add('call3b');
      } else {
        cell.classList.add('fold');
      }

      cell.title = display;
      grid.appendChild(cell);
    }
  }
}

function initRangos() {
  const btns = document.querySelectorAll('.pos-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      buildHandGrid(btn.dataset.pos);
    });
  });
  buildHandGrid('UTG');
}

// ===== POSICIÓN =====
const POSITIONS_6MAX = [
  {
    id: 'UTG', label: 'UTG', pct: '14%',
    top: '10%', left: '30%',
    title: 'UTG — Under The Gun',
    desc: 'Primera posición en actuar preflop. Máximo número de jugadores actúan después. Rango muy ajustado (~14%). Postflop tendrás posición media.',
    tips: ['Sólo abre manos premium', 'Pares > 77, broadways fuertes', 'Cuidado con el squeeze de ciegas']
  },
  {
    id: 'MP', label: 'MP', pct: '18%',
    top: '10%', left: '65%',
    title: 'MP — Middle Position',
    desc: 'Mejor que UTG pero aún con HJ, CO, BTN, SB y BB atrás. Rango ~18%. Más conectores suited pero aún selectivo.',
    tips: ['Expande vs UTG con Ax suited', 'Pares 66+ como apertura', 'Atento a squeeze desde BTN/CO']
  },
  {
    id: 'HJ', label: 'HJ', pct: '24%',
    top: '50%', left: '90%',
    title: 'HJ — Hijack',
    desc: 'Empezamos a tener posición real. Solo CO, BTN y ciegas atrás. Rango ~24%. Comenzamos a ver manos más especulativas.',
    tips: ['Conectores suited bajos: 76s, 65s', 'K8s+, Q9s+ empiezan a tener sentido', 'Dobla los opens vs limpers']
  },
  {
    id: 'CO', label: 'CO', pct: '30%',
    top: '85%', left: '70%',
    title: 'CO — Cutoff',
    desc: 'Segunda mejor posición. Solo BTN y ciegas atrás. Rango ~30%. Puedes "robar" agresivamente.',
    tips: ['Abre con todo el rango Ax suited', 'Pares 22+ si BTN es pasivo', 'Raise grande si BTN defiende mucho']
  },
  {
    id: 'BTN', label: 'BTN', pct: '45%',
    top: '85%', left: '30%',
    title: 'BTN — Button',
    desc: 'La mejor posición. Actúas último en todas las calles postflop. Rango ~45%. Máxima libertad para abrir y robar.',
    tips: ['Puedes abrir casi cualquier mano decente', 'Roba las ciegas agresivamente', 'Postflop tienes ventaja absoluta']
  },
  {
    id: 'SB', label: 'SB', pct: '35%',
    top: '50%', left: '5%',
    title: 'SB — Small Blind',
    desc: 'Última posición preflop, PRIMERA postflop. Paradoja: abrimos mucho (~35%) pero siempre estamos OOP postflop.',
    tips: ['Aplica 3-bet amplio vs BTN steal', 'Postflop: cuidado, siempre OOP', 'Construye pots con iniciativa cuando tengas manos fuertes']
  },
  {
    id: 'BB', label: 'BB', pct: '65%',
    top: '30%', left: '5%',
    title: 'BB — Big Blind',
    desc: 'Ya tienes dinero en el bote. Puedes defender amplio con buenas pot odds. ~65% de manos vs algunos steals.',
    tips: ['Calcula pot odds antes de fold', '3-bet como defensa vs BTN/SB steals', 'Postflop: busca checkraise en tableros que te favorecen']
  }
];

function buildPokerTable() {
  const wrap = document.getElementById('seatWrap');
  const detail = document.getElementById('positionDetail');
  wrap.innerHTML = '';

  POSITIONS_6MAX.forEach(pos => {
    const seat = document.createElement('div');
    seat.className = 'seat';
    seat.style.top = pos.top;
    seat.style.left = pos.left;
    seat.innerHTML = `<span class="seat-label">${pos.label}</span><span class="seat-pct">${pos.pct}</span>`;
    seat.addEventListener('click', () => {
      document.querySelectorAll('.seat').forEach(s => s.classList.remove('selected'));
      seat.classList.add('selected');
      detail.innerHTML = `
        <h3>${pos.title}</h3>
        <p>${pos.desc}</p>
        <ul>${pos.tips.map(t => `<li>${t}</li>`).join('')}</ul>
      `;
    });
    wrap.appendChild(seat);
  });
}

// ===== SITUACIONES INTERACTIVAS =====
const SITUATIONS = [
  {
    type: '2-BET (RFI)',
    pos: 'BTN — solo',
    hand: [{r:'A', s:'♠', red:false},{r:'K', s:'♥', red:true}],
    board: [],
    context: 'Estás en el <strong>Button</strong>. Todos foldean hasta ti. Los blinds son regulares y no muy agresivos. ¿Qué haces?',
    options: ['Fold','Limp','Raise 2.5bb'],
    correct: 2,
    feedback: '✅ Raise 2.5bb. AKo en BTN es una apertura clara. Tienes la mejor posición y una mano premium. Limp pierde valor e iniciativa. Fold es un error grave.'
  },
  {
    type: '3-BET',
    pos: 'BB vs BTN open',
    hand: [{r:'Q', s:'♠', red:false},{r:'Q', s:'♥', red:true}],
    board: [],
    context: 'BTN abre a 2.5bb. SB foldea. Tú estás en el <strong>BB</strong> con QQ. ¿Qué haces?',
    options: ['Fold','Call','3-bet a 9bb'],
    correct: 2,
    feedback: '✅ 3-bet a ~9bb. QQ es demasiado fuerte para solo llamar. El 3-bet te da protección, construye el bote y le hace la vida difícil a BTN con manos especulativas.'
  },
  {
    type: 'FLOP DECISION',
    pos: 'CO (PFR) vs BB',
    hand: [{r:'A', s:'♣', red:false},{r:'Q', s:'♠', red:false}],
    board: [{r:'A', s:'♥', red:true, board:true},{r:'7', s:'♣', red:false, board:true},{r:'2', s:'♦', red:true, board:true}],
    context: 'Abriste en CO, BB llamó. Flop: A♥ 7♣ 2♦. BB checkea. Tienes <strong>par de Ases</strong> con kicker de Reina. Tienes iniciativa y posición. ¿Qué haces?',
    options: ['Check detrás','Bet 33% bote','Bet 75% bote'],
    correct: 1,
    feedback: '✅ Bet 33% bote. Con top pair buen kicker en un tablero seco, un bet pequeño es óptimo: obtiene valor de pares medios y draws, y protege de cartas de turno problemáticas. 75% es demasiado para este tablero seco.'
  },
  {
    type: '3-BET POT',
    pos: 'UTG vs BTN 3-bet',
    hand: [{r:'J', s:'♠', red:false},{r:'J', s:'♣', red:false}],
    board: [],
    context: 'Abriste en UTG a 2.5bb con JJ. BTN hace 3-bet a 8bb. ¿Qué haces?',
    options: ['Fold','Call (flat)','4-bet shove'],
    correct: 1,
    feedback: '✅ Call (flat). JJ es demasiado bueno para fold pero hacer un 4-bet vs un BTN amplio nos pone en situaciones difíciles vs KK/AA/QQ. Llamar en posición (si BTN está OOP, cuidado) y jugar un 3-bet pot con iniciativa en el flop.'
  },
  {
    type: 'SQUEEZE',
    pos: 'SB vs CO open + BTN call',
    hand: [{r:'A', s:'♦', red:true},{r:'K', s:'♠', red:false}],
    board: [],
    context: 'CO abre, BTN llama, SB eres tú con AKo. ¿Qué haces?',
    options: ['Fold','Call (frío)','Squeeze 3-bet grande'],
    correct: 2,
    feedback: '✅ Squeeze 3-bet a ~14-16bb. Con AKo y dos oponentes detrás tienes una situación de squeeze perfecta. El frío call OOP con AK es un error; el squeeze actúa como protección y gana el bote con frecuencia.'
  },
  {
    type: 'INICIATIVA',
    pos: 'BB (caller) — flop',
    hand: [{r:'K', s:'♦', red:true},{r:'J', s:'♣', red:false}],
    board: [{r:'K', s:'♠', red:false, board:true},{r:'8', s:'♥', red:true, board:true},{r:'3', s:'♦', red:true, board:true}],
    context: 'Llamaste en BB vs BTN open. Flop: K♠ 8♥ 3♦. Tienes top pair. ¿Qué haces? (BTN tiene la iniciativa)',
    options: ['Donk-bet 40%','Check-raise','Check-call'],
    correct: 2,
    feedback: '✅ Check-call (o check-raise como alternativa). Contra BTN con iniciativa en un flop que te favorece (K alto), el check-call permite que BTN c-bet con su rango amplio. El check-raise también es válido con esta mano para construir bote y no dejarnos robar gratis en turn.'
  },
  {
    type: '2-BET STEAL',
    pos: 'CO — ciegos débiles',
    hand: [{r:'7', s:'♦', red:true},{r:'6', s:'♠', red:false}],
    board: [],
    context: 'Todos foldean hasta ti en CO. Los ciegos son muy pasivos y foldean mucho. ¿Qué haces con 76s?',
    options: ['Fold','Raise 2.5bb (steal)','Limp'],
    correct: 1,
    feedback: '✅ Raise (steal). 76s en CO vs blinds pasivos es un robo estándar. Tienes buena playability postflop si te llaman, posición, e iniciativa. Contra blinds que foldean mucho, la EV preflop ya es positiva.'
  },
  {
    type: 'FOLD EQ',
    pos: 'BTN vs BB check-raise',
    hand: [{r:'T', s:'♣', red:false},{r:'9', s:'♠', red:false}],
    board: [{r:'J', s:'♦', red:true, board:true},{r:'8', s:'♣', red:false, board:true},{r:'2', s:'♥', red:true, board:true}],
    context: 'Abriste en BTN, BB llamó. C-bet en flop J♦ 8♣ 2♥. BB hace check-raise grande (3x tu bet). Tienes T9 (gutshot a la Q). ¿Qué haces?',
    options: ['Fold','Call con draw','Re-raise'],
    correct: 1,
    feedback: '✅ Call con el draw. Tienes 4 outs para el straight (Q), más posibles overcards. Con pot odds probablemente suficientes y buena playability si pegas, el call es correcto. El fold sería demasiado tight. El re-raise es especulativo sin fold equity clara.'
  }
];

let currentSit = 0;

function renderSituation(idx) {
  const s = SITUATIONS[idx % SITUATIONS.length];
  document.getElementById('sitType').textContent = s.type;
  document.getElementById('sitPos').textContent = s.pos;

  const hc = document.getElementById('holeCards');
  hc.innerHTML = s.hand.map(c => `<div class="card-chip${c.red ? ' red' : ''}">${c.r}${c.s}</div>`).join('');

  const bc = document.getElementById('boardCards');
  bc.innerHTML = s.board.length
    ? '<span style="color:var(--muted);font-size:0.8rem;align-self:center">Flop:</span>' +
      s.board.map(c => `<div class="card-chip board${c.red ? ' red' : ''}">${c.r}${c.s}</div>`).join('')
    : '';

  document.getElementById('sitContext').innerHTML = s.context;

  const actionBtns = document.getElementById('actionBtns');
  actionBtns.innerHTML = s.options.map((opt, i) => {
    const cls = i === 0 ? 'fold-btn' : i === 1 ? 'call-btn' : 'raise-btn';
    return `<button class="action-btn ${cls}" data-idx="${i}">${opt}</button>`;
  }).join('');

  const feedback = document.getElementById('sitFeedback');
  feedback.style.display = 'none';
  feedback.className = 'situation-feedback';

  actionBtns.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const chosen = parseInt(btn.dataset.idx);
      feedback.style.display = 'block';
      feedback.textContent = s.feedback;
      if (chosen === s.correct) {
        feedback.classList.add('correct');
      } else {
        feedback.classList.add('wrong');
        feedback.textContent = `❌ No es la mejor opción. ${s.feedback}`;
      }
      actionBtns.querySelectorAll('.action-btn').forEach(b => b.disabled = true);
    });
  });
}

function initSituaciones() {
  currentSit = Math.floor(Math.random() * SITUATIONS.length);
  renderSituation(currentSit);
  document.getElementById('skipSit').addEventListener('click', () => {
    currentSit = (currentSit + 1) % SITUATIONS.length;
    renderSituation(currentSit);
  });
}

// ===== EQUITY =====
const EQUITY_MATCHUPS = [
  { h1: ['A♠','A♥'], h2: ['K♠','K♥'], eq: 82, opts: [55, 65, 75, 82], desc: 'AA vs KK: los "rockets" dominan masivamente. KK tiene ~18%.' },
  { h1: ['A♠','K♠'], h2: ['Q♥','Q♣'], eq: 46, opts: [35, 46, 55, 65], desc: 'AKs vs QQ: casi coinflip. AKs necesita mejorar.' },
  { h1: ['J♠','J♥'], h2: ['A♠','K♣'], eq: 57, opts: [45, 50, 57, 65], desc: 'JJ vs AKo: las jotas son ligeras favoritas (coinflip muy pequeño).' },
  { h1: ['T♣','9♣'], h2: ['A♦','A♠'], eq: 20, opts: [15, 20, 30, 40], desc: 'T9s vs AA: manos conectadas suited tienen algo más de equity que bloques.' },
  { h1: ['K♠','Q♠'], h2: ['K♣','J♥'], eq: 70, opts: [55, 63, 70, 80], desc: 'KQs vs KJo: dominancia parcial. Kicker marca la diferencia.' },
  { h1: ['A♥','Q♦'], h2: ['A♣','J♠'], eq: 72, opts: [60, 65, 72, 80], desc: 'AQo vs AJo: dominancia de kicker. J tiene solo ~28%.' },
  { h1: ['7♣','6♣'], h2: ['A♠','K♦'], eq: 40, opts: [30, 35, 40, 50], desc: 'Mano suited conectada vs dos overcards: casi coinflip, ligeramente peor.' },
  { h1: ['Q♠','Q♦'], h2: ['A♣','Q♥'], eq: 68, opts: [55, 60, 68, 75], desc: 'QQ vs AQo: QQ es favorita porque AQ solo tiene 3 Ases para ganar.' },
];

const EQ_REFERENCE = [
  { matchup: 'AA vs KK', eq1: '82%', eq2: '18%', desc: 'Overpair dominante' },
  { matchup: 'QQ vs AKo', eq1: '57%', eq2: '43%', desc: 'Coinflip ligero' },
  { matchup: 'AA vs 72o', eq1: '88%', eq2: '12%', desc: 'Máxima dominancia' },
  { matchup: 'AKs vs 22', eq1: '48%', eq2: '52%', desc: 'Coinflip clásico' },
  { matchup: 'JJ vs AQo', eq1: '56%', eq2: '44%', desc: 'Pareja vs dos overc.' },
  { matchup: 'KK vs AA', eq1: '18%', eq2: '82%', desc: 'Las peores ciegas' },
  { matchup: 'AKo vs AQo', eq1: '73%', eq2: '27%', desc: 'Dominancia de kicker' },
  { matchup: 'T9s vs 88', eq1: '45%', eq2: '55%', desc: 'Conectada vs pareja' },
];

let currentEq = 0;

function renderEquityQuestion(idx) {
  const m = EQUITY_MATCHUPS[idx];
  document.getElementById('eqHand1').innerHTML = m.h1.map(c => {
    const red = c.includes('♥') || c.includes('♦');
    return `<div class="card-chip${red ? ' red' : ''}">${c}</div>`;
  }).join('');
  document.getElementById('eqHand2').innerHTML = m.h2.map(c => {
    const red = c.includes('♥') || c.includes('♦');
    return `<div class="card-chip${red ? ' red' : ''}">${c}</div>`;
  }).join('');

  const opts = document.getElementById('eqOptions');
  opts.innerHTML = m.opts.map(o => `<button class="eq-opt-btn" data-val="${o}">${o}%</button>`).join('');
  document.getElementById('eqFeedback').textContent = '';

  opts.querySelectorAll('.eq-opt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = parseInt(btn.dataset.val);
      opts.querySelectorAll('.eq-opt-btn').forEach(b => {
        b.disabled = true;
        if (parseInt(b.dataset.val) === m.eq) b.classList.add('correct');
        else if (b === btn && val !== m.eq) b.classList.add('wrong');
      });
      document.getElementById('eqFeedback').textContent = m.desc;
    });
  });
}

function buildEqReference() {
  const grid = document.getElementById('eqRefGrid');
  grid.innerHTML = EQ_REFERENCE.map(r => `
    <div class="eq-ref-item">
      <div class="matchup">${r.matchup}</div>
      <div class="eq-pct">${r.eq1} / ${r.eq2}</div>
      <div class="eq-desc">${r.desc}</div>
    </div>
  `).join('');
}

function initEquity() {
  buildEqReference();
  currentEq = 0;
  renderEquityQuestion(currentEq);

  document.getElementById('nextEquity').addEventListener('click', () => {
    currentEq = (currentEq + 1) % EQUITY_MATCHUPS.length;
    renderEquityQuestion(currentEq);
  });

  document.getElementById('calcOdds').addEventListener('click', () => {
    const pot = parseFloat(document.getElementById('potSize').value) || 0;
    const bet = parseFloat(document.getElementById('betSize').value) || 0;
    const outs = parseFloat(document.getElementById('yourOuts').value);
    const result = document.getElementById('oddsResult');

    if (!pot || !bet) { result.innerHTML = 'Introduce bote y apuesta.'; result.classList.add('show'); return; }

    const totalPot = pot + bet;
    const potOdds = bet / (totalPot + bet);
    const potOddsPct = (potOdds * 100).toFixed(1);

    let html = `<strong>Pot odds:</strong> ${bet} para ganar ${totalPot + bet} → necesitas <strong>${potOddsPct}% equity</strong> para break-even.<br>`;

    if (!isNaN(outs) && outs > 0) {
      // Rule of 4 and 2
      const eq2 = (outs * 2).toFixed(0);
      const eq4 = (outs * 4).toFixed(0);
      html += `<strong>Regla 2/4:</strong> ${outs} outs → ~${eq2}% en turn, ~${eq4}% en flop.<br>`;
      const canCall = parseFloat(eq2) >= parseFloat(potOddsPct);
      html += canCall
        ? `<span class="odds-good">✅ Call rentable</span> (tienes más equity que pot odds)`
        : `<span class="odds-bad">❌ Fold correcto</span> (no tienes suficiente equity)`;
    }

    result.innerHTML = html;
    result.classList.add('show');
  });
}

// ===== QUIZ =====
const QUIZ_QUESTIONS = [
  {
    q: '¿Qué significa tener "posición" en una mano de poker?',
    opts: ['Tener las mejores cartas', 'Actuar después que tu oponente en cada calle', 'Estar en el asiento del dealer', 'Tener más fichas'],
    correct: 1,
    exp: 'Tener posición significa actuar DESPUÉS de tu oponente. Ves sus acciones antes de decidir: una ventaja de información enorme en cada calle.'
  },
  {
    q: '¿Qué posición tiene la mayor ventaja preflop y postflop?',
    opts: ['UTG (Under the Gun)', 'SB (Small Blind)', 'BTN (Button)', 'BB (Big Blind)'],
    correct: 2,
    exp: 'El BTN (Button) actúa último en todas las calles postflop. Solo SB y BB actúan después en PF. Es la posición más ventajosa de la mesa.'
  },
  {
    q: 'Una mano "suited" (del mismo palo) otorga aproximadamente ¿cuánta equity extra vs una mano offsuit?',
    opts: ['0% (es igual)', '~2-3%', '~10%', '~20%'],
    correct: 1,
    exp: 'Las manos suited añaden aproximadamente 2-3% de equity. No es una ventaja enorme, pero sí importa: adds valor de flush y más draws.'
  },
  {
    q: '¿Qué es el "3-bet"?',
    opts: ['Una apuesta el tercer nivel de ciegas', 'Relanzar (re-raise) la primera apuesta preflop', 'Apostar en el tercer tablero (river)', 'Tener tres manos ganadoras seguidas'],
    correct: 1,
    exp: 'El 3-bet es un re-raise preflop (o en cualquier calle): BB/SB son las ciegas (1ra apuesta), la primera apertura (open) es el 2-bet, y relanzar encima es el 3-bet.'
  },
  {
    q: '¿Qué son los "pot odds"?',
    opts: ['La probabilidad de ganar el bote', 'La relación entre el coste del call y el bote total', 'El tamaño máximo del bote en un turneo', 'Los odds de repartir una mano premium'],
    correct: 1,
    exp: 'Los pot odds son la relación entre cuánto te cuesta llamar y cuánto ganarías. Si hay 100 en el bote y te apuestan 50, tu call de 50 en un bote total de 150 → pot odds del 33%.'
  },
  {
    q: '¿Qué posición actúa primero en todas las calles postflop en una mesa de 6?',
    opts: ['UTG', 'BTN', 'BB', 'SB'],
    correct: 3,
    exp: 'SB actúa primero postflop (out of position). Esto hace que el SB sea una posición difícil: aunque puede abrir amplio preflop, siempre juega OOP después.'
  },
  {
    q: '¿Qué es un "c-bet" (continuation bet)?',
    opts: ['Una apuesta en el flop del jugador que abrió preflop', 'Una apuesta a cualquier precio en cualquier calle', 'Apostar cuando tienes la mano ganadora', 'Apostar solo cuando tienes draws'],
    correct: 0,
    exp: 'El c-bet (continuation bet) es la apuesta en el flop del jugador que mostró agresión preflop (PFR). Tiene iniciativa y puede apostar con credibilidad independientemente de si ha mejorado.'
  },
  {
    q: '¿Cuántos outs tiene un flush draw (proyecto de color)?',
    opts: ['6', '8', '9', '13'],
    correct: 2,
    exp: 'Un flush draw tiene 9 outs: hay 13 cartas de cada palo, ya tienes 4, quedan 9. Con la regla del 2/4: ~18% en un turno, ~36% en dos turnos.'
  },
  {
    q: '¿Qué es la "equity" en poker?',
    opts: ['Las fichas que tienes en el momento', 'Tu porcentaje de ganar el bote si las cartas se reparten hasta el final', 'El valor de las ciegas', 'El dinero que debes poner en el bote'],
    correct: 1,
    exp: 'Equity es tu probabilidad de ganar el bote si la mano llega a showdown. AA vs KK preflop: AA tiene ~82% de equity. Es la base de todas las decisiones matemáticas en poker.'
  },
  {
    q: 'Con un "gutshot" (conector interior), ¿cuántos outs tienes?',
    opts: ['2', '4', '8', '12'],
    correct: 1,
    exp: 'Un gutshot tiene 4 outs: solo una carta (el interior del conector) completa la escalera. Ejemplo: tienes 9T en tablero J-7-2, solo el 8 completa.'
  },
  {
    q: '¿En qué situación deberías ampliar más tu rango de apertura?',
    opts: ['En UTG con muchos jugadores activos', 'En BTN con solo las ciegas detrás', 'En SB con BB muy agresivo', 'En BB cuando hay varios limpers'],
    correct: 1,
    exp: 'En BTN con solo las ciegas detrás amplías más porque: tienes posición en todas las calles, hay pocos jugadores que pueden tenerte dominado, y puedes defender amplios rangos con ventaja.'
  },
  {
    q: '¿Qué significa "RFI" en poker?',
    opts: ['Raise for Information (subir para obtener info)', 'Raise First In (primera subida en la ronda)', 'Re-Fold Indicator', 'River Final Initiative'],
    correct: 1,
    exp: 'RFI = Raise First In. Es cuando eres el primer jugador en subir preflop (no hay raises previos). Define el rango de apertura por posición.'
  }
];

let quizState = {
  questions: [],
  current: 0,
  score: 0,
  answered: false
};

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function startQuiz() {
  quizState.questions = shuffleArray(QUIZ_QUESTIONS);
  quizState.current = 0;
  quizState.score = 0;
  quizState.answered = false;
  document.getElementById('quizScore').style.display = 'none';
  document.getElementById('restartQuiz').style.display = 'none';
  renderQuizQuestion();
}

function renderQuizQuestion() {
  const q = quizState.questions[quizState.current];
  const total = quizState.questions.length;
  const pct = (quizState.current / total * 100).toFixed(0);

  document.getElementById('progressFill').style.width = pct + '%';
  document.getElementById('progressText').textContent = `${quizState.current} / ${total}`;
  document.getElementById('quizQuestion').textContent = `${quizState.current + 1}. ${q.q}`;
  document.getElementById('quizFeedback').textContent = '';

  const opts = document.getElementById('quizOptions');
  opts.innerHTML = q.opts.map((o, i) => `<button class="quiz-opt-btn" data-idx="${i}">${o}</button>`).join('');

  document.getElementById('nextQuestion').style.display = 'none';
  quizState.answered = false;

  opts.querySelectorAll('.quiz-opt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (quizState.answered) return;
      quizState.answered = true;

      const chosen = parseInt(btn.dataset.idx);
      opts.querySelectorAll('.quiz-opt-btn').forEach(b => {
        b.disabled = true;
        if (parseInt(b.dataset.idx) === q.correct) b.classList.add('correct');
        else if (b === btn && chosen !== q.correct) b.classList.add('wrong');
      });

      if (chosen === q.correct) quizState.score++;
      document.getElementById('quizFeedback').textContent = q.exp;

      const isLast = quizState.current >= quizState.questions.length - 1;
      if (isLast) {
        document.getElementById('nextQuestion').style.display = 'none';
        showQuizScore();
      } else {
        document.getElementById('nextQuestion').style.display = 'inline-block';
      }
    });
  });
}

function showQuizScore() {
  const score = quizState.score;
  const total = quizState.questions.length;
  document.getElementById('progressFill').style.width = '100%';
  document.getElementById('progressText').textContent = `${total} / ${total}`;

  const scoreEl = document.getElementById('quizScore');
  scoreEl.style.display = 'block';
  document.getElementById('scoreText').textContent = `${score} / ${total}`;
  const pct = Math.round(score / total * 100);
  let msg = pct >= 90 ? '🏆 Excelente! Tienes bases sólidas de poker.' :
            pct >= 70 ? '✅ Bien. Repasa los conceptos que fallaste.' :
            pct >= 50 ? '📚 Regular. Vale la pena repasar posición y equity.' :
                        '🃏 Sigue practicando. Usa los módulos de Rangos y Posición.';
  document.getElementById('scoreMessage').textContent = msg;
  document.getElementById('restartQuiz').style.display = 'inline-block';
}

function initQuiz() {
  startQuiz();
  document.getElementById('nextQuestion').addEventListener('click', () => {
    quizState.current++;
    renderQuizQuestion();
  });
  document.getElementById('restartQuiz').addEventListener('click', startQuiz);
}

// ===== TORNEO (original) =====
const torneoData = {
  inventory: [
    {color:'Blanco', value:10, qty:49},
    {color:'Rojo', value:25, qty:60},
    {color:'Verde', value:100, qty:32},
    {color:'Azul', value:500, qty:48},
    {color:'Negro', value:1000, qty:35},
  ],
  stacks: [
    { players:2, colors:{blancas:24, rojas:30, verdes:16, azules:24, negras:17} },
    { players:3, colors:{blancas:16, rojas:20, verdes:10, azules:16, negras:11} },
    { players:4, colors:{blancas:12, rojas:15, verdes:8, azules:12, negras:8} },
    { players:5, colors:{blancas:9, rojas:12, verdes:6, azules:9, negras:7} },
    { players:6, colors:{blancas:7, rojas:10, verdes:5, azules:8, negras:5} },
    { players:7, colors:{blancas:7, rojas:8, verdes:4, azules:6, negras:5} },
    { players:8, colors:{blancas:5, rojas:7, verdes:4, azules:6, negras:4} },
    { players:9, colors:{blancas:4, rojas:6, verdes:3, azules:5, negras:3} },
    { players:10, colors:{blancas:4, rojas:6, verdes:3, azules:4, negras:3} }
  ],
  levels:[
    {n:1, blinds:'25 / 50', minBet:50, note:'Calentamiento'},
    {n:2, blinds:'50 / 100', minBet:100, note:'Aún puedes ver muchos flops'},
    {n:3, blinds:'100 / 200', minBet:200, note:'Empieza a doler'},
    {n:4, blinds:'150 / 300', minBet:300, note:'Suben las apuestas'},
    {n:5, blinds:'200 / 400', minBet:400, note:'Ritmo estable'},
    {n:6, blinds:'300 / 600', minBet:600, note:'Empieza la presión'},
    {n:7, blinds:'400 / 800', minBet:800, note:'Jugadores más cortos'},
    {n:8, blinds:'500 / 1000', minBet:1000, note:'Se decide quién domina'},
    {n:9, blinds:'800 / 1600', minBet:1600, note:'Modo all-in o fold'},
    {n:10, blinds:'1000 / 2000', minBet:2000, note:'Final del torneo'}
  ]
};

function fmt(n) { return typeof n === 'number' ? n.toLocaleString('es-ES') : n; }

function buildTorneo() {
  // Inventory
  const container = document.getElementById('chipsRow');
  let totalChips = 0, totalPoints = 0;
  container.innerHTML = '';
  torneoData.inventory.forEach(item => {
    const colorKey = item.color.toLowerCase();
    let cls = 'chip-white';
    if (colorKey.includes('rojo')) cls = 'chip-red';
    if (colorKey.includes('verde')) cls = 'chip-green';
    if (colorKey.includes('azul')) cls = 'chip-blue';
    if (colorKey.includes('negro')) cls = 'chip-black';
    const card = document.createElement('div');
    card.className = 'chip-card';
    card.innerHTML = `<div class="chip ${cls}">${fmt(item.value)}</div><small>${item.qty} uds</small>`;
    container.appendChild(card);
    totalChips += item.qty;
    totalPoints += item.value * item.qty;
  });
  document.getElementById('totalChips').textContent = totalChips;
  document.getElementById('totalPoints').textContent = fmt(totalPoints);

  // Stacks
  const stBody = document.querySelector('#stacksTable tbody');
  stBody.innerHTML = '';
  torneoData.stacks.forEach(s => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${s.players}</td><td>${s.colors.blancas}</td><td>${s.colors.rojas}</td><td>${s.colors.verdes}</td><td>${s.colors.azules}</td><td>${s.colors.negras}</td>`;
    stBody.appendChild(tr);
  });

  // Levels
  const lvBody = document.querySelector('#levelsTable tbody');
  lvBody.innerHTML = '';
  torneoData.levels.forEach(l => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${l.n}</td><td>${l.blinds}</td><td>${fmt(l.minBet)}</td><td>${l.note}</td>`;
    lvBody.appendChild(tr);
  });

  document.getElementById('copyBtn').addEventListener('click', () => {
    const lines = ['Inventario: ' + torneoData.inventory.map(i => `${i.color}(${i.qty}x${i.value})`).join(', ')];
    torneoData.stacks.forEach(s => lines.push(`${s.players}J: B${s.colors.blancas} R${s.colors.rojas} V${s.colors.verdes} A${s.colors.azules} N${s.colors.negras}`));
    torneoData.levels.forEach(l => lines.push(`Nv${l.n}: ${l.blinds}`));
    navigator.clipboard.writeText(lines.join('\n')).then(() => alert('Copiado!')).catch(() => alert('No se pudo copiar'));
  });
  document.getElementById('printBtn').addEventListener('click', () => window.print());
}

// ===== INIT =====
window.addEventListener('DOMContentLoaded', () => {
  initNav();
  initRangos();
  buildPokerTable();
  initSituaciones();
  initEquity();
  initQuiz();
  buildTorneo();
});
