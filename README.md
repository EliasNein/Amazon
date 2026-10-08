# Amazon Project

Ein Amazon-Shop-Klon als Lernprojekt, gebaut mit reinem HTML, CSS und JavaScript (ES-Module) – ohne Framework und ohne Build-Schritt.

## Features

- **Produktübersicht** (`amazon.html`): Produkte werden dynamisch gerendert, inkl. Bewertungssternen, Preis, Mengenauswahl und „Add to Cart“.
- **Warenkorb**: Wird im `localStorage` gespeichert und bleibt über Seitenaufrufe hinweg erhalten.
- **Checkout** (`checkout.html`): Bestellübersicht mit Mengen- und Lieferoptionen (7 Tage kostenlos, 3 Tage für $4.99, 1 Tag für $9.99) sowie Zahlungsübersicht.
- **Bestellungen** (`orders.html`) und **Tracking** (`tracking.html`).
- **Produktklassen**: `Product` und `Clothing` (mit Größentabelle) per Vererbung.
- **Unit-Tests** mit Jasmine.

## Projektstruktur

```
amazon.html, checkout.html,
orders.html, tracking.html   Seiten
scripts/                     Seitenlogik (amazon.js, checkout.js, checkout/, utils/)
data/                        Produkte, Warenkorb, Lieferoptionen, Bestellungen
backend/products.json        Lokale Produktdaten
styles/                      CSS (shared/ und pages/)
images/                      Logos, Icons, Produkt- und Bewertungsbilder
tests/                       Jasmine-Tests (tests.html)
```

## Starten

Da ES-Module verwendet werden, funktioniert das Projekt **nicht** per Doppelklick (`file://`), sondern muss über einen lokalen Webserver ausgeliefert werden, z. B.:

```bash
# VS Code: Erweiterung „Live Server“ → Rechtsklick auf amazon.html → „Open with Live Server“

# oder mit Python
python -m http.server 8000

# oder mit Node
npx serve
```

Anschließend `http://localhost:8000/amazon.html` öffnen.

## Tests

Die Tests laufen im Browser. Mit laufendem Webserver `tests/tests.html` öffnen. Getestet werden u. a. Währungsformatierung, Warenkorb-Funktionen und die Checkout-Bestellübersicht.

## Backend / externe Abhängigkeiten

Das Projekt hat kein eigenes Backend. Produkte und Bestellungen werden über die API von `https://supersimplebackend.dev` geladen bzw. gesendet; zusätzlich werden `dayjs` und weitere Hilfsmodule von `unpkg.com` eingebunden. Eine Internetverbindung ist daher erforderlich.
