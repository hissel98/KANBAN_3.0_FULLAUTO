# Mobile Setup

Diese App nutzt Capacitor, um die bestehende Next.js Kanban-Web-App als Android-App zu verpacken.

## Installierte Pakete

Installiert wurden:

```bash
npm install --save-dev @capacitor/core @capacitor/cli
npm install --save-dev @capacitor/android
```

`@capacitor/android` ist erforderlich, damit `npx cap add android` das native Android-Projekt erzeugen und `npx cap sync` die Android-Plattform aktualisieren kann.

## Capacitor-Konfiguration

Die zentrale Konfiguration liegt in `capacitor.config.ts`:

```ts
appId: 'com.dasistmeinetest.kanban'
appName: 'Kanban Board'
webDir: '.next/standalone'
server.url: 'https://www.dasistmeinetest.space/'
bundledWebRuntime: false
```

Wichtig: Die Android-App lädt die produktive Web-App live über `https://www.dasistmeinetest.space/`. Die lokalen Assets aus `.next/standalone` dienen nur als Capacitor-Web-Verzeichnis für die Projektstruktur.

## Next.js Build-Modus

Die Web-App bleibt auf `output: 'standalone'`.

Es wird kein `output: 'export'` verwendet. Die bestehende Vercel-Web-App darf dadurch unverändert weiterlaufen.

## Android-Projekt

Das Android-Projekt wurde mit folgendem Befehl erstellt:

```bash
npx cap add android
```

Der native Code liegt unter `android/`.

Die App-Namen stehen in `android/app/src/main/res/values/strings.xml`:

```xml
<string name="app_name">Kanban Board</string>
<string name="title_activity_main">Kanban Board</string>
```

## Auth Deep Links

Für Supabase Auth sind in `android/app/src/main/AndroidManifest.xml` Intent-Filter auf der `MainActivity` konfiguriert.

Unterstützte Callback-URLs:

```text
com.dasistmeinetest.kanban://auth/callback
https://www.dasistmeinetest.space/auth/callback
http://www.dasistmeinetest.space/auth/callback
```

Zusätzlich enthält `capacitor.config.ts`:

```ts
plugins: {
  DeepLinks: {
    schemes: ['com.dasistmeinetest.kanban', 'https', 'http'],
  },
}
```

In Supabase sollten diese Redirect-URLs entsprechend erlaubt sein.

## Sync und Build

Nach Änderungen an Capacitor oder am Web-Build:

```bash
npm run build
npx cap sync
```

Android Studio kann anschließend mit dem Projektordner `android/` geöffnet werden.

Ein Android-Build wurde hier bewusst nicht ausgeführt, weil dafür eine lokale Java/Android-SDK-Konfiguration wie `JAVA_HOME` benötigt wird.

Typische Build-Befehle, wenn Java und Android SDK korrekt eingerichtet sind:

```bash
cd android
./gradlew assembleDebug
```

oder für Release-Builds:

```bash
cd android
./gradlew assembleRelease
```

## Gitignore

Folgende Android-Build-Ordner werden ignoriert:

```text
/android/build/
/android/app/build/
```
