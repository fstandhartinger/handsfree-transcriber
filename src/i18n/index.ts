import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const getBrowserLanguage = () => {
  console.log('Browser language:', navigator.language);
  const browserLang = navigator.language.split('-')[0].toLowerCase();
  console.log('Detected language:', browserLang === 'de' ? 'de' : 'en');
  return browserLang === 'de' ? 'de' : 'en';
};

const resources = {
  en: {
    translation: {
      buttons: {
        edit: "Edit section",
        finishEdit: "Finish edit section",
        formal: "Formal",
        concise: "Concise",
        casual: "Casual",
        rephrase: "Rephrase",
        copyText: "Copy Text",
        stop: "Stop",
        share: "Share",
        cancel: "Cancel",
        undo: "Undo"
      },
      recording: {
        status: "Recording",
        instruction: "Explain how you would like the text to be rephrased, for example: 'shorter and more serious' or 'translate to french'",
        editInstruction: "Speak your correction instructions...\n(e.g. \"Make this part more detailed\" or \"Remove this\")",
        markedText: "Marked text:",
        rephraseTitle: "Rephrase Text",
        rephraseDescription: "Press the microphone button and speak how you would like the text to be rephrased.",
        instructionTitle: "Edit Text",
        instructionDescription: "Press the microphone button and speak your instructions for editing the marked text.",
        selectedText: "Selected text:"
      },
      toasts: {
        textCopied: "Text copied to clipboard",
        shareSuccess: "Text shared successfully",
        shareFailed: "Failed to share text"
      },
      editMode: {
        instruction: "Select any text you want to modify. Selected text will be marked with a strikethrough."
      },
      share: {
        title: "Share via",
        whatsapp: "WhatsApp",
        email: "Email",
        clipboard: "Copy to Clipboard"
      }
    }
  },
  de: {
    translation: {
      buttons: {
        edit: "Abschnitt bearbeiten",
        finishEdit: "Bearbeitung abschließen",
        formal: "Formell",
        concise: "Prägnant",
        casual: "Umgangssprachlich",
        rephrase: "Umformulieren",
        copyText: "Text kopieren",
        stop: "Stopp",
        share: "Teilen",
        cancel: "Abbrechen",
        undo: "Rückgängig"
      },
      recording: {
        status: "Aufnahme läuft...",
        instruction: "Erklären Sie, wie der Text umformuliert werden soll, zum Beispiel: 'kürzer und ernster' oder 'auf Französisch übersetzen'",
        editInstruction: "Sprechen Sie Ihre Korrekturanweisungen...\n(z.B. \"Mache diesen Teil ausführlicher\" oder \"Entferne das\")",
        markedText: "Markierter Text:",
        rephraseTitle: "Text umformulieren",
        rephraseDescription: "Drücken Sie auf das Mikrofon und sprechen Sie, wie der Text umformuliert werden soll.",
        instructionTitle: "Text bearbeiten",
        instructionDescription: "Drücken Sie auf das Mikrofon und sprechen Sie Ihre Anweisungen zur Bearbeitung des markierten Texts.",
        selectedText: "Ausgewählter Text:"
      },
      toasts: {
        textCopied: "Text in die Zwischenablage kopiert",
        shareSuccess: "Text erfolgreich geteilt",
        shareFailed: "Fehler beim Teilen des Textes"
      },
      editMode: {
        instruction: "Wählen Sie den Text aus, den Sie ändern möchten. Ausgewählter Text wird durchgestrichen dargestellt."
      },
      share: {
        title: "Teilen über",
        whatsapp: "WhatsApp",
        email: "E-Mail",
        clipboard: "In Zwischenablage kopieren"
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getBrowserLanguage(),
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

console.log('i18n initialized with language:', i18n.language);

export default i18n;