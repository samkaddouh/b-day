let musicPlaying = false

window.addEventListener('load', () => {
    launchConfetti()
    startCountdown()

    // Autoplay music (works since user clicked Yes to get here)
    const music = document.getElementById('bg-music')
    music.volume = 0.3
    music.play().catch(() => {})
    musicPlaying = true
    document.getElementById('music-toggle').textContent = '🔊'
})

function launchConfetti() {
    const colors = ['#ff69b4', '#ff1493', '#ff85a2', '#ffb3c1', '#ff0000', '#ff6347', '#fff', '#ffdf00']
    const duration = 6000
    const end = Date.now() + duration

    // Initial big burst
    confetti({
        particleCount: 150,
        spread: 100,
        origin: { x: 0.5, y: 0.3 },
        colors
    })

    // Continuous side cannons
    const interval = setInterval(() => {
        if (Date.now() > end) {
            clearInterval(interval)
            return
        }

        confetti({
            particleCount: 40,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.6 },
            colors
        })

        confetti({
            particleCount: 40,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.6 },
            colors
        })
    }, 300)
}

function startCountdown() {
    const target = new Date(2026, 6, 7, 0, 0, 0).getTime() // July 7, 2026, 00:00 local (start of day)
    runCountdown(target)
}

function runCountdown(target) {
    const d = document.getElementById('cd-days')
    const h = document.getElementById('cd-hours')
    const m = document.getElementById('cd-mins')
    const s = document.getElementById('cd-secs')
    if (!d) return

    const card = document.getElementById('countdown-card')
    const headEl = document.getElementById('cd-headline')
    const subEl = document.getElementById('cd-subline')
    let tickHandle = null
    let rotateHandle = null
    let birthdayFired = false
    // preview via ?preview=birthday
    const forcePreview = new URLSearchParams(location.search).get('preview') === 'birthday'

    const tick = () => {
        const diff = target - Date.now()
        if (diff <= 0 || forcePreview) {
            d.textContent = h.textContent = m.textContent = s.textContent = '00'
            if (!birthdayFired) {
                birthdayFired = true
                fireBirthdayMoment(card, headEl, subEl)
                if (rotateHandle) clearInterval(rotateHandle)
                if (tickHandle) clearInterval(tickHandle)
            }
            return
        }
        const days = Math.floor(diff / 86400000)
        const hours = Math.floor((diff % 86400000) / 3600000)
        const mins = Math.floor((diff % 3600000) / 60000)
        const secs = Math.floor((diff % 60000) / 1000)
        d.textContent = String(days).padStart(2, '0')
        h.textContent = String(hours).padStart(2, '0')
        m.textContent = String(mins).padStart(2, '0')
        s.textContent = String(secs).padStart(2, '0')
    }
    tick()
    tickHandle = setInterval(tick, 1000)

    const lines = [
        { head: 'officially 26-and-a-half-and-a-bit', sub: "27 is just 26 with better taste 🍷" },
        { head: "the '26 farewell tour' ends in…", sub: 'encore: one (1) year of you, louder 🎤' }
    ]
    let i = 0
    rotateHandle = setInterval(() => {
        if (birthdayFired) return
        i = (i + 1) % lines.length
        headEl.style.opacity = subEl.style.opacity = '0'
        setTimeout(() => {
            if (birthdayFired) return
            headEl.textContent = lines[i].head
            subEl.textContent = lines[i].sub
            headEl.style.opacity = subEl.style.opacity = '1'
        }, 350)
    }, 5000)
}

function fireBirthdayMoment(card, headEl, subEl) {
    if (!card) return
    // Fade current contents, then morph
    headEl.style.opacity = subEl.style.opacity = '0'
    setTimeout(() => {
        card.classList.add('birthday-mode', 'birthday-clickable')
        card.setAttribute('role', 'button')
        card.setAttribute('tabindex', '0')
        card.setAttribute('title', 'open your birthday game')
        const openConstellation = () => { window.location.href = 'games.html?open=constellation' }
        card.onclick = openConstellation
        card.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openConstellation() } }
        headEl.textContent = "🌷 it's here 🌷"
        subEl.textContent = 'happy birthday, moon-child ✨'
        // Inject the big HAPPY BIRTHDAY block if not already
        if (!card.querySelector('.birthday-big')) {
            const big = document.createElement('div')
            big.className = 'birthday-big'
            big.innerHTML = '<span class="bd-line">HAPPY BIRTHDAY</span><span class="bd-sub">you\'re 27 💚</span><span class="bd-open">tap to open your gift 🎁 →</span>'
            const grid = card.querySelector('.countdown-grid')
            if (grid) grid.insertAdjacentElement('afterend', big)
            else card.appendChild(big)
        }
        headEl.style.opacity = subEl.style.opacity = '1'
        document.body.classList.add('birthday-glow')
        birthdayConfetti()
    }, 400)
}

function birthdayConfetti() {
    if (typeof confetti !== 'function') return
    const colors = ['#4caf50', '#81c784', '#a5d6a7', '#fff59d', '#ffd54f', '#ffffff']
    confetti({ particleCount: 200, spread: 100, origin: { x: 0.5, y: 0.35 }, colors })
    const end = Date.now() + 5000
    const iv = setInterval(() => {
        if (Date.now() > end) { clearInterval(iv); return }
        confetti({ particleCount: 40, angle: 60, spread: 55, origin: { x: 0, y: 0.6 }, colors })
        confetti({ particleCount: 40, angle: 120, spread: 55, origin: { x: 1, y: 0.6 }, colors })
    }, 350)
}

function toggleMusic() {
    const music = document.getElementById('bg-music')
    if (musicPlaying) {
        music.pause()
        musicPlaying = false
        document.getElementById('music-toggle').textContent = '🔇'
    } else {
        music.play()
        musicPlaying = true
        document.getElementById('music-toggle').textContent = '🔊'
    }
}
