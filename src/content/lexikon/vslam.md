---
term: vSLAM
description: vSLAM ist die kamerabasierte Navigation von Saugrobotern. Wie sich das Verfahren von LiDAR unterscheidet und worauf du bei Kameras in der Wohnung achten solltest.
short: Navigation über eine nach oben oder vorn gerichtete Kamera, die sich an Merkmalen im Raum orientiert.
aliases: [Kameranavigation, visuelle Navigation]
related: [lidar-navigation, hinderniserkennung]
subs: [saugroboter-ohne-kamera]
---

vSLAM steht für visual Simultaneous Localization and Mapping. Der Roboter filmt die Decke oder den Raum vor sich und merkt sich markante Punkte, etwa eine Lampe oder eine Türkante. Aus der Verschiebung dieser Punkte berechnet er, wie weit er sich bewegt hat, und baut daraus eine Karte.

## Unterschied zu LiDAR

Eine Kamera braucht Licht. Bei vSLAM-Geräten leidet die Orientierung in abgedunkelten Räumen, manche Modelle schalten dann auf ein einfacheres Fahrmuster um oder lassen ein kleines Licht mitlaufen. Dafür kommt eine Kamera ohne den Aufbau aus, den ein Laserturm braucht, und das Gerät bleibt flacher.

In der Praxis kombinieren viele Hersteller heute beides: LiDAR für die Karte, Kamera für das Erkennen von Gegenständen auf dem Boden.

## Kamera in der Wohnung

Wer keine Kamera im Wohnzimmer möchte, findet das in den Produktangaben nicht immer deutlich. Hersteller werben mit der Funktion, nicht mit ihrem Fehlen. Geräte ohne Kamera erkennst du meist daran, dass sie als LiDAR- oder Gyro-Modell beschrieben werden und keine Fernüberwachung oder Haustierkamera anbieten.
