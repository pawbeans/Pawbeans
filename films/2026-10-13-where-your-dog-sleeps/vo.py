"""Dog Decoded: Where your dog sleeps, VOICEOVER + TIMELINE (owner, 2026-10-14).

The film is built voice first (owner: the voice must sound like a person talking to you, and the captions are exactly
what she says). Each section is one natural take. The picture is then re-timed around the voice: every section is
as long as its take needs, the key animation moments land on the words that name them (the head pops out on
"Tucked", she shuffles back on "back", the knock on "That's"), and fast action (whips, the dive, the punch-in, the
knock, the shuffle) keeps its real speed. Captions are cut from the take and every word builds in as it is spoken.

Voice: ElevenLabs (ELEVENLABS_API_KEY; never commit it), voice "Jessica – Playful, Bright, Warm" unless BEANS_VO_VOICE
names another voice id; local Kokoro-82M without a key. A take is redone (new seed) if the words heard don't match the
script; takes are cached in out/vo/raw/ by model, voice, settings, seed and text, so re-runs spend no credits.
Alignment: faster-whisper. Needs a Python with `soundfile faster-whisper` (+ `kokoro-onnx` for the fallback):
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
# eleven_multilingual_v2 by default: natural, steady pace. eleven_v3 is more expressive (audio tags) but slower.
EL_MODEL = os.environ.get('BEANS_VO_MODEL', 'eleven_multilingual_v2')
EL_SETTINGS = {'eleven_v3': {'stability': 0.5},
               'eleven_multilingual_v2': {'stability': 0.4, 'similarity_boost': 0.8, 'style': 0.4, 'use_speaker_boost': True, 'speed': 1.0}}
EL_TRIES = 4
KOKORO_MIX, KOKORO_SPEED = (('af_heart', 0.6), ('af_bella', 0.4)), 0.95

# ------------------------------------------------------------------ the script (spoken = shown; ** = emphasised word)
# id, section, text, picture moment to land on a word: (old time, keep-speed duration, word, offset from its onset)
SCRIPT = [
    ('hook', 0, 'Where your dog sleeps says a lot about how they feel about you.', None),
    ('intro', 0, 'Here are six spots, and the last one\'s the **sweetest.**', None),
    ('s1', 1, 'First, on your bed. That usually means you\'re **family.** Puppies sleep in a pile to feel safe.', (6.1, 0.35, 'family', -0.05)),
    ('s2', 2, 'At the foot of the bed? They want to be close to you, but still keep an eye on **the room.**', (10.0, 0.0, 'but', 0.0)),
    ('s3', 3, 'Sleeping by the door? That\'s **guard duty.** They\'re looking out for you.', (13.8, 0.8, "that's", -0.1)),
    ('s4', 4, 'Curled up on your clothes? Your **smell** comforts them, especially when you\'re out.', (18.0, 0.0, 'comforts', 0.0)),
    ('s5', 5, 'If they sleep with their back against you, it\'s a sign of **trust.** They\'ve got your back.', (21.6, 0.4, 'back', -0.1)),
    ('s6', 6, 'And the sweetest one? Tucked right up against you. It means you\'re their **safe place.**', (24.3, 1.15, 'tucked', -0.96)),
    ('q', 7, 'Where does yours sleep? Tell us in the comments.', None),
]
HEADLINE_WORDS = 7   # "Where your dog sleeps says a lot" is the cover headline; the rest of the hook is a caption
# the picture as it was built (old seconds): section bounds; fast moves kept at real speed
OLD = [(0.0, 4.0), (4.0, 8.0), (8.0, 12.0), (12.0, 16.0), (16.0, 20.0), (20.0, 24.0), (24.0, 28.8), (28.8, 32.5)]
WH = 0.125           # whip pans: ±WH round each section cut, real speed
LEAD, TAIL = 0.35, 0.45   # voice starts after the whip and the label pop; a breath before the next whip


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
    segs, _ = asr.transcribe(path, word_timestamps=True, language='en')
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
    for lid, sec, text, ev in SCRIPT:
        shown = text.split(' ')
        seed0 = int(hashlib.sha1(lid.encode()).hexdigest()[:6], 16)
        path = os.path.join(OUT, f'{lid}.wav')
        for n in range(EL_TRIES if EL_KEY else 1):
            y, sr = take(lid, plain(text), seed0 + n)
            y = trim(y, sr); sf.write(path, y, sr)
            heard = words_of(asr, path)
            if [norm(w) for _, _, w in heard] == [norm(plain(w)) for w in shown]: break
        on, off, nk = align([plain(w) for w in shown], heard)
        takes[lid] = dict(sec=sec, text=text, words=shown, on=on, off=off, dur=len(y) / sr, take=n + 1, matched=nk,
                          heard=' '.join(w for _, _, w in heard))

    # ---------------------------------------------------------- the time warp: anchors (new s, old s), section by section
    anchors, place, caps, secs = [(0.0, 0.0)], [], [], []
    A = 0.0
    def word_at(t, w, nth=0):
        hits = [i for i, x in enumerate(t['words']) if norm(plain(x)) == norm(w)]
        return hits[nth]
    for k, (a, b) in enumerate(OLD):
        lines = [(lid, takes[lid], ev) for lid, sec, _, ev in SCRIPT if sec == k]
        if k > 0: anchors += [(A, a), (A + WH, a + WH)]
        if k == 1: anchors.append((A + 0.25, a + 0.25))                     # the punch-in, on 1s
        if k == 0:
            hook, intro = takes['hook'], takes['intro']
            vs_h = 0.05
            about = vs_h + hook['on'][HEADLINE_WORDS]
            anchors += [(about - 0.32, 2.0), (about - 0.12, 2.2)]            # the headline pops out just before her "about" card
            vs_i = vs_h + hook['dur'] + 0.3
            starts = {'hook': vs_h, 'intro': vs_i}
            need = vs_i + intro['dur'] + TAIL
        elif k == 7:                                                            # the question card, the yawn, the loop
            t = takes['q']; card = A + 0.2; vs = card + 0.12
            starts = {'q': vs}
            anchors.append((card, 29.0))
            yawn = max(vs + t['dur'] + 0.25, card + 1.6)
            anchors += [(yawn, 31.2)]
            need = yawn + (b - 31.2) - A
        else:
            lid, t, ev = lines[0]
            vs = A + LEAD; starts = {lid: vs}
            need = LEAD + t['dur'] + TAIL
            if ev:
                old_e, keep, w, dt = ev
                E = vs + t['on'][word_at(t, w)] + dt
                prev = anchors[-1]
                E = max(E, prev[0] + (old_e - prev[1]) * 0.6)                  # never faster than 1.67× into it
                anchors.append((E, old_e))
                if keep: anchors.append((E + keep, old_e + keep))
                need = max(need, E + keep - A + (b - WH - (old_e + keep)) * 0.6)
        B = A + max(b - a, need + (WH if k < 7 else 0))
        if k < 7: anchors.append((B - WH, b - WH))
        else: anchors.append((B, b))
        secs.append([round(A, 3), round(B, 3)])
        # voice placement + caption cards (in new seconds)
        for lid, at in starts.items():
            t = takes[lid]
            place.append({'id': lid, 'at': round(at, 3), 'file': f'out/vo/{lid}.wav', 'dur': round(t['dur'], 3)})
            if lid == 'q': continue                                            # the question card is the text
            idx = list(range(len(t['words'])))
            if lid == 'hook': idx = idx[HEADLINE_WORDS:]
            groups = cards([t['words'][i] for i in idx])
            for g in groups:
                ii = [idx[j] for j in g]
                txt = ' '.join(t['words'][i] for i in ii)
                if lid == 'hook': txt = '...' + txt
                caps.append([round(at + t['on'][ii[0]] - 0.12, 3), round(at + t['off'][ii[-1]] + 0.35, 3), txt,
                             [round(at + t['on'][i], 3) for i in ii]])
        A = B
    # cards back to back stay up; none crosses a whip or the next card
    cuts = [s[1] - WH - 0.02 for s in secs]
    for i, c in enumerate(caps):
        nxt = caps[i + 1][0] if i + 1 < len(caps) else 1e9
        cut = min(x for x in cuts if x > c[0])
        c[1] = round(min(cut, nxt if nxt - c[1] < 0.6 else c[1]), 3)
        if c[1] > nxt: c[1] = nxt
    anchors = sorted(set((round(n, 4), round(o, 4)) for n, o in anchors))
    for (n0, o0), (n1, o1) in zip(anchors, anchors[1:]):
        assert n1 > n0 and o1 >= o0, ('warp not monotonic', (n0, o0), (n1, o1))
    DUR = round(round(A * 24) / 24, 4)
    tl = {'dur': DUR, 'warp': anchors, 'sections': secs, 'caps': caps, 'tell': [p['at'] for p in place if p['id'] == 'q'][0]
          + takes['q']['on'][word_at(takes['q'], 'tell')]}
    json.dump(place, open(os.path.join(HERE, 'out', 'vo.json'), 'w'), indent=1)
    json.dump(tl, open(os.path.join(HERE, 'out', 'timeline.json'), 'w'), indent=1)
    with open(os.path.join(HERE, 'js', 'timeline.js'), 'w') as f:
        f.write('// GENERATED by vo.py: the film re-timed around the voiceover (seconds). warp = [new, old] anchors.\n')
        f.write('export const TL = ' + json.dumps(tl) + ';\n')
    for lid, sec, text, ev in SCRIPT:
        t = takes[lid]; at = [p['at'] for p in place if p['id'] == lid][0]
        print(f"{lid:5s} sec {sec}  {at:6.2f}–{at + t['dur']:6.2f}  take {t['take']}  {len(t['words']) / t['dur']:.1f} w/s  "
              f"matched {t['matched']}/{len(t['words'])}  heard: {t['heard']}")
    print('sections', secs, 'dur', DUR)
    for c in caps: print(f'  card {c[0]:6.2f}–{c[1]:6.2f}  {c[2]}')


if __name__ == '__main__':
    main()
