"""Dog Decoded: Where your dog sleeps, soundtrack (32.5 s): voiceover + music + sound effects.

Owner, 2026-10-14: add a gentle, warm, bright, playful female voiceover that matches the captions, and a new instrumental
made for this film (ukulele, pizzicato, glockenspiel, gentle pace, ending on a short happy resolve as she snuggles in)
at a quarter of the voiceover's volume (−12 dB). Run vo.py first (it writes out/vo/ and out/vo.json).

Soft synced foley: paper rustle for fur and fabric, soft pops for the spot labels, whooshes for the whip pans,
harp notes for the sweet moments, one soft impact for the hero dive. No zany cartoon SFX. Every time below is a
picture event in js/scene.js.

  python audio.py   →  out/audio.wav (+ out/audio-spectrogram.png, stems in out/stems/: vo, music, sfx)
"""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'mg-styles-15', 'lib', 'audio'))
import mgaudio as mg
from mgaudio import sfx, samples, pluck
import soundfile as sf
from math import gcd
from scipy.signal import resample_poly

# v5: the film is re-timed around the voiceover (vo.py → out/timeline.json). Every time below is written in animation
# time (the 32.5 s cut, as in js/scene.js) and placed through the same warp, so each hit stays on its picture event.
TL = json.load(open(os.path.join(HERE, 'out', 'timeline.json')))
DUR = TL['dur']
def new(t):
    """animation time → film time"""
    A = TL['warp']
    for (n0, o0), (n1, o1) in zip(A, A[1:]):
        if t <= o1: return n0 + (n1 - n0) * (t - o0) / ((o1 - o0) or 1)
    return A[-1][0]
RESOLVE = new(25.21)     # her head pops out, tucked against you: the music lands home here
NB = max(4, round(RESOLVE / 2.52))   # whole bars of 4/4 up to the resolve, kept near 95 bpm (a gentle pace)
BAR = RESOLVE / NB
m = mg.Mix(duration=DUR, bpm=240 / BAR, anchor=0.0)
m.master_kw.update(tilt=1.2, air=1.5)   # lift presence for phones


def avail(key):
    """A sampled instrument limited to the files actually shipped (the VCSL subset in mg-styles-15 is partial)."""
    ins = samples.Instrument(key)
    ins.items = [i for i in ins.items if os.path.exists(os.path.join(samples.ROOT, i['file']))]
    return ins


HARP = avail('harp')
GLOCK = avail('glock')
SFX_LIFT = 3.0   # foley sits under the voice
S = lambda snd, at, gain=0.0, **kw: m.sfx(snd, new(at), gain=gain + SFX_LIFT, **kw)
harp = lambda note, at, gain=-13: S(HARP.play(note, 1.2, 0.4, release=0.6).loud(-18), at=at, gain=gain)

# hook: a soft breath of fur as she settles, the caption pop
S(sfx.paper('rustle', 0.5, seed=1), at=0.1, gain=-14)
S(sfx.pop('soft', 1.0), at=2.2, gain=-14)
# spot labels pop (and each spot's first caption card)
for a in (4.15, 8.15, 12.15, 16.15, 20.15, 24.15):
    S(sfx.pop('soft', 1.1), at=a, gain=-10)
# punch-in at 4.0 and the whip pans
S(sfx.whoosh(0.35, 'swish', peak=0.6), at=3.92, gain=-9)
for b in (8.0, 12.0, 16.0, 20.0, 24.0, 28.8):
    S(sfx.whoosh(0.45, 'air', peak=0.5), at=b - 0.22, gain=-7)
# 1 on your bed: the tail thump
S(sfx.impact('soft', size=0.25), at=6.208, gain=-14)   # the settle squash (frame 149)
S(sfx.paper('rustle', 0.3, seed=3), at=6.15, gain=-15)
# 2 foot of the bed: she turns to watch the room
S(sfx.paper('rustle', 0.25, seed=5), at=10.0, gain=-14)
harp('A5', 10.4, -16)
# 3 by the door: two soft knocks, ears up
S(sfx.click('wood'), at=13.8, gain=-6)
S(sfx.click('wood'), at=14.05, gain=-7)
S(sfx.paper('rustle', 0.2, seed=7), at=13.95, gain=-14)
# 4 on your clothes: scent drifting up, a contented smile
for k in range(3):
    S(sfx.paper('slide', 0.6, seed=9 + k), at=17.2 + k * 0.53, gain=-19)
harp('D6', 18.2, -15); harp('F#6', 18.32, -16)
# 5 back against you: the shuffle, the squish, two twinkles
S(sfx.paper('rustle', 0.3, seed=11), at=21.6, gain=-11)
S(sfx.impact('soft', size=0.3), at=21.85, gain=-12)
harp('E6', 22.0, -15)
# 6 tucked against you (hero): the crouch, the dive, the duvet flop, travelling under, the pop out
S(sfx.paper('rustle', 0.2, seed=13), at=24.35, gain=-14)
S(sfx.whoosh(0.3, 'swish', peak=0.7), at=24.40, gain=-6)
S(sfx.impact('soft', size=0.7), at=24.67, gain=-4)
S(sfx.paper('crumple', 0.5, seed=14), at=24.7, gain=-10)
for k in range(5):
    S(sfx.paper('rustle', 0.12, seed=20 + k), at=24.8 + k * 0.08, gain=-13)
S(sfx.pop('soft', 0.9), at=25.21, gain=-8)
for j, x in enumerate(['D5', 'F#5', 'A5', 'D6']):
    harp(x, 25.3 + 0.1 * j, -12)
# end: the question card, the yawn, the headline back (loops to frame 0)
S(sfx.paper('slide', 0.4), at=29.0, gain=-11)
S(sfx.pop('soft', 1.0), at=29.5, gain=-14)
S(sfx.paper('rustle', 0.4, seed=30), at=31.2, gain=-13)
S(sfx.pop('soft', 1.1), at=31.92, gain=-15)

# ------------------------------------------------------------------ voiceover (one clip per caption card, see vo.py)
for ln in json.load(open(os.path.join(HERE, 'out', 'vo.json'))):
    y, sr = sf.read(os.path.join(HERE, ln['file']), dtype='float32')
    if sr != 48000:   # Kokoro speaks at 24 kHz
        g = gcd(48000, sr); y = resample_poly(y, 48000 // g, sr // g).astype('float32')
    m.track('vo', group='vo', hp=90).add(mg.Sound(y), at=ln['at'])
m.group('vo').level = -16.0

# ------------------------------------------------------------------ music: D major, ukulele + pizzicato + glockenspiel
# D | Bm | G | A (repeated) … | G | A7 || D (bar NB = the snuggle)
UKE = {'D': ['F#4', 'A4', 'D5'], 'Bm': ['F#4', 'B4', 'D5'], 'G': ['G4', 'B4', 'D5'], 'A': ['E4', 'A4', 'C#5'],
       'A7': ['E4', 'G4', 'C#5']}
BASS = {'D': ('D3', 'A2'), 'Bm': ('B2', 'F#3'), 'G': ('G2', 'D3'), 'A': ('A2', 'E3'), 'A7': ('A2', 'E3')}
PROG = (['D', 'Bm', 'G', 'A'] * 8)[:NB - 2] + ['G', 'A7']
beat = lambda bar, b: bar * BAR + b * BAR / 4
uke, pz, gl = (m.track(n, gain=g, sends={'room': -14}) for n, g in (('uke', 0.0), ('pizz', -4.0), ('glock', 2.0)))
for i, ch in enumerate(PROG):
    # ukulele: soft down-strums on 1 and 3, a lighter up-strum on the "and" of 2 and 4 (bar 0 is strums only)
    for b, down, vel in ((0, True, 0.62), (1.5, False, 0.38), (2, True, 0.55), (3.5, False, 0.36)):
        uke.add(pluck.strum(UKE[ch], 1.1, vel, kind='uke', down=down, seed=100 + i * 4 + int(b * 2)), at=beat(i, b))
    if i >= 1:   # pizzicato bass, bouncing root and fifth on the beat
        r, f = BASS[ch]
        for b, nt in ((0, r), (1, f), (2, r), (3, f)):
            pz.add(pluck.pizz(nt, 0.5, 0.75 if b == 0 else 0.6, seed=200 + i * 4 + b), at=beat(i, b))
# a walk-up into the resolve as she dives (the last bar, beats 2.5–3.5)
for b, nt in ((2.5, 'B2'), (3, 'C#3'), (3.5, 'D3')):
    pz.add(pluck.pizz(nt, 0.4, 0.7, seed=290 + int(b * 2)), at=beat(NB - 1, b))
# glockenspiel: a small playful motif, every other bar, quiet
MOTIF = [(0, 'F#5'), (0.5, 'A5'), (1, 'B5'), (2, 'A5')]
ANSWER = [(0, 'D5'), (0.5, 'E5'), (1, 'F#5'), (2.5, 'E5')]
for i in range(1, NB, 2):
    for b, nt in (MOTIF if i % 4 == 1 else ANSWER):
        gl.add(GLOCK.play(nt, 1.0, 0.42, release=0.5), at=beat(i, b))
# the resolve: a full strum, low pizz, a glockenspiel sparkle up to D6; it rings out and the music ends
uke.add(pluck.strum(['D4', 'F#4', 'A4', 'D5'], 2.6, 0.7, kind='uke', seed=400), at=RESOLVE)
pz.add(pluck.pizz('D2', 0.9, 0.85, seed=401), at=RESOLVE); pz.add(pluck.pizz('D3', 0.9, 0.7, seed=402), at=RESOLVE)
for j, nt in enumerate(['A5', 'D6']):
    gl.add(GLOCK.play(nt, 2.2, 0.5, release=1.2), at=RESOLVE + 0.12 * j)
m.group('music').level = -16.0 - 12.0   # a quarter of the voiceover's volume

if __name__ == '__main__':
    os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
    res = m.export(os.path.join(HERE, 'out', 'audio.wav'), lufs=-14.0, tp=-2.5,  # AAC adds ~0.5 dB TP; check the mp4
                   spectrogram=os.path.join(HERE, 'out', 'audio-spectrogram.png'), stems_dir=os.path.join(HERE, 'out', 'stems'))
    print({k: v for k, v in res.items() if k != 'path'})
