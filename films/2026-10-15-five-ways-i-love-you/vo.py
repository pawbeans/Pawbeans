"""Dog Decoded: 5 ways your dog says I love you, VOICEOVER + TIMELINE (voice first, playbook §2.7).

Copied from films/2026-10-14-the-poop-chart/vo.py (itself from where-your-dog-sleeps): every section is one or more natural
takes, the picture is re-timed around them (each section is as long as its voice needs, fast moves keep real speed),
captions are cut from the takes word for word, and named word onsets ("marks") are exported so labels, stickers and
pops land on the word that names them.

Voice: ElevenLabs "Jessica" (ELEVENLABS_API_KEY; never commit it), voice id from BEANS_VO_VOICE if set; local
Kokoro-82M without a key. A take is redone (new seed) if the words heard don't match the script; takes are cached in
out/vo/raw/ by model, voice, settings, seed and text, so re-runs spend no credits. Alignment: faster-whisper.
  ELEVENLABS_API_KEY=… <py> films/<slug>/vo.py
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
EL_MODEL = os.environ.get('BEANS_VO_MODEL', 'eleven_multilingual_v2')
EL_SETTINGS = {'eleven_v3': {'stability': 0.5},
               'eleven_multilingual_v2': {'stability': 0.4, 'similarity_boost': 0.8, 'style': 0.4, 'use_speaker_boost': True, 'speed': 1.0}}
EL_TRIES = 4
EL_PICK = {'five2': 2}   # chosen take (seed offset): a clear pause in "a hug, dog style" (seed +0 ran it together as "hugged dog")
EL_SPEED = {'hook': 0.88, 'like': 0.92}   # per-line pace (Multilingual v2 speed): the hook is said a touch slower
KOKORO_MIX, KOKORO_SPEED = (('af_heart', 0.6), ('af_bella', 0.4)), 0.9

# ------------------------------------------------------------------ the script (spoken = shown; ** = emphasised word)
# id, section, text, picture moment to land on a word: (old time, keep-speed duration, word, offset from its onset)
SCRIPT = [
    ('hook', 0, 'Your dog says I **love** you.', None),
    ('like', 0, 'Like this.', None),
    ('five', 1, 'Number five: they **lean** on you.', (4.6, 0.4, 'lean', -0.05)),
    ('five2', 1, "All of their weight. That's a hug, **dog style.**", None),
    ('four', 2, 'Number four: they **follow** you everywhere.', (8.2, 0.0, 'follow', -0.05)),
    ('four2', 2, 'Yes, **even there.**', (10.0, 0.4, 'even', -0.05)),
    ('three', 3, 'Number three: they bring you their **favourite** thing.', (13.6, 0.4, 'thing', -0.05)),
    ('three2', 3, 'Or your **sock.** Same energy.', None),
    ('two', 4, "Number two: on walks, they **look back** to check you're still there.", (17.6, 0.5, 'look', -0.05)),
    ('tease', 5, "And number one? It's written all over their **face.**", None),
    ('one', 6, 'Number one: the **puppy eyes.**', (22.8, 0.5, 'puppy', -0.05)),
    ('one2', 6, "Dogs have a tiny muscle that lifts their **eyebrows.** Wolves mostly don't.", None),
    ('one3', 6, 'Scientists think it evolved **for you.**', None),
    ('q', 7, 'How many does yours do? Tell us below.', None),
]
# named word onsets (film seconds) for the picture: name → (line id, word, nth occurrence)
MARKS = {
    'about': ('hook', 'says', 0), 'like': ('like', 'like', 0),
    'five': ('five', 'five:', 0), 'weight': ('five2', 'weight.', 0), 'hug': ('five2', 'hug,', 0),
    'four': ('four', 'number', 0), 'everywhere': ('four', 'everywhere.', 0),
    'three': ('three', 'number', 0), 'sock': ('three2', '**sock.**', 0), 'same': ('three2', 'same', 0),
    'two': ('two', 'number', 0), 'check': ('two', 'check', 0),
    'tease': ('tease', 'and', 0), 'face': ('tease', '**face.**', 0),
    'one': ('one', 'number', 0), 'muscle': ('one2', 'muscle', 0), 'eyebrows': ('one2', '**eyebrows.**', 0),
    'wolves': ('one2', 'wolves', 0), 'scientists': ('one3', 'scientists', 0), 'foryou': ('one3', '**for', 0),
    'q': ('q', 'how', 0), 'tell': ('q', 'tell', 0),
}
NO_CAPTION = {'hook', 'q'}   # the hook headline and the question card are the text
# the picture as it was built (old seconds): section bounds; half-width of the cut into each section (real speed)
OLD = [(0.0, 3.0), (3.0, 7.5), (7.5, 11.5), (11.5, 16.0), (16.0, 20.0), (20.0, 22.0), (22.0, 28.0), (28.0, 31.5)]
CUT = [0, 0.125, 0.125, 0.125, 0.125, 0.125, 0.125, 0.125]
LOGO_OLD, LOGO_HOLD = 30.6, 0.9   # Dog Decoded: no logo. After the question she settles back into the cover pose (old 30.6), held 0.9 s, then the loop
LEAD, TAIL, GAP = 0.3, 0.8, 0.4


def norm(w):
    w = re.sub(r'[^a-z0-9]', '', w.lower().replace('’', "'"))
    return {'youre': 'your', 'theyre': 'their', '1': 'one', '2': 'two', '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', 'dont': 'dont', 'favourite': 'favorite'}.get(w, w)


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
    vs = dict(EL_SETTINGS[EL_MODEL])
    if lid in EL_SPEED and 'speed' in vs: vs['speed'] = EL_SPEED[lid]
    key = hashlib.sha1(f'{EL_MODEL}|{EL_VOICE}|{seed}|{json.dumps(vs, sort_keys=True)}|{say}'.encode()).hexdigest()[:12]
    raw = os.path.join(OUT, 'raw', f'{lid}-{key}.wav')
    if not os.path.exists(raw):
        os.makedirs(os.path.dirname(raw), exist_ok=True)
        body = json.dumps({'text': say, 'model_id': EL_MODEL, 'seed': seed, 'voice_settings': vs}).encode()
        req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{EL_VOICE}?output_format=pcm_24000', body,
                                     {'xi-api-key': EL_KEY, 'Content-Type': 'application/json'})
        pcm = np.frombuffer(urllib.request.urlopen(req, timeout=120).read(), dtype='<i2')
        sf.write(raw, pcm.astype(np.float32) / 32768, 24000)
    return sf.read(raw, dtype='float32')


def words_of(asr, path):
    y, sr = sf.read(path, dtype='float32')                              # decoded here (PyAV 19 broke faster-whisper's decoder)
    if y.ndim > 1: y = y.mean(axis=1)
    from scipy.signal import resample_poly
    from math import gcd
    g = gcd(16000, sr); y = resample_poly(y, 16000 // g, sr // g).astype(np.float32)
    segs, _ = asr.transcribe(y, word_timestamps=True, language='en')
    return [(w.start, w.end, w.word.strip()) for s in segs for w in s.words]


def align(shown, heard):
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


def cards(words, most=52):
    """One sentence a card; a sentence over `most` characters splits at the comma nearest its middle."""
    sents, cur = [], []
    for i, w in enumerate(words):
        cur.append(i)
        if re.search(r'[.?!]\**$', w): sents.append(cur); cur = []
    if cur: sents.append(cur)
    merged = []                                                            # two short sentences share a card (≥ 1.5 s each)
    for s in sents:
        if merged and (len(' '.join(plain(words[j]) for j in merged[-1] + s)) <= 30 or (len(' '.join(plain(words[j]) for j in merged[-1])) <= 20 and len(' '.join(plain(words[j]) for j in merged[-1] + s)) <= 52)): merged[-1] = merged[-1] + s
        else: merged.append(s)
    sents = merged
    out = []
    for s in sents:
        txt = lambda ii: ' '.join(plain(words[j]) for j in ii)
        if len(txt(s)) <= most: out.append(s); continue
        commas = [k for k in range(len(s) - 1) if words[s[k]].endswith(',') or words[s[k]].endswith(',**')]
        mid = len(txt(s)) / 2
        k = min(commas or range(len(s) - 1), key=lambda k: abs(len(txt(s[:k + 1])) - mid))
        out += [s[:k + 1], s[k + 1:]]
    return out


def main():
    os.makedirs(OUT, exist_ok=True)
    asr = WhisperModel('small.en', device='cpu', compute_type='int8')
    takes = {}
    for lid, sec, text, ev in SCRIPT:
        shown = text.split(' ')
        seed0 = int(hashlib.sha1(lid.encode()).hexdigest()[:6], 16) + (EL_PICK.get(lid, 0) if EL_KEY else 0)
        path = os.path.join(OUT, f'{lid}.wav')
        for n in range(EL_TRIES if EL_KEY else 1):
            y, sr = take(lid, plain(text), seed0 + n)
            y = trim(y, sr); sf.write(path, y, sr)
            heard = words_of(asr, path)
            if [norm(w) for _, _, w in heard] == [norm(plain(w)) for w in shown]: break
        on, off, nk = align([plain(w) for w in shown], heard)
        takes[lid] = dict(sec=sec, text=text, words=shown, on=on, off=off, dur=len(y) / sr, take=n + 1, matched=nk,
                          heard=' '.join(w for _, _, w in heard))

    def word_at(t, w, nth=0):
        hits = [i for i, x in enumerate(t['words']) if norm(plain(x)) == norm(plain(w))]
        return hits[nth]

    anchors, place, caps, secs = [(0.0, 0.0)], [], [], []
    starts = {}
    A = 0.0
    for k, (a, b) in enumerate(OLD):
        lines = [(lid, takes[lid], ev) for lid, sec, _, ev in SCRIPT if sec == k]
        wh_in = CUT[k] if k > 0 else 0.0
        wh_out = CUT[k + 1] if k + 1 < len(OLD) else 0.0
        if k > 0: anchors += [(A, a), (A + wh_in, a + wh_in)]
        vs = A + (0.05 if k == 0 else wh_in + LEAD)
        need = 0.0
        for lid, t, ev in lines:
            starts[lid] = vs
            if ev:
                old_e, keep, w, dt = ev
                E = vs + t['on'][word_at(t, w)] + dt
                prev = anchors[-1]
                E = max(E, prev[0] + (old_e - prev[1]) * 0.6)                  # never faster than 1.67× into it
                anchors.append((E, old_e))
                if keep: anchors.append((E + keep, old_e + keep))
                need = max(need, E + keep - A + (b - wh_out - (old_e + keep)) * 0.6)
            vs = vs + t['dur'] + GAP
        vend = vs - GAP
        if k == len(OLD) - 1:                                                  # the question, then back to the cover pose (loop)
            L = max(vend + 0.5, anchors[-1][0] + 0.8)
            anchors.append((L, LOGO_OLD))
            B = L + LOGO_HOLD
            anchors.append((B, b))
        else:
            need = max(need, vend + TAIL + wh_out - A)
            B = A + max(b - a, need)
            anchors.append((B - wh_out, b - wh_out))
        secs.append([round(A, 3), round(B, 3)])
        A = B
    for lid, sec, text, ev in SCRIPT:
        t, at = takes[lid], starts[lid]
        place.append({'id': lid, 'at': round(at, 3), 'file': f'out/vo/{lid}.wav', 'dur': round(t['dur'], 3)})
        if lid in NO_CAPTION: continue
        for g in cards(t['words']):
            caps.append([round(at + t['on'][g[0]] - 0.12, 3), round(at + t['off'][g[-1]] + 0.35, 3),
                         ' '.join(t['words'][i] for i in g), [round(at + t['on'][i], 3) for i in g]])
    # cards back to back stay up; none crosses a section cut or the next card
    cuts = [s[1] - CUT[i + 1] - 0.02 for i, s in enumerate(secs[:-1])] + [secs[-1][1]]
    for i, c in enumerate(caps):
        nxt = caps[i + 1][0] if i + 1 < len(caps) else 1e9
        cut = min(x for x in cuts if x > c[0])
        c[1] = round(min(cut, nxt), 3)                                         # a card stays up to the next card or the cut
    for p, c in zip(caps, caps[1:]):                                           # back to back: swap just before the first word
        if p[1] == c[0]: c[0] = p[1] = round(max(c[0], c[3][0] - 0.04), 3)
    anchors = sorted(set((round(n, 4), round(o, 4)) for n, o in anchors))
    for (n0, o0), (n1, o1) in zip(anchors, anchors[1:]):
        assert n1 > n0 and o1 >= o0, ('warp not monotonic', (n0, o0), (n1, o1))
    marks = {}
    for name, (lid, w, nth) in MARKS.items():
        t = takes[lid]; marks[name] = round(starts[lid] + t['on'][word_at(t, w, nth)], 3)
    DUR = round(round(A * 24) / 24, 4)
    tl = {'dur': DUR, 'warp': anchors, 'sections': secs, 'caps': caps, 'marks': marks,
          'voice': 'elevenlabs' if EL_KEY else 'kokoro'}
    json.dump(place, open(os.path.join(HERE, 'out', 'vo.json'), 'w'), indent=1)
    json.dump(tl, open(os.path.join(HERE, 'out', 'timeline.json'), 'w'), indent=1)
    with open(os.path.join(HERE, 'js', 'timeline.js'), 'w') as f:
        f.write('// GENERATED by vo.py: the film re-timed around the voiceover (seconds). warp = [new, old] anchors.\n')
        f.write('export const TL = ' + json.dumps(tl) + ';\n')
    for lid, sec, text, ev in SCRIPT:
        t = takes[lid]
        print(f"{lid:6s} sec {sec}  {starts[lid]:6.2f}–{starts[lid] + t['dur']:6.2f}  take {t['take']}  {len(t['words']) / t['dur']:.1f} w/s  "
              f"matched {t['matched']}/{len(t['words'])}  heard: {t['heard']}")
    print('sections', secs, 'dur', DUR)
    for c in caps: print(f'  card {c[0]:6.2f}–{c[1]:6.2f}  {c[2]}')
    print('marks', marks)


if __name__ == '__main__':
    main()
