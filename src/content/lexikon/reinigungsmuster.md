---
term: Reinigungsmuster
description: "Ob ein Saugroboter in Bahnen, in Zickzack oder zufällig fährt, entscheidet über Abdeckung und Dauer. Was die Muster unterscheidet."
short: Die Route, die ein Saugroboter abfährt. Geräte mit Karte fahren systematische Bahnen, einfache Modelle ein festes Muster oder Zufallswege.
aliases: [Reinigungsmuster, Fahrmuster, Bahnen, Zickzack, Reinigungsroute]
related: [lidar-navigation, gyroskop-navigation, vslam]
subs: [saugroboter-ohne-app, saugroboter-mit-absaugstation]
---

Wie ein Saugroboter durch den Raum fährt, hängt direkt davon ab, wie gut er weiß, wo er ist. Drei Varianten sind verbreitet.

## Systematische Bahnen

Geräte mit [LiDAR-Navigation](/lexikon/lidar-navigation/) oder [VSLAM](/lexikon/vslam/) kennen den Raum und fahren ihn in parallelen Bahnen ab, meist in Längsrichtung, dazu eine Runde an den Wänden entlang. Das ist die effizienteste Variante: volle Abdeckung bei kürzester Strecke, und schon gereinigte Flächen werden nicht erneut befahren.

Nach einem Zwischenladen setzt das Gerät dort fort, wo es aufgehört hat, siehe [Wiederaufnahme](/lexikon/wiederaufnahme/).

## Festes Muster ohne Karte

Geräte mit [Gyroskop-Navigation](/lexikon/gyroskop-navigation/) fahren ebenfalls Bahnen, wissen aber nicht, wo sie im Raum sind. Sie arbeiten ein Muster ab und beginnen bei jedem Durchgang neu. Auf kleiner Fläche ist das Ergebnis brauchbar, auf großer bleiben Bereiche aus, weil sich Messfehler über die Fahrzeit summieren.

## Zufallsfahrt

Die älteste und einfachste Variante: Das Gerät fährt geradeaus, bis es anstößt, dreht in einem beliebigen Winkel ab und fährt weiter. Über genug Zeit deckt das statistisch den Raum ab, dauert aber ein Vielfaches und lässt sich nicht nachvollziehen. In aktuellen Modellen kommt das kaum noch vor.

## Was das praktisch bedeutet

Die Abdeckung ist bei Bahnen zuverlässiger als bei Zufall, das ist der Hauptunterschied. Für die Reinigungsqualität an einer einzelnen Stelle spielt das Muster dagegen kaum eine Rolle, dort zählen Bürste und Saugleistung.

Beeinflussen lässt sich die Fahrtrichtung bei den meisten Geräten nicht. Das fällt vor allem auf Böden mit sichtbarer Struktur auf, etwa bei [Fliesen und Fugen](/situationen/fliesen-und-fugen/).
