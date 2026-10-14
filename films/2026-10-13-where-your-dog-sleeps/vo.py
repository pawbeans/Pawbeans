"""Dog Decoded: Where your dog sleeps, VOICEOVER (owner, 2026-10-14: gentle, warm, bright, playful female voice).

The voice reads exactly the on-screen words: the hook headline, every caption card, the question card. Each line starts
as its card appears and ends before the card leaves; every caption word then builds in on the frame it is spoken
(word times from forced alignment are written to js/vo.js and used by scene.js).

Voice: Kokoro-82M (local, Apache-2.0), a blend of af_heart (warm) and af_bella (bright). Alignment: faster-whisper.
Needs a Python with `kokoro-onnx soundfile faster-whisper` and the Kokoro model files that `npx hyperframes tts` caches:
  <py> films/<slug>/vo.py   →  out/vo/<id>.wav, out/vo.json (placement for audio.py), js/vo.js (caption word times)
"""
import json, os, re, difflib
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro
from faster_whisper import WhisperModel

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.expanduser('~/.cache/hyperframes/tts')
OUT = os.path.join(HERE, 'out', 'vo')
SPEED, MAX_SPEED = 0.92, 1.25   # a gentle pace; a line only speeds up if its card is short
MIX = (('af_heart', 0.6), ('af_bella', 0.4))

# id, card in, card out, on-screen text (as in scene.js CAPS, ** = emphasis), card already up (no pop)
LINES = [
    ('hook', 0.0, 2.0, 'Where your dog sleeps says a lot.', True),
    ('c0', 2.2, 4.0, 'Six spots. The best is **last.**', False),
    ('c1', 4.2, 5.8, 'It can mean you\'re **family.**', False),
    ('c2', 5.8, 7.9, 'Puppies pile up for **warmth and safety.**', True),
    ('c3', 8.2, 10.1, 'Close to you...', False),
    ('c4', 10.1, 11.9, '...but **watching the room.**', True),
    ('c5', 12.2, 14.1, 'Often a dog on **guard duty.**', False),
    ('c6', 14.1, 15.9, 'They see themselves as your **protector.**', True),
    ('c7', 16.2, 18.1, 'Your **scent** comforts them...', False),
    ('c8', 18.1, 19.9, '...especially when **you\'re out.**', True),
    ('c9', 20.15, 22.2, 'It can mean **"I\'ve got your back."**', False),
    ('c10', 22.2, 23.9, 'It\'s a sign of **deep trust.**', True),
    ('c11', 24.2, 25.9, 'And the sweetest spot...', False),
    ('c12', 25.9, 28.7, 'Against you? You\'re their **safe place.**', True),
    ('q', 29.0, 31.8, 'Where does yours sleep? Tell us below.', False),
]
# how a line is said, where it differs from how it is shown: a tiny beat after "yours" (the emphasised word) so its z is heard
SAY = {'q': 'Where does yours, sleep? Tell us below.'}
LEAD_POP, LEAD_CONT, TAIL = 0.10, 0.03, 0.08   # voice starts once a popping card is up; ends before the card goes


def norm(w): return re.sub(r'[^a-z0-9]', '', w.lower().replace('’', "'"))


def tts_text(s):
    s = s.replace('**', '').replace('"', '')
    return re.sub(r'^\.\.\.', '', s).strip()


def trim(y, sr, th=0.01):
    idx = np.where(np.abs(y) > th)[0]
    if not len(idx): return y
    a, b = max(0, idx[0] - int(0.01 * sr)), min(len(y), idx[-1] + int(0.04 * sr))
    return y[a:b]


def main():
    os.makedirs(OUT, exist_ok=True)
    k = Kokoro(os.path.join(CACHE, 'models', 'kokoro-v1.0.onnx'), os.path.join(CACHE, 'voices', 'voices-v1.0.bin'))
    voice = sum(w * k.get_voice_style(v) for v, w in MIX).astype(np.float32)
    asr = WhisperModel('small.en', device='cpu', compute_type='int8')
    place, caps, report = [], {}, []
    for lid, t0, t1, text, cont in LINES:
        start = t0 + (LEAD_CONT if cont else LEAD_POP)
        budget = t1 - TAIL - start
        speed = SPEED
        while True:
            y, sr = k.create(SAY.get(lid) or tts_text(text), voice=voice, speed=speed, lang='en-us', sentence_pause=0.14)
            y = trim(y, sr)
            dur = len(y) / sr
            if dur <= budget or speed >= MAX_SPEED: break
            speed = min(MAX_SPEED, speed * dur / budget * 1.02)
        path = os.path.join(OUT, f'{lid}.wav')
        sf.write(path, y, sr)
        segs, _ = asr.transcribe(path, word_timestamps=True, language='en')
        heard = [(w.start, w.word) for s in segs for w in s.words]
        shown = [w.replace('**', '') for w in text.split(' ')]
        # map each on-screen word to its spoken onset (sequence match on normalised tokens, gaps interpolated)
        a, b = [norm(w) for w in shown], [norm(w) for _, w in heard]
        on = [None] * len(shown)
        for blk in difflib.SequenceMatcher(None, a, b, autojunk=False).get_matching_blocks():
            for j in range(blk.size): on[blk.a + j] = heard[blk.b + j][0]
        known = [i for i, v in enumerate(on) if v is not None]
        for i in range(len(on)):
            if on[i] is None:
                lo = max([j for j in known if j < i], default=None); hi = min([j for j in known if j > i], default=None)
                on[i] = (on[lo] + 0.18 * (i - lo)) if hi is None and lo is not None else (on[hi] - 0.18 * (hi - i)) if lo is None and hi is not None else (on[lo] + (on[hi] - on[lo]) * (i - lo) / (hi - lo)) if lo is not None else 0.2 * i
        on = [round(start + max(0.0, v), 3) for v in on]
        caps[lid] = on
        place.append({'id': lid, 'at': round(start, 3), 'file': f'out/vo/{lid}.wav', 'dur': round(dur, 3)})
        report.append(f'{lid:4s} {start:6.2f}–{start + dur:6.2f} (card {t0:.2f}–{t1:.2f}) speed {speed:.2f} '
                      f'{len(shown) / dur:.1f} w/s  matched {len(known)}/{len(shown)}  heard: {" ".join(w for _, w in heard).strip()}')
    json.dump(place, open(os.path.join(HERE, 'out', 'vo.json'), 'w'), indent=1)
    with open(os.path.join(HERE, 'js', 'vo.js'), 'w') as f:
        f.write('// GENERATED by vo.py: the second each on-screen word is spoken (caption words build in on these).\n')
        f.write('export const VO_WORDS = ' + json.dumps(caps) + ';\n')
    print('\n'.join(report))


if __name__ == '__main__':
    main()
