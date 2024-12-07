import { useTranslation } from 'react-i18next';

export default function Imprint() {
  return (
    <div className="legal-page bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="prose prose-sm sm:prose lg:prose-lg mx-auto dark:prose-invert">
          <h1 className="text-3xl font-bold mb-6">Legal Notice (Imprint)</h1>
          
          <h2 className="text-2xl font-semibold mt-8">Information according to § 5 TMG:</h2>
          <p>
            productivity-boost.com Betriebs UG (haftungsbeschränkt) & Co. KG<br />
            Reichenbergerstr. 2<br />
            94036 Passau<br />
            Germany
          </p>

          <h2 className="text-2xl font-semibold mt-8">Represented by:</h2>
          <p>Florian Standhartinger</p>

          <h2 className="text-2xl font-semibold mt-8">Contact:</h2>
          <p>
            Phone: +49 178 1981631<br />
            Fax: +49 321 21160681<br />
            Email: florian.standhartinger@gmail.com
          </p>

          <h2 className="text-2xl font-semibold mt-8">Commercial Register:</h2>
          <p>
            Registered in the Commercial Register<br />
            Court of Registration: Amtsgericht Passau<br />
            Registration Number: HRB 8453
          </p>

          <h2 className="text-2xl font-semibold mt-8">VAT ID:</h2>
          <p>
            VAT identification number according to § 27a Value Added Tax Act:<br />
            DE296812612
          </p>

          <p className="text-sm text-muted-foreground mt-12">© 2024 productivity-boost.com Betriebs UG (haftungsbeschränkt) & Co. KG. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
} 