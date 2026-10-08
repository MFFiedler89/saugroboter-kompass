---
term: Gyroskop-Navigation
description: "Gyroskop-Navigation führt Saugroboter ohne Karte in Bahnen durch den Raum. Was die Technik leistet, wo sie an Grenzen kommt und für wen sie reicht."
short: Orientierung über Lagesensoren statt über eine gespeicherte Karte. Der Roboter fährt Bahnen, erkennt Räume aber nicht wieder.
aliases: [Gyroskop-Navigation, Gyroskop, Gyro-Navigation, Gyrosensor]
related: [lidar-navigation, vslam, no-go-zone]
subs: [saugroboter-ohne-app, saugroboter-ohne-kamera]
---

Ein Gyroskop misst Drehung und Lage des Geräts. Damit weiß der Roboter, wie weit er geradeaus gefahren ist und um wie viel Grad er sich gedreht hat. Daraus entsteht kein Bild des Raums, aber genug Information, um systematische Bahnen zu fahren statt zufällig umherzuirren.

## Der Unterschied zur Kartierung

Ein Gerät mit [LiDAR-Navigation](/lexikon/lidar-navigation/) oder [VSLAM](/lexikon/vslam/) misst seine Umgebung und speichert sie. Beim nächsten Durchgang weiß es, wo es ist, welcher Raum das ist und was es beim letzten Mal schon gemacht hat.

Ein Gyroskop-Gerät weiß das nicht. Es beginnt jeden Durchgang bei null und arbeitet die Fläche nach einem Muster ab, bis der Akku endet oder es die Station sucht. Räume lassen sich nicht einzeln anwählen, und eine [No-Go-Zone](/lexikon/no-go-zone/) in der App gibt es nicht, weil es keine Karte gibt, in die man sie eintragen könnte.

## Wo die Technik ungenau wird

Gyroskope driften. Kleine Messfehler summieren sich über die Fahrzeit, und nach einiger Zeit stimmt die angenommene Position nicht mehr mit der tatsächlichen überein. Auf kleiner Fläche fällt das kaum auf, auf großer schon. Rutschende Räder auf Teppich und häufiges Ausweichen verstärken den Effekt.

Deshalb sind diese Geräte für überschaubare Wohnungen gemacht. Je größer und verwinkelter die Fläche, desto eher bleiben Bereiche aus.

## Für wen das reicht

Für kleine Wohnungen mit wenigen Räumen, für Haushalte, die bewusst kein Gerät mit App und WLAN wollen, und als günstiger Einstieg. Was dabei wegfällt, sind Raumauswahl, Zeitpläne pro Raum, Sperrzonen und die Kartenansicht.

Wer mehrere Etagen oder eine große Fläche hat, ist mit kartierender Navigation deutlich besser bedient.
