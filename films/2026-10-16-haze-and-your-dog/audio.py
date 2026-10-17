"""Inside Your Dog: What the haze does to your dog, soundtrack: voiceover + music + soft foley.

Voice first (playbook §2.7): run vo.py first (it writes out/vo/, out/vo.json and out/timeline.json).
Music: a new instrumental for this film, same family as the 2026-10-14 ukulele piece but its own tune: nylon guitar
fingerpicking, pizzicato bass, a harp motif, G major, about 88 bpm, a little hushed under the haze, landing a warm
resolve when the window slams shut (hero). It sits 12 LU under the voice; thin bars run under the teaser and the last chord rings out under the end card.
Foley: whooshes for the whips and irises, soft pops for the stickers, a quiet airy rush for the specks, a sliding
window and one soft cinematic impact on the slam, a gentle air hum for the aircon, paws for the sniffing, a soft
thud for the pouch, a paper slide for the question card. No zany cartoon SFX.

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
FR = lambda t: round(t * 24) / 24      # snap to the film frame the picture keys on
HERO = FR(MK['shut'])                   # the window slams shut (scene.js HERO = MK('shut'), contact frame): the music lands home here
RESOLVE = HERO
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

# whips and irises (film time, each whoosh peaks on its cut)
for b in (22.0, 26.0, 31.0, 37.0, 40.0, 44.5, 48.0):
    SF(sfx.whoosh(0.45, 'air', peak=0.5), at=new(b), gain=-8)    # mgaudio puts the peak (sync point) on `at`
for b in (6.5, 14.0):
    SF(sfx.whoosh(0.6, 'swoosh', peak=0.5), at=new(b), gain=-9)
# hook + news: a soft paper rustle (her tail), stickers on "very"
S(sfx.paper('rustle', 0.4, seed=1), at=0.2, gain=-15)
SF(sfx.pop('soft', 1.0), at=MK['very'] - 0.05, gain=-11)
SF(sfx.pop('soft', 1.1), at=MK['very'] + 0.2, gain=-13)
# inside: an airy rush as the tiny specks pour down the airway, a harp on "lungs", pops for the labels
SF(sfx.whoosh(1.4, 'air', peak=0.6), at=MK['tiny'] + 0.3, gain=-14)
for w in ('nose', 'lungs', 'eyes', 'nose2', 'breathing'): SF(sfx.pop('soft', 1.0), at=MK[w] - 0.03, gain=-13)
SF(HARP.play('D6', 1.2, 0.4, release=0.6).loud(-18), at=MK['lungs'], gain=-15 + SFX_LIFT)
# signs, risk, tips: a pop on each sticker; a soft breath-puff on "sneezing"
for w in ('watery', 'sneezing', 'runny', 'coughing', 'fast', 'tired', 'flat', 'narrow', 'older', 'heart', 'walks', 'toilet', 'harder',
          'workout', 'hide', 'training', 'fewer', 'small', 'newfood', 'next', 'tuned', 'puppies', 'wipe', 'belly', 'gums', 'emergency'):
    SF(sfx.pop('soft', 1.0), at=MK[w] - 0.03, gain=-13)
SF(sfx.whoosh(0.25, 'air', peak=0.3), at=MK['sneezing'], gain=-15)
SF(sfx.pop('soft', 0.85), at=MK['most'] - 0.03, gain=-10)
SF(sfx.whoosh(1.2, 'air', peak=0.6), at=MK['morehaze'] + 0.4, gain=-18)   # haze drawn in towards her nose
# the big one (hero): the pane slides, one soft cinematic impact on the slam, harp up; the aircon starts (an air hum)
SF(sfx.whoosh(0.3, 'swish', peak=0.8), at=HERO - 1 / 24, gain=-8)
SF(sfx.impact('soft', size=0.7), at=HERO, gain=-5)
SF(sfx.click('wood'), at=HERO, gain=-10)
for j, x in enumerate(['G5', 'B5', 'D6', 'G6']): SF(HARP.play(x, 1.2, 0.4, release=0.6).loud(-18), at=HERO + 0.08 + 0.09 * j, gain=-12 + SFX_LIFT)
SF(sfx.whoosh(2.2, 'air', peak=0.2), at=MK['aircon'] - 0.1, gain=-19)
SF(sfx.pop('soft', 1.0), at=MK['aircon'] - 0.03, gain=-13)
SF(sfx.pop('soft', 0.9), at=MK['callvet'] - 0.03, gain=-10)
# back home: the damp cloth rubs (soft paper rustles in time with it)
for k in range(5): SF(sfx.paper('rustle', 0.3, seed=20 + k), at=MK['wipe'] + 0.1 + k * 0.7, gain=-17)
# stuck inside: paws on the floor as she sniffs from bit to bit
for k in range(8): SF(sfx.click('soft'), at=MK['hide'] + 0.3 + k * 0.2, gain=-18 - (k % 2))
# the pouch lands: a soft thud, then a twinkle on "Nothing"
SF(sfx.impact('soft', size=0.3), at=FR(new(44.80)), gain=-10)   # scene.js POUCH = 44.80 (contact frame)
SF(HARP.play('B5', 1.2, 0.4, release=0.6).loud(-18), at=MK['nothing'], gain=-15 + SFX_LIFT)
# question card, then the wipe to the end card
S(sfx.paper('slide', 0.4), at=48.05, gain=-11)
S(sfx.paper('slide', 0.3, seed=5), at=50.0, gain=-12)

# ------------------------------------------------------------------ voiceover (one clip per line, see vo.py)
for ln in json.load(open(os.path.join(HERE, 'out', 'vo.json'))):
    y, sr = sf.read(os.path.join(HERE, ln['file']), dtype='float32')
    if sr != 48000:
        g = gcd(48000, sr); y = resample_poly(y, 48000 // g, sr // g).astype('float32')
    m.track('vo', group='vo', hp=90).add(mg.Sound(y), at=ln['at'])
m.group('vo').level = -16.0

# ------------------------------------------------------------------ music: G major, nylon guitar + pizzicato + harp
# G | Em | C | D (repeated) … | C | D7 || G (the slam), then a gentle ring-out under the tips, the pouch and the question
GTR = {'G': ['G2', 'D3', 'G3', 'B3'], 'Em': ['E2', 'B2', 'E3', 'G3'], 'C': ['C3', 'G3', 'C4', 'E4'], 'D': ['D3', 'A3', 'D4', 'F#4'],
       'D7': ['D3', 'A3', 'C4', 'F#4'], 'Am': ['A2', 'E3', 'A3', 'C4']}
BASS = {'G': ('G2', 'D3'), 'Em': ('E2', 'B2'), 'C': ('C3', 'G2'), 'D': ('D3', 'A2'), 'D7': ('D3', 'A2'), 'Am': ('A2', 'E3')}
PROG = (['G', 'Em', 'C', 'D'] * 12)[:NB - 2] + ['C', 'D7']
TAILP = ['G', 'C', 'Am', 'D']
beat = lambda bar, b: bar * BAR + b * BAR / 4
gt, pz, hp = (m.track(n, gain=g, sends={'room': -12}) for n, g in (('guitar', 0.0), ('pizz', -4.0), ('harp', -2.0)))
PICK = [(0, 0), (0.5, 2), (1, 3), (1.5, 2), (2, 1), (2.5, 2), (3, 3), (3.5, 2)]   # a soft travis-ish fingerpick
def bar_of(i, ch, vel=0.5, thin=False):
    for b, k in PICK:
        if thin and b % 1: continue
        gt.add(pluck.guitar(GTR[ch][k], BAR / 4 * 2.2, vel * (1.0 if k == 0 else 0.75), seed=600 + i * 8 + int(b * 2)), at=beat(i, b))
for i, ch in enumerate(PROG):
    bar_of(i, ch, thin=(i < 2))
    if i >= 2:
        r, f = BASS[ch]
        for b, nt in ((0, r), (2, f)):
            pz.add(pluck.pizz(nt, 0.6, 0.66 if b == 0 else 0.54, seed=200 + i * 4 + b), at=beat(i, b))
MOTIF = [(0, 'B4'), (0.5, 'D5'), (1, 'G5'), (2.5, 'F#5')]
ANSWER = [(0, 'E5'), (0.5, 'D5'), (1, 'B4'), (2, 'A4')]
for i in range(3, NB, 2):
    for b, nt in (MOTIF if i % 4 == 3 else ANSWER):
        hp.add(HARP.play(nt, 1.2, 0.34, release=0.6), at=beat(i, b))
# the resolve on the slam: a full G chord, low pizz, harp up to G6
for j, nt in enumerate(['G2', 'D3', 'G3', 'B3', 'D4', 'G4']): gt.add(pluck.guitar(nt, 2.8, 0.6, seed=700 + j), at=RESOLVE + 0.025 * j)
pz.add(pluck.pizz('G2', 0.9, 0.8, seed=401), at=RESOLVE)
for j, nt in enumerate(['D6', 'G6']): hp.add(HARP.play(nt, 2.0, 0.4, release=1.0), at=RESOLVE + 0.12 * j)
# after the resolve: thin bars under the vet, the game and the pouch; rest under the question; a last chord rings out
k = NB + 1
q0 = MK['tuned'] - 0.4   # thin bars run under the teaser; the last chord rings out under the logo
while beat(k, 0) < q0 - BAR * 0.25:
    bar_of(k, TAILP[k % 4], 0.4, thin=True)
    r, _ = BASS[TAILP[k % 4]]; pz.add(pluck.pizz(r, 0.6, 0.5, seed=900 + k), at=beat(k, 0))
    k += 1
for j, nt in enumerate(['G2', 'D3', 'G3', 'B3', 'D4']): gt.add(pluck.guitar(nt, 2.6, 0.42, seed=800 + j), at=max(0, DUR - 2.4) + 0.03 * j)
m.group('music').level = -16.0 - 12.0   # a quarter of the voiceover's volume

if __name__ == '__main__':
    os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
    res = m.export(os.path.join(HERE, 'out', 'audio.wav'), lufs=-14.0, tp=-2.5,
                   spectrogram=os.path.join(HERE, 'out', 'audio-spectrogram.png'), stems_dir=os.path.join(HERE, 'out', 'stems'))
    print({k: v for k, v in res.items() if k != 'path'})
