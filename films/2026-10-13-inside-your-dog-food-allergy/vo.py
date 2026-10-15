"""Inside Your Dog: Food Allergy, v4 VOICEOVER + TIMELINE (owner, 2026-10-15).

v3 was sound effects only. v4 is voice first: each caption line of the approved film is one natural take by the
house voice (ElevenLabs "Jessica"), the captions are exactly what she says (built word by word as she says them), and
the picture is re-timed around the voice: every line keeps its picture window, stretched when the take needs longer,
key moments land on the words that name them (FLEAS struck through on "fleas", the lock on "locks", the burst on
"burst", the poop on "poops", the bounce on "never"), and fast action (the dive into the mouth, the impact frames,
crossfades) keeps its real speed.

  ELEVENLABS_API_KEY=… mg-styles-15/.venv/bin/python films/<slug>/vo.py   (never commit the key)
    →  out/vo/<id>.wav, out/vo.json (voice placement), out/timeline.json (time warp for audio.py), js/timeline.js
"""
import json, os, re, difflib, hashlib, urllib.request
import numpy as np
import soundfile as sf
from faster_whisper import WhisperModel

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.expanduser('~/.cache/hyperframes/tts')
OUT = os.path.join(HERE, 'out', 'vo')
EL_KEY = os.environ.get('ELEVENLABS_API_KEY')
EL_VOICE = os.environ.get('BEANS_VO_VOICE', 'cgSgspJ2msm6clMCkdW9')   # Jessica – Playful, Bright, Warm
# eleven_multilingual_v2 by default: natural, steady pace. eleven_v3 is more expressive (audio tags) but slower.
EL_MODEL = os.environ.get('BEANS_VO_MODEL', 'eleven_multilingual_v2')
EL_SETTINGS = {'eleven_v3': {'stability': 0.5},
               'eleven_multilingual_v2': {'stability': 0.4, 'similarity_boost': 0.8, 'style': 0.4, 'use_speaker_boost': True, 'speed': 1.0}}
EL_TRIES = 4
KOKORO_MIX, KOKORO_SPEED = (('af_heart', 0.6), ('af_bella', 0.4)), 0.95

# ------------------------------------------------------------------ the script (spoken = shown; ** = emphasised word)
# id, text, old window [a, b] (the v3 picture, seconds), events [(old time, keep-speed s, word, offset from its onset)],
# head keep (s of the window start kept at real speed: crossfades / transitions), tail keep (same, at the window end)
SCRIPT = [
    ('l01', "Your dog isn't itchy because of **fleas.**", (0.0, 2.3), [(1.2, 0.45, 'fleas', -0.1)], 0, 0),
    ('l02', 'It might be **dinner.**', (2.3, 4.3), [(2.5, 0.65, 'dinner', -0.15)], 0, 1.1),
    ('l03', 'Food gets broken down in the gut.', (4.3, 6.8), [], 0, 0),
    ('l04', 'But sometimes, **protein** pieces slip through the gut wall **intact.**', (6.8, 11.0), [(8.1, 0.0, 'slip', 0.0)], 0, 0),
    ('l05', 'The **immune system** spots them, and makes a **mistake.**', (11.0, 13.8), [], 0, 0),
    ('l06', 'It tags that protein as an **invader.**', (13.8, 16.4), [(13.8, 0.5, 'tags', -0.1)], 0, 0),
    ('l07', 'And builds **antibodies** against it.', (16.4, 19.3), [], 0, 0),
    ('l08', 'Those antibodies load onto **mast cells** in the skin and gut.', (19.3, 22.2), [], 0, 0),
    ('l09', 'Nothing happens yet. Your dog **seems fine.**', (22.2, 24.2), [], 0, 0),
    ('l10', 'This is why allergies seem to come out of **nowhere.**', (24.2, 26.0), [], 0, 0),
    ('l11', 'Next meal. **Same protein.**', (26.0, 28.2), [], 0, 0),
    ('l12', 'It **locks** onto the antibodies.', (28.2, 30.8), [(29.4, 0.3, 'locks', -0.05)], 0, 0),
    ('l13', 'And the mast cells **burst,** releasing **histamine** and **itch signals.**', (30.8, 35.0), [(31.0, 0.6, 'burst', -0.08)], 0, 0),
    ('l14', 'In the skin, those signals fire up the **nerves.**', (35.0, 37.4), [], 0.45, 0),
    ('l15', 'The message races to the **brain.**', (37.4, 38.8), [(38.6, 0.2, 'brain', -0.05)], 0, 0),
    ('l16', 'And the brain says one thing. **Scratch.**', (38.8, 43.0), [(38.8, 0.3, 'scratch', -0.05)], 0, 0),
    ('l17', 'In the gut, the same reaction causes **inflammation.**', (43.0, 45.6), [], 0.4, 0),
    ('l18', 'Food rushes through. Hello, **bad poops.**', (45.6, 48.0), [(46.5, 0.4, 'poops', -0.1)], 0, 0),
    ('l19', 'The body only reacts to proteins it has **met before.**', (48.0, 50.9), [], 0.4, 0),
    ('l20', 'So vets use a protein your dog has **never eaten.**', (50.9, 53.6), [(51.75, 0.3, 'never', 0.0)], 0, 0),
    ('l21', '**No antibodies.** **No reaction.**', (53.6, 55.0), [], 0, 0),
    ('l22', 'Suspect a food allergy? Talk to your vet.', (55.0, 58.0), [], 0.45, 0),
]
NOCAP = {'l22'}            # the end card already shows this line
LEAD, TAIL = 0.25, 0.35    # voice starts a beat into its window; a breath before the next line
OLD_DUR = 58.0


def norm(w):   # ASR can't hear the difference between homophones, so they count as a match
    w = re.sub(r'[^a-z0-9]', '', w.lower().replace('’', "'"))
    return {'youre': 'your', 'theyre': 'their'}.get(w, w)


def plain(s): return s.replace('**', '')


def trim(y, sr, th=0.01):
    idx = np.where(np.abs(y) > th)[0]
    if not len(idx): return y
    a, b = max(0, idx[0] - int(0.01 * sr)), min(len(y), idx[-1] + int(0.04 * sr))
    return y[a:b]


_kokoro = None
def take(lid, say, seed):
    """One take as float mono. ElevenLabs (cached by model + voice + settings + seed + text), else local Kokoro."""
    if not EL_KEY:
        global _kokoro
        from kokoro_onnx import Kokoro
        if _kokoro is None:
            k = Kokoro(os.path.join(CACHE, 'models', 'kokoro-v1.0.onnx'), os.path.join(CACHE, 'voices', 'voices-v1.0.bin'))
            _kokoro = (k, sum(w * k.get_voice_style(v) for v, w in KOKORO_MIX).astype(np.float32))
        return _kokoro[0].create(say, voice=_kokoro[1], speed=KOKORO_SPEED, lang='en-us')
    key = hashlib.sha1(f'{EL_MODEL}|{EL_VOICE}|{seed}|{json.dumps(EL_SETTINGS[EL_MODEL], sort_keys=True)}|{say}'.encode()).hexdigest()[:12]
    raw = os.path.join(OUT, 'raw', f'{lid}-{key}.wav')
    if not os.path.exists(raw):
        os.makedirs(os.path.dirname(raw), exist_ok=True)
        body = json.dumps({'text': say, 'model_id': EL_MODEL, 'seed': seed, 'voice_settings': EL_SETTINGS[EL_MODEL]}).encode()
        req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{EL_VOICE}?output_format=pcm_24000', body,
                                     {'xi-api-key': EL_KEY, 'Content-Type': 'application/json'})
        pcm = np.frombuffer(urllib.request.urlopen(req, timeout=120).read(), dtype='<i2')
        sf.write(raw, pcm.astype(np.float32) / 32768, 24000)
    return sf.read(raw, dtype='float32')


def words_of(asr, path):
    y, sr = sf.read(path, dtype='float32')            # decode ourselves (PyAV versions differ); whisper wants 16 kHz
    from scipy.signal import resample_poly
    from math import gcd
    g = gcd(16000, sr); y16 = resample_poly(y, 16000 // g, sr // g).astype(np.float32)
    segs, _ = asr.transcribe(y16, word_timestamps=True, language='en')
    return [(w.start, w.end, w.word.strip()) for s in segs for w in s.words]


def align(shown, heard):
    """Onset and end (s) of every shown word, by sequence match on normalised tokens; gaps interpolated."""
    a, b = [norm(w) for w in shown], [norm(w) for _, _, w in heard]
    on, off = [None] * len(shown), [None] * len(shown)
    for blk in difflib.SequenceMatcher(None, a, b, autojunk=False).get_matching_blocks():
        for j in range(blk.size): on[blk.a + j], off[blk.a + j] = heard[blk.b + j][0], heard[blk.b + j][1]
    known = [i for i, v in enumerate(on) if v is not None]
    for i in range(len(on)):
        if on[i] is None:
            lo = max([j for j in known if j < i], default=None); hi = min([j for j in known if j > i], default=None)
            if lo is not None and hi is not None: on[i] = off[i] = on[lo] + (on[hi] - on[lo]) * (i - lo) / (hi - lo)
            elif lo is not None: on[i] = off[i] = off[lo] + 0.05
            else: on[i] = off[i] = max(0.0, on[hi] - 0.2 * (hi - i))
    return on, off, len(known)


def cards(words, most=44):
    """Split a take's words into caption cards: one sentence a card; a sentence over `most` characters splits at the
    comma nearest its middle (or, with no comma, at the middle word)."""
    sents, cur = [], []
    for i, w in enumerate(words):
        cur.append(i)
        if re.search(r'[.?!]\**$', w): sents.append(cur); cur = []
    if cur: sents.append(cur)
    out = []
    for s in sents:
        txt = lambda ii: ' '.join(plain(words[j]) for j in ii)
        if len(txt(s)) <= most: out.append(s); continue
        commas = [k for k in range(len(s) - 1) if words[s[k]].endswith(',')]
        mid = len(txt(s)) / 2
        k = min(commas or range(len(s) - 1), key=lambda k: abs(len(txt(s[:k + 1])) - mid))
        out += [s[:k + 1], s[k + 1:]]
    return out


def main():
    os.makedirs(OUT, exist_ok=True)
    asr = WhisperModel('small.en', device='cpu', compute_type='int8')
    takes = {}
    for lid, text, win, evs, hk, tk in SCRIPT:
        shown = text.split(' ')
        seed0 = int(hashlib.sha1(lid.encode()).hexdigest()[:6], 16)
        path = os.path.join(OUT, f'{lid}.wav')
        for n in range(EL_TRIES if EL_KEY else 1):
            y, sr = take(lid, plain(text), seed0 + n)
            y = trim(y, sr); sf.write(path, y, sr)
            heard = words_of(asr, path)
            if [norm(w) for _, _, w in heard] == [norm(plain(w)) for w in shown]: break
        on, off, nk = align([plain(w) for w in shown], heard)
        takes[lid] = dict(text=text, words=shown, on=on, off=off, dur=len(y) / sr, take=n + 1, matched=nk,
                          heard=' '.join(w for _, _, w in heard))

    def word_at(t, w):
        return [i for i, x in enumerate(t['words']) if norm(plain(x)) == norm(w)][0]
    anchors, place, caps, secs = [(0.0, 0.0)], [], [], []
    A = 0.0
    for lid, text, (a, b), evs, hk, tk in SCRIPT:
        t = takes[lid]
        lead = max(LEAD, hk)                      # a crossfade plays first, then she speaks
        vs = A + lead
        need = lead + t['dur'] + TAIL
        if hk: anchors.append((A + hk, a + hk))
        for old_e, keep, w, dt in evs:
            E = vs + t['on'][word_at(t, w)] + dt
            prev = anchors[-1]
            E = max(E, prev[0] + (old_e - prev[1]) * 0.6)     # never faster than 1.67x into it
            anchors.append((E, old_e))
            if keep: anchors.append((E + keep, old_e + keep))
            need = max(need, E + keep - A + (b - tk - (old_e + keep)) * 0.6)
        B = A + max(b - a, need + tk)
        if tk: anchors.append((B - tk, b - tk))
        anchors.append((B, b))
        secs.append([round(A, 3), round(B, 3)])
        place.append({'id': lid, 'at': round(vs, 3), 'file': f'out/vo/{lid}.wav', 'dur': round(t['dur'], 3)})
        if lid not in NOCAP:
            for g in cards(t['words'], most=96):   # this film's cards hold two lines: one card per spoken line
                txt = ' '.join(t['words'][i] for i in g)
                caps.append([round(vs + t['on'][g[0]] - 0.12, 3), round(vs + t['off'][g[-1]] + 0.35, 3), txt,
                             [round(vs + t['on'][i], 3) for i in g]])
        A = B
    # back-to-back cards stay up; a card never runs into the next one
    for i, c in enumerate(caps):
        nxt = caps[i + 1][0] if i + 1 < len(caps) else 1e9
        if nxt - c[1] < 0.6: c[1] = nxt
        c[1] = max(c[1], min(c[0] + 1.5, nxt))   # every card readable for at least 1.5 s when there is room
        c[1] = round(min(c[1], nxt), 3)
    anchors = sorted(set((round(n, 4), round(o, 4)) for n, o in anchors))
    for (n0, o0), (n1, o1) in zip(anchors, anchors[1:]):
        assert n1 > n0 and o1 >= o0, ('warp not monotonic', (n0, o0), (n1, o1))
    DUR = round(round(A * 24) / 24, 4)
    tl = {'dur': DUR, 'old_dur': OLD_DUR, 'warp': anchors, 'lines': secs, 'caps': caps}
    json.dump(place, open(os.path.join(HERE, 'out', 'vo.json'), 'w'), indent=1)
    json.dump(tl, open(os.path.join(HERE, 'out', 'timeline.json'), 'w'), indent=1)
    with open(os.path.join(HERE, 'js', 'timeline.js'), 'w') as f:
        f.write('// GENERATED by vo.py: the film re-timed around the voiceover (seconds). warp = [new, old] anchors.\n')
        f.write('export const TL = ' + json.dumps(tl) + ';\n')
    for (lid, *_), p in zip(SCRIPT, place):
        t = takes[lid]
        print(f"{lid}  {p['at']:6.2f}-{p['at'] + t['dur']:6.2f}  take {t['take']}  {len(t['words']) / t['dur']:.1f} w/s  "
              f"matched {t['matched']}/{len(t['words'])}  heard: {t['heard']}")
    print('dur', DUR)
    for c in caps: print(f'  card {c[0]:6.2f}-{c[1]:6.2f}  {c[2]}')


if __name__ == '__main__':
    main()
