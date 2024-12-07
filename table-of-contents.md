# Projektdokumentation - Handsfree Transcriber

Vorgehen für Aktualisierung der Datei ist am Ende der Datei beschrieben.

## 1. Detaillierte Funktionsübersicht
In diesem Abschnitt werden die wichtigsten Funktionen der Applikation auf der granularsten Ebene beschrieben.

### Kernfunktionen

#### Authentifizierung und Benutzerverwaltung
- `src/components/AuthDialog.tsx`: Authentifizierungsdialog für Benutzeranmeldung
- `src/components/ProfileButton.tsx`: Verwaltung des Benutzerprofils und Authentifizierungsstatus
- `src/pages/Auth.tsx`: Authentifizierungs-Callback-Seite
- `src/integrations/supabase/client.ts`: Supabase-Client-Konfiguration und -Initialisierung
- `src/integrations/supabase/types.ts`: TypeScript-Typdefinitionen für Supabase-Datenmodelle

#### Aufnahme und Transkription
- `src/components/RecordingModal.tsx`: Steuerung der Audioaufnahme und Transkription
- `src/components/TextEditView.tsx`: Hauptkomponente für die Bearbeitung und Anzeige von Transkriptionen
- `src/hooks/useAudioRecording.ts`: Hook für die Audioaufnahme-Funktionalität
- `src/hooks/useAudioProcessing.ts`: Hook für die Audioverarbeitung und Transkription

#### Text und Bearbeitung
- `src/components/EditableText.tsx`: Bearbeitbare Textkomponente mit Echtzeit-Änderungen
- `src/components/TextControls.tsx`: Steuerelemente für Textformatierung und -bearbeitung
- `src/components/RephraseModal.tsx`: Modal für die Umformulierung von Text

#### PWA-Funktionalität
- `src/pwa.ts`: Service Worker Registrierung und PWA-Funktionalität
- `src/components/InstallButton.tsx`: PWA-Installationsbutton und -Logik
- `src/components/UpdateNotification.tsx`: Benachrichtigungen über App-Updates
- `src/pages/download-updated-windows-app.tsx`: Seite für Windows App-Updates

#### Internationalisierung
- `src/i18n/index.ts`: i18n-Konfiguration und Setup
- `src/i18n/locales/de.json`: Deutsche Übersetzungen
- `src/i18n/locales/en.json`: Englische Übersetzungen

#### Nutzungsverfolgung und UI-Utilities
- `src/hooks/useUsageCounter.ts`: Hook für die Verfolgung der Nutzungshäufigkeit
- `src/hooks/use-toast.tsx`: Toast-Benachrichtigungssystem
- `src/hooks/use-mobile.tsx`: Hook für mobile Geräteerkennung
- `src/lib/utils.ts`: Allgemeine Hilfsfunktionen

## 2. Dateiübersicht

### Hauptanwendungsdateien
- `src/main.tsx`: Einstiegspunkt der Anwendung, initialisiert React und Service Worker
- `src/App.tsx`: Hauptkomponente mit Routing und Authentifizierungslogik
- `src/App.css`: Hauptstylesheets für die Anwendung
- `src/index.css`: Globale Styles und Tailwind-Konfiguration

### Seiten
- `src/pages/Index.tsx`: Hauptseite der Anwendung mit Transkriptionsinterface
- `src/pages/Auth.tsx`: Authentifizierungs-Callback-Handler
- `src/pages/DataPrivacy.tsx`: Datenschutzerklärung
- `src/pages/TermsAndConditions.tsx`: Nutzungsbedingungen
- `src/pages/Imprint.tsx`: Impressum
- `src/pages/download-updated-windows-app.tsx`: Windows App-Update-Seite

### Komponenten
- `src/components/AuthDialog.tsx`: Authentifizierungsdialog für Login/Registrierung
- `src/components/ProfileButton.tsx`: Benutzerprofilsteuerung und Authentifizierungsoptionen
- `src/components/TextEditView.tsx`: Haupteditor für Transkriptionen
- `src/components/EditableText.tsx`: Wiederverwendbare editierbare Textkomponente
- `src/components/RecordingModal.tsx`: Modal für Audioaufnahmen
- `src/components/TextControls.tsx`: Steuerelemente für Textbearbeitung
- `src/components/ShareButton.tsx`: Funktionalität zum Teilen von Transkriptionen
- `src/components/LoadingOverlay.tsx`: Ladeanzeige für asynchrone Operationen
- `src/components/CookieBanner.tsx`: Cookie-Zustimmungsbanner
- `src/components/LegalFooter.tsx`: Footer mit rechtlichen Links

### React Hooks
- `src/hooks/useAudioRecording.ts`: Verwaltung der Audioaufnahme
- `src/hooks/useAudioProcessing.ts`: Audioverarbeitung und Transkription
- `src/hooks/useUsageCounter.ts`: Nutzungsverfolgung
- `src/hooks/use-toast.tsx`: Benachrichtigungssystem
- `src/hooks/use-mobile.tsx`: Mobile Geräteerkennung

### Utilities und Integrationen
- `src/lib/utils.ts`: Allgemeine Hilfsfunktionen
- `src/integrations/supabase/client.ts`: Supabase-Client-Konfiguration
- `src/integrations/supabase/types.ts`: Supabase-Datenmodell-Typen

### Internationalisierung
- `src/i18n/index.ts`: i18n-Konfiguration und Setup
- `src/i18n/locales/de.json`: Deutsche Übersetzungen (236 Einträge)
- `src/i18n/locales/en.json`: Englische Übersetzungen (236 Einträge)

### Konfigurationsdateien
- `package.json`: NPM-Projektabhängigkeiten und Skripte
- `vite.config.ts`: Vite-Bundler-Konfiguration
- `tailwind.config.ts`: Tailwind CSS-Konfiguration
- `tsconfig.json`: TypeScript-Konfiguration

## 3. Verzeichnisstruktur und Architektur

### Hauptverzeichnisse
- `/src`: Hauptquellcode der Anwendung
  - `/components`: React-Komponenten für UI-Elemente
  - `/pages`: Hauptseitenkomponenten und Routen
  - `/hooks`: Wiederverwendbare React-Hooks für Geschäftslogik
  - `/lib`: Hilfsfunktionen und Utilities
  - `/integrations`: Externe Integrationen
    - `/supabase`: Supabase-Backend-Integration
  - `/i18n`: Internationalisierung
    - `/locales`: Sprachdateien (DE/EN)

- `/public`: Statische Assets und PWA-Ressourcen
- `/supabase`: Supabase-Konfiguration und -Schemas

### Architekturübersicht
Die Anwendung ist als moderne Single-Page-Application (SPA) mit React aufgebaut und nutzt:
- React für die UI-Komponenten
- Supabase für Backend und Authentifizierung
  - Benutzerauthentifizierung
  - Datenspeicherung
  - Echtzeit-Updates
- Tailwind CSS für Styling
- PWA-Funktionalität für Offline-Nutzung
- Vite als Build-Tool und Entwicklungsserver
- i18next für Internationalisierung
  - Unterstützung für Deutsch und Englisch
  - 236 Übersetzungseinträge pro Sprache

Kernfunktionen:
- Spracherkennung und Transkription
- Echtzeit-Textbearbeitung
- Benutzerauthentifizierung
- PWA mit Offline-Unterstützung
- Mehrsprachenunterstützung (DE/EN)

## Prozess zur Aktualisierung dieser Dokumentation
1. Systematische Durchsicht aller Verzeichnisse und Dateien
2. Analyse der Hauptkomponenten und ihrer Funktionen
3. Dokumentation auf drei Ebenen:
   - Detaillierte Funktionsebene
   - Dateiebene
   - Architekturebene
4. Regelmäßige Aktualisierung bei Codeänderungen
5. Besonderer Fokus auf:
   - Neue Funktionen
   - Geänderte Architektur
   - Neue Abhängigkeiten
   - Sicherheitsrelevante Änderungen
   - Neue Übersetzungen oder Sprachen