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
server.js                    Webserver und API
backend/products.json        Produktdaten
styles/                      CSS (shared/ und pages/)
images/                      Logos, Icons, Produkt- und Bewertungsbilder
tests/                       Jasmine-Tests (tests.html)
```

## Starten

Voraussetzung: [Node.js](https://nodejs.org) (getestet mit Version 24). Es müssen keine Pakete installiert werden.

```bash
npm start
```

Anschließend `http://localhost:3000/amazon.html` öffnen. Über die Umgebungsvariable `PORT` lässt sich ein anderer Port wählen.

Der Server liefert die Seiten **und** die API aus. Ein reiner Dateiserver (z. B. Live Server oder `python -m http.server`) reicht nicht mehr, weil dann die `/api`-Endpunkte fehlen.

## Tests

Die Tests laufen im Browser. Mit laufendem Server `http://localhost:3000/tests/tests.html` öffnen. Getestet werden u. a. Währungsformatierung, Warenkorb-Funktionen und die Checkout-Bestellübersicht.

## Backend

Das Projekt bringt ein eigenes kleines Backend mit ([server.js](server.js), ohne Abhängigkeiten):

| Endpoint | Beschreibung |
| --- | --- |
| `GET /api/products` | Alle Produkte (aus `backend/products.json`) |
| `POST /api/orders` | Legt eine Bestellung an. Body: `{"cart": [{"productId", "quantity", "deliveryOptionId"}]}`. Der Server prüft Produkt, Menge und Lieferoption und berechnet die geschätzte Lieferzeit. |
| `GET /api/orders` | Alle gespeicherten Bestellungen (in `backend/orders.json`, nicht im Repo) |

Weiterhin extern eingebunden sind `dayjs` und ein Hilfsmodul von `unpkg.com` (in `scripts/checkout/orderSummary.js`), dafür ist eine Internetverbindung nötig.
