# Saugradar

Vergleichsseite fuer Saugroboter und Saug-Wisch-Roboter. Statische Astro-Seite,
Produktdaten kommen bei jedem Build frisch aus der Amazon Creators API.

## Grundregeln

- Produktdaten nur aus der API, niemals im Code gepflegt
- Preise mit Zeitstempel, aelter als 24 Stunden werden ausgeblendet
- Merkmale werden aus Titel und Produktmerkmalen gelesen, was nicht eindeutig
  dasteht, bleibt "k. A." und wird nie geraten
- Keine erfundenen Tests, Testsieger, Studien oder Bewertungen
- Jeder Amazon-Link mit rel="sponsored nofollow noopener" und sichtbarem
  Hinweis "Anzeige"
- Keine Secrets im Code, vor jedem Push laeuft `npm run build` fehlerfrei

## Befehle

```
npm install
npm run dev       # lokale Entwicklung
npm run live      # Produktdaten von Amazon holen
npm run discover  # neue ASINs suchen
npm run build     # Produktionsbuild
```

## Deployment

GitHub Actions baut bei jedem Push und zusaetzlich alle 6 Stunden, das Ergebnis
geht per Wrangler auf Cloudflare Pages.
