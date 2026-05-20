# Android Release Build

Diese Anleitung beschreibt den Release-Prozess fuer die Capacitor-Android-App `Kanban Board`.

## 1. Projekt in Android Studio oeffnen

1. Android Studio starten.
2. `File > Open` waehlen.
3. Den Ordner `android/` in diesem Repository oeffnen.
4. Warten, bis Android Studio das Projekt geladen hat.

## 2. Gradle Sync ausfuehren

1. In Android Studio `File > Sync Project with Gradle Files` ausfuehren.
2. Falls Android Studio fehlende SDKs oder Build Tools meldet, diese ueber den vorgeschlagenen Dialog installieren.
3. Danach den Sync erneut starten.

## 3. Release-Keystore erstellen

Der Keystore darf nicht ins Repository eingecheckt werden.

Beispiel per Terminal im Ordner `android/app`:

```bash
keytool -genkeypair \
  -v \
  -keystore release/kanban-board-release.jks \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -alias kanban-board
```

Die Passwoerter sicher in einem Passwortmanager speichern. Fuer lokale Builds koennen sie als Umgebungsvariablen gesetzt werden:

```bash
export KANBAN_STORE_PASSWORD="..."
export KANBAN_KEY_ALIAS="kanban-board"
export KANBAN_KEY_PASSWORD="..."
```

## 4. signingConfig aktivieren

In `android/app/build.gradle` ist ein auskommentiertes Template vorbereitet.

1. Den Block `signingConfigs { ... }` einkommentieren.
2. In `buildTypes.release` die Zeile `signingConfig signingConfigs.release` einkommentieren.
3. Sicherstellen, dass `release/kanban-board-release.jks` lokal existiert.

## 5. Signed Android App Bundle erzeugen

1. In Android Studio `Build > Generate Signed Bundle / APK...` oeffnen.
2. `Android App Bundle` auswaehlen.
3. Den Release-Keystore aus `android/app/release/kanban-board-release.jks` auswaehlen.
4. Key Alias und Passwoerter eintragen.
5. Build Variant `release` auswaehlen.
6. Build abschliessen.

Das erzeugte `.aab` liegt typischerweise unter:

```text
android/app/release/app-release.aab
```

## 6. Upload in die Google Play Console

1. In der Google Play Console die App oeffnen oder eine neue App anlegen.
2. Store-Eintrag, Datenschutzangaben, App-Zugriff, Zielgruppe und Content Rating ausfuellen.
3. Unter `Produktion` oder einem Test-Track eine neue Release-Version erstellen.
4. Die erzeugte `.aab` hochladen.
5. Release Notes eintragen.
6. Pruefungen der Play Console abarbeiten.
7. Release zur Ueberpruefung einreichen.

Das Play-Store-Icon liegt unter:

```text
android/app/release/play-store-icon-512.png
```
