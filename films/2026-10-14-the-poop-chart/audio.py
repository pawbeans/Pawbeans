"""Inside Your Dog: The poop chart, soundtrack: voiceover + music + soft foley.

Voice first (playbook §2.7): run vo.py first (it writes out/vo/, out/vo.json and out/timeline.json).
Music: a new instrumental for this film, same family as the 2026-10-14 ukulele piece but its own tune: nylon guitar
fingerpicking, pizzicato bass, a light vibraphone motif, G major, about 92 bpm, landing a short happy resolve on the
hero beat (the 2). It sits 12 LU under the voice and thins out under the vet advice.
Foley: soft pops for labels and samples, paper slides, whooshes for the whips, a gentle squelch for the soft ones,
small wooden clicks for the pellets, a soft impact for the hero, harp for the "close" star and the goal.
No zany cartoon SFX. Every time below is a picture event in js/scene.js (animation seconds, placed through the warp)
or a word mark from vo.py (film seconds).

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

TL = json.load(open(os.path.join(HERE, 'out', 'timeline.json')))
DUR, MK = TL['dur'], TL['marks']
def new(t):
    """animation time → film time"""
    A = TL['warp']
    for (n0, o0), (n1, o1) in zip(A, A[1:]):
        if t <= o1: return n0 + (n1 - n0) * (t - o0) / ((o1 - o0) or 1)
    return A[-1][0]
RESOLVE = new(42.35)                    # the 2 lands: the music lands home here
NB = max(4, round(RESOLVE / 2.6))       # whole bars of 4/4 up to the resolve, kept near 92 bpm
BAR = RESOLVE / NB
m = mg.Mix(duration=DUR, bpm=240 / BAR, anchor=0.0)
m.master_kw.update(tilt=1.2, air=1.5)


def avail(key):
    """A sampled instrument limited to the files actually shipped (the VCSL subset in mg-styles-15 is partial)."""
    ins = samples.Instrument(key)
    ins.items = [i for i in ins.items if os.path.exists(os.path.join(samples.ROOT, i['file']))]
    return ins


HARP, VIB = avail('harp'), avail('vibraphone')
SFX_LIFT = 3.0
S = lambda snd, at, gain=0.0, **kw: m.sfx(snd, new(at), gain=gain + SFX_LIFT, **kw)       # animation time
SF = lambda snd, at, gain=0.0, **kw: m.sfx(snd, at, gain=gain + SFX_LIFT, **kw)           # film time
harp = lambda note, at, gain=-13: S(HARP.play(note, 1.2, 0.4, release=0.6).loud(-18), at=at, gain=gain)

# hook: a rustle behind the bush, the headline pops out
S(sfx.paper('rustle', 0.5, seed=1), at=0.1, gain=-14)
S(sfx.paper('rustle', 0.3, seed=2), at=1.0, gain=-15)          # her glance
S(sfx.pop('soft', 1.0), at=2.62, gain=-14)
# whips
for b in (3.0, 13.5, 18.0, 21.5, 26.0, 29.0, 31.5, 35.0, 38.5, 41.5, 46.5, 50.0, 53.5):
    S(sfx.whoosh(0.45, 'air', peak=0.5), at=b - 0.22, gain=-8)
# section pills
for i, (a, _) in enumerate(TL['sections']):
    if i in (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13): SF(sfx.pop('soft', 1.1), at=a + 0.15, gain=-12)
# the ruler slides up, seven numbers stamp in, one to seven; "water": a drop
S(sfx.paper('slide', 0.35, seed=3), at=3.15, gain=-10)
for n in range(7):
    SF(sfx.click('soft'), at=MK['one'] + (MK['seven'] - MK['one']) * n / 6 - 0.04, gain=-12)
SF(sfx.drip(1.0), at=MK['water'] - 0.02, gain=-11)
# into the gut: the iris whoosh, a calm river, soft drips as the walls soak; then it rushes
S(sfx.whoosh(0.6, 'air', peak=0.5), at=6.3, gain=-8)
S(sfx.gloop(0.7, dur=0.5), at=6.9, gain=-17)
for k in range(4): SF(sfx.drip(0.9 + 0.1 * k), at=MK['soaks'] + 0.25 * k, gain=-18)
S(sfx.whoosh(0.9, 'air', peak=0.4), at=11.1, gain=-11)
# 7 and 6: two soft landings, her ears drop, the sticker
SF(sfx.squelch(0.35, seed=4), at=MK['seven2'] - 0.05, gain=-15)
SF(sfx.gloop(0.9), at=MK['six'], gain=-15)
# why so soft: a pop for each cause
for w in ('food', 'scav', 'stress'): SF(sfx.pop('soft', 1.05), at=MK[w], gain=-12)
# 4 and 5: a soggy landing, then the piles
SF(sfx.gloop(1.0), at=MK['four'], gain=-15)
SF(sfx.squelch(0.3, seed=8), at=MK['five'] - 0.05, gain=-16)
# why a little soft
for w in ('rich', 'treat'): SF(sfx.pop('soft', 1.05), at=MK[w], gain=-12)
# too slow: a low, slow whoosh; dry cracks
S(sfx.whoosh(0.9, 'air', peak=0.3), at=29.1, gain=-15)
for k in range(3): S(sfx.paper('crumple', 0.15, seed=30 + k), at=29.6 + 0.45 * k, gain=-17)
# 1: strain, six small dry pellets (wooden ticks)
S(sfx.paper('rustle', 0.4, seed=7), at=31.8, gain=-15)
for k in range(6): S(sfx.click('wood'), at=32.3 + k * 0.14 + 0.22, gain=-13 - (k % 2))
# why so dry
for w in ('water2', 'bones', 'walks'): SF(sfx.pop('soft', 1.05), at=MK[w], gain=-12)
# 3: a soft landing, a harp note for "close" (not quite home)
SF(sfx.gloop(1.1), at=MK['three'], gain=-15)
SF(HARP.play('A5', 1.2, 0.4, release=0.6).loud(-18), at=MK['close'], gain=-13 + SFX_LIFT)
# 2 (hero): the drop, one soft cinematic impact, harp up, the sticker, the happy wag
S(sfx.whoosh(0.25, 'swish', peak=0.75), at=42.2, gain=-7)
S(sfx.impact('soft', size=0.8), at=42.35, gain=-4)
for j, x in enumerate(['G5', 'B5', 'D6', 'G6']): harp(x, 42.45 + 0.09 * j, -12)
S(sfx.pop('soft', 1.1), at=42.65, gain=-10)
for k in range(4): S(sfx.paper('rustle', 0.12, seed=10 + k), at=42.5 + k * 0.17, gain=-16)
# when to call the vet
for w in ('runny', 'blood', 'straining'): SF(sfx.pop('soft', 1.0), at=MK[w], gain=-12)
SF(sfx.pop('soft', 0.9), at=MK['callvet'], gain=-9)
# the tin lands, Miya wags, twinkles on "Firmer"
S(sfx.whoosh(0.25, 'swish', peak=0.7), at=50.05, gain=-9)
S(sfx.impact('soft', size=0.35), at=50.13, gain=-10)
S(sfx.paper('rustle', 0.3, seed=20), at=50.3, gain=-15)
for j, x in enumerate(['D6', 'G6']): SF(HARP.play(x, 1.2, 0.4, release=0.6).loud(-18), at=MK['firmer'] + 0.1 * j, gain=-15 + SFX_LIFT)
# question card, end card
S(sfx.paper('slide', 0.4), at=53.6, gain=-11)
S(sfx.paper('slide', 0.5, seed=21), at=55.5, gain=-13)

# ------------------------------------------------------------------ voiceover (one clip per line, see vo.py)
for ln in json.load(open(os.path.join(HERE, 'out', 'vo.json'))):
    y, sr = sf.read(os.path.join(HERE, ln['file']), dtype='float32')
    if sr != 48000:
        g = gcd(48000, sr); y = resample_poly(y, 48000 // g, sr // g).astype('float32')
    m.track('vo', group='vo', hp=90).add(mg.Sound(y), at=ln['at'])
m.group('vo').level = -16.0

# ------------------------------------------------------------------ music: G major, nylon guitar + pizzicato + vibraphone
# G | Em | C | D (repeated) … | C | D7 || G (the 2 lands), then a gentle tail to the end
GTR = {'G': ['G3', 'D4', 'G4', 'B4'], 'Em': ['E3', 'B3', 'E4', 'G4'], 'C': ['C3', 'G3', 'C4', 'E4'], 'D': ['D3', 'A3', 'D4', 'F#4'],
       'D7': ['D3', 'A3', 'C4', 'F#4'], 'Am': ['A2', 'E3', 'A3', 'C4']}
BASS = {'G': ('G2', 'D3'), 'Em': ('E2', 'B2'), 'C': ('C3', 'G2'), 'D': ('D3', 'A2'), 'D7': ('D3', 'A2'), 'Am': ('A2', 'E3')}
PROG = (['G', 'Em', 'C', 'D'] * 8)[:NB - 2] + ['C', 'D7']
TAIL = ['G', 'C', 'Am', 'D'] * 8                    # after the resolve, under the vet advice, product and end card
beat = lambda bar, b: bar * BAR + b * BAR / 4
gt, pz, vb = (m.track(n, gain=g, sends={'room': -14}) for n, g in (('guitar', 0.0), ('pizz', -4.0), ('vib', 0.0)))
PICK = [(0, 0), (0.5, 2), (1, 3), (1.5, 2), (2, 1), (2.5, 2), (3, 3), (3.5, 2)]   # a travis-ish fingerpick (string index)
def bar_of(i, ch, vel=0.5, quiet=False):
    for b, sidx in PICK:
        if quiet and b % 1: continue
        gt.add(pluck.guitar(GTR[ch][sidx], 1.0, vel * (0.85 if sidx else 1.0), 'nylon', seed=100 + i * 8 + int(b * 2)), at=beat(i, b))
for i, ch in enumerate(PROG):
    bar_of(i, ch)
    if i >= 1:
        r, f = BASS[ch]
        for b, nt in ((0, r), (2, f)):
            pz.add(pluck.pizz(nt, 0.6, 0.72 if b == 0 else 0.6, seed=200 + i * 4 + b), at=beat(i, b))
MOTIF = [(0, 'B4'), (0.5, 'D5'), (1, 'E5'), (2, 'D5')]
ANSWER = [(0, 'G4'), (0.5, 'A4'), (1, 'B4'), (2.5, 'A4')]
for i in range(1, NB, 2):
    for b, nt in (MOTIF if i % 4 == 1 else ANSWER):
        vb.add(VIB.play(nt, 1.2, 0.4, release=0.6), at=beat(i, b))
# the resolve on the 2: a full chord, low pizz, vibraphone up to G5
gt.add(pluck.strum(['G2', 'D3', 'G3', 'B3', 'D4', 'G4'], 2.6, 0.62, kind='nylon', seed=400), at=RESOLVE)
pz.add(pluck.pizz('G2', 0.9, 0.85, seed=401), at=RESOLVE)
for j, nt in enumerate(['D5', 'G5']): vb.add(VIB.play(nt, 2.0, 0.45, release=1.0), at=RESOLVE + 0.12 * j)
# the tail: the same groove, thinner (on the beat only) inside the body, fuller again for the tin and the end card
k = NB + 1
while beat(k, 0) < DUR - BAR * 0.5:
    t0 = beat(k, 0); inside = new(46.5) <= t0 < new(50.0)   # quieter under the vet advice
    bar_of(k, TAIL[k % 4], 0.42 if inside else 0.5, quiet=inside)
    if not inside: pz.add(pluck.pizz(BASS[TAIL[k % 4]][0], 0.6, 0.65, seed=500 + k), at=t0)
    k += 1
gt.add(pluck.strum(['G2', 'D3', 'G3', 'B3', 'D4', 'G4'], 2.0, 0.5, kind='nylon', seed=600), at=max(0, DUR - 2.0))
m.group('music').level = -16.0 - 12.0   # a quarter of the voiceover's volume

if __name__ == '__main__':
    os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
    res = m.export(os.path.join(HERE, 'out', 'audio.wav'), lufs=-14.0, tp=-2.5,
                   spectrogram=os.path.join(HERE, 'out', 'audio-spectrogram.png'), stems_dir=os.path.join(HERE, 'out', 'stems'))
    print({k: v for k, v in res.items() if k != 'path'})
