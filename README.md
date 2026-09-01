# RouteDraw 🚴

Zeichne Fahrradrouten direkt auf einer interaktiven Karte und exportiere sie als GPX-Datei – zum Import in Strava, Komoot, Garmin Connect und andere Tools.

## Features

- 🗺️ Route per Klick/Zeichnen direkt auf der Karte erstellen
- 📍 Wegpunkte hinzufügen, verschieben und löschen
- 📏 Live-Anzeige von Distanz (und optional Höhenprofil)
- 📤 Export als GPX-Datei
- 🔄 Kompatibel mit Strava, Komoot, Garmin Connect u. a.

## Screenshot

<!-- Füge hier einen Screenshot der App ein -->

## Tech Stack

- HTML / CSS / JavaScript
- Kartenbibliothek: [Leaflet](https://leafletjs.com/) 
- GPX-Generierung: [togpx](https://github.com/tyrasd/togpx) 

## Installation

```bash
git clone https://github.com/RobiWanKenobi194/routedraw.git
cd routedraw
npm install
npm start
```

## Nutzung

1. App öffnen
2. Auf der Karte per Klick die gewünschte Route zeichnen
3. Optional: Wegpunkte nachträglich anpassen
4. Auf **„Als GPX exportieren"** klicken
5. Generierte `.gpx`-Datei in Strava, Komoot o. ä. importieren

6. Bis zu 5 Routen vorab speichern, bevor export

## Roadmap

- [ ] Höhenprofil anzeigen
- [✅] Routen speichern/laden
- [ ] Mehrere Kartenanbieter zur Auswahl
- [ ] Mobile-optimierte Ansicht

## Beitrag

Dies ist ein privates Projekt, aktuell keine externen Beiträge
