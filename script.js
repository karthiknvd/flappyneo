/* ---------------------------------------------------
   AUDIO (Direct working URLs + Unlock Fix)
--------------------------------------------------- */
let audioUnlocked = false;

// 🔊 NEW — audio toggle variables
let musicEnabled = true;
let sfxEnabled = true;

const bgm = new Audio("music/retro-gaming-271301.mp3");
bgm.loop = true;
bgm.volume = 0.35;

const scoreSfx = new Audio("https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg");
scoreSfx.volume = 0.7;

const score10Sfx = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
score10Sfx.volume = 0.9;

const hitSfx = new Audio("https://actions.google.com/sounds/v1/impacts/crash.ogg");
hitSfx.volume = 0.9;

// Unlock audio only when user interacts
function unlockAudio() {
    if (!audioUnlocked) {
        if (musicEnabled) bgm.play().catch(() => {});
        audioUnlocked = true;
    }
}

/* ---------------------------------------------------
   🔊 AUDIO PANEL UI (ADDED WITHOUT CHANGING ANY GAME CODE)
--------------------------------------------------- */
const audioButton = document.getElementById("audioButton");
const audioPanel = document.getElementById("audioPanel");
const toggleMusic = document.getElementById("toggleMusic");
const toggleSfx = document.getElementById("toggleSfx");

// open/close panel
audioButton.addEventListener("click", () => {
    audioPanel.classList.toggle("hidden");
});

// toggle music
toggleMusic.addEventListener("change", () => {
    musicEnabled = toggleMusic.checked;
    if (!musicEnabled) {
        bgm.pause();
        audioButton.textContent = "🔇";
    } else {
        bgm.play().catch(()=>{});
        audioButton.textContent = "🔊";
    }
});

// toggle sfx
toggleSfx.addEventListener("change", () => {
    sfxEnabled = toggleSfx.checked;
});

// helper play function
function playSfx(sound) {
    if (!sfxEnabled) return;
    sound.currentTime = 0;
    sound.play().catch(()=>{});
}


/* ---------------------------------------------------
   GAME CODE (Your original logic, not changed)
--------------------------------------------------- */
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let width, height;
let player = {};
let gapMin, obstacleWidth, obstacleSpacing, currentGap;

function resizeCanvas() {
    width = canvas.width = canvas.clientWidth;
    height = canvas.height = canvas.clientHeight;
    
    player.x = width * 0.22;
    player.radius = Math.max(22, height * 0.045);
    
    gapMin = height * 0.20;
    obstacleWidth = Math.max(85, height * 0.13);
    obstacleSpacing = width * 0.55;
    currentGap = gapMin + 120;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

player = {
    x: player.x || width * 0.22,
    y: height / 2,
    vx: 0,
    vy: 0,
    radius: player.radius || height * 0.045,
    trail: []
};

const GRAVITY = 0.7;
const JUMP = -15;
const BASE_SPEED = 5;
let gameSpeed = BASE_SPEED;

const DRONE_ACCEL = 0.6;
const DRONE_MAX_SPEED = 12;
const DRONE_FRICTION = 0.92;
const DRONE_FORWARD_BOOST_MULTIPLIER = 1.5;
const DRONE_RIGHT_WALL = 0.50;

let obstacles = [];

let score = 0;
let ogHighScore = localStorage.getItem('neonDroneOgHS') ? parseInt(localStorage.getItem('neonDroneOgHS')) : 0;
let droneHighScore = localStorage.getItem('neonDroneDroneHS') ? parseInt(localStorage.getItem('neonDroneDroneHS')) : 0;

document.getElementById('ogHighScoreDisplay').textContent = ogHighScore;
document.getElementById('droneHighScoreDisplay').textContent = droneHighScore;
document.getElementById('finalOgHighScore').textContent = ogHighScore;
document.getElementById('finalDroneHighScore').textContent = droneHighScore;

let gameState = 'start';
let shakeAmount = 0;

let gameMode = 'OG';

let keys = { w: false, s: false, a: false, d: false };

function toggleScreens() {
    document.getElementById('startScreen').classList.toggle('hidden', gameState !== 'start');
    document.getElementById('gameOverScreen').classList.toggle('hidden', gameState !== 'gameOver');
    document.getElementById('scoreDisplay').classList.toggle('hidden', gameState !== 'playing');
    document.getElementById('currentModeDisplay').textContent = gameMode;
}

toggleScreens();

document.addEventListener('keydown', e => {
    unlockAudio(); // 🔥 unlock audio on any key

    if (e.key.toLowerCase() === 'm' && (gameState === 'start' || gameState === 'gameOver')) {
        gameMode = gameMode === 'OG' ? 'DRONE' : 'OG';
        document.getElementById('currentModeDisplay').textContent = gameMode;
    }
    
    if (gameMode === 'DRONE' && gameState === 'playing') {
        if (e.key.toLowerCase() === 'w') keys.w = true;
        if (e.key.toLowerCase() === 's') keys.s = true;
        if (e.key.toLowerCase() === 'a') keys.a = true;
        if (e.key.toLowerCase() === 'd') keys.d = true;
    }
    
    if (e.code === 'Space') {
        e.preventDefault();
        if (gameState === 'start' || gameState === 'gameOver') {
            thrust();
        } else if (gameState === 'playing' && gameMode === 'OG') {
            player.vy = JUMP;
        }
    }
});

document.addEventListener('keyup', e => {
    if (gameMode === 'DRONE') {
        if (e.key.toLowerCase() === 'w') keys.w = false;
        if (e.key.toLowerCase() === 's') keys.s = false;
        if (e.key.toLowerCase() === 'a') keys.a = false;
        if (e.key.toLowerCase() === 'd') keys.d = false;
    }
});

function thrust() {
    unlockAudio(); // 🔥 unlock on click/tap

    if (gameState === 'start' || gameState === 'gameOver') {

        // ✅ Only play music if enabled
        if (musicEnabled) {
            bgm.currentTime = 0;
            bgm.play().catch(()=>{});
        } else {
            bgm.pause();
        }

        gameState = 'playing';
        resetGame();

    } else if (gameState === 'playing' && gameMode === 'OG') {
        player.vy = JUMP;
    }

    toggleScreens();
}


canvas.addEventListener('click', () => {
    unlockAudio(); // 🔥 unlock audio on click
    thrust();
});

canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    unlockAudio();
    thrust();
});

function resetGame() {
    player.y = height / 2;
    player.x = width * 0.22;
    player.vy = 0;
    player.vx = 0;
    player.trail = [];
    obstacles = [];
    score = 0;
    gameSpeed = BASE_SPEED;
    currentGap = gapMin + 120;
    document.getElementById('scoreDisplay').textContent = 'SCORE: 0';
}

function spawnObstacle() {
    const minTop = gapMin / 2.5;
    const maxTop = height - currentGap - gapMin / 2.5;
    const topHeight = minTop + Math.random() * (maxTop - minTop);
    
    const obstacle = {
        x: width,
        topHeight,
        bottomHeight: height - topHeight - currentGap,
        passed: false,
        litTopWindows: generateStaticPattern(obstacleSeedCounter++),
        litBottomWindows: generateStaticPattern(obstacleSeedCounter++)
    };
    obstacles.push(obstacle);
}

let obstacleSeedCounter = 0;

function generateStaticPattern(seed) {
    const cols = 6;
    const rows = 12;
    const total = rows * cols;
    const pattern = new Array(total).fill(false);
    let s = seed;
    for (let i = 0; i < total; i++) {
        s = (s * 1103515245 + 12345) & 0x7fffffff;
        if ((s / 0x7fffffff) < 0.65) {
            pattern[i] = true;
        }
    }
    return pattern;
}

function update() {
    if (gameState === 'start') {
        player.y = height / 2 + Math.sin(Date.now() / 350) * 25;
        render();
        return;
    }

    if (gameState !== 'playing') return;

    if (gameMode === 'OG') {
        player.vy += GRAVITY;
        player.y += player.vy;
        player.vy *= 0.985;
    } else if (gameMode === 'DRONE') {
        if (keys.w) player.vy -= DRONE_ACCEL;
        if (keys.s) player.vy += DRONE_ACCEL;
        if (keys.a) player.vx -= DRONE_ACCEL;
        if (keys.d) player.vx += DRONE_ACCEL;

        player.vx = Math.max(-DRONE_MAX_SPEED, Math.min(DRONE_MAX_SPEED, player.vx));
        player.vy = Math.max(-DRONE_MAX_SPEED, Math.min(DRONE_MAX_SPEED, player.vy));

        if (!keys.a && !keys.d) player.vx *= DRONE_FRICTION;
        if (!keys.w && !keys.s) player.vy *= DRONE_FRICTION;

        player.x += player.vx;
        player.y += player.vy;

        const rightWallX = width * DRONE_RIGHT_WALL - player.radius;
        player.x = Math.max(player.radius, Math.min(rightWallX, player.x));
        
        player.y = Math.max(player.radius, Math.min(height - player.radius, player.y));
    }

    const trailStrength = 2.0;
    const trailOffsetX = player.vx * trailStrength;
    const trailOffsetY = player.vy * trailStrength;

    player.trail.push({ 
        x: player.x - trailOffsetX, 
        y: player.y - trailOffsetY 
    });
    if (player.trail.length > 18) player.trail.shift();

    let effectiveSpeed = gameSpeed;

    if (gameMode === 'DRONE') {
        const forwardVelocityBoost = Math.max(0, player.vx) * DRONE_FORWARD_BOOST_MULTIPLIER;
        effectiveSpeed += forwardVelocityBoost;
    }

    obstacles.forEach(o => o.x -= effectiveSpeed);

    if (obstacles.length === 0 || obstacles[obstacles.length - 1].x < width - obstacleSpacing) {
        spawnObstacle();
    }

    obstacles = obstacles.filter(o => o.x + obstacleWidth > -120);

    obstacles.forEach(o => {
        if (!o.passed && o.x + obstacleWidth < player.x) {
            o.passed = true;
            score++;

            // ⚡ SCORE SOUND
            playSfx(scoreSfx);


            // ⭐ EVERY 10 SCORE SOUND
            if (score % 10 === 0) {
                playSfx(score10Sfx);
            }

            document.getElementById('scoreDisplay').textContent = `SCORE: ${score}`;
            document.getElementById('finalScore').textContent = score;
            gameSpeed += 0.20;
            currentGap = Math.max(gapMin, currentGap - 4.5);
        }
    });

    if (player.y - player.radius < 0 || player.y + player.radius > height) {
        gameOver();
        return;
    }

    for (let o of obstacles) {
        if (player.x + player.radius > o.x && player.x - player.radius < o.x + obstacleWidth) {
            if (player.y - player.radius < o.topHeight || player.y + player.radius > height - o.bottomHeight) {
                gameOver();
                return;
            }
        }
    }
}

function gameOver() {
    playSfx(hitSfx);
    bgm.pause();

    gameState = 'gameOver';
    if (gameMode === 'OG' && score > ogHighScore) {
        ogHighScore = score;
        localStorage.setItem('neonDroneOgHS', ogHighScore);
        document.getElementById('ogHighScoreDisplay').textContent = ogHighScore;
        document.getElementById('finalOgHighScore').textContent = ogHighScore;
    } else if (gameMode === 'DRONE' && score > droneHighScore) {
        droneHighScore = score;
        localStorage.setItem('neonDroneDroneHS', droneHighScore);
        document.getElementById('droneHighScoreDisplay').textContent = droneHighScore;
        document.getElementById('finalDroneHighScore').textContent = droneHighScore;
    }
    toggleScreens();
    shakeAmount = 35;
}

function drawBackground() {
    const gradTop = ctx.createLinearGradient(0, 0, 0, height * 0.4);
    gradTop.addColorStop(0, '#001144');
    gradTop.addColorStop(0.5, '#000033');
    gradTop.addColorStop(1, '#000011');
    
    const gradBottom = ctx.createLinearGradient(0, height * 0.6, 0, height);
    gradBottom.addColorStop(0, '#000011');
    gradBottom.addColorStop(1, '#000000');
    
    ctx.fillStyle = gradTop;
    ctx.fillRect(0, 0, width, height * 0.6);
    ctx.fillStyle = gradBottom;
    ctx.fillRect(0, height * 0.4, width, height * 0.6);

    ctx.strokeStyle = 'rgba(0, 255, 255, 0.12)';
    ctx.lineWidth = 2.5;
    for (let i = 1; i < 18; i++) {
        const y = height * i / 18;
        const alpha = 0.12 + Math.sin(Date.now() * 0.001 + i) * 0.03;
        ctx.strokeStyle = `rgba(0, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
}

function drawObstacles() {
    obstacles.forEach(o => {
        ctx.shadowColor = '#ff00ff';
        ctx.shadowBlur = 60;
        ctx.fillStyle = '#ff00ff';
        ctx.fillRect(o.x, 0, obstacleWidth, o.topHeight);
        ctx.fillRect(o.x, height - o.bottomHeight, obstacleWidth, o.bottomHeight);

        ctx.shadowBlur = 0;

        drawStaticFacade(o, 0, obstacleWidth, o.topHeight);
        drawStaticFacade(o, height - o.bottomHeight, obstacleWidth, o.bottomHeight);
    });
}

function drawStaticFacade(obstacle, barY, barW, barH) {
    const litWindows = (barY === 0) ? obstacle.litTopWindows : obstacle.litBottomWindows;

    const beamCount = 3;
    const beamWidth = barW * 0.05;
    ctx.fillStyle = '#110022';
    for (let i = 1; i < beamCount; i++) {
        const bx = obstacle.x + (barW * i / beamCount);
        ctx.fillRect(bx - beamWidth / 2, barY, beamWidth, barH);
    }

    const floorLines = 4;
    ctx.strokeStyle = '#220033';
    ctx.lineWidth = 2;
    for (let i = 1; i <= floorLines; i++) {
        const fy = barY + barH * i / (floorLines + 1);
        ctx.beginPath();
        ctx.moveTo(obstacle.x, fy);
        ctx.lineTo(obstacle.x + barW, fy);
        ctx.stroke();
    }

    const cols = 6;
    const rows = Math.max(8, Math.floor(barH / (barH * 0.08)));
    const winW = barW / cols * 0.8;
    const winH = barH / rows * 0.7;
    const offsetX = obstacle.x + barW * 0.1;
    const offsetY = barY + barH * 0.15;

    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ffaa00';

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const windowIndex = row * cols + col;
            if (windowIndex >= litWindows.length) continue;
            const wx = offsetX + col * winW;
            const wy = offsetY + row * winH;

            if (litWindows[windowIndex]) {
                ctx.fillStyle = '#ffff99';
                ctx.fillRect(wx, wy, winW * 0.9, winH * 0.9);
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(wx + winW * 0.2, wy + winH * 0.2, winW * 0.6, winH * 0.4);
            } else {
                ctx.shadowBlur = 0;
                ctx.fillStyle = '#0a0011';
                ctx.fillRect(wx, wy, winW * 0.9, winH * 0.9);
                ctx.shadowBlur = 8;
            }
        }
    }
    ctx.shadowBlur = 0;

    if (barY === 0 && barH > height * 0.45) {
        ctx.shadowColor = '#ff00ff';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#ff00ff';
        ctx.fillRect(obstacle.x + barW / 2 - 4, 0, 8, -30);
        ctx.shadowBlur = 0;
    }
}

function drawPlayer() {
    player.trail.forEach((p, i) => {
        const alpha = (i + 1) / player.trail.length * 0.75;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = 25 * alpha;
        ctx.shadowColor = '#00ffff';
        ctx.fillStyle = `rgba(0, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, player.radius * (0.4 + alpha * 0.6), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });

    ctx.shadowBlur = 70;
    ctx.shadowColor = '#00ffff';
    ctx.fillStyle = '#00ffff';
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius * 1.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 45;
    ctx.shadowColor = '#ffffff';
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius * 0.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 20;
    ctx.shadowColor = '#00ffaa';
    ctx.fillStyle = '#00ffaa';
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius * 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
}

function drawModeIndicator() {
    ctx.font = 'bold 28px Orbitron';
    ctx.fillStyle = gameMode === 'DRONE' ? '#00ffaa' : '#ff00ff';
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 20;
    ctx.textAlign = 'right';
    ctx.fillText(`MODE: ${gameMode}`, width - 30, 50);
    ctx.shadowBlur = 0;
}

function render() {
    ctx.clearRect(0, 0, width, height);

    if (shakeAmount > 0) {
        ctx.save();
        ctx.translate((Math.random() - 0.5) * shakeAmount, (Math.random() - 0.5) * shakeAmount);
        shakeAmount *= 0.93;
    }

    drawBackground();
    drawObstacles();
    drawPlayer();
    drawModeIndicator();

    if (shakeAmount > 0) ctx.restore();
}

function loop() {
    update();
    render();
    requestAnimationFrame(loop);
}

loop();
