# Cloudflare GitHub Integration Setup

## 🚀 Die einfachste Methode - Keine Secrets nötig!

### Schritt-für-Schritt Anleitung

### 1. Cloudflare Dashboard öffnen
Gehe zu: https://dash.cloudflare.com

### 2. Workers & Pages auswählen
- Klicke links auf "Workers & Pages"
- Wähle deinen "linkbase" Worker

### 3. GitHub Integration aktivieren
- Klicke auf den Tab "Deployments"
- Klicke auf "Connect to Git"
- Wähle "GitHub" aus

### 4. Repository auswählen
- Wähle "SchBenedikt/linkbase" aus deiner Repository-Liste
- Cloudflare fragt nach Berechtigungen - erlaube den Zugriff

### 5. Build-Konfiguration einstellen
- **Build command**: `npm run build:cloudflare`
- **Build output directory**: `.open-next`
- **Root directory**: `/` (leer lassen)

### 6. Environment Variables hinzufügen
Im selben Fenster unter "Environment variables":
```
GEMINI_API_KEY = AIzaSyASyfHbUSQBh-EVkTC4eqX8JpD_Km3fa8E
NEXT_PUBLIC_FIREBASE_API_KEY = AIzaSyCMJYTvIjtuDaiRyLKOyEf-lTcgD_n-SVY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = studio-1788933160-b748f.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID = studio-1788933160-b748f
NEXT_PUBLIC_FIREBASE_APP_ID = 1:732127475016:web:3e40e6b80866d9c91e6f7d
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 732127475016
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID = ""
NEXT_PUBLIC_SITE_URL = https://links.schächner.de
```

### 7. Deployment starten
- Klicke auf "Save and Deploy"
- Cloudflare wird automatisch dein Repository clonen, bauen und deployen

### 8. Automatische Deploys aktivieren
- Nach dem ersten erfolgreichen Deployment
- Aktiviere "Automatic deployments" 
- Jetzt wird jeder Push zum main Branch automatisch deployed!

## Vorteile dieser Methode

✅ **Keine GitHub Secrets nötig** - Alles direkt in Cloudflare konfiguriert
✅ **Einfach zu verwalten** - Alle Einstellungen an einem Ort
✅ **Sicher** - Cloudflare verwaltet die Keys direkt
✅ **Automatisch** - Jeder Push wird sofort deployed
✅ **Kein GitHub Actions Setup** - Weniger Komplexität

## Nach dem Setup

- Jeder Push zu `main` wird automatisch deployed
- Deployment-Status direkt im Cloudflare Dashboard sichtbar
- Keine manuellen Schritte mehr nötig
- Custom Domain kann direkt in Cloudflare konfiguriert werden

## Domain Konfiguration

Nachdem das Deployment funktioniert:
1. In Cloudflare Dashboard auf "Workers & Pages" → "linkbase"
2. Tab "Custom domains"
3. "Set up a custom domain" klicken
4. `links.schächner.de` eintragen
5. DNS-Einstellungen folgen (Cloudflare zeigt an, was zu tun ist)
