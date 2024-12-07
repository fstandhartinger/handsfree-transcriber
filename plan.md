Dieses Softwareprojekt heißt speech-to-text.pro, auch bekannt als handsfree-transcriber. 
Es handelt sich um eine minimalistische, moderne Speech-to-Text-Transkriptionssoftware mit KI-Funktionen für die Nachbearbeitung des Textes.

# Grundsätzlicher Aufbau der App:

Die App besteht aus einer Startseite (Index.tsx) und einer Ergebnisseite (TextEditView.tsx). Die Startseite enthält eine Kopfzeile mit einem Settings-Button in der linken oberen Ecke und einem Profilbild-Button in der rechten oberen Ecke. Über den Profilbild-Button kann man sich mit seinem Google-Account einloggen. Wenn man eingeloggt ist, wird dort das Google-Profilbild angezeigt, ansonsten ein Platzhalter-Icon.

# Erläuterung der Funktion der App:

Die Startseite ist die Seite, die erscheint wenn man die Web App initial öffnet. Auf der Startseite befindet sich ein Mikrofon-Button, 
über den man die Aufzeichnung eines Audiostreams über das Gerätemikrofon starten kann.
Sobald man das getan hat, erscheint statt dem Mikrofon-Button ein Stop-Button. Wenn man den anklickt, wird die Aufzeichnung mittels eines marktführenden 
Speech-to-Text-KI-Modells namens Whisper transkribiert, also in Text umgewandelt.
Der transkribierte Text wird dann auf der Ergebnisseite angezeigt.

# Die Floating Action Buttons der Ergebnisseite:

# Die Ergebnisseite bietet unten rechts mehrere Floating Action Buttons.

Der unterste Button ist mit 'Neue Aufnahme' beschriftet. Wenn man ihn anklickt, wird eine neue Aufzeichnung gestartet und die Anzeige springt zurück zur 
Startseite in dem Zustand, wo der Stop-Button in der Mitte des Bildschirms sichtbar ist. 
Mit dem Klick auf diesen Button kann man einen neuen Text transkribieren, der anschließend auf der Ergebnisseite angezeigt wird. 

Darüber befindet sich ein Button mit der Aufschrift 'Stil'. Beim Klick darauf öffnet sich ein Pop-up-Menü mit drei Einträgen: formell, prägnant und lässig. 
Wählt man einen dieser Einträge aus, wird der Text der Ergebnisseite mit einem entsprechenden Prompt an ein Large Language Model, konkret GPT-4o, gesendet. 
Das LLM formuliert den Text dann so um, dass er besser dem ausgewählten Stil entspricht. 

Darüber wird ein Button angezeigt, der mit 'Umformulieren' beschriftet ist. 
Klickt man ihn an, öffnet sich ein modaler Dialog mit einer kurzen Erklärung und auf-/zuklappbaren Beispielen, sowie einem Mikrofon-Button. 
Wenn man darauf klickt, kann man einsprechen, wie der vorhandene Text umformuliert werden soll, zum Beispiel 'ins Englische übersetzen# oder 'wie einen Brief formatieren'. 
Wenn man 'Stop' drückt, verwendet das Tool erneut GPT-4o, um den Text gemäß des Änderungswunsches anzupassen. 
Die umformulierte Version wird dann wiederum auf der Ergebnisseite angezeigt. 

Über diesem Button befindet sich noch ein 'Undo'-Button, mit dem man zur vorherigen Version des Textes zurückkehren kann. 
Dieser Undo-Button wird nur angezeigt, wenn bereits eine Umformulierung durchgeführt wurde.

# Die Buttons am oberen Rand der Ergebnisseite:

Oben befinden sich drei Buttons, die jeweils nur rechteckig und mit einem Symbol dargestellt werden. 

Oben in der linken oberen Ecke befindet sich ein Pfeil nach links Button, mit dem man zurück zur Startseite gelangen kann. 
Oben rechts befinden sich zwei verschiedene Buttons nebeneinander. 
In der Ecke ganz rechts oben der Teilen-Button mit einem entsprechenden Symbol. Wenn man den anklickt, öffnet sich das Betriebssystem eigene Menü zum Teilen des Textes, 
der in der Ergebnisseite dargestellt wird. 
Links neben diesem Teilen-Button ist ein Copy-to-Clipboard-Button, auf dessen Klick hin der Text in die Zwischenablage kopiert wird. 

# Weitere Benutzeroberflächen-Steuerelemente der Ergebnisseite:

Die Ergebnisseite besitzt außerdem noch ein paar Benutzeroberflächen-Steuerelemente, die nicht immer sichtbar sind. 
So gibt es beispielsweise oben in der Mitte des Bildschirms zentriert einen Platz, an dem in bestimmten Situationen Toast-Messages angezeigt werden, die dann schnell wieder verschwinden. 
An der gleichen Stelle befindet sich in bestimmten Situationen ein Progress-Indikator, also ein rotierender Kreis, mit dem angezeigt wird, dass die Applikation gerade arbeitet.

# Weitere Benutzeroberflächen-Steuerelemente der Startseite:

## Das Settings-Menü:

Auf der Startseite befindet sich in der oberen rechten Ecke ein kleiner rechteckiger Button mit einem Zahnradsymbol. 
Über diesen Button kann man das Settings-Menü der Applikation öffnen, welches als zentriertes modales Dialogfenster dargestellt wird, mit einer Überschrift und darunter einer 
Liste an Einstellungen, die in der Local Storage des Browsers gespeichert werden. 
Aktuell befindet sich dort bisher nur ein Setting: 
Und zwar eine Checkbox, mit der man festlegen kann, dass jede neue Version des Ergebnistextes, einschließlich der initial nach dem Transkribieren erstellten, 
automatisch sofort ins Clipboard kopiert werden soll, ohne dass man die Copy-to-Clipboard-Button anklicken muss.

## Installation

Die Applikation besitzt die Möglichkeit, eine lokale Installation vorzunehmen und fordert den Benutzer mit einem Panel am unteren Rand der Startseite dazu auf. 
Dieses Panel enthält einen Text und einen Button App installieren. Und wenn man darauf klickt, passieren unterschiedliche Dinge, je nach Betriebssystem. 
Ist das aktuelle Betriebssystem Windows, dann wird hier ein Download einer Exe-Datei gestartet, welche mit C# .Net Windows Forms programmiert wurde und einen 
WebView2 Browser verwendet um die Webapplikation darzustellen und über spezielle Interfaces mit ihr zu kommunizieren. 
Auf allen anderen Betriebssystemen bedeutet der Klick auf App installieren, dass die App als Progressive Web App lokal installiert wird. 
Die App wird dann ausgeführt und prüft in kurzen Zeitzyklen ob online eine neue Version vorliegt. Falls ja, wird sofort ein Reload erzwungen. 
Wenn die App installiert ist, dann wird dieses Panel App installieren am unteren Rand nicht mehr angezeigt.

# Übergreifende Funktionen:

## Mehrsprachigkeit

Alle Texte der Benutzeroberfläche der Applikation werden mehrsprachig vorgehalten. Aktuell gibt es hierfür bisher zwei verschiedene lokalisierte Versionen für jeden Text. 
Eine Version auf Deutsch, die dann zur Anwendung kommen soll, wenn die Locale des Browsers Deutsch ist. 
Und eine englische Version der Texte, die bei allen anderen Browser-Locales zur Anwendung kommen soll. 
Es ist wichtig, dass bei allen Änderungen in der Benutzeroberfläche berücksichtigt wird, dass diese lokalisierten Texte verwendet werden.

## Interface für Windows-Desktop-App

Wenn die Applikation über die C# .NET Windows Formas app ausgeführt wird, injiziert diese über das WebView2 Browser Control ein javascript Objekt in die Webapp, das unter
(window as any).chrome?.webview?.hostObjects?.transcriberHost erreichbar ist. Über diese Objekt kommuniziert die Desktop-App mit der Webapp.
Hier über kann die Windows-Applikation beispielsweise eine Aufnahme starten oder beenden und die Web-Applikation benachrichtigt die Windows-Applikation, wenn ein Text verarbeitet oder transkribiert wurde.

## Sign In With Google

Die Applikation besitzt Funktionalität für Sign in with Google. 
Wenn der Benutzer das erste Mal auf unserer Webseite landet, wird ihm einfach die Startseite, wie oben beschrieben, angezeigt, mit dem Mikrofon-Button in der Mitte.
Der Benutzer kann diesen auch verwenden und die gesamte Funktionalität der Applikation nutzen. 
Allerdings wird bei jeder Verwendung der Aufzeichnung und Transkription ein Zähler in der Local Storage, der initial auf 3 gesetzt wird, um 1 dekrementiert. 
Wenn dieser Zähler bei 0 angekommen ist, wird der Benutzer bei der nächsten Verwendung des Mikrofon-Buttons aufgefordert, sich mit seinem Google Account einzuloggen.
Wir zeigen in der oberen rechten Ecke dann das Profile Picture des Anwenders an. Wenn man darauf klickt, erscheint darunter ein Pop-up Menü, über welches man sich wieder abmelden kann.

# Todos und nächste Schritte:

1. Der Profile-Picture Button soll auf der Startseite immer oben rechts angezeigt werden, auch wenn der User nicht eingeloggt ist. Über ihn kann man sich einloggen.
2. Der Dialog, mit dem der Benutzer aufgefordert wird, sich einzuloggen soll einen etwas luftigeren Rahmen haben, sodass sichergestellt ist, dass das Kreuz zum Schließen in der oberen
rechten Ecke nicht mit dem Text überlappt. Der Button für Sign In With Google soll neben dem Google-Symbol uach den Text "Sign In with Google" enthalten (bzw die deutsche lokalisation davon), 
so wie dieser Button üblicherweise aussieht.
3. [IMPLEMENTIERT] Die Startseite braucht ganz subtil am unteren Rand angezeigt einen ganz minimalistischen Cookie-Banner, so subtil wie möglich aber dennoch rechtlich ausreichend. Er soll oberhalb des Installations-Panels angezeigt werden, sofern dieses angezeigt wird, und falls nicht, dann einfach am unteren Rand.
4. [IMPLEMENTIERT] Die Startseite braucht unten links auf die rechtlich verbindlichen Seiten, terms-and-conditions und privacy-policy, sowie einen Link zum Impressum. All diese Seiten werden in einem neuen Tab geöffnet. Diese Links sollen oberhalb des Installations-Panels und oberhalb des Cookie-Banners angezeigt werden, sofern diese agezeigt werden, und falls nicht, dann einfach am unteren Rand.
Diese neuen Seiten sollen erreichbar sein unter /data-privacy und /terms-and-conditions und /imprint.
Sie sollen inhaltlich so aufgebaut sein, dass sie den Anforderungen des Gesetzgebers an die rechtlich verbindlichen Seiten genügen und uns von allen Verantwortungen befreien und rechtlich
unbelangbar machen. Wir verwenden in diesem Projekt Services von OpenAI und replicate.com und groq.com, sodass implizit auch deren Bedingungen und Konditionen für die Verwendung gelten.
Orientiere dich inhaltlich an den Dateien example-terms.html und example-privacy.html und example-imprint.html im Rootverzeichnis unseres Projektes, welche ich in einem anderen Projekt verwendet habe. Diese Texte dieser drei neuen Seiten sollen ausnahmsweise nicht mehrsprachig angelegt werden, sondern nur in englisch, direkt in der Datei enthalten sein. Es handelt sich bei unserem Projekt 
um die gleiche verantwortliche Firma (productivity-boos.com UG & Co. KG), die auch screengrasp betreibt und es handelt sich auch um die gleichen verantwortlichen Personen und Ansprechpartner 
(Florian Standhartinger). Verwende daher also die gleichen Links, Adressen, Websites, Firmennamen.
Achte beim Design dieser Seiten auf einen schlichten, cleanen, aber wohldesignten Look. Passe auf, dass wir keine Schwierigkeiten mit einer die Texte überlappenden Header-Leiste bekommen.
5. Optimiere die Seite hinsichtlich SEO und SEM. Füge eine Blog-Artikel-Ähnliche Seite hinzu, die die Funktionalität der Applikation erklärt und wie man sie richtig benutzt, denn Content ist 
wichtig, um bei Suchmaschinen wie Google Ansehen zu verdienen. Verlinke auf diese Seite von der Startseite aus, plaziere diesen Link dort wo uach die anderen Links am unteren Rand der Startseite angezeigt werden. Gestalte den Text dieser neuen Seite so, dass er den Anforderungen von SEO und SEM genügt. Verwende die Erklärungen zur App aus der plan.md Datei, um zu verstehen was unsere 
Webapp inhaltlich tut und was sie ausmacht. Falls es weitere sinnvolle Maßnahmen hinsichtlich SEO und SEM gibt, beispielsweise eine robots.txt Datei, eine sitemap.xml Datei oder andere, dann führe diese Maßnahmen auf und biete mir ihre Umsetzung an.
6. Stelle sicher, dass der Mechanismus der Sign In With Google erzwingt, wenn die kostenlosen Verwendungen aufgebracht sind (Zähler in Local Storage, siehe oben) auch beim Verwenden des
'Neue Aufnahme' Floating Action Buttons der Ergebnisseite greift. Nach 3 kostenlosen Verwendeungen des Transkirptionsmechanismus ohne angemeldet zu sein, soll der Benutzer gezwungen werden, sich einzuloggen, andernfalls wird ihm die weitere Verwendung der App verwehrt. Öffne den Dialog, der zur Anmeldung auffordert am Ende des Transkriptionsvorgangs, also auf der Ergebnisseite, wo im Hintergrund bereits der transkribierte Text angezeigt wird. Bisher wurde dieser Dialog direkt beim Klick auf den Mikrofon-Button bereits angezeigt, aber das wollen wir jetzt ändern, er sol nun
erst auf der Ergebnisseite, also nach erfolgreicher Transkription angezeigt werden. Der Dialog soll nicht schließbar sein (das X oben rechts entfernen). Er soll den Benutzer darauf hinweisen, dass er sich einloggen muss, um die App weiter zu verwenden. Die Plazierung an dieser Stelle ist wichtig, weil wenn der Benutzer gerade die Zeit investiert hat, einen Text einzusprechen und 
im Hintergrund sehen kann, dass bereits das transkribierte Ergebnis angezeigt wird, er allerdings nicht darauf zugreifen kann, weil der Dialog zur Anmeldung im Weg ist, dann ist er 
stärker motiviert, den Anmeldedialog schnell aus dem Weg zu räumen, indem er sich einloggt, um die App weiter zu verwenden zu können und auf den transkribierten Text zugreifen zu können. 
Und so bekommen wir das, was wir wollen: dass die User sich einloggen.
7. Baue unsere Startseite so um, dass sie eine minimalistische Landing-Page eines SaaS Produktes (Speech to Text PRO) darstellt. Lasse dabei die oben beschriebe Grundstruktur der Startseite der App intakt, also sprich: 
- Der Mikrofon-Button in der Mitte der Startseite soll immer sichtbar und anklickbar sein.
- Der Button für das Settings-Menü in der oberen rechten Ecke soll immer sichtbar und anklickbar sein.
- Das Panel für die Installation der App soll sichtbar und anklickbar sein, falls die App noch nicht installiert ist.
- Die Links am unteren Rand der Startseite sollen immer sichtbar und anklickbar sein.
Füge der Seite einen schlichten, aber wohldesignten Header hinzu, der die Überschrift "Speech to Text PRO" beinhaltet. Benenne die Seite (den Title, der im Browser-Tab angezeigt wird) in "Speech to Text PRO" um.
Füge einen kurzen, markanten, marketingtauglichen Untertitel hinzu, der den Vorteilen der App erklärt und die Funktionalität der App erklärt. Hebe dabei hervor, dass die App
die weltweit führende Speech-To-Text KI verwendet und sie simpel, intuitiv und schnell bedienbar ist und KI Funktionen für perfekte Produktivität enthält.
Über dem Mikrofon-Button ködere den Benutzer mit der Call-To-Action: "Try for FREE".
8. Wir wollen eine Bezahlfunktion über Stripe integrieren. Bachte hierzu erst mal, was wir oben im Absatz "Sign In With Google" beschrieben haben und was wir beim Todo 6. beschrieben haben. 
Nach den 3 kostenlosen Verwendungen ohne dass erzwungen wird, dass der User sich einloggt, soll der User aufgefordert werden, eingeloggt weiter zu machen. Wenn der Benutzer dann noch mal 3 Verwendungen als eingeloggter Anwender vorgenommen hat, soll er mit einem Dialog, der an der gleichen Stelle auftaucht (also in dem Moment, wo der Ergebnistext in der Ergebnisseite angezeigt wird), aufgefordert werden, einen Bezahlaccount einzurichten, da die kostenlosen Verwendungen aufgebraucht sind. 
Ich habe bereits einen Stripe Account eingerichtet und einen Price dort angelegt und kann dir die price id geben. 
Wir müssen dann den stripe webhook implementieren. Ich kann dir hierfür ein code beispiel aus einem unserer anderen projekte geben welches die funktionierende Implementierung dieses Stripe webhooks in Form einer der Node ts Express Implementierung zeigt. 
Wir müssen außerdem darauf achten, dass wir Cors entsprechend konfigurieren. 
Auch hier kann ich dir das Codebeispiel bereitstellen. Dann brauchen wir außerdem einen Endpunkt in unserer API zum Erstellen einer Checkout Session über Stripe. 
Auch hier kann ich dir das Codebeispiel aus meiner Node API bereitstellen. 
Wir müssen der Applikation eine Übersichtsseite über die verschiedenen Pläne hinzufügen, für die ich dir ebenfalls ein gut aussehendes Beispiel bereitstellen kann. 
Der Benutzer kann über diese Seite auf einen anderen Plan upgraden. Falls es ein Bezahlplan ist, wird er dabei an Stripe weitergeleitet. Und falls es ein Downgrade von einem Bezahlplan auf einen kostenlosen ist, müssen wir einen entsprechenden API Endpunkt im Backend vorsehen. 
Außerdem braucht unser API Backend eine Möglichkeit, den aktuellen Plan des angemeldeten Users abzufragen. Bitte erkläre mir, wie in unserer Architektur, wo wir Edge Functions von Superbase verwenden, eine sinnvolle Implementierung dises Bezahlsystems mit Stripe vorgenommen werden kann, bevor du mit der Codeänderung beginnst.