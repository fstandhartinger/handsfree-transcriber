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
        undo: "Undo",
        style: "Style"
      },
      recording: {
        status: "Recording",
        instruction: "Explain how you would like the text to be rephrased, for example: 'shorter and more serious' or 'translate to french'",
        editInstruction: "Speak your correction instructions...\n(e.g. \"Make this part more detailed\" or \"Remove this\")",
        markedText: "Marked text:",
        rephraseTitle: "Rephrase Text",
        rephraseDescription: "Press the microphone button and speak how you would like the text to be rephrased.\n\n Examples:\n• 'Format as a letter'\n• 'Translate to English'\n• 'Next Thursday instead of next Wednesday'",
        instructionTitle: "Edit Text",
        instructionDescription: "Press the microphone button and speak your instructions for editing the marked text.",
        selectedText: "Selected text:",
        processing: "Processing your request..."
      },
      toasts: {
        textCopied: "Text copied to clipboard",
        shareSuccess: "Text shared successfully",
        shareFailed: "Failed to share text",
        styleUpdated: "Text style updated to {{style}}",
        styleUpdateError: "Error updating text style",
        changesUndone: "Changes undone",
        audioProcessingError: "Error processing audio",
        clipboardError: "Error copying to clipboard",
        understood: "Understood",
        textRephrased: "Text rephrased",
        rephrasingError: "Error processing rephrasing. Please try again.",
        textUpdated: "Text updated"
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
        casual: "Lässig",
        rephrase: "Umformulieren",
        copyText: "Text kopieren",
        stop: "Stopp",
        share: "Teilen",
        cancel: "Abbrechen",
        undo: "Rückgängig",
        style: "Stil"
      },
      recording: {
        status: "Aufnahme läuft...",
        markedText: "Markierter Text:",
        editInstruction: "Sprechen Sie Ihre Anweisungen zur Bearbeitung",
        rephraseTitle: "Text umformulieren",
        rephraseDescription: "Drücken Sie auf das Mikrofon und sprechen Sie, wie der Text umformuliert werden soll.\n\n Beispiele:\n• 'Formatiere wie einen Brief'\n• 'Übersetze auf Englisch'\n• 'Nächsten Donnerstag statt nächsten Mittwoch'",
        instructionTitle: "Text bearbeiten",
        instructionDescription: "Drücken Sie auf das Mikrofon und sprechen Sie Ihre Anweisungen zur Bearbeitung des markierten Texts.",
        selectedText: "Ausgewählter Text:",
        processing: "Verarbeite Ihre Anfrage..."
      },
      toasts: {
        textCopied: "Text in die Zwischenablage kopiert",
        shareSuccess: "Text erfolgreich geteilt",
        shareFailed: "Fehler beim Teilen des Textes",
        styleUpdated: "Textstil geändert zu {{style}}",
        styleUpdateError: "Fehler beim Ändern des Textstils",
        changesUndone: "Änderungen rückgängig gemacht",
        audioProcessingError: "Fehler bei der Audioverarbeitung",
        clipboardError: "Fehler beim Kopieren in die Zwischenablage",
        understood: "Verstanden",
        textRephrased: "Text umformuliert",
        rephrasingError: "Fehler bei der Umformulierung. Bitte versuchen Sie es erneut.",
        textUpdated: "Text aktualisiert"
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