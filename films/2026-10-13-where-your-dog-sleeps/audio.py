"""Dog Decoded: Where your dog sleeps, sound effects (32.5 s). SOUND EFFECTS ONLY: the owner adds their own music.

Soft synced foley: paper rustle for fur and fabric, soft pops for the spot labels, whooshes for the whip pans,
harp notes for the sweet moments, one soft impact for the hero dive. No zany cartoon SFX. Every time below is a
picture event in js/scene.js.

  python audio.py   →  out/audio.wav (+ out/audio-spectrogram.png)
"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'mg-styles-15', 'lib', 'audio'))
import mgaudio as mg
from mgaudio import sfx, samples

DUR = 32.5
m = mg.Mix(duration=DUR, bpm=80, anchor=0.0)
m.master_kw.update(tilt=1.2, air=1.5)   # lift presence for phones


def avail(key):
    """A sampled instrument limited to the files actually shipped (the VCSL subset in mg-styles-15 is partial)."""
    ins = samples.Instrument(key)
    ins.items = [i for i in ins.items if os.path.exists(os.path.join(samples.ROOT, i['file']))]
    return ins


HARP = avail('harp')
SFX_LIFT = 5.0
S = lambda snd, at, gain=0.0, **kw: m.sfx(snd, at, gain=gain + SFX_LIFT, **kw)
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
S(sfx.impact('soft', size=0.25), at=6.2, gain=-14)
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
harp('D6', 18.0, -15); harp('F#6', 18.12, -16)
# 5 back against you: the shuffle, the squish, two twinkles
S(sfx.paper('rustle', 0.3, seed=11), at=21.6, gain=-11)
S(sfx.impact('soft', size=0.3), at=21.85, gain=-12)
harp('E6', 22.0, -15)
# 6 tucked against you (hero): the crouch, the dive, the duvet flop, travelling under, the pop out
S(sfx.paper('rustle', 0.2, seed=13), at=24.35, gain=-14)
S(sfx.whoosh(0.3, 'swish', peak=0.7), at=24.45, gain=-6)
S(sfx.impact('soft', size=0.7), at=24.67, gain=-4)
S(sfx.paper('crumple', 0.5, seed=14), at=24.7, gain=-10)
for k in range(5):
    S(sfx.paper('rustle', 0.12, seed=20 + k), at=24.8 + k * 0.08, gain=-13)
S(sfx.pop('soft', 0.9), at=25.25, gain=-8)
for j, x in enumerate(['D5', 'F#5', 'A5', 'D6']):
    harp(x, 25.3 + 0.1 * j, -12)
# end: the question card, the yawn, the headline back (loops to frame 0)
S(sfx.paper('slide', 0.4), at=29.0, gain=-11)
S(sfx.pop('soft', 1.0), at=29.5, gain=-14)
S(sfx.paper('rustle', 0.4, seed=30), at=31.2, gain=-13)
S(sfx.pop('soft', 1.1), at=32.0, gain=-15)

if __name__ == '__main__':
    os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
    res = m.export(os.path.join(HERE, 'out', 'audio.wav'), lufs=-16.0, tp=-2.0,  # AAC adds ~0.5 dB TP; check the mp4
                   spectrogram=os.path.join(HERE, 'out', 'audio-spectrogram.png'))
    print({k: v for k, v in res.items() if k != 'path'})
