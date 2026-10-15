"""Inside Your Dog: Food Allergy, v4 soundtrack: voiceover + background music + soft foley.

Owner, 2026-10-14/15 (playbook §2.7 and §5): voice first (ElevenLabs "Jessica", see vo.py, captions = her words), a
new instrumental for this film in the same family as Where your dog sleeps (ukulele, pizzicato, a small bell-like
lead) but its own key, tempo, chords and lead (here G major, 88 bpm, fingerpicked ukulele, pizzicato bass and a
kalimba motif), sitting 12 LU under the voice, never busy under the words, a short rest before the burst and a happy
resolve on the end card. Foley as in v3, every hit on its picture event.

The film is re-timed around the voice (vo.py → out/timeline.json). Every SFX time below is written in animation time
(the approved 58 s cut, as in js/scene.js) and placed through the same warp.

  ELEVENLABS_API_KEY=… python vo.py, then python audio.py → out/audio.wav (+ spectrogram, stems in out/stems/)
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
DUR = TL['dur']
def new(t):
    """animation time → film time"""
    A = TL['warp']
    for (n0, o0), (n1, o1) in zip(A, A[1:]):
        if t <= o1: return n0 + (n1 - n0) * (t - o0) / ((o1 - o0) or 1)
    return A[-1][0]
BPM = 88.0
BAR = 240 / BPM
m = mg.Mix(duration=DUR, bpm=BPM, anchor=0.0)
m.master_kw.update(tilt=0.4, air=1.0)   # a light lift for phones (the voice is already bright)


def avail(key):
    """A sampled instrument limited to the files actually shipped (the VCSL subset in mg-styles-15 is partial)."""
    ins = samples.Instrument(key)
    ins.items = [i for i in ins.items if os.path.exists(os.path.join(samples.ROOT, i['file']))]
    return ins


HARP, KAL = avail('harp'), avail('kalimba')

# ------------------------------------------------------------------ foley (animation time → film time)
SFX_LIFT = 3.0   # foley sits under the voice
S = lambda snd, at, gain=0.0, **kw: m.sfx(snd, new(at), gain=gain + SFX_LIFT, **kw)
# hook: paw scratching (fur rustle on the strokes), strike-through, dinner, the dive
for k in range(12):
    S(sfx.paper('rustle', 0.12, seed=k), at=0.25 + k * 0.17, gain=-9, pan=-0.15)
S(sfx.pen('marker', 0.3, strokes=[(0, 0.25)]), at=1.35, gain=-5)
S(sfx.pop('soft', 0.9), at=2.62, gain=-9)
S(sfx.whoosh(0.9, 'air', peak=0.85), at=3.85, gain=-4)
# 1 the gut: food lands, breaks down, two proteins squeeze through, glowing pings
for i in range(5):
    S(sfx.impact('soft', size=0.35), at=4.3 + i * 0.12 + 0.55, gain=-12, pan=-0.6 + 0.3 * i)
S(sfx.paper('crumple', 0.7), at=6.7, gain=-9)
S(sfx.squelch(0.6, seed=2), at=8.5, gain=-8, pan=-0.2)
S(sfx.squelch(0.6, seed=3), at=8.65, gain=-9, pan=0.25)
for k in range(3):
    S(HARP.play('D6', 0.8, 0.35, release=0.4).loud(-18), at=9.4 + k * 0.55, gain=-12)
S(sfx.whoosh(1.0, 'soft', direction=0), at=11.1, gain=-7)
# 2 the mistake
S(sfx.swish(0.35), at=11.9, gain=-9)
S(sfx.impact('soft', size=0.6), at=13.8, gain=-3)
S(sfx.pop('soft', 1.1), at=14.3, gain=-7)
S(sfx.pop('soft', 0.9), at=15.6, gain=-8)
for k in range(17):
    S(sfx.click('soft'), at=16.4 + k * 0.17, gain=-15, pan=-0.3)
# 3 the trap is set: antibodies dock, the cell sleeps
for k, tt in enumerate([19.8, 20.3, 20.8, 21.3, 21.8, 22.3]):
    S(sfx.click('wood'), at=tt, gain=-16, pan=-0.4 + 0.15 * k)
S(sfx.pop('soft', 1.0), at=20.4, gain=-10)
# 4 the reaction: the protein returns, locks, heat builds, burst
S(sfx.whoosh(0.8, 'soft'), at=26.6, gain=-9)
S(sfx.click('wood'), at=29.4, gain=-4)
S(sfx.riser(1.6, 'noise', intensity=0.6), at=31.0, gain=-9)
S(sfx.impact('cinematic', size=0.8), at=31.0, gain=4)
S(sfx.paper('flip', 0.6), at=31.1, gain=-8)
S(sfx.sparkle(3.2, 14, key='G', lo=78, hi=96), at=31.3, gain=-11)
S(sfx.pop('soft', 1.0), at=32.3, gain=-11)
S(sfx.pop('soft', 1.2), at=32.9, gain=-11)
# 5 the itch: the nerve fires, the message races up, SCRATCH!, back to Miya
S(sfx.whoosh(0.5, 'swish'), at=36.6, gain=-10)
S(sfx.whoosh(1.1, 'air', direction=1), at=38.6, gain=-6)
S(sfx.impact('soft', size=0.7), at=38.8, gain=-7)
for k in range(14):
    S(sfx.paper('rustle', 0.12, seed=40 + k), at=40.35 + k * 0.2, gain=-11, pan=-0.1)
for tt in (40.6, 41.0, 41.4):
    S(sfx.pop('soft', 1.05), at=tt, gain=-15)
# 6 the gut, again: inflamed, food rushes through, the poop
S(sfx.whoosh(0.7, 'soft'), at=43.1, gain=-9)
S(sfx.bubbles(4.0, 8.0), at=44.0, gain=-14)
S(sfx.gloop(0.8, 0.4), at=46.6, gain=-7)
S(sfx.pop('soft', 0.8), at=46.75, gain=-12)
# 7 the fix: met before, never met bounces off, the new proteins
S(sfx.pop('soft', 1.0), at=48.5, gain=-10)
S(sfx.whoosh(0.6, 'soft'), at=51.2, gain=-10)
S(sfx.click('wood'), at=51.75, gain=-5)
S(sfx.impact('soft', size=0.3), at=51.75, gain=-10)
for tt in (53.1, 53.35, 53.6):
    S(sfx.pop('soft', 1.1), at=tt, gain=-10)
for j, x in enumerate(['D5', 'G5', 'B5']):   # a soft harp lift, not a celesta (too close to xylophone)
    S(HARP.play(x, 1.2, 0.4, release=0.6).loud(-18), at=53.0 + 0.12 * j, gain=-13)
# end card
S(sfx.paper('slide', 0.5), at=55.2, gain=-12)


# ------------------------------------------------------------------ voiceover (one take per line, see vo.py)
for ln in json.load(open(os.path.join(HERE, 'out', 'vo.json'))):
    y, sr = sf.read(os.path.join(HERE, ln['file']), dtype='float32')
    if sr != 48000:
        g = gcd(48000, sr); y = resample_poly(y, 48000 // g, sr // g).astype('float32')
    m.track('vo', group='vo', hp=90).add(mg.Sound(y), at=ln['at'])
m.group('vo').level = -16.0

# ------------------------------------------------------------------ music: G major, 88 bpm, uke + pizz + kalimba
UKE = {'G': ['G4', 'B4', 'D5'], 'Em': ['E4', 'G4', 'B4'], 'C': ['E4', 'G4', 'C5'], 'D': ['F#4', 'A4', 'D5'],
       'Am': ['E4', 'A4', 'C5'], 'B': ['F#4', 'B4', 'D#5']}
BASS = {'G': ('G2', 'D3'), 'Em': ('E2', 'B2'), 'C': ('C3', 'G2'), 'D': ('D3', 'A2'), 'Am': ('A2', 'E3'), 'B': ('B2', 'F#3')}
BURST, END = new(31.0), new(55.0)
def prog(t):   # film time → the chord for the bar starting at t, by story section
    sec = [(new(26.0), ['G', 'Em', 'C', 'D']),            # the gut, the mistake, the trap: easy and curious
           (BURST, ['Em', 'C', 'Am', 'B']),               # the reaction: a little tension
           (new(43.0), ['Em', 'C', 'G', 'D']),            # the itch
           (new(48.0), ['C', 'G', 'Am', 'D']),            # the gut, again
           (END, ['G', 'D', 'Em', 'C'])]                  # the fix: brighter
    for edge, p in sec:
        if t < edge: return p
    return None
uke, pz, kal = (m.track(n, gain=g, sends={'room': -14}) for n, g in (('uke', 0.0), ('pizz', -4.0), ('kalimba', 1.0)))
PICK = [0, 1, 2, 1, 0, 1, 2, 1]                          # gentle fingerpicked eighths
bar, i = 0.0, 0
while bar < END - 0.01:
    p = prog(bar); ch = p[i % 4]
    for k, nt in enumerate(PICK):
        at = bar + k * BAR / 8
        if at >= END or (BURST - 0.35 <= at < BURST + 0.6): continue    # a short rest before the burst
        uke.add(pluck.guitar(UKE[ch][nt], 1.0, 0.42 if k % 4 == 0 else 0.3, 'uke', seed=500 + i * 8 + k), at=at)
    if i >= 1:
        r, f = BASS[ch]
        for k, nt in ((0, r), (2, f)):
            at = bar + k * BAR / 4
            if at < END and not (BURST - 0.35 <= at < BURST + 0.6):
                pz.add(pluck.pizz(nt, 0.6, 0.7, seed=600 + i * 2 + k), at=at)
    if i % 2 == 1 and bar < new(26.0) or (new(48.0) <= bar < END and i % 2 == 0):   # the kalimba motif, calm sections only
        for b, nt in ([(0, 'D5'), (0.5, 'G5'), (1, 'B5'), (2, 'A5')] if i % 4 < 2 else [(0, 'B4'), (0.5, 'D5'), (1.5, 'G5')]):
            kal.add(KAL.play(nt, 1.2, 0.4, release=0.6), at=bar + b * BAR / 4)
    bar += BAR; i += 1
# the burst: one low pizz under the hit; the end card: a full strum, low G, a kalimba lift to G6, ringing out
pz.add(pluck.pizz('E2', 1.2, 0.85, seed=700), at=BURST)
uke.add(pluck.strum(['G4', 'B4', 'D5', 'G5'], 2.8, 0.65, kind='uke', seed=701), at=END)
pz.add(pluck.pizz('G2', 1.0, 0.85, seed=702), at=END)
for j, nt in enumerate(['B5', 'D6', 'G6']):
    kal.add(KAL.play(nt, 2.0, 0.45, release=1.0), at=END + 0.15 + 0.12 * j)
m.group('music').level = -16.0 - 12.0   # a quarter of the voice's volume

if __name__ == '__main__':
    os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
    res = m.export(os.path.join(HERE, 'out', 'audio.wav'), lufs=-14.0, tp=-2.5,  # AAC adds ~0.5 dB TP; check the mp4
                   spectrogram=os.path.join(HERE, 'out', 'audio-spectrogram.png'), stems_dir=os.path.join(HERE, 'out', 'stems'))
    print({k: v for k, v in res.items() if k not in ('path', 'onsets')})
