"""Dog Decoded: Where your dog sleeps, VOICEOVER (owner, 2026-10-14: gentle, warm, bright, playful female voice).

The voice reads exactly the on-screen words: the hook headline, every caption card, the question card. Each line starts
as its card appears and ends before the card leaves; every caption word then builds in on the frame it is spoken
(word times from forced alignment are written to js/vo.js and used by scene.js).

Voice (owner, 2026-10-14): ElevenLabs Eleven v3 when ELEVENLABS_API_KEY is set (never commit the key), voice
"Jessica – Playful, Bright, Warm" unless BEANS_VO_VOICE names another voice id; one gentle delivery tag per line.
A take is redone (new seed) if the words heard don't match the card. Takes are cached in out/vo/raw/ by text, voice
and seed, so re-runs spend no credits. Without a key it falls back to local Kokoro-82M (Apache-2.0).
Alignment: faster-whisper. Needs a Python with `soundfile faster-whisper` (+ `kokoro-onnx` for the fallback):
  ELEVENLABS_API_KEY=… <py> films/<slug>/vo.py  →  out/vo/<id>.wav, out/vo.json (for audio.py), js/vo.js (word times)
"""
import json, os, re, difflib, hashlib, subprocess, urllib.request
import numpy as np
import soundfile as sf
from faster_whisper import WhisperModel

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.expanduser('~/.cache/hyperframes/tts')
OUT = os.path.join(HERE, 'out', 'vo')
SPEED, MAX_SPEED = 0.92, 1.25   # Kokoro: a gentle pace; a line only speeds up if its card is short
MIX = (('af_heart', 0.6), ('af_bella', 0.4))
EL_KEY = os.environ.get('ELEVENLABS_API_KEY')
EL_VOICE = os.environ.get('BEANS_VO_VOICE', 'cgSgspJ2msm6clMCkdW9')   # Jessica – Playful, Bright, Warm
# model: eleven_multilingual_v2 (default) takes a speed setting and fits the cards; eleven_v3 is more expressive but
# slower (≈ 33 s of speech for this 32.5 s film) and ignores speed
EL_MODEL = os.environ.get('BEANS_VO_MODEL', 'eleven_multilingual_v2')
EL_SETTINGS = {'eleven_v3': {'stability': 0.5},
               'eleven_multilingual_v2': {'stability': 0.4, 'similarity_boost': 0.8, 'style': 0.4, 'use_speaker_boost': True, 'speed': 1.0}}
EL_TRIES, MAX_TEMPO = 4, 1.2   # a take longer than its card is sped up at most 1.2× (pitch kept)
# delivery direction (Eleven v3 audio tags, not spoken); default [warmly]
TAG = {'c0': '[playfully]', 'c3': '[softly]', 'c9': '[playfully]', 'c11': '[softly, teasing]', 'c12': '[tenderly]',
       'q': '[playfully]'}

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


def norm(w):   # ASR can't hear the difference between homophones, so they count as a match
    w = re.sub(r'[^a-z0-9]', '', w.lower().replace('’', "'"))
    return {'youre': 'your'}.get(w, w)


def tts_text(s):
    s = s.replace('**', '').replace('"', '')
    return re.sub(r'^\.\.\.', '', s).strip()


def trim(y, sr, th=0.01):
    idx = np.where(np.abs(y) > th)[0]
    if not len(idx): return y
    a, b = max(0, idx[0] - int(0.01 * sr)), min(len(y), idx[-1] + int(0.04 * sr))
    return y[a:b]


def el_take(lid, say, seed):
    """One ElevenLabs take as float mono at 24 kHz, cached by model + voice + settings + seed + text."""
    if EL_MODEL == 'eleven_v3':   # audio tags are v3 only (other models would read them aloud)
        say = f"{TAG.get(lid, '[warmly]')} {say}"
    key = hashlib.sha1(f'{EL_MODEL}|{EL_VOICE}|{seed}|{json.dumps(EL_SETTINGS[EL_MODEL], sort_keys=True)}|{say}'.encode()).hexdigest()[:12]
    raw = os.path.join(OUT, 'raw', f'{lid}-{key}.wav')
    if not os.path.exists(raw):
        os.makedirs(os.path.dirname(raw), exist_ok=True)
        body = json.dumps({'text': say, 'model_id': EL_MODEL, 'seed': seed, 'voice_settings': EL_SETTINGS[EL_MODEL]}).encode()
        req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{EL_VOICE}?output_format=pcm_24000', body,
                                     {'xi-api-key': EL_KEY, 'Content-Type': 'application/json'})
        pcm = np.frombuffer(urllib.request.urlopen(req, timeout=120).read(), dtype='<i2')
        sf.write(raw, pcm.astype(np.float32) / 32768, 24000)
    y, sr = sf.read(raw, dtype='float32')
    return y, sr


def tempo(y, sr, k):
    """Speed up by k without changing pitch (ffmpeg atempo)."""
    p = subprocess.run(['ffmpeg', '-v', 'error', '-f', 'f32le', '-ar', str(sr), '-ac', '1', '-i', '-', '-af', f'atempo={k:.4f}',
                        '-f', 'f32le', '-'], input=y.astype('<f4').tobytes(), capture_output=True, check=True)
    return np.frombuffer(p.stdout, dtype='<f4').copy()


def heard_words(asr, path):
    segs, _ = asr.transcribe(path, word_timestamps=True, language='en')
    return [(w.start, w.word) for s in segs for w in s.words]


def main():
    os.makedirs(OUT, exist_ok=True)
    asr = WhisperModel('small.en', device='cpu', compute_type='int8')
    if not EL_KEY:
        from kokoro_onnx import Kokoro
        k = Kokoro(os.path.join(CACHE, 'models', 'kokoro-v1.0.onnx'), os.path.join(CACHE, 'voices', 'voices-v1.0.bin'))
        voice = sum(w * k.get_voice_style(v) for v, w in MIX).astype(np.float32)
    place, caps, report = [], {}, []
    for lid, t0, t1, text, cont in LINES:
        start = t0 + (LEAD_CONT if cont else LEAD_POP)
        budget = t1 - TAIL - start
        shown = [w.replace('**', '') for w in text.split(' ')]
        path = os.path.join(OUT, f'{lid}.wav')
        if EL_KEY:   # ElevenLabs: retake until every shown word is heard, then fit the card
            seed0 = int(hashlib.sha1(lid.encode()).hexdigest()[:6], 16)
            for n in range(EL_TRIES):
                y, sr = el_take(lid, SAY.get(lid) or tts_text(text), seed0 + n)
                y = trim(y, sr); sf.write(path, y, sr)
                got = [norm(w) for _, w in heard_words(asr, path)]
                if got == [norm(w) for w in shown]: break
            speed = len(y) / sr / budget
            if speed > 1.0:
                y = trim(tempo(y, sr, min(speed, MAX_TEMPO)), sr); sf.write(path, y, sr)
            speed = max(1.0, min(speed, MAX_TEMPO)); take = f'take {n + 1}'
        else:        # Kokoro fallback
            speed, take = SPEED, 'kokoro'
            while True:
                y, sr = k.create(SAY.get(lid) or tts_text(text), voice=voice, speed=speed, lang='en-us', sentence_pause=0.14)
                y = trim(y, sr)
                if len(y) / sr <= budget or speed >= MAX_SPEED: break
                speed = min(MAX_SPEED, speed * len(y) / sr / budget * 1.02)
            sf.write(path, y, sr)
        dur = len(y) / sr
        heard = heard_words(asr, path)
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
        report.append(f'{lid:4s} {start:6.2f}–{start + dur:6.2f} (card {t0:.2f}–{t1:.2f}) {take} speed {speed:.2f}{" OVER" if dur > budget + 0.01 else ""} '
                      f'{len(shown) / dur:.1f} w/s  matched {len(known)}/{len(shown)}  heard: {" ".join(w for _, w in heard).strip()}')
    json.dump(place, open(os.path.join(HERE, 'out', 'vo.json'), 'w'), indent=1)
    with open(os.path.join(HERE, 'js', 'vo.js'), 'w') as f:
        f.write('// GENERATED by vo.py: the second each on-screen word is spoken (caption words build in on these).\n')
        f.write('export const VO_WORDS = ' + json.dumps(caps) + ';\n')
    print('\n'.join(report))


if __name__ == '__main__':
    main()
