# koumakyou_public

Public side of Koumakyou-rs, a Rust reimplementation of Touhou 6 ~ the Embodiment of Scarlet Devil v1.02h:
the built web page (`site/`, published by GitHub Pages at https://koumakyou.celeste.gg) and the release assets.

No game data is stored in this repository. `game.bin`, `game.meta.json` and `start.pack.json` are release assets
of the latest release; the Pages workflow copies them next to the page when it publishes.

## Build game.bin from your own copy

The source repository builds `game.bin` with `koumakyou-pack` from the install folder of your own v1.02h copy
(the six `.DAT` archives, `bgm/th06_NN.wav` and the executable):

```
KOUMAKYOU_TH06_DIR="/path/to/th06" cargo run --release -p koumakyou-pack -- --out out/release/pack
```

## Run

- Native: put `game.bin` beside the `koumakyou` executable from the release (or set `KOUMAKYOU_PACK`), then run it.
- Web: open the page; it downloads `game.bin`, checks it against `game.meta.json` and keeps nothing but your saves
  in the browser. Without a published `game.bin` it asks for the DAT files and `bgm/*.wav` of your own copy.
