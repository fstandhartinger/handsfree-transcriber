import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const getBrowserLanguage = () => {
  const browserLang = navigator.language.toLowerCase();
  return browserLang.startsWith('de') ? 'de' : 'en';
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
        stop: "Stop"
      },
      recording: {
        status: "Recording",
        instruction: "Explain how you would like the text to be rephrased, for example: 'shorter and more serious' or 'translate to french'",
        editInstruction: "Speak your correction instructions...\n(e.g. \"Make this part more detailed\" or \"Remove this\")",
        markedText: "Marked text:"
      },
      toasts: {
        textCopied: "Text copied to clipboard"
      },
      editMode: {
        instruction: "Select any text you want to modify. Selected text will be marked with a strikethrough."
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
        stop: "Stopp"
      },
      recording: {
        status: "Aufnahme",
        instruction: "Erklären Sie, wie der Text umformuliert werden soll, zum Beispiel: 'kürzer und ernster' oder 'auf französisch übersetzen'",
        editInstruction: "Sprechen Sie Ihre Korrekturanweisungen...\n(z.B. \"Mache diesen Teil ausführlicher\" oder \"Entferne das\")",
        markedText: "Markierter Text:"
      },
      toasts: {
        textCopied: "Text in die Zwischenablage kopiert"
      },
      editMode: {
        instruction: "Wählen Sie den Text aus, den Sie ändern möchten. Ausgewählter Text wird durchgestrichen dargestellt."
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

export default i18n;