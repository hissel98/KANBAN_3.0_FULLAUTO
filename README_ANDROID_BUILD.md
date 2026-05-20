# Android App Build & Play Store — Schritt für Schritt

## Voraussetzungen
- Android Studio (neueste Version)
- Java JDK (Android Studio bringt meist einen mit)
- Git (zum Clonen des Repos)

---

## 1. Projekt auf PC kopieren

```bash
cd C:\Users\DEIN_NAME\Documents
git clone https://github.com/hissel98/KANBAN_3.0_FULLAUTO.git
cd KANBAN_3.0_FULLAUTO
```

---

## 2. Android Studio öffnen

1. Android Studio starten
2. **"Open"** klicken
3. Den Ordner `KANBAN_3.0_FULLAUTO/android` auswählen
4. Auf **"OK"** klicken
5. Gradle Sync abwarten (erster Start dauert ~5-10 Min — Gradle lädt sich herunter)

---

## 3. Keystore erstellen (einmalig)

In Android Studio Terminal oder PowerShell:

```bash
cd android/app

# Ersetze DEIN_PASSWORT durch ein echtes Passwort!
keytool -genkey -v -keystore kanban-release.keystore -alias kanban -keyalg RSA -keysize 2048 -validity 10000
```

Beantworte die Fragen:
- Passwort: **merken!**
- Name: Christian Kloda
- Organization: dein Name oder leer
- City: deine Stadt
- State: leer
- Country Code: DE

**WICHTIG:** `kanban-release.keystore` muss sicher aufbewahrt werden. Verlierst du es oder das Passwort, kannst du nie wieder Updates für die App veröffentlichen!

---

## 4. Signing-Config in build.gradle aktivieren

1. In Android Studio: `android/app/build.gradle` öffnen
2. Im Block `signingConfigs.release` auskommentierte Zeilen aktivieren:

```gradle
signingConfigs {
    release {
        storeFile file('kanban-release.keystore')
        storePassword 'DEIN_PASSWORT'
        keyAlias 'kanban'
        keyPassword 'DEIN_PASSWORT'
    }
}
```

3. **Sync Now** klicken (Gradle-Sync)

---

## 5. Release-Build erstellen (.aab)

1. **Build → Generate Signed App Bundle / APK...**
2. **Android App Bundle (AAB)** auswählen
3. **Next → Create new** (falls noch kein Keystore hinterlegt)
   - Keystore-Pfad: `android/app/kanban-release.keystore`
   - Alias: `kanban`
4. Passwort eingeben
5. **Release** Build-Variante wählen
6. **Finish**

Ergebnis liegt in:
```
android/app/release/app-release.aab
```

Diese `.aab` Datei wird in den Play Store hochgeladen.

---

## 6. Play Console — App erstellen

### Erstmalig anmelden
1. https://play.google.com/console anmelden (Google-Account)
2. **25$ Einmalgebühr** zahlen (Entwickler-Registrierung)
3. App erstellen: **"Create app"**
   - App Name: "Kanban Board"
   - Default language: German
   - App or game: **App**
   - Free or paid: **Free**

### App-Details eintragen
- **App access:** All functionality is available without special access
- **Ads:** No, my app does not contain ads
- **Content rating:** Fragebogen ausfüllen (wahrscheinlich PEGI 3 / Everyone)
- **Target audience:** Erwachsene / All ages
- **News apps:** No
- **Data safety:** Keine Daten gesammelt außer Auth-Email (angemeldet werden)
- **App icon:** `android/app/release/play-store-icon-512.png` hochladen

### Store-Listing
- **Screenshots:** Mindestens 2 Screenshots (am besten 8, verschiedene Geräte)
- **Feature graphic:** 1024x500 Banner (optional, aber empfohlen)
- **Short description:** Max 80 Zeichen
- **Full description:** Max 4000 Zeichen
- **App categorie:** Productivity

### .aab hochladen
1. **Production → Create new release**
2. `app-release.aab` hochladen
3. Release notes eingeben
4. **Review release → Start rollout**

---

## 7. Updates veröffentlichen

Bei jedem Update:

1. `versionCode` in `android/app/build.gradle` erhöhen (+1)
2. `versionName` anpassen (z.B. "1.0.1")
3. Neuen Keystore-Sign build machen (Schritt 5)
4. In Play Console unter **Production → Create new release**
5. Neue `.aab` hochladen

---

## Hilfreiche Links
- [Play Console Help](https://support.google.com/googleplay/android-developer)
- [App Bundle Format](https://developer.android.com/guide/app-bundle)
- [Play Store Policy](https://play.google.com/about/developer-content-policy/)
