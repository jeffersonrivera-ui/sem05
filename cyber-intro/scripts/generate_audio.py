#!/usr/bin/env python3
"""
Generador de diseño sonoro ORIGINAL para la intro "Ciberataques a computadoras personales".

Todo el audio se sintetiza desde cero con numpy (osciladores, ruido, filtros y
reverberación por convolución). No se usa ninguna muestra ni música de terceros,
por lo que los archivos resultantes están libres de derechos.

Uso:  python3 scripts/generate_audio.py
Salida: public/audio/music/*.wav y public/audio/sfx/*.wav  (48 kHz, estéreo, 16 bit)

Si consigues música / efectos con licencia, simplemente reemplaza los .wav
manteniendo el mismo nombre, o cambia las rutas en src/config.ts.
"""
import os
import wave
import numpy as np

SR = 48000
RNG = np.random.default_rng(2026)
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "audio")


# ----------------------------------------------------------------- utilidades
def t_axis(dur):
    return np.arange(int(dur * SR)) / SR


def write(path, stereo, peak=0.89):
    stereo = np.asarray(stereo, dtype=np.float64)
    if stereo.ndim == 1:
        stereo = np.stack([stereo, stereo], axis=1)
    m = np.max(np.abs(stereo)) or 1.0
    stereo = stereo / m * peak
    data = (stereo * 32767).astype(np.int16)
    full = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with wave.open(full, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())
    print(f"  ✓ {path:32s} {len(stereo) / SR:5.2f}s")


def fft_filter(x, lo=None, hi=None):
    """Filtro pasa-banda suave en el dominio de la frecuencia."""
    n = len(x)
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(n, 1 / SR)
    g = np.ones_like(f)
    if lo:
        g *= 1 / np.sqrt(1 + (lo / np.maximum(f, 1e-3)) ** 4)
    if hi:
        g *= 1 / np.sqrt(1 + (f / hi) ** 4)
    return np.fft.irfft(X * g, n)


def sweep_lowpass(x, f_start, f_end, q=0.0):
    """Pasa-bajos resonante (state variable) con barrido exponencial de frecuencia."""
    n = len(x)
    fc = f_start * (f_end / f_start) ** (np.arange(n) / n)
    out = np.zeros(n)
    low = band = 0.0
    damp = 2.0 - 1.8 * q
    for i in range(n):
        f = 2 * np.sin(np.pi * min(fc[i], SR / 6) / SR)
        high = x[i] - low - damp * band
        band += f * high
        low += f * band
        out[i] = low
    return out


def bandpass_sweep(x, fc_curve, q=4.0):
    n = len(x)
    out = np.zeros(n)
    low = band = 0.0
    damp = 1.0 / q
    for i in range(n):
        f = 2 * np.sin(np.pi * min(fc_curve[i], SR / 6) / SR)
        high = x[i] - low - damp * band
        band += f * high
        low += f * band
        out[i] = band
    return out


def reverb(x, seconds=2.5, mix=0.35, bright=6000, seed=1):
    """Reverberación estéreo por convolución con ruido de decaimiento exponencial."""
    rng = np.random.default_rng(seed)
    n = int(seconds * SR)
    env = np.exp(-np.arange(n) / SR * (6.9 / seconds))
    irs = []
    for _ in range(2):
        ir = rng.standard_normal(n) * env
        ir = fft_filter(ir, lo=120, hi=bright)
        ir[: int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))
        irs.append(ir / np.sqrt(np.sum(ir ** 2)))
    if x.ndim == 1:
        x = np.stack([x, x], axis=1)
    out_len = len(x) + n
    wet = np.zeros((out_len, 2))
    N = 1 << int(np.ceil(np.log2(out_len)))
    for c in range(2):
        wet[:, c] = np.fft.irfft(np.fft.rfft(x[:, c], N) * np.fft.rfft(irs[c], N), N)[:out_len]
    dry = np.zeros((out_len, 2))
    dry[: len(x)] = x
    wet *= np.max(np.abs(dry)) / (np.max(np.abs(wet)) + 1e-9)
    return dry * (1 - mix) + wet * mix


def adsr(n, a, d, s, r, sustain_len=None):
    a, d, r = int(a * SR), int(d * SR), int(r * SR)
    sl = n - a - d - r if sustain_len is None else int(sustain_len * SR)
    sl = max(sl, 0)
    env = np.concatenate([
        np.linspace(0, 1, a, endpoint=False),
        np.linspace(1, s, d, endpoint=False),
        np.full(sl, s),
        np.linspace(s, 0, r),
    ])
    return np.pad(env, (0, max(0, n - len(env))))[:n]


def pan(x, p):
    """p en [-1, 1]; ley de potencia constante."""
    ang = (p + 1) * np.pi / 4
    return np.stack([x * np.cos(ang), x * np.sin(ang)], axis=1)


def saw(phase):
    return 2 * (phase % 1.0) - 1


def note(n):  # n semitonos desde A4
    return 440.0 * 2 ** (n / 12)


# ----------------------------------------------------------------- efectos
def sub_drone():
    """Drone grave de suspenso (escena 1)."""
    dur = 11.0
    t = t_axis(dur)
    f0 = 36.7  # D1
    x = (np.sin(2 * np.pi * f0 * t) * 0.9
         + np.sin(2 * np.pi * f0 * 2.003 * t) * 0.35
         + np.sin(2 * np.pi * f0 * 3.01 * t + np.sin(2 * np.pi * 0.2 * t)) * 0.12)
    rumble = fft_filter(RNG.standard_normal(len(t)), lo=25, hi=160) * 0.6
    air = fft_filter(RNG.standard_normal(len(t)), lo=2500, hi=9000) * 0.03
    lfo = 0.75 + 0.25 * np.sin(2 * np.pi * 0.13 * t)
    env = np.minimum(1, t / 3.5) * np.minimum(1, (dur - t) / 3.0)
    mono = (x + rumble) * lfo * env
    st = pan(mono, 0) + pan(air * env, -0.4) + pan(np.roll(air, 4000) * env, 0.4)
    write("sfx/sub_drone.wav", reverb(st, 3.0, 0.25))


def bass_hit(name="sfx/bass_hit.wav", big=False):
    """Cinematic Bass Hit: barrido 140→32 Hz + transitorio + cola de reverberación."""
    dur = 3.5 if big else 2.4
    t = t_axis(dur)
    f = 32 + 110 * np.exp(-t * 9)
    phase = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(phase) * np.exp(-t * (1.1 if big else 1.8))
    body = np.tanh(body * 2.2)
    click = fft_filter(RNG.standard_normal(len(t)), lo=800, hi=9000) * np.exp(-t * 60) * 0.7
    thump = fft_filter(RNG.standard_normal(len(t)), lo=40, hi=400) * np.exp(-t * 14) * 0.8
    layers = body + click + thump
    if big:
        metal = sum(np.sin(2 * np.pi * fr * t) * np.exp(-t * dk)
                    for fr, dk in [(220, 3), (331, 4), (587, 5), (1174, 7)]) * 0.12
        layers = layers + metal
    st = reverb(layers, 4.0 if big else 2.6, 0.38 if big else 0.28, bright=4000)
    write(name, st)


def riser():
    """Riser de ruido y tono ascendente antes de la revelación del título."""
    dur = 2.0
    t = t_axis(dur)
    noise = RNG.standard_normal(len(t))
    fc = 300 * (9000 / 300) ** (t / dur) ** 1.6
    nb = bandpass_sweep(noise, fc, q=3) * 0.8
    tone_f = 110 * (880 / 110) ** (t / dur) ** 2
    tone = saw(np.cumsum(tone_f) / SR) * 0.15
    tone = fft_filter(tone, hi=5000)
    env = (t / dur) ** 2.2
    env[-int(0.02 * SR):] *= np.linspace(1, 0, int(0.02 * SR))
    st = pan(nb * env, -0.3) + pan(np.roll(nb, 300) * env, 0.3) + pan(tone * env, 0)
    write("sfx/riser.wav", st)


def whoosh(name, dur=1.3, up=True, seed=0):
    """Whoosh Transition: ruido con pasa-banda barrido y paneo L→R."""
    rng = np.random.default_rng(100 + seed)
    t = t_axis(dur)
    noise = rng.standard_normal(len(t))
    k = t / dur
    if up:
        fc = 250 * (6500 / 250) ** (k ** 1.3)
    else:
        fc = 6500 * (250 / 6500) ** (k ** 0.8)
    nb = bandpass_sweep(noise, fc, q=2.2)
    env = np.sin(np.pi * np.clip(k, 0, 1)) ** 2.5
    env = env * (1 + 0.2 * np.sin(2 * np.pi * 9 * t))
    p = np.linspace(-0.85, 0.85, len(t))
    left = nb * env * np.cos((p + 1) * np.pi / 4)
    right = nb * env * np.sin((p + 1) * np.pi / 4)
    st = np.stack([left, right], axis=1)
    write(name, reverb(st, 1.6, 0.3))


def glitch(name, seed):
    """Digital Glitch: ráfagas de onda cuadrada, bit-crush y tartamudeo."""
    rng = np.random.default_rng(seed)
    dur = 0.75
    n = int(dur * SR)
    out = np.zeros(n)
    pos = 0
    while pos < n - 400:
        seg = int(rng.uniform(0.012, 0.07) * SR)
        seg = min(seg, n - pos)
        tt = np.arange(seg) / SR
        kind = rng.integers(0, 4)
        if kind == 0:
            f = rng.uniform(80, 2400)
            s = np.sign(np.sin(2 * np.pi * f * tt))
        elif kind == 1:
            s = rng.standard_normal(seg)
            s = np.round(s * 3) / 3
        elif kind == 2:
            f = rng.uniform(200, 4000)
            s = saw(f * tt + rng.uniform())
            s = np.repeat(s[:: 12], 12)[:seg]
        else:
            s = np.zeros(seg)
        s *= rng.uniform(0.3, 1.0)
        out[pos:pos + seg] = s
        pos += seg
    # tartamudeo: repetir un fragmento
    a = int(0.05 * SR)
    frag = out[a:a + int(0.03 * SR)].copy()
    for r in range(3):
        st = int((0.42 + r * 0.035) * SR)
        out[st:st + len(frag)] = frag * (0.8 - r * 0.2)
    env = np.ones(n)
    env[-int(0.12 * SR):] = np.linspace(1, 0, int(0.12 * SR))
    out = fft_filter(out * env, lo=60, hi=11000)
    l = out
    r = np.roll(out, int(0.004 * SR))
    write(name, reverb(np.stack([l, r], axis=1), 0.8, 0.18), peak=0.8)


def typing():
    """Keyboard Typing: clics mecánicos sintetizados con ritmo humano."""
    dur = 4.0
    n = int(dur * SR)
    out = np.zeros((n, 2))
    tpos = 0.05
    rng = np.random.default_rng(7)
    while tpos < dur - 0.15:
        i = int(tpos * SR)
        ln = int(0.035 * SR)
        tt = np.arange(ln) / SR
        click = rng.standard_normal(ln) * np.exp(-tt * 260)
        click = fft_filter(click, lo=1800, hi=7500)
        thock = np.sin(2 * np.pi * rng.uniform(180, 260) * tt) * np.exp(-tt * 140) * 0.5
        s = (click + thock) * rng.uniform(0.45, 1.0)
        p = rng.uniform(-0.35, 0.35)
        out[i:i + ln] += pan(s, p)
        gap = rng.choice([rng.uniform(0.06, 0.13), rng.uniform(0.18, 0.32)], p=[0.85, 0.15])
        tpos += gap
    write("sfx/keyboard_typing.wav", reverb(out, 0.6, 0.12, bright=9000), peak=0.7)


def alert():
    """Electronic Alert: alarma de dos tonos filtrada."""
    dur = 1.8
    t = t_axis(dur)
    f = np.where((t * 4.0) % 1 < 0.5, 988, 740)
    s = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.5 + np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.5
    s = fft_filter(s, lo=300, hi=4500)
    gate = ((t * 8) % 1 < 0.82).astype(float)
    gate = np.convolve(gate, np.ones(200) / 200, mode="same")
    env = np.minimum(1, t / 0.02) * np.minimum(1, (dur - t) / 0.4)
    st = pan(s * gate * env, 0)
    write("sfx/electronic_alert.wav", reverb(st, 1.4, 0.3), peak=0.7)


def warning_beep():
    dur = 0.55
    t = t_axis(dur)
    s = (np.sin(2 * np.pi * 1320 * t) + 0.4 * np.sin(2 * np.pi * 2640 * t)) * np.exp(-t * 7)
    s *= np.minimum(1, t / 0.004)
    write("sfx/warning_beep.wav", reverb(pan(s, 0), 1.2, 0.35), peak=0.6)


def energy():
    """Digital Energy: acorde brillante ascendente con chispa granular."""
    dur = 5.0
    t = t_axis(dur)
    k = t / dur
    out = np.zeros(len(t))
    # D mayor abierto (D3 A3 D4 F#4 A4)
    for i, semi in enumerate([-19, -12, -7, -3, 0]):
        f = note(semi) * (1 + 0.06 * (k ** 1.5))
        for det in (-0.004, 0.0, 0.0045):
            out += saw(np.cumsum(f * (1 + det)) / SR + RNG.uniform()) * 0.12
    out = sweep_lowpass(out, 300, 7000, q=0.35)
    sparkle = np.zeros(len(t))
    for _ in range(140):
        st = int(RNG.uniform(0.3, dur - 0.2) * SR)
        ln = int(0.08 * SR)
        tt = np.arange(ln) / SR
        fr = RNG.uniform(2500, 7500)
        g = np.sin(2 * np.pi * fr * tt) * np.exp(-tt * 45) * RNG.uniform(0.05, 0.18) * (st / len(t))
        sparkle[st:st + ln] += g[: len(sparkle) - st]
    hum = np.sin(2 * np.pi * 73.4 * t) * 0.25 * (0.6 + 0.4 * np.sin(2 * np.pi * 6 * t))
    env = np.minimum(1, t / 1.8) * np.minimum(1, (dur - t) / 0.9)
    st = pan(out * env, 0) + pan(sparkle, -0.5) + pan(np.roll(sparkle, 9000), 0.5) + pan(hum * env, 0)
    write("sfx/digital_energy.wav", reverb(st, 2.8, 0.35))


def shimmer():
    """Brillo cristalino para la revelación del título."""
    dur = 4.5
    t = t_axis(dur)
    out = np.zeros(len(t))
    for semi in [3, 7, 10, 15, 19, 22]:  # notas altas de D mayor/9
        f = note(semi + 5)
        out += np.sin(2 * np.pi * f * t) * np.exp(-t * 0.9) * 0.15
        out += np.sin(2 * np.pi * f * 2.0 * t) * np.exp(-t * 1.6) * 0.05
    out *= np.minimum(1, t / 0.02)
    st = reverb(np.stack([out, np.roll(out, 600)], axis=1), 3.5, 0.55, bright=10000)
    write("sfx/title_shimmer.wav", st, peak=0.7)


# ----------------------------------------------------------------- música
def music_bed():
    """
    Cama musical de 25 s sincronizada con las escenas (30 fps → 750 frames):
      0–5 s  pad grave (Re menor) + pulso tenue
      5–15 s tensión: pulso de bajo en corcheas, disonancia (b2), latido
      15–20 s resolución hacia luz: Si♭ → Re mayor, arpegio brillante
      20–25 s final: acorde de Re mayor amplio con cola
    """
    dur = 25.0
    t = t_axis(dur)
    n = len(t)
    bpm = 96
    beat = 60 / bpm
    out = np.zeros((n, 2))

    def seg_env(a, b, fade=1.2):
        e = np.clip((t - a) / fade, 0, 1) * np.clip((b - t) / fade, 0, 1)
        return e

    def pad(semis, a, b, gain, cutoff, fade=1.5):
        sig = np.zeros(n)
        for s in semis:
            f = note(s)
            for det in (-0.006, 0.0, 0.0055):
                sig += saw(f * (1 + det) * t + RNG.uniform()) * 0.06
        sig = fft_filter(sig, lo=60, hi=cutoff)
        sig *= seg_env(a, b, fade) * gain
        return np.stack([sig, np.roll(sig, 900)], axis=1)

    # Escena 1: Dm (D2 A2 F3) oscuro
    out += pad([-31, -24, -16, -12], 0.0, 5.6, 0.9, 900, fade=2.5)
    # Escenas 2–3: Dm con Eb (b2) – tensión
    out += pad([-31, -24, -18, -16, -12], 4.6, 15.4, 1.0, 1300, fade=0.8)
    # Escena 4: Bb → D mayor
    out += pad([-35, -23, -16, -11], 14.8, 17.8, 0.9, 2200, fade=0.8)
    out += pad([-31, -24, -15, -12, -7], 17.4, 25.0, 1.0, 3200, fade=1.0)

    # Pulso de bajo en corcheas (5–15 s), con filtro abriéndose
    bass = np.zeros(n)
    step = beat / 2
    k = 0
    tt0 = 5.0
    while tt0 < 15.0:
        i = int(tt0 * SR)
        ln = int(step * 0.9 * SR)
        tt = np.arange(ln) / SR
        f = note(-31) if (k % 8) not in (6, 7) else note(-30)
        s = saw(f * tt) * np.exp(-tt * 9)
        bass[i:i + ln] += s[: n - i] * (0.55 + 0.45 * ((tt0 - 5) / 10))
        tt0 += step
        k += 1
    bass = fft_filter(bass, lo=35, hi=650)
    out += np.stack([bass, bass], axis=1) * 0.55

    # Latido (kick suave) en negras, escenas 2–3
    kick = np.zeros(n)
    tt0 = 5.0
    while tt0 < 15.0:
        i = int(tt0 * SR)
        ln = int(0.35 * SR)
        tt = np.arange(ln) / SR
        f = 45 + 80 * np.exp(-tt * 30)
        s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 9)
        kick[i:i + ln] += s[: n - i]
        tt0 += beat
    out += np.stack([kick, kick], axis=1) * 0.45

    # Arpegio de luz (escena 4–5)
    arp = np.zeros((n, 2))
    pattern = [-12, -5, 0, 2, 5, 9, 12, 9]  # D mayor (A4=0 → D4=-7) desplazado
    tt0 = 15.5
    j = 0
    while tt0 < 24.2:
        i = int(tt0 * SR)
        ln = int(0.5 * SR)
        tt = np.arange(ln) / SR
        f = note(pattern[j % len(pattern)] - 7)
        s = (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * 2 * f * tt)) * np.exp(-tt * 6)
        s *= np.minimum(1, tt / 0.004) * 0.22
        p = 0.5 * np.sin(j * 0.9)
        arp[i:i + ln] += pan(s, p)[: n - i]
        tt0 += beat / 2
        j += 1
    out += arp

    # Sub final (20–25 s)
    sub = np.sin(2 * np.pi * 36.7 * t) * seg_env(20.3, 25.0, 0.6) * 0.5
    out += np.stack([sub, sub], axis=1)

    # Fade-out global y reverberación
    master = np.minimum(1, t / 1.5) * np.clip((dur - t) / 1.2, 0, 1)
    out *= master[:, None]
    out = reverb(out, 3.2, 0.3)[:n]
    write("music/music_bed.wav", out, peak=0.8)


if __name__ == "__main__":
    print("Sintetizando diseño sonoro original…")
    sub_drone()
    bass_hit()
    bass_hit("sfx/cinematic_boom.wav", big=True)
    riser()
    whoosh("sfx/whoosh_1.wav", 1.3, True, 0)
    whoosh("sfx/whoosh_2.wav", 1.1, False, 1)
    whoosh("sfx/whoosh_3.wav", 1.5, True, 2)
    glitch("sfx/glitch_1.wav", 11)
    glitch("sfx/glitch_2.wav", 22)
    glitch("sfx/glitch_3.wav", 33)
    typing()
    alert()
    warning_beep()
    energy()
    shimmer()
    music_bed()
    print("Listo.")
