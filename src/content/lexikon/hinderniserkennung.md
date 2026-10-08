---
term: Hinderniserkennung
description: Hinderniserkennung soll verhindern, dass ein Saugroboter Kabel einzieht oder in Tierkot fährt. Welche Verfahren es gibt und wie verlässlich sie sind.
short: Sensorik, mit der ein Roboter Gegenstände auf dem Boden erkennt und umfährt.
aliases: [Objekterkennung, Hindernisvermeidung, AIVI, Obstacle Avoidance]
related: [vslam, no-go-zone, lidar-navigation]
subs: [saugroboter-mit-absaugstation, saugroboter-ohne-kamera]
---

Ein LiDAR sieht nur auf seiner Scanhöhe, also ein paar Zentimeter über dem Boden. Alles, was flacher ist, bemerkt er nicht: Ladekabel, Socken, Spielzeug, Haufen vom Haustier. Für diese Dinge braucht es eine zweite Sensorik nach vorn.

## Die gängigen Verfahren

**Kamera mit Objekterkennung** fotografiert den Bereich vor dem Gerät und vergleicht ihn mit antrainierten Mustern. Das erkennt Kabel und Schuhe recht gut, braucht aber Licht und bedeutet eine Kamera in der Wohnung.

**Strukturiertes Licht oder Linienlaser** projiziert ein Muster nach vorn und misst dessen Verformung. Das funktioniert auch im Dunkeln und ohne Bildaufnahme.

**3D-Sensoren und Ultraschall** ergänzen beides, vor allem bei durchsichtigen oder spiegelnden Flächen.

## Wie gut das funktioniert

Deutlich besser als vor einigen Jahren, aber nicht perfekt. Dünne, dunkle Kabel auf dunklem Boden bleiben schwierig, und niedrige Gegenstände unter der Sensorhöhe werden überfahren. Die ehrlichste Vorbereitung ist weiterhin, vor dem ersten Lauf einmal aufzuräumen. Wer Tiere hat, sollte auf die ausdrücklich beworbene Erkennung von Hinterlassenschaften achten, denn ein einziger Vorfall kostet mehr Zeit als eine Woche manuelles Saugen.
