# Leonida Trophy Path

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/yihow1337/leonida-trophy-path/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/yihow1337/leonida-trophy-path/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline trophy guide and tracker for all 55 PlayStation 5 trophies of **Grand Theft Auto VI**.

- **Official list, exactly:** every trophy shows its official PlayStation name, description and grade (1 platinum, 2 gold, 6 silver, 46 bronze). The 28 trophies PlayStation hides until earned are marked as PSN secrets.
- **A cited guide per trophy:** what to do, where, and when it can be missed, written for this guide. Each one lists its sources (PowerPyx's trophy guide and sub-guides, Exophase, the official list) next to the text.
- **Roadmap to the platinum:** 9 stages in play order. It starts with a Chapter 1 safety pass, then the story by chapter and mission, character strands and the 8 strangers, activities (42 range golds, 14 drone sites, 20 races, 250 stunts), crime and money (9 gangs, 5 vaults, $250,000 laundered, $100,000 spent, 8 garages, 10 Scooter Bros cars), collectibles (52 areas, 18 meditations, 3 card sets, 100 WAiNK spots, 100 vehicles), one-off feats, the 100% checklist, and finally the platinum.
- **Missable flags, kept conservative:** only Positive Mental Attitude is flagged, because its first meditation exists only in Chapter 1. Two time-sensitive steps get a softer "watch" note.
- **Tracker:** a checklist saved in `localStorage`, export to a JSON file and import it back. Filter chips by kind (story, missable/watch, collectibles, activities, strands, crime, money, feats), grade chips and text search.
- **Spoiler setting:** *Show all*, *Hide story* (the default) or *Hide all secret*. Hidden trophies show their chapter only, with no name, description or guide, until you mark them earned. The setting is remembered.

No build step, no network: the trophy data is a JSON module import, fonts are local, and source links only open when you click them.

## Run it

```sh
node serve.ts            # serves app/ on http://localhost:8080
node serve.ts --port 8765
```

Open the printed local URL in Chrome. Deep links reproduce the screenshots, for example
`#open=28` (a guide), `#view=roadmap&spoilers=off`, `#kind=story&spoilers=story`.
An `earned=1,2,3` list in the hash previews progress without saving it.

`MAKEFUN_OUTPUT_DIR=out node main.ts` validates `app/data/trophies.json` (55 official trophies, cited guides, grade and
hidden counts, roadmap stages, no network URLs in app code) and writes the hand-in to `out/`.

---

<sub>Entered on [make.fun](https://make.fun/?ref=j5ka5y6n&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
