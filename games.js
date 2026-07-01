// ===== Music =====
let musicPlaying = true
const music = document.getElementById('bg-music')
music.muted = true
music.volume = 0.3
music.play().then(() => { music.muted = false }).catch(() => {
    document.addEventListener('click', () => {
        music.muted = false
        music.play().catch(() => {})
    }, { once: true })
})
function toggleMusic() {
    if (musicPlaying) {
        music.pause(); musicPlaying = false
        document.getElementById('music-toggle').textContent = '🔇'
    } else {
        music.muted = false; music.play(); musicPlaying = true
        document.getElementById('music-toggle').textContent = '🔊'
    }
}

// ===== Code Gate =====
const SECRET_CODE = 'HITCH'
const wrongTeases = [
    "nope 🌷 try again",
    "wrong... think a little 💚",
    "still no. you actually know this one 😏",
    "fine, hint time: something you love that i did NOT 🙃",
    "ok bigger hint: it's a movie. a boring one. (to me) 🎬",
    "ok last hint: he teaches guys how to flirt 💚"
]
let wrongCount = 0
const gate = document.getElementById('code-gate')
const codeInput = document.getElementById('code-input')
const codeMsg = document.getElementById('code-msg')
const codeSubmit = document.getElementById('code-submit')

function tryCode() {
    const val = (codeInput.value || '').trim().toLowerCase()
    if (val === SECRET_CODE.toLowerCase()) {
        gate.classList.remove('show')
        codeMsg.textContent = ''
        return
    }
    codeInput.classList.remove('wrong')
    void codeInput.offsetWidth
    codeInput.classList.add('wrong')
    codeMsg.textContent = wrongTeases[Math.min(wrongCount, wrongTeases.length - 1)]
    wrongCount++
    codeInput.select()
}
codeSubmit.addEventListener('click', tryCode)
codeInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') tryCode() })
setTimeout(() => codeInput.focus(), 200)

// ===== Router =====
function showView(id) {
    document.querySelectorAll('.game-view').forEach(v => v.classList.remove('active'))
    document.getElementById(id).classList.add('active')
}

// ===== Locked tile teasers =====
const lockedTeases = [
    "nope! you only get one game 😏",
    "still locked... try the basket one 🧺",
    "you're really gonna keep clicking, huh 👀",
    "i hid the others on purpose 🔒",
    "the green hearts miss you 💚",
    "fine, click it again. still locked 🌷",
    "ok at this point you're just stalling 😤",
    "the only game that matters is right there → 🧺",
    "stubborn. cute. but still one game 💐",
    "you found my trap card 🎴 go catch hearts",
    "i admire the persistence... but no 🙃",
    "ok you win, you can click this forever. won't open 😌"
]
let lockedIdx = 0
const lockedMsgEl = document.getElementById('locked-msg')

document.querySelectorAll('.hub-tile').forEach(tile => {
    tile.addEventListener('click', () => {
        const game = tile.dataset.game
        if (game === 'catch') {
            showView('game-catch')
            initCatch()
            return
        }
        if (game === 'maze') {
            showView('game-maze')
            initMaze()
            return
        }
        const msg = lockedTeases[lockedIdx % lockedTeases.length]
        lockedIdx++
        lockedMsgEl.textContent = msg
        tile.classList.remove('shake')
        void tile.offsetWidth
        tile.classList.add('shake')
    })
})
document.querySelectorAll('[data-back]').forEach(b => {
    b.addEventListener('click', () => showView('hub'))
})

// ===== Reveal modal =====
function showReveal() {
    document.getElementById('reveal-modal').classList.add('show')
    if (typeof confetti === 'function') {
        confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 }, colors: ['#4caf50','#81c784','#a5d6a7','#fff','#c8e6c9'] })
    }
}
document.getElementById('reveal-close').addEventListener('click', () => {
    document.getElementById('reveal-modal').classList.remove('show')
    showView('hub')
})

function showMazeReveal() {
    document.getElementById('maze-reveal').classList.add('show')
    if (typeof confetti === 'function') {
        confetti({ particleCount: 160, spread: 90, origin: { y: 0.6 }, colors: ['#4caf50','#81c784','#a5d6a7','#fff','#ffcdd2'] })
    }
}
document.getElementById('maze-reveal-close').addEventListener('click', () => {
    document.getElementById('maze-reveal').classList.remove('show')
    showView('hub')
})

// ===== CATCH =====
let catchState = null
function initCatch() {
    const stage = document.getElementById('catch-stage')
    const basket = document.getElementById('basket')
    const scoreEl = document.getElementById('catch-score')
    if (catchState) {
        clearInterval(catchState.spawn)
        clearInterval(catchState.tick)
        window.removeEventListener('keydown', catchState.keyHandler)
        stage.querySelectorAll('.falling-heart').forEach(h => h.remove())
    }
    let score = 0
    const basketW = 60
    let basketX = stage.clientWidth / 2
    scoreEl.textContent = '0 / 7'

    function setBasket(x) {
        basketX = Math.max(basketW/2, Math.min(stage.clientWidth - basketW/2, x))
        basket.style.left = basketX + 'px'
    }
    setBasket(basketX)

    function onMove(e) {
        const rect = stage.getBoundingClientRect()
        const t = e.touches ? e.touches[0] : e
        setBasket(t.clientX - rect.left)
    }
    stage.onmousemove = onMove
    stage.ontouchmove = (e) => { e.preventDefault(); onMove(e) }
    const keyHandler = (e) => {
        if (e.key === 'ArrowLeft') setBasket(basketX - 25)
        if (e.key === 'ArrowRight') setBasket(basketX + 25)
    }
    window.addEventListener('keydown', keyHandler)

    // Decoys (don't count) vs target (counts)
    const decoyEmojis = ['💗','💖','💕','🌷','🌸','🌹','🌺','🌻','🌼','🌿','🍀','🍃','💐','💝','💞','✨','⭐','🦋']
    const TARGET = '💚'
    const hearts = []

    const spawn = setInterval(() => {
        if (score >= 7) return
        const h = document.createElement('div')
        h.className = 'falling-heart'
        // ~30% chance to spawn the green heart, otherwise a decoy
        const isTarget = Math.random() < 0.3
        h.textContent = isTarget ? TARGET : decoyEmojis[Math.floor(Math.random() * decoyEmojis.length)]
        h.dataset.target = isTarget ? '1' : '0'
        h.style.left = (Math.random() * (stage.clientWidth - 30)) + 'px'
        h.style.top = '-30px'
        h.dataset.y = -30
        // gentle horizontal drift for variety
        h.dataset.vx = (Math.random() - 0.5) * 0.6
        stage.appendChild(h)
        hearts.push(h)
    }, 650)

    const tick = setInterval(() => {
        const stageH = stage.clientHeight
        const stageW = stage.clientWidth
        for (let i = hearts.length - 1; i >= 0; i--) {
            const h = hearts[i]
            let y = parseFloat(h.dataset.y) + 4
            h.dataset.y = y
            h.style.top = y + 'px'
            let x = parseFloat(h.style.left) + parseFloat(h.dataset.vx)
            if (x < 0 || x > stageW - 30) h.dataset.vx = -parseFloat(h.dataset.vx)
            h.style.left = x + 'px'
            const cx = x + 15
            // catch zone
            if (y > stageH - 60 && y < stageH - 20 && Math.abs(cx - basketX) < 40) {
                const wasTarget = h.dataset.target === '1'
                h.remove(); hearts.splice(i, 1)
                if (wasTarget) {
                    score++
                    scoreEl.textContent = score + ' / 7'
                    // little sparkle on score
                    scoreEl.animate(
                        [{ transform: 'translateX(-50%) scale(1)' }, { transform: 'translateX(-50%) scale(1.25)' }, { transform: 'translateX(-50%) scale(1)' }],
                        { duration: 300 }
                    )
                    if (score >= 7) {
                        clearInterval(spawn); clearInterval(tick)
                        window.removeEventListener('keydown', keyHandler)
                        setTimeout(showReveal, 400)
                    }
                }
                // decoys just disappear silently — no score change
            } else if (y > stageH) {
                h.remove(); hearts.splice(i, 1)
            }
        }
    }, 30)
    catchState = { spawn, tick, keyHandler }
}

// ===== MAZE =====
let mazeState = null
function initMaze() {
    const canvas = document.getElementById('maze-canvas')
    const ctx = canvas.getContext('2d')
    const COLS = 11, ROWS = 11
    const cell = canvas.width / COLS

    // DFS maze generation — each cell has 4 walls; we knock down walls between neighbors
    const cells = Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => ({ n:true, e:true, s:true, w:true, v:false })))
    function carve(cx, cy) {
        cells[cy][cx].v = true
        const dirs = [[0,-1,'n','s'],[1,0,'e','w'],[0,1,'s','n'],[-1,0,'w','e']].sort(() => Math.random() - 0.5)
        for (const [dx, dy, a, b] of dirs) {
            const nx = cx + dx, ny = cy + dy
            if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) continue
            if (cells[ny][nx].v) continue
            cells[cy][cx][a] = false
            cells[ny][nx][b] = false
            carve(nx, ny)
        }
    }
    carve(0, 0)

    let px = 0, py = 0
    let facing = 'right' // 🚶‍♀️ default glyph faces left; we flip to face right by default (goal is bottom-right)
    const gx = COLS - 1, gy = ROWS - 1
    let won = false

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        // walls
        ctx.strokeStyle = '#2e7d32'
        ctx.lineWidth = 3
        ctx.lineCap = 'round'
        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                const c = cells[y][x]
                const x0 = x * cell, y0 = y * cell
                ctx.beginPath()
                if (c.n) { ctx.moveTo(x0, y0); ctx.lineTo(x0 + cell, y0) }
                if (c.e) { ctx.moveTo(x0 + cell, y0); ctx.lineTo(x0 + cell, y0 + cell) }
                if (c.s) { ctx.moveTo(x0, y0 + cell); ctx.lineTo(x0 + cell, y0 + cell) }
                if (c.w) { ctx.moveTo(x0, y0); ctx.lineTo(x0, y0 + cell) }
                ctx.stroke()
            }
        }
        // goal
        ctx.font = (cell * 0.7) + 'px serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('🏨', gx * cell + cell / 2, gy * cell + cell / 2)
        // player — glyph natively faces left; flip horizontally when facing right
        const cxp = px * cell + cell / 2
        const cyp = py * cell + cell / 2
        ctx.save()
        if (facing === 'right') {
            ctx.translate(cxp, cyp)
            ctx.scale(-1, 1)
            ctx.fillText('🚶‍♀️', 0, 0)
        } else {
            ctx.fillText('🚶‍♀️', cxp, cyp)
        }
        ctx.restore()
    }
    draw()

    function move(dx, dy) {
        if (won) return
        const c = cells[py][px]
        if (dx === 1 && c.e) return
        if (dx === -1 && c.w) return
        if (dy === 1 && c.s) return
        if (dy === -1 && c.n) return
        if (dx === 1) facing = 'right'
        else if (dx === -1) facing = 'left'
        px += dx; py += dy
        draw()
        if (px === gx && py === gy) {
            won = true
            setTimeout(showMazeReveal, 350)
        }
    }

    const keyHandler = (e) => {
        if (document.getElementById('game-maze').classList.contains('active') === false) return
        if (e.key === 'ArrowUp') { e.preventDefault(); move(0, -1) }
        if (e.key === 'ArrowDown') { e.preventDefault(); move(0, 1) }
        if (e.key === 'ArrowLeft') { e.preventDefault(); move(-1, 0) }
        if (e.key === 'ArrowRight') { e.preventDefault(); move(1, 0) }
    }
    if (mazeState) window.removeEventListener('keydown', mazeState.keyHandler)
    window.addEventListener('keydown', keyHandler)

    // Touch swipe
    let tsx = 0, tsy = 0
    canvas.ontouchstart = (e) => { const t = e.touches[0]; tsx = t.clientX; tsy = t.clientY }
    canvas.ontouchend = (e) => {
        const t = e.changedTouches[0]
        const dx = t.clientX - tsx, dy = t.clientY - tsy
        if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return
        if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 1 : -1, 0)
        else move(0, dy > 0 ? 1 : -1)
    }

    mazeState = { keyHandler }
}
document.getElementById('maze-new').addEventListener('click', initMaze)
