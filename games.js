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
