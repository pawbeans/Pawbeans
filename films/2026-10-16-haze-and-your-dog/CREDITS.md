# Credits: Inside Your Dog: What the haze does to your dog

Engine, fonts, paper and Miya: see the repo `CREDITS.md`. All artwork drawn in code for this film. BEANS wordmark:
`assets/brand/logo/beans-wordmark-navy.png` (owner-supplied), end card only. The Rabbit treats pouch is redrawn in the
cel style (no logo on it).

## On-screen facts and sources (checked by web search 2026-10-16, 22:50–23:00 SGT)

| Line | Source |
|---|---|
| The haze in Singapore just hit very unhealthy levels (PSI 200+) | NEA readings as reported 15–16 Oct 2026: western 24-hour PSI 212 at noon on 15 Oct (The Online Citizen, https://news.theonlinecitizen.com/2026/10/15/singapore-haze-worsens-as-western-24-hour-psi-hits-very-unhealthy-level-of-212-at-noon-on-15-october); central 203 at 00:00 on 16 Oct (hazenow.app). **Check haze.gov.sg on the posting day; drop "just" or the PSI sticker if the haze has cleared.** |
| The worst of it is tiny: it slips past the nose, deep into the lungs (PM2.5) | US EPA, "Particulate Matter (PM) Basics" (fine particles, 2.5 µm and smaller, can get deep into the lungs): https://www.epa.gov/pm-pollution/particulate-matter-pm-basics. *Human figure applied to dogs; the build should read the EPA page in full.* |
| Signs: watery eyes, sneezing or a runny nose, coughing or gagging, fast or noisy breathing, tired, off their food | AVMA, "Wildfire smoke and animals" (coughing or gagging, laboured or noisy breathing, eye irritation, nasal discharge, faster breathing, fatigue, reduced appetite), via Oregon State University Extension, "How to protect pets and livestock from wildfire smoke": https://extension.oregonstate.edu/node/154356 |
| Flat-faced breeds, older dogs, and dogs with heart or lung problems feel it most | AVMA (animals with heart or lung disease especially at risk); Sydney vets and RSPCA NSW on bushfire haze ("older pets or squishy-nosed breeds… and those with pre-existing medical conditions"): https://www.theleader.com.au/story/6529969/keep-pets-inside-amid-sydney-haze-vets/ |
| Keep walks short, just a quick toilet trip | AVMA (limit outdoor time to brief bathroom breaks; avoid intense exercise); RSPCA NSW (avoid big walks until the smoke clears) |
| Keep the water bowl full | General care advice (fresh water always available); no specific claim |
| Shut the windows, run the aircon or a purifier | AVMA (keep pets indoors with windows closed); Sydney vets ("running air-conditioning to filter the air") |
| Struggling to breathe? Call your vet straight away | AVMA (consult your veterinarian if any signs appear after smoke exposure) |
| Sniffing games keep their brain busy | AKC, scent work / nose games as mental stimulation (https://www.akc.org/sports/akc-scent-work/). *Light claim; read at build.* |
| Our single-ingredient treats break into tiny pieces. Nothing added, nothing hidden. | BEANS brand copy (beans.sg: single-ingredient freeze-dried treats; "Nothing added. Nothing hidden.") |

## Sound
- Voiceover: **Kokoro-82M (Apache-2.0), local**, because this session has no `ELEVENLABS_API_KEY`. Re-voice with
  ElevenLabs "Jessica" (`ELEVENLABS_API_KEY=… python vo.py`) before the render if the key is available; captions and
  timing re-cut automatically. Word timing by faster-whisper (MIT) with Whisper small.en (OpenAI, MIT).
- Music: an original instrumental made for this film in `audio.py` with mgaudio (mg-styles-15, MIT): nylon guitar and
  pizzicato synthesised, harp from VCSL samples (CC0). G major, fingerpicked, resolving on the window slam.
- Sound effects synthesised with mgaudio.
