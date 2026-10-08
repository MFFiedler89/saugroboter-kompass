---
term: LiDAR-Navigation
description: LiDAR ist ein rotierender Laserscanner, mit dem Saugroboter die Wohnung vermessen und eine Karte anlegen. Wie das Verfahren arbeitet und wo seine Grenzen liegen.
short: Rotierender Laserscanner auf dem Roboter, der Abstände misst und daraus eine Karte der Wohnung baut.
aliases: [LiDAR, Laser-Navigation, LDS]
related: [vslam, no-go-zone, bauhoehe]
subs: [saugroboter-mit-absaugstation, saugroboter-ohne-kamera]
---

LiDAR steht für Light Detection and Ranging. Ein kleiner Laser dreht sich mehrmals pro Sekunde und misst, wie lange das Licht bis zur nächsten Wand und zurück braucht. Daraus entsteht ein Grundriss, in dem der Roboter seine eigene Position kennt. Das ist der Grund, warum ein Gerät mit LiDAR in geraden Bahnen fährt statt zufällig durch den Raum zu stoßen.

## Was das im Alltag bedeutet

Ein Roboter mit Karte weiß, wo er schon war. Er arbeitet die Fläche systematisch ab, findet zurück zur Station und kann nach dem Laden an der Abbruchstelle weitermachen. Außerdem lassen sich in der App einzelne Räume auswählen und Sperrflächen einzeichnen.

LiDAR funktioniert im Dunkeln genauso gut wie bei Tageslicht, weil der Laser sein eigenes Licht mitbringt. Das ist der praktische Vorteil gegenüber rein kamerabasierten Verfahren.

## Die Grenzen

Der Laserturm sitzt meist als kleiner Aufbau oben auf dem Gerät und macht es um rund zwei Zentimeter höher. Genau diese Zentimeter entscheiden darüber, ob der Roboter noch unter das Sofa kommt. Flache Geräte ohne Turm navigieren deshalb anders, oft über Kamera oder Gyroskop.

Außerdem sieht ein LiDAR nur auf seiner Scanhöhe. Was darunter liegt, etwa ein Kabel oder ein Socken, erkennt er nicht. Dafür braucht es eine zusätzliche Hinderniserkennung.
