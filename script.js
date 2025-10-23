const data = {
  inventory: [
    {color:'Blanco', value:10, qty:49},
    {color:'Rojo', value:25, qty:60},
    {color:'Verde', value:100, qty:32},
    {color:'Azul', value:500, qty:48},
    {color:'Negro', value:1000, qty:35},
  ],
  stacks: [
    { players:2, stack:32095, colors:{blancas:24, rojas:30, verdes:16, azules:24, negras:17}, chips:111 },
    { players:3, stack:21396, colors:{blancas:16, rojas:20, verdes:10, azules:16, negras:11}, chips:73 },
    { players:4, stack:16047, colors:{blancas:12, rojas:15, verdes:8, azules:12, negras:8}, chips:55 },
    { players:5, stack:12838, colors:{blancas:9, rojas:12, verdes:6, azules:9, negras:7}, chips:43 },
    { players:6, stack:10698, colors:{blancas:7, rojas:10, verdes:5, azules:8, negras:5}, chips:35 },
    { players:7, stack:9170, colors:{blancas:7, rojas:8, verdes:4, azules:6, negras:5}, chips:30 },
    { players:8, stack:8023, colors:{blancas:5, rojas:7, verdes:4, azules:6, negras:4}, chips:26 },
    { players:9, stack:7132, colors:{blancas:4, rojas:6, verdes:3, azules:5, negras:3}, chips:21 },
    { players:10, stack:6419, colors:{blancas:4, rojas:6, verdes:3, azules:4, negras:3}, chips:20 }
  ],
  levels:[
    {n:1, blinds:'25 / 50', minBet:50, note:'Nivel de calentamiento'},
    {n:2, blinds:'50 / 100', minBet:100, note:'Aún puedes ver muchos flops'},
    {n:3, blinds:'100 / 200', minBet:200, note:'Empieza a doler perder'},
    {n:4, blinds:'150 / 300', minBet:300, note:'Suben las apuestas'},
    {n:5, blinds:'200 / 400', minBet:400, note:'Ritmo estable'},
    {n:6, blinds:'300 / 600', minBet:600, note:'Empieza la presión'},
    {n:7, blinds:'400 / 800', minBet:800, note:'Jugadores más cortos'},
    {n:8, blinds:'500 / 1000', minBet:1000, note:'Se decide quién domina'},
    {n:9, blinds:'800 / 1600', minBet:1600, note:'Entra el modo “all-in o fold”'},
    {n:10, blinds:'1000 / 2000', minBet:2000, note:'Final del torneo'}
  ]
}

function fmt(n){
  if(typeof n!=='number') return n
  return n.toLocaleString('es-ES')
}

function buildStacks(){
  const tbody = document.querySelector('#stacksTable tbody')
  tbody.innerHTML = ''
  data.stacks.forEach(s => {
    const tr = document.createElement('tr')
    tr.innerHTML = `
      <td>${s.players}</td>
      <td>${s.colors.blancas}</td>
      <td>${s.colors.rojas}</td>
      <td>${s.colors.verdes}</td>
      <td>${s.colors.azules}</td>
      <td>${s.colors.negras}</td>
    `
    tbody.appendChild(tr)
  })
}

function buildInventory(){
  const container = document.getElementById('chipsRow')
  const totalChipsEl = document.getElementById('totalChips')
  const totalPointsEl = document.getElementById('totalPoints')
  container.innerHTML = ''
  let totalChips = 0
  let totalPoints = 0
  data.inventory.forEach(item=>{
    const tot = item.value * item.qty
    // map color to chip class
    const colorKey = item.color.toLowerCase()
    let chipClass = 'chip-white'
    if(colorKey.includes('rojo')) chipClass = 'chip-red'
    if(colorKey.includes('verde')) chipClass = 'chip-green'
    if(colorKey.includes('azul')) chipClass = 'chip-blue'
    if(colorKey.includes('negro')) chipClass = 'chip-black'
    const chipHtml = `<div class="chip ${chipClass}"><span>${fmt(item.value)}</span></div>`

  const card = document.createElement('div')
  card.className = 'chip-card'
  card.innerHTML = `${chipHtml}`
    container.appendChild(card)

    totalChips += item.qty
    totalPoints += tot
  })
  totalChipsEl.textContent = totalChips
  totalPointsEl.textContent = fmt(totalPoints)
}

function buildLevels(){
  const tbody = document.querySelector('#levelsTable tbody')
  tbody.innerHTML = ''
  data.levels.forEach(l => {
    const tr = document.createElement('tr')
    tr.innerHTML = `<td>${l.n}</td><td>${l.blinds}</td><td>${fmt(l.minBet)}</td><td>${l.note}</td>`
    tbody.appendChild(tr)
  })
}

function copyAll(){
  const lines = []
  lines.push('Inventario (Color - Valor - Cantidad - Total)')
  data.inventory.forEach(i=> lines.push(`${i.color} — ${i.value} — ${i.qty} — ${i.value*i.qty}`))
  lines.push('')
  lines.push('Reparto sugerido (puntos; blanco, rojo, verde, azul, negro)')
  data.stacks.forEach(s => {
    lines.push(`${s.players} jugadores: ${s.colors.blancas} blancas, ${s.colors.rojas} rojas, ${s.colors.verdes} verdes, ${s.colors.azules} azules, ${s.colors.negras} negras`)
  })
  lines.push('')
  lines.push('Opción A — Torneo estándar (~2 horas) — cada nivel ~20 minutos')
  data.levels.forEach(l => lines.push(`Nivel ${l.n}: ${l.blinds} — Apuesta mínima ${l.minBet} — ${l.note}`))

  navigator.clipboard.writeText(lines.join('\n')).then(()=>{
    alert('Datos copiados al portapapeles')
  },()=>{
    alert('No se pudo copiar. Usa Ctrl+C manualmente.')
  })
}

function init(){
  buildInventory();
  buildStacks();
  buildLevels();
  document.getElementById('copyBtn').addEventListener('click', copyAll)
  document.getElementById('printBtn').addEventListener('click', ()=>window.print())
  const toggle = document.getElementById('toggleCompact')
  toggle.addEventListener('click', ()=>{
    document.body.classList.toggle('compact')
    toggle.textContent = document.body.classList.contains('compact') ? 'Vista normal' : 'Vista compacta'
  })
}

window.addEventListener('DOMContentLoaded', init)