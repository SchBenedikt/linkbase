# GitHub Secrets Configuration Template

Du musst diese Secrets in deinem GitHub Repository unter Settings > Secrets and variables > Actions hinzufügen:

## Required Secrets

### Cloudflare Configuration
- `CLOUDFLARE_API_TOKEN`: Dein Cloudflare API Token mit Workers Rechten
- `CLOUDFLARE_ACCOUNT_ID`: Deine Cloudflare Account ID

### Firebase Configuration
- `NEXT_PUBLIC_FIREBASE_API_KEY`: AIzaSyCMJYTvIjtuDaiRyLKOyEf-lTcgD_n-SVY
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: studio-1788933160-b748f.firebaseapp.com
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: studio-1788933160-b748f
- `NEXT_PUBLIC_FIREBASE_APP_ID`: 1:732127475016:web:3e40e6b80866d9c91e6f7d
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`: 732127475016
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`: ""

### API Keys
- `GEMINI_API_KEY`: AIzaSyASyfHbUSQBh-EVkTC4eqX8JpD_Km3fa8E

### Site Configuration
- `NEXT_PUBLIC_SITE_URL`: https://links.schächner.de

## How to Get Cloudflare API Token

1. Gehe zu https://dash.cloudflare.com/profile/api-tokens
2. Klicke auf "Create Token"
3. Wähle "Custom token"
4. Gib dem Token folgende Permissions:
   - Account: Cloudflare Workers:Edit
   - Zone: Zone:Read
   - Zone Resources: Include All zones
5. Setze TTL auf "Custom" und wähle ein angemessenes Zeitlimit
6. Kopiere den generierten Token

## How to Get Cloudflare Account ID

1. Gehe zu https://dash.cloudflare.com
2. Klicke rechts unten auf dein Profil
3. Deine Account ID wird angezeigt

## Nach der Konfiguration

Sobald alle Secrets hinzugefügt wurden, wird jeder Push zum main Branch automatisch deployed!
