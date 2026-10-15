"""Dog Decoded: 5 ways your dog says I love you, soundtrack: voiceover + music + soft foley.

Voice first (playbook §2.7): run vo.py first (it writes out/vo/, out/vo.json and out/timeline.json).
Music: a new instrumental for this film, same family as the 2026-10-14 ukulele piece but its own tune: soft piano
broken chords, upright pizzicato bass, a harp motif, F major, about 90 bpm, landing a warm resolve on the hero beat
(the brow lift). It sits 12 LU under the voice; the question and the loop are voice and foley only, under a ring-out.
Foley: soft pops for the countdown pills, whooshes for the whips, a fur rustle and soft thud for the lean, a door
creak (soft wooden tick + air) for the escort, paws for the trot, a soft cloth flop for the sock, footsteps for the
walk, harp for the look back and the puppy eyes, one soft cinematic impact on the lift.
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
RESOLVE = new(22.8)                     # the brow lift: the music lands home here
NB = max(4, round(RESOLVE / 2.6))       # whole bars of 4/4 up to the resolve, kept near 92 bpm
BAR = RESOLVE / NB
m = mg.Mix(duration=DUR, bpm=240 / BAR, anchor=0.0)
m.master_kw.update(tilt=1.2, air=1.5)


def avail(key):
    """A sampled instrument limited to the files actually shipped (the VCSL subset in mg-styles-15 is partial)."""
    ins = samples.Instrument(key)
    ins.items = [i for i in ins.items if os.path.exists(os.path.join(samples.ROOT, i['file']))]
    return ins


HARP, PIANO = avail('harp'), avail('piano')
SFX_LIFT = 3.0
S = lambda snd, at, gain=0.0, **kw: m.sfx(snd, new(at), gain=gain + SFX_LIFT, **kw)       # animation time
SF = lambda snd, at, gain=0.0, **kw: m.sfx(snd, at, gain=gain + SFX_LIFT, **kw)           # film time
harp = lambda note, at, gain=-13: S(HARP.play(note, 1.2, 0.4, release=0.6).loud(-18), at=at, gain=gain)

# hook: a soft paper rustle (her tail), the headline pops out on "Like"
S(sfx.paper('rustle', 0.4, seed=1), at=0.2, gain=-15)
SF(sfx.pop('soft', 1.0), at=MK['like'] - 0.05, gain=-13)
# whips
for b in (3.0, 7.5, 11.5, 16.0, 20.0, 22.0, 28.0):   # placed in film time so each whoosh peaks on its cut
    SF(sfx.whoosh(0.45, 'air', peak=0.5), at=new(b) - 0.225, gain=-8)
# countdown pills
for a, _ in TL['sections'][1:5] + [TL['sections'][6]]:
    SF(sfx.pop('soft', 1.1), at=a + 0.15, gain=-12)
# 5: the lean: fur rustle as she tips in, a soft thud on contact, harp on the hug
S(sfx.paper('rustle', 0.35, seed=3), at=4.25, gain=-13)
S(sfx.impact('soft', size=0.25), at=4.6, gain=-12)
SF(HARP.play('A5', 1.2, 0.4, release=0.6).loud(-18), at=MK['hug'], gain=-14 + SFX_LIFT)
# 4: the escort: a wooden creak as the door opens a crack, her ears flick
S(sfx.click('wood'), at=10.0, gain=-11)
S(sfx.paper('slide', 0.25, seed=8), at=10.02, gain=-15)   # the door swings open a crack
S(sfx.whoosh(0.4, 'air', peak=0.3), at=10.0, gain=-16)
S(sfx.paper('rustle', 0.15, seed=4), at=10.05, gain=-15)
# 3: the gift: quick paws on the floor (on the trot), the sock flops down, a twinkle on "sock"
for k in range(8): S(sfx.click('soft'), at=11.6 + k * 0.12, gain=-17 - (k % 2))
SF(sfx.paper('crumple', 0.25, seed=5), at=new(13.6) - 0.15, gain=-12)   # peaks on the drop
SF(HARP.play('C6', 1.2, 0.4, release=0.6).loud(-18), at=MK['sock'], gain=-15 + SFX_LIFT)
# 2: the walk: soft steps, then the look back (harp up), hearts
for k in range(10): S(sfx.click('soft'), at=16.15 + k * 0.17, gain=-19 - (k % 2))
for j, x in enumerate(['F5', 'A5']): harp(x, 17.65 + 0.09 * j, -13)
# 1 (hero): one soft cinematic impact on the lift, harp run up, a second harp on "eyebrows", pop for the callout
SF(sfx.whoosh(0.25, 'swish', peak=0.75), at=new(22.8) - 0.19, gain=-8)
S(sfx.impact('soft', size=0.7), at=22.8, gain=-5)
for j, x in enumerate(['F5', 'A5', 'C6', 'F6']): harp(x, 22.88 + 0.09 * j, -12)
SF(sfx.pop('soft', 1.0), at=MK['muscle'], gain=-12)
SF(HARP.play('A5', 1.2, 0.4, release=0.6).loud(-18), at=MK['eyebrows'], gain=-14 + SFX_LIFT)
SF(sfx.pop('soft', 0.9), at=MK['scientists'] - 0.05, gain=-10)
# question card, then she settles back into the cover pose (loop)
SF(sfx.paper('slide', 0.4), at=MK['q'] - 0.15, gain=-11)
S(sfx.paper('rustle', 0.3, seed=21), at=30.6, gain=-14)
S(sfx.pop('soft', 1.0), at=30.6, gain=-13)

# ------------------------------------------------------------------ voiceover (one clip per line, see vo.py)
for ln in json.load(open(os.path.join(HERE, 'out', 'vo.json'))):
    y, sr = sf.read(os.path.join(HERE, ln['file']), dtype='float32')
    if sr != 48000:
        g = gcd(48000, sr); y = resample_poly(y, 48000 // g, sr // g).astype('float32')
    m.track('vo', group='vo', hp=90).add(mg.Sound(y), at=ln['at'])
m.group('vo').level = -16.0

# ------------------------------------------------------------------ music: F major, soft piano + pizzicato + harp
# F | Dm | Bb | C (repeated) … | Bb | C7 || F (the brow lift), then a gentle ring-out under "Scientists…" and the question
PNO = {'F': ['F3', 'C4', 'F4', 'A4'], 'Dm': ['D3', 'A3', 'D4', 'F4'], 'Bb': ['Bb2', 'F3', 'Bb3', 'D4'], 'C': ['C3', 'G3', 'C4', 'E4'],
       'C7': ['C3', 'G3', 'Bb3', 'E4'], 'Gm': ['G2', 'D3', 'G3', 'Bb3']}
BASS = {'F': ('F2', 'C3'), 'Dm': ('D2', 'A2'), 'Bb': ('Bb2', 'F2'), 'C': ('C3', 'G2'), 'C7': ('C3', 'G2'), 'Gm': ('G2', 'D3')}
PROG = (['F', 'Dm', 'Bb', 'C'] * 8)[:NB - 2] + ['Bb', 'C7']
TAILP = ['F', 'Bb', 'Gm', 'C']
beat = lambda bar, b: bar * BAR + b * BAR / 4
pn, pz, hp = (m.track(n, gain=g, sends={'room': -12}) for n, g in (('piano', 0.0), ('pizz', -4.0), ('harp', -1.0)))
ARP = [(0, 0), (0.5, 1), (1, 2), (1.5, 3), (2, 2), (2.5, 1), (3, 2), (3.5, 3)]   # a gentle broken chord
def bar_of(i, ch, vel=0.42, thin=False):
    for b, k in ARP:
        if thin and b % 1: continue
        pn.add(PIANO.play(PNO[ch][k], BAR / 4 * 1.6, vel * (1.0 if k == 0 else 0.8), release=0.5), at=beat(i, b))
for i, ch in enumerate(PROG):
    bar_of(i, ch, thin=(i == 0))
    if i >= 1:
        r, f = BASS[ch]
        for b, nt in ((0, r), (2, f)):
            pz.add(pluck.pizz(nt, 0.6, 0.7 if b == 0 else 0.58, seed=200 + i * 4 + b), at=beat(i, b))
MOTIF = [(0, 'C5'), (0.5, 'D5'), (1, 'F5'), (2, 'A5')]
ANSWER = [(0, 'A4'), (0.5, 'C5'), (1, 'D5'), (2.5, 'C5')]
for i in range(1, NB, 2):
    for b, nt in (MOTIF if i % 4 == 1 else ANSWER):
        hp.add(HARP.play(nt, 1.2, 0.38, release=0.6), at=beat(i, b))
# the resolve on the lift: a full F chord, low pizz, harp up to F6
for j, nt in enumerate(['F2', 'C3', 'F3', 'A3', 'C4', 'F4']): pn.add(PIANO.play(nt, 2.8, 0.5, release=1.2), at=RESOLVE + 0.02 * j)
pz.add(pluck.pizz('F2', 0.9, 0.85, seed=401), at=RESOLVE)
for j, nt in enumerate(['C6', 'F6']): hp.add(HARP.play(nt, 2.0, 0.42, release=1.0), at=RESOLVE + 0.12 * j)
# after the resolve: two thin bars under the payoff, then rest under the question; a last chord rings into the loop
k = NB + 1
q0 = MK['q'] - 0.3
while beat(k, 0) < q0 - BAR * 0.25:
    bar_of(k, TAILP[k % 4], 0.36, thin=True); k += 1
for j, nt in enumerate(['F3', 'A3', 'C4', 'F4']): pn.add(PIANO.play(nt, 2.4, 0.32, release=1.4), at=max(0, DUR - 2.2) + 0.03 * j)
m.group('music').level = -16.0 - 12.0   # a quarter of the voiceover's volume

if __name__ == '__main__':
    os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
    res = m.export(os.path.join(HERE, 'out', 'audio.wav'), lufs=-14.0, tp=-2.5,
                   spectrogram=os.path.join(HERE, 'out', 'audio-spectrogram.png'), stems_dir=os.path.join(HERE, 'out', 'stems'))
    print({k: v for k, v in res.items() if k != 'path'})
