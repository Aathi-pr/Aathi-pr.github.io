// ================================================
// TimeKeeper â€” Ultra Minimal Timer
// Premium Awwwards-Level Experience
// ================================================

// ========== State Management ==========
const state = {
    mode: 'pomodoro',
    theme: 'light',
    settings: {
        soundComplete: true,
        soundAmbient: false,
        soundTick: false,
        volume: 60,
        autoBreak: false,
        longBreakEnabled: false,
        breakDuration: 5,
        longBreakDuration: 15,
        sessionsTillLong: 4,
        desktopNotif: false,
        titleProgress: true,
        time24h: false,
        showMs: true,
        dimInactive: true
    },
    stats: {
        sessions: 0,
        totalTime: 0,
        streak: 0,
        lastUsed: new Date().toDateString(),
        history: []
    },
    pomodoro: {
        duration: 25 * 60,
        remaining: 25 * 60,
        running: false,
        interval: null,
        phase: 'focus',
        sessionCount: 0,
        completedSessions: 0
    },
    stopwatch: {
        elapsed: 0,
        running: false,
        interval: null,
        laps: []
    },
    timer: {
        duration: 10 * 60,
        remaining: 10 * 60,
        running: false,
        interval: null
    },
    breath: {
        running: false,
        cycles: 0,
        phase: 'inhale',
        countdown: 4,
        timeout: null,
        totalTime: 0,
        startTime: null,
        timeInterval: null
    }
};

// ========== Audio System ==========
let audioCtx = null;
let ambientOsc = null;
let tickInterval = null;

const initAudio = () => {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
};

const playTone = (freq, duration, vol = 0.3) => {
    if (!state.settings.soundComplete) return;
    try {
        const ctx = initAudio();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(vol * (state.settings.volume / 100), ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.start();
        osc.stop(ctx.currentTime + duration);
    } catch (e) {
        console.warn('Audio play error:', e);
    }
};

const playComplete = () => {
    playTone(523.25, 0.2, 0.2); // C5
    setTimeout(() => playTone(659.25, 0.2, 0.2), 200); // E5
    setTimeout(() => playTone(783.99, 0.4, 0.25), 400); // G5
};

const playTick = () => {
    if (!state.settings.soundTick) return;
    playTone(800, 0.05, 0.1);
};

const startAmbient = () => {
    if (!state.settings.soundAmbient || ambientOsc) return;
    try {
        const ctx = initAudio();
        ambientOsc = ctx.createOscillator();
        const gain = ctx.createGain();
        ambientOsc.connect(gain);
        gain.connect(ctx.destination);
        ambientOsc.frequency.value = 174;
        ambientOsc.type = 'sine';
        gain.gain.setValueAtTime(0.05 * (state.settings.volume / 100), ctx.currentTime);
        ambientOsc.start();
    } catch (e) {
        console.warn('Ambient start error:', e);
    }
};

const stopAmbient = () => {
    if (ambientOsc) {
        try {
            ambientOsc.stop();
        } catch (e) {
            console.warn('Ambient stop error:', e);
        }
        ambientOsc = null;
    }
};

const startTick = () => {
    if (!state.settings.soundTick || tickInterval) return;
    tickInterval = setInterval(() => {
        playTick();
    }, 1000);
};

const stopTick = () => {
    if (tickInterval) {
        clearInterval(tickInterval);
        tickInterval = null;
    }
};

// ========== Storage System ==========
const loadState = () => {
    try {
        const saved = localStorage.getItem('timekeeper-state');
        if (saved) {
            const data = JSON.parse(saved);
            state.theme = data.theme || 'light';
            state.settings = { ...state.settings, ...data.settings };
            state.stats = { ...state.stats, ...data.stats };

            const today = new Date().toDateString();
            if (state.stats.lastUsed !== today) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                if (state.stats.lastUsed !== yesterday.toDateString()) {
                    state.stats.streak = 0;
                }
                state.stats.lastUsed = today;
            }
        }
    } catch (e) {
        console.warn('Could not load state:', e);
    }
    document.documentElement.setAttribute('data-theme', state.theme);
};

const saveState = () => {
    try {
        localStorage.setItem('timekeeper-state', JSON.stringify({
            theme: state.theme,
            settings: state.settings,
            stats: state.stats
        }));
    } catch (e) {
        console.warn('Could not save state:', e);
    }
};

// ========== Notification System ==========
const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
};

const showNotif = (title, body, icon = 'â±ï¸') => {
    if (!state.settings.desktopNotif) return;
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body,
            silent: true
        });
    }
};

const showToast = (msg) => {
    const toast = document.getElementById('toast');
    const toastMsg = toast ? toast.querySelector('.toast-msg') : null;
    if (toastMsg) toastMsg.textContent = msg;
    if (toast) {
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2500);
    }
};

// ========== Title Progress ==========
const updateTitle = (text = null) => {
    document.title = text || 'TimeKeeper â€” Ultra Minimal';
};

// ========== Utilities ==========
const stopAll = () => {
    if (state.pomodoro.interval) {
        clearInterval(state.pomodoro.interval);
        state.pomodoro.interval = null;
        state.pomodoro.running = false;
    }
    if (state.stopwatch.interval) {
        clearInterval(state.stopwatch.interval);
        state.stopwatch.interval = null;
        state.stopwatch.running = false;
    }
    if (state.timer.interval) {
        clearInterval(state.timer.interval);
        state.timer.interval = null;
        state.timer.running = false;
    }
    if (state.breath.timeout) {
        clearTimeout(state.breath.timeout);
        state.breath.timeout = null;
        state.breath.running = false;
    }
    if (state.breath.timeInterval) {
        clearInterval(state.breath.timeInterval);
        state.breath.timeInterval = null;
    }

    document.body.classList.remove('running');
    stopAmbient();
    stopTick();
    updateTitle();
};

const formatTime = (seconds) => {
    const m = Math.floor(Math.abs(seconds) / 60);
    const s = Math.abs(seconds) % 60;
    return {
        m: String(m).padStart(2, '0'),
        s: String(s).padStart(2, '0')
    };
};

// FIXED: Simplified digit morphing - directly update with smooth transition
const morphDigit = (element, newValue) => {
    if (!element) return;
    const current = element.textContent;
    if (current === newValue) return;

    // Simple fade transition
    element.style.transition = 'opacity 0.2s ease';
    element.style.opacity = '0.3';

    setTimeout(() => {
        element.textContent = newValue;
        element.style.opacity = '1';
    }, 100);
};

// FIXED: Direct update without animation (for initial display)
const setDigit = (element, value) => {
    if (!element) return;
    element.textContent = value;
};

const update3DElements = (progress) => {
    const orb = document.querySelector('.time-orb');
    if (orb) {
        const rotation = progress * 360;
        orb.style.transform = `translate(-50%, -50%) rotateY(${rotation}deg) rotateX(${rotation * 0.5}deg)`;
    }
};

// ========== Navigation ==========
const menuBtn = document.getElementById('menu-btn');
const navOverlay = document.getElementById('nav-overlay');
const navClose = document.getElementById('nav-close');
const modeItems = document.querySelectorAll('.mode-item');
const modeLabel = document.getElementById('mode-label');

if (menuBtn) {
    menuBtn.addEventListener('click', () => {
        if (navOverlay) navOverlay.classList.add('active');
        updateNavStats();
    });
}

if (navClose) {
    navClose.addEventListener('click', () => {
        if (navOverlay) navOverlay.classList.remove('active');
    });
}

modeItems.forEach(item => {
    item.addEventListener('click', () => {
        const mode = item.dataset.mode;
        switchMode(mode);
        if (navClose) navClose.click();
    });
});

const switchMode = (mode) => {
    stopAll();
    state.mode = mode;

    const labels = {
        pomodoro: 'Pomodoro',
        stopwatch: 'Stopwatch',
        timer: 'Timer',
        breathe: 'Breathe'
    };

    if (modeLabel) modeLabel.textContent = labels[mode];

    document.querySelectorAll('.timer-scene').forEach(scene => {
        scene.classList.remove('active');
    });

    const activeScene = document.querySelector(`[data-scene="${mode}"]`);
    if (activeScene) {
        activeScene.classList.add('active');
    }
};

const updateNavStats = () => {
    const sessionsEl = document.getElementById('nav-sessions');
    const timeEl = document.getElementById('nav-time');
    const streakEl = document.getElementById('nav-streak');

    if (sessionsEl) sessionsEl.textContent = state.stats.sessions;
    if (streakEl) streakEl.textContent = state.stats.streak;

    if (timeEl) {
        const h = Math.floor(state.stats.totalTime / 3600);
        const m = Math.floor((state.stats.totalTime % 3600) / 60);
        timeEl.textContent = h > 0 ? `${h}h ${m}m` : `${m}m`;
    }
};

// ========== Options Panel ==========
const optionsBtn = document.getElementById('options-btn');
const optionsPanel = document.getElementById('options-panel');
const panelClose = document.getElementById('panel-close');

if (optionsBtn) {
    optionsBtn.addEventListener('click', () => {
        if (optionsPanel) optionsPanel.classList.add('active');
    });
}

if (panelClose) {
    panelClose.addEventListener('click', () => {
        if (optionsPanel) optionsPanel.classList.remove('active');
    });
}

// Theme swatches
document.querySelectorAll('.swatch').forEach(btn => {
    btn.addEventListener('click', () => {
        state.theme = btn.dataset.theme;
        document.documentElement.setAttribute('data-theme', state.theme);
        document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
        btn.classList.add('active');
        saveState();
    });
});

// Settings initialization
const initSettings = () => {
    const elements = {
        soundComplete: document.getElementById('sound-complete'),
        soundAmbient: document.getElementById('sound-ambient'),
        soundTick: document.getElementById('sound-tick'),
        volume: document.getElementById('volume'),
        volumeVal: document.getElementById('volume-val'),
        autoBreak: document.getElementById('auto-break'),
        longBreakEnabled: document.getElementById('long-break-enabled'),
        breakDuration: document.getElementById('break-duration'),
        breakVal: document.getElementById('break-val'),
        longBreak: document.getElementById('long-break'),
        longBreakVal: document.getElementById('long-break-val'),
        sessionsTillLong: document.getElementById('sessions-till-long'),
        sessionsVal: document.getElementById('sessions-val'),
        desktopNotif: document.getElementById('desktop-notif'),
        titleProgress: document.getElementById('title-progress'),
        time24h: document.getElementById('time-24h'),
        showMs: document.getElementById('show-ms'),
        dimInactive: document.getElementById('dim-inactive')
    };

    // Set initial values
    if (elements.soundComplete) elements.soundComplete.checked = state.settings.soundComplete;
    if (elements.soundAmbient) elements.soundAmbient.checked = state.settings.soundAmbient;
    if (elements.soundTick) elements.soundTick.checked = state.settings.soundTick;
    if (elements.volume) elements.volume.value = state.settings.volume;
    if (elements.volumeVal) elements.volumeVal.textContent = state.settings.volume;
    if (elements.autoBreak) elements.autoBreak.checked = state.settings.autoBreak;
    if (elements.longBreakEnabled) elements.longBreakEnabled.checked = state.settings.longBreakEnabled;
    if (elements.breakDuration) elements.breakDuration.value = state.settings.breakDuration;
    if (elements.breakVal) elements.breakVal.textContent = state.settings.breakDuration + 'm';
    if (elements.longBreak) elements.longBreak.value = state.settings.longBreakDuration;
    if (elements.longBreakVal) elements.longBreakVal.textContent = state.settings.longBreakDuration + 'm';
    if (elements.sessionsTillLong) elements.sessionsTillLong.value = state.settings.sessionsTillLong;
    if (elements.sessionsVal) elements.sessionsVal.textContent = state.settings.sessionsTillLong;
    if (elements.desktopNotif) elements.desktopNotif.checked = state.settings.desktopNotif;
    if (elements.titleProgress) elements.titleProgress.checked = state.settings.titleProgress;
    if (elements.time24h) elements.time24h.checked = state.settings.time24h;
    if (elements.showMs) elements.showMs.checked = state.settings.showMs;
    if (elements.dimInactive) elements.dimInactive.checked = state.settings.dimInactive;

    // Add event listeners
    if (elements.soundComplete) {
        elements.soundComplete.addEventListener('change', (e) => {
            state.settings.soundComplete = e.target.checked;
            saveState();
            if (e.target.checked) playTone(440, 0.2);
        });
    }

    if (elements.soundAmbient) {
        elements.soundAmbient.addEventListener('change', (e) => {
            state.settings.soundAmbient = e.target.checked;
            saveState();
        });
    }

    if (elements.soundTick) {
        elements.soundTick.addEventListener('change', (e) => {
            state.settings.soundTick = e.target.checked;
            saveState();
            if (e.target.checked && document.body.classList.contains('running')) {
                startTick();
            } else {
                stopTick();
            }
        });
    }

    if (elements.volume && elements.volumeVal) {
        elements.volume.addEventListener('input', (e) => {
            state.settings.volume = parseInt(e.target.value);
            elements.volumeVal.textContent = e.target.value;
            saveState();
        });
    }

    if (elements.autoBreak) {
        elements.autoBreak.addEventListener('change', (e) => {
            state.settings.autoBreak = e.target.checked;
            saveState();
        });
    }

    if (elements.longBreakEnabled) {
        elements.longBreakEnabled.addEventListener('change', (e) => {
            state.settings.longBreakEnabled = e.target.checked;
            saveState();
        });
    }

    if (elements.breakDuration && elements.breakVal) {
        elements.breakDuration.addEventListener('input', (e) => {
            state.settings.breakDuration = parseInt(e.target.value);
            elements.breakVal.textContent = e.target.value + 'm';
            saveState();
        });
    }

    if (elements.longBreak && elements.longBreakVal) {
        elements.longBreak.addEventListener('input', (e) => {
            state.settings.longBreakDuration = parseInt(e.target.value);
            elements.longBreakVal.textContent = e.target.value + 'm';
            saveState();
        });
    }

    if (elements.sessionsTillLong && elements.sessionsVal) {
        elements.sessionsTillLong.addEventListener('input', (e) => {
            state.settings.sessionsTillLong = parseInt(e.target.value);
            elements.sessionsVal.textContent = e.target.value;
            saveState();
        });
    }

    if (elements.desktopNotif) {
        elements.desktopNotif.addEventListener('change', (e) => {
            state.settings.desktopNotif = e.target.checked;
            if (e.target.checked) {
                requestNotificationPermission();
            }
            saveState();
        });
    }

    if (elements.titleProgress) {
        elements.titleProgress.addEventListener('change', (e) => {
            state.settings.titleProgress = e.target.checked;
            saveState();
        });
    }

    if (elements.time24h) {
        elements.time24h.addEventListener('change', (e) => {
            state.settings.time24h = e.target.checked;
            saveState();
        });
    }

    if (elements.showMs) {
        elements.showMs.addEventListener('change', (e) => {
            state.settings.showMs = e.target.checked;
            saveState();
            if (state.mode === 'stopwatch') updateStopwatchDisplay();
        });
    }

    if (elements.dimInactive) {
        elements.dimInactive.addEventListener('change', (e) => {
            state.settings.dimInactive = e.target.checked;
            saveState();
        });
    }
};

// Set active theme
setTimeout(() => {
    const activeTheme = document.querySelector(`[data-theme="${state.theme}"]`);
    if (activeTheme) activeTheme.classList.add('active');
}, 100);
// ========== POMODORO MODE ==========
const pomodoroScene = document.querySelector('[data-scene="pomodoro"]');
const pomodoroDigits = pomodoroScene ? pomodoroScene.querySelectorAll('.digit') : [];
const pomodoroLabel = document.getElementById('pomodoro-label');
const pomodoroFill = document.getElementById('pomodoro-fill');
const pomodoroMain = document.getElementById('pomodoro-main');
const pomodoroReset = document.getElementById('pomodoro-reset');
const pomodoroSkip = document.getElementById('pomodoro-skip');
const quickBtns = pomodoroScene ? pomodoroScene.querySelectorAll('.quick-btn') : [];
const sessionCount = document.getElementById('session-count');
const customTimeBtn = document.getElementById('custom-time-btn');
const customInput = document.getElementById('custom-input');
const customMinutes = document.getElementById('custom-minutes');
const customSetBtn = document.getElementById('custom-set');

// Quick set buttons
quickBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        if (state.pomodoro.running) return;

        if (btn.dataset.min === 'custom') {
            customInput.classList.toggle('active');
            return;
        }

        const min = parseInt(btn.dataset.min);
        state.pomodoro.duration = min * 60;
        state.pomodoro.remaining = min * 60;
        quickBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        customInput.classList.remove('active');
        updatePomodoroDisplay();
        if (pomodoroFill) pomodoroFill.style.width = '0%';
        update3DElements(0);
    });
});

// Custom time set
if (customSetBtn) {
    customSetBtn.addEventListener('click', () => {
        const min = parseInt(customMinutes.value);
        if (min && min > 0 && min <= 120) {
            state.pomodoro.duration = min * 60;
            state.pomodoro.remaining = min * 60;
            quickBtns.forEach(b => b.classList.remove('active'));
            customTimeBtn.classList.add('active');
            customInput.classList.remove('active');
            updatePomodoroDisplay();
            if (pomodoroFill) pomodoroFill.style.width = '0%';
            update3DElements(0);
            showToast(`Custom time set: ${min} minutes`);
        }
    });
}

if (pomodoroMain) {
    pomodoroMain.addEventListener('click', () => {
        if (state.pomodoro.running) {
            pausePomodoro();
        } else {
            startPomodoro();
        }
    });
}

if (pomodoroReset) {
    pomodoroReset.addEventListener('click', resetPomodoro);
}

if (pomodoroSkip) {
    pomodoroSkip.addEventListener('click', () => {
        if (state.pomodoro.phase === 'focus') {
            showToast('Focus session skipped');
        } else {
            showToast('Break skipped');
        }
        completePomodoro(true);
    });
}

const startPomodoro = () => {
    state.pomodoro.running = true;
    const icon = pomodoroMain.querySelector('.control-icon');
    if (icon) icon.textContent = 'Pause';
    document.body.classList.add('running');
    startAmbient();
    startTick();

    state.pomodoro.interval = setInterval(() => {
        state.pomodoro.remaining--;

        if (state.pomodoro.phase === 'focus') {
            state.stats.totalTime++;
            saveState();
        }

        if (state.pomodoro.remaining <= 0) {
            completePomodoro();
        }

        updatePomodoroDisplay();
        const prog = ((state.pomodoro.duration - state.pomodoro.remaining) / state.pomodoro.duration);
        if (pomodoroFill) pomodoroFill.style.width = (prog * 100) + '%';
        update3DElements(prog);

        // Update title
        if (state.settings.titleProgress) {
            const time = formatTime(state.pomodoro.remaining);
            updateTitle(`${time.m}:${time.s} â€” ${state.pomodoro.phase === 'focus' ? 'Focus' : 'Break'}`);
        }
    }, 1000);
};

const pausePomodoro = () => {
    state.pomodoro.running = false;
    const icon = pomodoroMain.querySelector('.control-icon');
    if (icon) icon.textContent = 'Start';
    document.body.classList.remove('running');
    clearInterval(state.pomodoro.interval);
    state.pomodoro.interval = null;
    stopAmbient();
    stopTick();
    updateTitle();
};

const resetPomodoro = () => {
    pausePomodoro();
    state.pomodoro.remaining = state.pomodoro.duration;
    state.pomodoro.phase = 'focus';
    state.pomodoro.sessionCount = 0;
    if (pomodoroLabel) pomodoroLabel.textContent = 'Focus';
    if (sessionCount) sessionCount.textContent = 'Session 1';
    updatePomodoroDisplay();
    if (pomodoroFill) pomodoroFill.style.width = '0%';
    update3DElements(0);
    showToast('Timer reset');
};

const completePomodoro = (skipped = false) => {
    pausePomodoro();

    if (!skipped) {
        playComplete();
    }

    if (state.pomodoro.phase === 'focus') {
        // Focus completed
        state.pomodoro.completedSessions++;
        state.stats.sessions++;
        state.stats.streak = Math.max(state.stats.streak, 1);
        saveState();

        // Add to history
        state.stats.history.push({
            type: 'pomodoro',
            duration: state.pomodoro.duration,
            timestamp: Date.now()
        });

        if (!skipped) {
            showToast('Focus complete! Well done. ðŸŽ‰');
            showNotif('Pomodoro Complete', 'Time for a break!', 'ðŸŽ¯');
        }

        // Determine break type
        let breakDuration;
        let breakType;

        if (state.settings.longBreakEnabled && 
            state.pomodoro.completedSessions % state.settings.sessionsTillLong === 0) {
            breakDuration = state.settings.longBreakDuration * 60;
            breakType = 'Long Break';
        } else {
            breakDuration = state.settings.breakDuration * 60;
            breakType = 'Break';
        }

        state.pomodoro.phase = 'break';
        state.pomodoro.duration = breakDuration;
        state.pomodoro.remaining = breakDuration;
        if (pomodoroLabel) pomodoroLabel.textContent = breakType;

        if (state.settings.autoBreak && !skipped) {
            setTimeout(() => {
                updatePomodoroDisplay();
                startPomodoro();
            }, 2000);
        } else {
            updatePomodoroDisplay();
        }
    } else {
        // Break completed
        if (!skipped) {
            showToast('Break complete! Ready to focus? ðŸ’ª');
            showNotif('Break Complete', 'Time to get back to work!', 'â±ï¸');
        }

        state.pomodoro.sessionCount++;
        state.pomodoro.phase = 'focus';

        // Get original focus duration from quick-btn
        const activeBtn = document.querySelector('.quick-btn.active');
        if (activeBtn && activeBtn.dataset.min && activeBtn.dataset.min !== 'custom') {
            state.pomodoro.duration = parseInt(activeBtn.dataset.min) * 60;
        } else {
            state.pomodoro.duration = 25 * 60; // Default
        }

        state.pomodoro.remaining = state.pomodoro.duration;
        if (pomodoroLabel) pomodoroLabel.textContent = 'Focus';
        if (sessionCount) sessionCount.textContent = `Session ${state.pomodoro.sessionCount + 1}`;
        updatePomodoroDisplay();
    }

    if (pomodoroFill) pomodoroFill.style.width = '0%';
    update3DElements(0);
};

const updatePomodoroDisplay = () => {
    const time = formatTime(state.pomodoro.remaining);
    if (pomodoroDigits[0]) morphDigit(pomodoroDigits[0], time.m[0]);
    if (pomodoroDigits[1]) morphDigit(pomodoroDigits[1], time.m[1]);
    if (pomodoroDigits[2]) morphDigit(pomodoroDigits[2], time.s[0]);
    if (pomodoroDigits[3]) morphDigit(pomodoroDigits[3], time.s[1]);
};

// ========== STOPWATCH MODE ==========
const stopwatchScene = document.querySelector('[data-scene="stopwatch"]');
const stopwatchDigits = stopwatchScene ? stopwatchScene.querySelectorAll('.digit') : [];
const stopwatchMain = document.getElementById('stopwatch-main');
const stopwatchLap = document.getElementById('stopwatch-lap');
const stopwatchReset = document.getElementById('stopwatch-reset');
const lapsList = document.getElementById('laps-list');
const lapsCount = document.getElementById('laps-count');

if (stopwatchMain) {
    stopwatchMain.addEventListener('click', () => {
        if (state.stopwatch.running) {
            pauseStopwatch();
        } else {
            startStopwatch();
        }
    });
}

if (stopwatchLap) {
    stopwatchLap.addEventListener('click', () => {
        if (state.stopwatch.running) addLap();
    });
}

if (stopwatchReset) {
    stopwatchReset.addEventListener('click', resetStopwatch);
}

const startStopwatch = () => {
    state.stopwatch.running = true;
    const icon = stopwatchMain.querySelector('.control-icon');
    if (icon) icon.textContent = 'Pause';
    document.body.classList.add('running');
    startTick();

    const startTime = Date.now() - state.stopwatch.elapsed;
    state.stopwatch.interval = setInterval(() => {
        state.stopwatch.elapsed = Date.now() - startTime;
        updateStopwatchDisplay();

        // Update title
        if (state.settings.titleProgress) {
            const total = Math.floor(state.stopwatch.elapsed / 1000);
            const m = Math.floor(total / 60);
            const s = total % 60;
            updateTitle(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} â€” Stopwatch`);
        }
    }, 10);
};

const pauseStopwatch = () => {
    state.stopwatch.running = false;
    const icon = stopwatchMain.querySelector('.control-icon');
    if (icon) icon.textContent = 'Start';
    document.body.classList.remove('running');
    clearInterval(state.stopwatch.interval);
    state.stopwatch.interval = null;
    stopTick();
    updateTitle();
};

const resetStopwatch = () => {
    pauseStopwatch();
    state.stopwatch.elapsed = 0;
    state.stopwatch.laps = [];
    updateStopwatchDisplay();
    if (lapsList) lapsList.innerHTML = '';
    if (lapsCount) lapsCount.textContent = '0';
    showToast('Stopwatch reset');
};

const updateStopwatchDisplay = () => {
    const total = Math.floor(state.stopwatch.elapsed / 1000);
    const m = Math.floor(total / 60);
    const s = total % 60;
    const ms = Math.floor((state.stopwatch.elapsed % 1000) / 10);

    const mStr = String(m).padStart(2, '0');
    const sStr = String(s).padStart(2, '0');
    const msStr = String(ms).padStart(2, '0');

    if (stopwatchDigits[0]) morphDigit(stopwatchDigits[0], mStr[0]);
    if (stopwatchDigits[1]) morphDigit(stopwatchDigits[1], mStr[1]);
    if (stopwatchDigits[2]) morphDigit(stopwatchDigits[2], sStr[0]);
    if (stopwatchDigits[3]) morphDigit(stopwatchDigits[3], sStr[1]);

    if (state.settings.showMs) {
        if (stopwatchDigits[4]) stopwatchDigits[4].textContent = msStr[0];
        if (stopwatchDigits[5]) stopwatchDigits[5].textContent = msStr[1];
    }
};

const addLap = () => {
    state.stopwatch.laps.unshift(state.stopwatch.elapsed);

    const total = Math.floor(state.stopwatch.elapsed / 1000);
    const m = Math.floor(total / 60);
    const s = total % 60;
    const ms = Math.floor((state.stopwatch.elapsed % 1000) / 10);

    const lapItem = document.createElement('div');
    lapItem.className = 'lap-item';
    lapItem.innerHTML = `
        <span>Lap ${state.stopwatch.laps.length}</span>
        <span>${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(2, '0')}</span>
    `;

    if (lapsList) {
        lapsList.insertBefore(lapItem, lapsList.firstChild);
        if (lapsCount) lapsCount.textContent = state.stopwatch.laps.length;
    }

    playTone(600, 0.1, 0.15);
};

// ========== TIMER MODE ==========
const timerScene = document.querySelector('[data-scene="timer"]');
const timerDigits = timerScene ? timerScene.querySelectorAll('.digit') : [];
const timerMain = document.getElementById('timer-main');
const timerReset = document.getElementById('timer-reset');
const timerFill = document.getElementById('timer-fill');
const timerMin = document.getElementById('timer-min');
const timerSec = document.getElementById('timer-sec');

[timerMin, timerSec].forEach(input => {
    if (input) {
        input.addEventListener('input', () => {
            if (!state.timer.running) updateTimerFromInput();
        });
    }
});

const updateTimerFromInput = () => {
    const m = timerMin ? parseInt(timerMin.value) || 0 : 10;
    const s = timerSec ? parseInt(timerSec.value) || 0 : 0;
    state.timer.duration = (m * 60) + s;
    state.timer.remaining = state.timer.duration;
    updateTimerDisplay();
};

if (timerMain) {
    timerMain.addEventListener('click', () => {
        if (state.timer.running) {
            pauseTimer();
        } else {
            startTimer();
        }
    });
}

if (timerReset) {
    timerReset.addEventListener('click', resetTimer);
}

const startTimer = () => {
    if (state.timer.remaining <= 0) {
        updateTimerFromInput();
        if (state.timer.remaining <= 0) {
            showToast('Please set a time');
            return;
        }
    }

    state.timer.running = true;
    const icon = timerMain.querySelector('.control-icon');
    if (icon) icon.textContent = 'Pause';
    document.body.classList.add('running');
    startAmbient();
    startTick();

    state.timer.interval = setInterval(() => {
        state.timer.remaining--;

        if (state.timer.remaining <= 0) {
            completeTimer();
        }

        updateTimerDisplay();
        const prog = ((state.timer.duration - state.timer.remaining) / state.timer.duration);
        if (timerFill) timerFill.style.width = (prog * 100) + '%';
        update3DElements(prog);

        // Update title
        if (state.settings.titleProgress) {
            const time = formatTime(state.timer.remaining);
            updateTitle(`${time.m}:${time.s} â€” Timer`);
        }
    }, 1000);
};

const pauseTimer = () => {
    state.timer.running = false;
    const icon = timerMain.querySelector('.control-icon');
    if (icon) icon.textContent = 'Start';
    document.body.classList.remove('running');
    clearInterval(state.timer.interval);
    state.timer.interval = null;
    stopAmbient();
    stopTick();
    updateTitle();
};

const resetTimer = () => {
    pauseTimer();
    updateTimerFromInput();
    if (timerFill) timerFill.style.width = '0%';
    update3DElements(0);
    showToast('Timer reset');
};

const completeTimer = () => {
    pauseTimer();
    playComplete();
    showToast('Timer complete! â°');
    showNotif('Timer Complete', 'Your countdown has finished!', 'â°');

    // Add to history
    state.stats.history.push({
        type: 'timer',
        duration: state.timer.duration,
        timestamp: Date.now()
    });
};

const updateTimerDisplay = () => {
    const time = formatTime(state.timer.remaining);
    if (timerDigits[0]) morphDigit(timerDigits[0], time.m[0]);
    if (timerDigits[1]) morphDigit(timerDigits[1], time.m[1]);
    if (timerDigits[2]) morphDigit(timerDigits[2], time.s[0]);
    if (timerDigits[3]) morphDigit(timerDigits[3], time.s[1]);
};
// ========== BREATHE MODE ==========
const breathScene = document.querySelector('[data-scene="breathe"]');
const breathCircle = document.getElementById('breath-circle');
const breathText = document.getElementById('breath-text');
const breathCountdown = document.getElementById('breath-countdown');
const breathCount = document.getElementById('breath-count');
const breathTime = document.getElementById('breath-time');
const breathMain = document.getElementById('breath-main');
const breathReset = document.getElementById('breath-reset');

if (breathMain) {
    breathMain.addEventListener('click', () => {
        if (state.breath.running) {
            pauseBreath();
        } else {
            startBreath();
        }
    });
}

if (breathReset) {
    breathReset.addEventListener('click', resetBreath);
}

const startBreath = () => {
    state.breath.running = true;
    state.breath.startTime = Date.now() - (state.breath.totalTime * 1000);
    const icon = breathMain.querySelector('.control-icon');
    if (icon) icon.textContent = 'Pause';
    document.body.classList.add('running');
    breathCycle();

    // Update time display
    if (!state.breath.timeInterval) {
        state.breath.timeInterval = setInterval(() => {
            state.breath.totalTime = Math.floor((Date.now() - state.breath.startTime) / 1000);
            const m = Math.floor(state.breath.totalTime / 60);
            const s = state.breath.totalTime % 60;
            if (breathTime) breathTime.textContent = `${m}:${String(s).padStart(2, '0')}`;
        }, 1000);
    }
};

const pauseBreath = () => {
    state.breath.running = false;
    const icon = breathMain.querySelector('.control-icon');
    if (icon) icon.textContent = 'Start';
    document.body.classList.remove('running');
    if (state.breath.timeout) {
        clearTimeout(state.breath.timeout);
        state.breath.timeout = null;
    }
    if (state.breath.timeInterval) {
        clearInterval(state.breath.timeInterval);
        state.breath.timeInterval = null;
    }
    if (breathCircle) breathCircle.classList.remove('inhale', 'exhale');
    updateTitle();
};

const resetBreath = () => {
    pauseBreath();
    state.breath.cycles = 0;
    state.breath.phase = 'inhale';
    state.breath.countdown = 4;
    state.breath.totalTime = 0;
    if (breathCount) breathCount.textContent = '0';
    if (breathTime) breathTime.textContent = '0:00';
    if (breathText) breathText.textContent = 'Inhale';
    if (breathCountdown) breathCountdown.textContent = '4';
    showToast('Breathe session reset');
};

const breathCycle = () => {
    if (!state.breath.running) return;

    const circle = breathCircle;
    const text = breathText;
    const countdown = breathCountdown;

    // 4-7-8 Breathing Technique
    // Inhale: 4s, Hold: 7s, Exhale: 8s

    if (state.breath.phase === 'inhale') {
        if (circle) {
            circle.classList.add('inhale');
            circle.classList.remove('exhale');
        }
        if (text) text.textContent = 'Inhale';
        playTone(392, 0.2, 0.1); // G4

        state.breath.countdown = 4;
        const countdownInterval = setInterval(() => {
            state.breath.countdown--;
            if (countdown) countdown.textContent = state.breath.countdown;
            if (state.breath.countdown <= 0) {
                clearInterval(countdownInterval);
            }
        }, 1000);

        state.breath.phase = 'hold1';
        state.breath.timeout = setTimeout(breathCycle, 4000);

    } else if (state.breath.phase === 'hold1') {
        if (text) text.textContent = 'Hold';

        state.breath.countdown = 7;
        const countdownInterval = setInterval(() => {
            state.breath.countdown--;
            if (countdown) countdown.textContent = state.breath.countdown;
            if (state.breath.countdown <= 0) {
                clearInterval(countdownInterval);
            }
        }, 1000);

        state.breath.phase = 'exhale';
        state.breath.timeout = setTimeout(breathCycle, 7000);

    } else if (state.breath.phase === 'exhale') {
        if (circle) {
            circle.classList.remove('inhale');
            circle.classList.add('exhale');
        }
        if (text) text.textContent = 'Exhale';
        playTone(329.63, 0.2, 0.1); // E4

        state.breath.countdown = 8;
        const countdownInterval = setInterval(() => {
            state.breath.countdown--;
            if (countdown) countdown.textContent = state.breath.countdown;
            if (state.breath.countdown <= 0) {
                clearInterval(countdownInterval);
            }
        }, 1000);

        state.breath.phase = 'complete';
        state.breath.timeout = setTimeout(breathCycle, 8000);

    } else {
        // Cycle complete
        state.breath.cycles++;
        if (breathCount) breathCount.textContent = state.breath.cycles;
        state.breath.phase = 'inhale';
        playTone(440, 0.1, 0.1); // A4
        breathCycle();
    }

    // Update title
    if (state.settings.titleProgress) {
        updateTitle(`${state.breath.phase} â€” Breathe`);
    }
};

// ========== KEYBOARD SHORTCUTS ==========
document.addEventListener('keydown', (e) => {
    // Ignore if typing in input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    const key = e.key.toLowerCase();

    // Space: Start/Pause
    if (key === ' ' || e.code === 'Space') {
        e.preventDefault();
        const scene = document.querySelector('.timer-scene.active');
        const mainBtn = scene ? scene.querySelector('.control-main') : null;
        if (mainBtn) mainBtn.click();
    }

    // R: Reset
    if (key === 'r') {
        e.preventDefault();
        const scene = document.querySelector('.timer-scene.active');
        const resetBtn = scene ? scene.querySelector('.control-aux') : null;
        if (resetBtn && resetBtn.textContent.includes('Reset')) {
            resetBtn.click();
        }
    }

    // M: Menu
    if (key === 'm') {
        e.preventDefault();
        if (navOverlay.classList.contains('active')) {
            navClose.click();
        } else {
            menuBtn.click();
        }
    }

    // T: Theme
    if (key === 't') {
        e.preventDefault();
        const themes = ['light', 'dark', 'warm', 'cool', 'forest'];
        const currentIndex = themes.indexOf(state.theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        const nextTheme = themes[nextIndex];

        const nextSwatch = document.querySelector(`[data-theme="${nextTheme}"]`);
        if (nextSwatch) nextSwatch.click();

        showToast(`Theme: ${nextTheme}`);
    }

    // O: Options
    if (key === 'o') {
        e.preventDefault();
        if (optionsPanel.classList.contains('active')) {
            panelClose.click();
        } else {
            optionsBtn.click();
        }
    }

    // Escape: Close overlays
    if (key === 'escape') {
        if (navOverlay.classList.contains('active')) {
            navClose.click();
        }
        if (optionsPanel.classList.contains('active')) {
            panelClose.click();
        }
    }

    // Number keys: Switch modes
    if (['1', '2', '3', '4'].includes(key)) {
        e.preventDefault();
        const modes = ['pomodoro', 'stopwatch', 'timer', 'breathe'];
        switchMode(modes[parseInt(key) - 1]);
    }
});

// ========== DATA EXPORT ==========
const exportDataBtn = document.getElementById('export-data');
const resetStatsBtn = document.getElementById('reset-stats');

if (exportDataBtn) {
    exportDataBtn.addEventListener('click', () => {
        const data = {
            stats: state.stats,
            settings: state.settings,
            theme: state.theme,
            exported: new Date().toISOString()
        };

        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `timekeeper-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showToast('Statistics exported successfully');
    });
}

if (resetStatsBtn) {
    resetStatsBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all statistics? This cannot be undone.')) {
            state.stats = {
                sessions: 0,
                totalTime: 0,
                streak: 0,
                lastUsed: new Date().toDateString(),
                history: []
            };
            saveState();
            updateNavStats();
            showToast('All statistics have been reset');
        }
    });
}

// ========== INACTIVITY DETECTION ==========
let inactivityTimeout;

const resetInactivity = () => {
    if (state.settings.dimInactive) {
        document.body.classList.remove('dim');
        clearTimeout(inactivityTimeout);

        inactivityTimeout = setTimeout(() => {
            if (!document.body.classList.contains('running')) {
                document.body.classList.add('dim');
            }
        }, 120000); // 2 minutes
    }
};

['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
    document.addEventListener(event, resetInactivity, true);
});

// ========== VISIBILITY CHANGE ==========
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page hidden
    } else {
        // Page visible again
        resetInactivity();
    }
});

// ========== INITIALIZATION ==========
const init = () => {
    console.log('ðŸš€ Initializing TimeKeeper...');

    // Load saved state
    loadState();

    // Initialize settings UI
    initSettings();

    // Update initial displays
    updatePomodoroDisplay();
    updateStopwatchDisplay();
    updateTimerDisplay();
    updateNavStats();

    // Set initial session count
    if (sessionCount) sessionCount.textContent = 'Session 1';

    // Start inactivity detection
    resetInactivity();

    // Request notification permission if enabled
    if (state.settings.desktopNotif) {
        requestNotificationPermission();
    }

    // Add PWA install prompt
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        console.log('ðŸ’¡ PWA install available');
    });

    console.log('âœ¨ TimeKeeper initialized successfully!');
    console.log('ðŸ“– Keyboard shortcuts:');
    console.log('   Space - Start/Pause');
    console.log('   R - Reset');
    console.log('   M - Menu');
    console.log('   T - Change theme');
    console.log('   O - Options');
    console.log('   1-4 - Switch modes');
};

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Save state before unload
window.addEventListener('beforeunload', () => {
    saveState();
});