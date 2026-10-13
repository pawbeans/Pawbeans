"""Inside Your Dog: Food Allergy, soundtrack (58 s).

House sound: acoustic and premium. A fingerpicked nylon guitar carries the film, with a warm pad underneath and
a few piano notes. Foley stays soft (paper, fur, soft pops, gentle squelch). No zany cartoon SFX, no xylophone.

D major, 84 bpm (eighth = 0.357 s). The music turns to B minor for the reaction, drops out for 0.15 s before the
burst at 31.0 s, and comes home to D for the fix and the end card. Every SFX time is a picture event in js/scene.js.

  python audio.py   →  out/audio.wav (+ out/audio-spectrogram.png)
"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'mg-styles-15', 'lib', 'audio'))
import mgaudio as mg
from mgaudio import sfx, synth, pluck, samples
from mgaudio.theory import midi

DUR, BPM = 58.0, 84
E8 = 60 / BPM / 2
m = mg.Mix(duration=DUR, bpm=BPM, anchor=0.0)
m.group('music').level = -20
m.sfx_duck = 2.0
m.master_kw.update(tilt=1.2, air=1.5)   # lift presence for phones



def avail(key):
    """A sampled instrument limited to the files actually shipped (the VCSL subset in mg-styles-15 is partial)."""
    ins = samples.Instrument(key)
    ins.items = [i for i in ins.items if os.path.exists(os.path.join(samples.ROOT, i['file']))]
    return ins


PNO, HARP = avail('piano'), avail('harp')
n = lambda s: midi(s) if isinstance(s, str) else s


def piano(note, dur, vel, release=0.4):
    """Sampled piano (nearest shipped note and layer)."""
    return PNO.play(note, dur=dur, vel=vel, release=release)

# ---------------------------------------------------------------- music
# (start, end, bass, upper chord tones, density 0..1)
CH = [
    (0.0, 4.0, 'D2', ['A3', 'D4', 'F#4'], 0.6),       # hook: guitar alone
    (4.0, 6.86, 'D2', ['A3', 'D4', 'F#4'], 1),        # 1 the gut
    (6.86, 9.71, 'B1', ['F#3', 'B3', 'D4'], 1),
    (9.71, 11.0, 'G2', ['D3', 'B3', 'D4'], 1),
    (11.0, 13.8, 'A2', ['E3', 'A3', 'C#4'], 1),       # 2 the mistake
    (13.8, 16.4, 'B1', ['F#3', 'B3', 'D4'], 1),
    (16.4, 19.0, 'G2', ['D3', 'B3', 'D4'], 1),
    (19.0, 22.2, 'D2', ['A3', 'D4', 'F#4'], 0.7),     # 3 the trap is set: calm, thinner
    (22.2, 26.0, 'G2', ['D3', 'B3', 'D4'], 0.6),
    (26.0, 28.2, 'B1', ['F#3', 'B3', 'D4'], 0.8),     # 4 the reaction: minor, pulse
    (28.2, 30.85, 'F#2', ['C#3', 'F#3', 'A#3'], 0.9),
    (35.0, 37.4, 'E2', ['B2', 'E3', 'G3'], 0.8),      # 5 the itch
    (37.4, 39.6, 'F#2', ['C#3', 'F#3', 'A#3'], 1),
    (39.6, 43.0, 'G2', ['D3', 'B3', 'D4'], 0.8),
    (43.0, 45.6, 'E2', ['B2', 'E3', 'G3'], 0.7),      # 6 the gut, again
    (45.6, 48.0, 'A2', ['E3', 'A3', 'C#4'], 0.7),
    (48.0, 50.6, 'G2', ['D3', 'B3', 'D4'], 0.9),      # 7 the fix: home to D
    (50.6, 53.0, 'A2', ['E3', 'A3', 'C#4'], 1),
    (53.0, 55.0, 'B1', ['F#3', 'B3', 'D4'], 1),
]
gtr = m.track('guitar', level=-21, sends={'hall': -14}, width=0.7)
pad = m.track('pad', level=-29, sends={'hall': -10}, hp=160, lp=3200)
for i, (a, b, bass, up, dens) in enumerate(CH):
    pad.add(synth.pad([n(bass) + 12] + [n(u) for u in up], (b - a) + 0.8, 0.5, 'warm'), at=a)
    k = 0
    t = a
    while t < b - 0.05:
        pos = k % 8
        if pos == 0: note, vel = n(bass), 0.8
        else:
            seq = [None, up[0], up[2], up[1], up[2], up[0], up[1], up[2]]
            note, vel = n(seq[pos]), 0.55
            if dens < 1 and pos in (3, 7) and (k // 8 + i) % 2 == 0: t += E8; k += 1; continue
            if dens < 0.65 and pos in (1, 5): t += E8; k += 1; continue
        gtr.add(pluck.guitar(note, 2.2, vel * (0.92 + 0.08 * ((k * 7) % 3) / 2), 'nylon', seed=k + 31 * i), at=t)
        t += E8; k += 1

# reaction: low piano pulse on the beat, building to the burst
pno = m.track('piano', level=-24, sends={'hall': -12})
t = 26.0
while t < 30.85:
    v = 0.35 + 0.35 * (t - 26) / 4.85
    pno.add(piano('B2' if t < 28.2 else 'F#2', dur=0.5, vel=v, release=0.3), at=t)
    t += E8 * 2 if t < 29.4 else E8
# burst aftermath: held pad, then the guitar returns at 35.0
pad.add(synth.pad([n('B2'), n('F#3'), n('D4'), n('A4')], 4.4, 0.45, 'air'), at=31.0)
# the fix: a few piano notes over the guitar
for tt, note in [(48.2, 'F#5'), (49.6, 'A5'), (50.6, 'E5'), (51.75, 'A5'), (53.0, 'F#5'), (53.9, 'D5')]:
    pno.add(piano(note, dur=1.4, vel=0.42, release=0.8), at=tt)
# end card: one strum on D, a harp roll, the final chord rings out
end = m.track('end', level=-19, sends={'hall': -8}, width=0.8)
end.add(pluck.strum([n(x) for x in ['D2', 'A2', 'D3', 'F#3', 'A3', 'D4']], 3.2, 0.75, kind='nylon', spread=0.03), at=55.0)
for j, x in enumerate(['D5', 'E5', 'G5', 'B5', 'D6']):
    end.add(HARP.play(x, 2.6, 0.45, release=0.6), at=55.05 + 0.09 * j)
end.add(piano('A5', dur=2.4, vel=0.4, release=1.2), at=55.6)

# ---------------------------------------------------------------- sound design (soft foley)
SFX_LIFT = 5.0   # foley sat ~8 LU under the music; lift it so it reads on phone speakers
S = lambda snd, at, gain=0.0, **kw: m.sfx(snd, at, gain=gain + SFX_LIFT, **kw)
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
    S(sfx.blip('A5', 'sine', 0.09, glide=0), at=9.4 + k * 0.55, gain=-12)
S(sfx.whoosh(1.0, 'soft', direction=0), at=11.1, gain=-7)
# 2 the mistake
S(sfx.swish(0.35), at=11.9, gain=-9)
S(sfx.impact('soft', size=0.6), at=13.8, gain=-3)
S(sfx.pop('soft', 1.1), at=14.3, gain=-7)
S(sfx.pop('bubble', 0.9), at=15.6, gain=-7)
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
S(sfx.impact('cinematic', size=0.8), at=31.0, gain=1)
S(sfx.paper('flip', 0.6), at=31.1, gain=-8)
S(sfx.sparkle(3.2, 14, key='D', lo=78, hi=96), at=31.3, gain=-11)
S(sfx.pop('soft', 1.0), at=32.3, gain=-11)
S(sfx.pop('soft', 1.2), at=32.9, gain=-11)
m.mute(30.85, 0.15)
# 5 the itch: the nerve fires, the message races up, SCRATCH!, back to Miya
S(sfx.whoosh(0.5, 'swish'), at=36.6, gain=-10)
S(sfx.whoosh(1.1, 'air', direction=1), at=38.6, gain=-6)
S(sfx.impact('soft', size=0.7), at=38.8, gain=-2)
for k in range(14):
    S(sfx.paper('rustle', 0.12, seed=40 + k), at=39.8 + k * 0.22, gain=-11, pan=-0.1)
for tt in (40.1, 40.7, 41.3):
    S(sfx.pop('soft', 1.05), at=tt, gain=-11)
# 6 the gut, again: inflamed, food rushes through, the poop
S(sfx.whoosh(0.7, 'soft'), at=43.1, gain=-9)
S(sfx.bubbles(4.0, 8.0), at=44.0, gain=-14)
S(sfx.gloop(0.8, 0.4), at=46.6, gain=-7)
S(sfx.pop('soft', 0.8), at=46.75, gain=-12)
# 7 the fix: met before, never met bounces off, the new proteins
S(sfx.pop('soft', 1.0), at=48.5, gain=-10)
S(sfx.whoosh(0.6, 'soft'), at=51.2, gain=-10)
S(sfx.click('wood'), at=51.75, gain=-5)
for tt in (53.1, 53.35, 53.6):
    S(sfx.pop('soft', 1.1), at=tt, gain=-10)
S(sfx.chime(('D6', 'F#6', 'A6'), step=0.12, kind='celesta'), at=53.0, gain=-12)
# end card
S(sfx.paper('slide', 0.5), at=55.2, gain=-12)

if __name__ == '__main__':
    os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
    res = m.export(os.path.join(HERE, 'out', 'audio.wav'), tp=-1.6,  # AAC adds ~0.5 dB of true peak
                   spectrogram=os.path.join(HERE, 'out', 'audio-spectrogram.png'))
    print({k: v for k, v in res.items() if k != 'path'})
    m.report()
