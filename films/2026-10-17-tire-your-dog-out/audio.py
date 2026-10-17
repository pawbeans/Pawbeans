"""Dog Decoded: tire your dog out without leaving the flat, soundtrack: voiceover + music + soft foley.

Voice first (playbook §2.7): run vo.py first (it writes out/vo/, out/vo.json and out/timeline.json).
Music: a new instrumental for this film, same family as the 2026-10-14 ukulele piece but its own tune: nylon guitar
broken chords, pizzicato bass, a light vibraphone motif, G major, about 96 bpm, landing a warm resolve on the hero
beat (she finds the treat). It sits 12 LU under the voice; the question and the loop are voice and foley only, under a
ring-out. Foley: soft pops for the countdown pills and stickers, whooshes for the whips, a breath for the sigh, kibble
pitter-patter, a cardboard crinkle and pop, a soft cloth roll, a soft clink of frost, paws on the floor for the sweep,
harp for the "ping" moments, one soft cinematic impact on the find. No zany cartoon SFX.
Every time below is a picture event in js/scene.js (animation seconds, placed through the warp) or a word mark from
vo.py (film seconds).

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
RESOLVE = new(72.3)                     # the find (hero): the music lands home here
NB = max(4, round(RESOLVE / 2.5))       # whole bars of 4/4 up to the resolve, kept near 96 bpm
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
sec = TL['sections']

# hook: the haze outside (a soft air bed), her sigh
S(sfx.whoosh(1.6, 'air', peak=0.5), at=0.0, gain=-22)
S(sfx.paper('rustle', 0.5, seed=1), at=2.4, gain=-15)
# whips (placed in film time so each whoosh peaks on its cut) and the countdown pills
for b in (4.2, 15.5, 24.5, 32.8, 42.0, 52.6, 62.2, 65.6, 77.4, 90.0):
    SF(sfx.whoosh(0.45, 'air', peak=0.5), at=new(b) - 0.225, gain=-8)
for i in (2, 3, 4, 5, 6, 8, 9):
    SF(sfx.pop('soft', 1.1), at=sec[i][0] + 0.15, gain=-12)
# set-up: ears perk on "secret", sparks on "brain", stickers
SF(HARP.play('B5', 1.2, 0.4, release=0.6).loud(-18), at=MK['secret'], gain=-15 + SFX_LIFT)
for j, x in enumerate(['G5', 'B5', 'D6']): SF(HARP.play(x, 1.2, 0.4, release=0.6).loud(-18), at=MK['brain'] + 0.08 * j, gain=-14 + SFX_LIFT)
SF(sfx.pop('soft', 1.0), at=MK['five_g'] - 0.05, gain=-12); SF(sfx.pop('soft', 1.2), at=MK['tonight'] - 0.05, gain=-13)
# 5: tufts (paper ticks), kibble pitter-patter, sniffs
for k in range(6): S(sfx.paper('rustle', 0.12, seed=10 + k), at=15.8 + k * 0.33, gain=-19)
for k in range(12): SF(sfx.click('soft'), at=MK['scatter'] - 0.05 + k * 0.04 + 0.3, gain=-16 - (k % 3))
for k in range(4): SF(sfx.whoosh(0.18, 'air', peak=0.4), at=MK['sniff'] + 0.2 + k * 0.32, gain=-20)
SF(HARP.play('D6', 1.2, 0.4, release=0.6).loud(-18), at=MK['calms'], gain=-15 + SFX_LIFT)
# 4: treats drop in, the ends fold (crinkle), the pop open (crumple + soft impact)
for k in range(3): SF(sfx.click('soft'), at=MK['drop'] + 0.2 + k * 0.25, gain=-14)
SF(sfx.paper('crumple', 0.3, seed=5), at=MK['fold'] - 0.1, gain=-12)
SF(sfx.paper('crumple', 0.35, seed=6), at=MK['open'] - 0.1, gain=-10)
SF(sfx.impact('soft', size=0.3), at=MK['open'] - 0.05, gain=-12)
# 3: treats laid down, the towel rolls (cloth slide), she unrolls it
for k in range(5): SF(sfx.pop('soft', 1.2 + 0.05 * k), at=MK['lay'] - 0.05 + 0.22 * k, gain=-17)
SF(sfx.paper('slide', 0.6, seed=8), at=MK['roll'] - 0.05, gain=-12)
SF(sfx.paper('slide', 1.4, seed=9), at=MK['unroll'] + 0.15, gain=-13)
# 2: spread (soft slide), frost (vibraphone shimmer), licks
SF(sfx.paper('slide', 0.8, seed=11), at=MK['spread'], gain=-15)
for j, x in enumerate(['D6', 'G6', 'B6']): SF(VIB.play(x, 1.0, 0.35, release=0.8).loud(-18), at=MK['freeze'] - 0.05 + 0.07 * j, gain=-15 + SFX_LIFT)
for k in range(6): SF(sfx.paper('rustle', 0.1, seed=30 + k), at=MK['licking'] + k * 0.25, gain=-20)
# stay safe: chewing (crinkles), the roll lifted away, treats into the bowl
for k in range(5): SF(sfx.paper('crumple', 0.15, seed=40 + k), at=MK['stay'] + 1.2 + k * 0.55, gain=-17)
SF(sfx.whoosh(0.3, 'air', peak=0.5), at=MK['chewing'], gain=-13)
for k in range(3): SF(sfx.click('soft'), at=MK['count'] + 0.25 + k * 0.35, gain=-13)
# tease
SF(HARP.play('A5', 1.2, 0.4, release=0.6).loud(-18), at=MK['nothing'], gain=-15 + SFX_LIFT)
# 1 (hero): the throw (swish), the sweep (quick paws), the find (soft cinematic impact + harp run)
SF(sfx.whoosh(0.35, 'swish', peak=0.6), at=MK['hide'] - 0.05, gain=-11)
for k in range(10): S(sfx.click('soft'), at=new(MK['findit']) + k * 0.09, gain=-16 - (k % 2))
S(sfx.whoosh(0.25, 'swish', peak=0.75), at=72.3 - 0.19, gain=-8)
S(sfx.impact('soft', size=0.7), at=72.3, gain=-5)
for j, x in enumerate(['G5', 'B5', 'D6', 'G6']): harp(x, 72.38 + 0.09 * j, -12)
SF(sfx.pop('soft', 1.0), at=MK['room'] - 0.4, gain=-14)
# bonus: the play bow (soft thud), rope tugs, the sit, the sticker, the flop asleep
SF(sfx.impact('soft', size=0.25), at=MK['tug'] - 0.05, gain=-13)
for k in range(4): SF(sfx.paper('rustle', 0.15, seed=50 + k), at=MK['tug'] + 0.2 + k * 0.3, gain=-17)
SF(HARP.play('B5', 1.2, 0.4, release=0.6).loud(-18), at=MK['training'], gain=-15 + SFX_LIFT)
SF(sfx.pop('soft', 1.0), at=MK['fullday'] - 0.05, gain=-12)
SF(sfx.paper('rustle', 0.6, seed=60), at=MK['tired'] - 0.05, gain=-12)
SF(sfx.impact('soft', size=0.2), at=MK['tired'] - 0.02, gain=-15)
# question card, then back to the window (loop)
SF(sfx.paper('slide', 0.4), at=MK['q'] - 0.15, gain=-11)
S(sfx.pop('soft', 1.0), at=90.0, gain=-13)

# ------------------------------------------------------------------ voiceover (one clip per line, see vo.py)
for ln in json.load(open(os.path.join(HERE, 'out', 'vo.json'))):
    y, sr = sf.read(os.path.join(HERE, ln['file']), dtype='float32')
    if sr != 48000:
        g = gcd(48000, sr); y = resample_poly(y, 48000 // g, sr // g).astype('float32')
    m.track('vo', group='vo', hp=90).add(mg.Sound(y), at=ln['at'])
m.group('vo').level = -16.0

# ------------------------------------------------------------------ music: G major, nylon guitar + pizzicato + vibraphone
# G | Em | C | D (repeated) … | C | D7 || G (the find), then thin bars under the payoff and a rest under the question
GT = {'G': ['G2', 'D3', 'G3', 'B3'], 'Em': ['E2', 'B2', 'E3', 'G3'], 'C': ['C3', 'G3', 'C4', 'E4'], 'D': ['D3', 'A3', 'D4', 'F#4'],
      'D7': ['D3', 'A3', 'C4', 'F#4'], 'Am': ['A2', 'E3', 'A3', 'C4']}
BASS = {'G': ('G2', 'D3'), 'Em': ('E2', 'B2'), 'C': ('C3', 'G2'), 'D': ('D3', 'A2'), 'D7': ('D3', 'A2'), 'Am': ('A2', 'E3')}
PROG = (['G', 'Em', 'C', 'D'] * 20)[:NB - 2] + ['C', 'D7']
TAILP = ['G', 'C', 'Am', 'D']
beat = lambda bar, b: bar * BAR + b * BAR / 4
gt, pz, vb = (m.track(n, gain=g, sends={'room': -12}) for n, g in (('guitar', 0.0), ('pizz', -4.0), ('vib', -3.0)))
ARP = [(0, 0), (0.5, 1), (1, 2), (1.5, 3), (2, 2), (2.5, 1), (3, 2), (3.5, 3)]
def bar_of(i, ch, vel=0.5, thin=False):
    for b, k in ARP:
        if thin and b % 1: continue
        gt.add(pluck.guitar(GT[ch][k], BAR / 4 * 2.0, vel * (1.0 if k == 0 else 0.8), kind='nylon', seed=1000 + i * 8 + int(b * 2)), at=beat(i, b))
for i, ch in enumerate(PROG):
    bar_of(i, ch, thin=(i == 0))
    if i >= 1:
        r, f = BASS[ch]
        for b, nt in ((0, r), (2, f)):
            pz.add(pluck.pizz(nt, 0.6, 0.7 if b == 0 else 0.58, seed=200 + i * 4 + b), at=beat(i, b))
MOTIF = [(0, 'D5'), (0.5, 'E5'), (1, 'G5'), (2, 'B5')]
ANSWER = [(0, 'B4'), (0.5, 'D5'), (1, 'E5'), (2.5, 'D5')]
for i in range(2, NB, 2):
    for b, nt in (MOTIF if i % 4 == 2 else ANSWER):
        vb.add(VIB.play(nt, 1.0, 0.32, release=0.6), at=beat(i, b))
# the resolve on the find: a full G chord, low pizz, harp up to G6
for j, nt in enumerate(['G2', 'D3', 'G3', 'B3', 'D4', 'G4']): gt.add(pluck.guitar(nt, 2.8, 0.55, kind='nylon', seed=900 + j), at=RESOLVE + 0.02 * j)
pz.add(pluck.pizz('G2', 0.9, 0.85, seed=401), at=RESOLVE)
for j, nt in enumerate(['D6', 'G6']): vb.add(HARP.play(nt, 2.0, 0.42, release=1.0), at=RESOLVE + 0.12 * j)
k = NB + 1
q0 = MK['q'] - 0.3
while beat(k, 0) < q0 - BAR * 0.25:
    bar_of(k, TAILP[k % 4], 0.42, thin=True); k += 1
for j, nt in enumerate(['G3', 'B3', 'D4', 'G4']): gt.add(pluck.guitar(nt, 2.4, 0.38, kind='nylon', seed=950 + j), at=max(0, DUR - 2.2) + 0.03 * j)
m.group('music').level = -16.0 - 12.0   # a quarter of the voiceover's volume

if __name__ == '__main__':
    os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
    res = m.export(os.path.join(HERE, 'out', 'audio.wav'), lufs=-14.0, tp=-2.5,
                   spectrogram=os.path.join(HERE, 'out', 'audio-spectrogram.png'), stems_dir=os.path.join(HERE, 'out', 'stems'))
    print({k: v for k, v in res.items() if k != 'path'})
