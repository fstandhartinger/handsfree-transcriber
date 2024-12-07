export default function TermsAndConditions() {
  return (
    <div className="legal-page bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="prose prose-sm sm:prose lg:prose-lg mx-auto dark:prose-invert">
          <h1 className="text-3xl font-bold mb-6">Terms and Conditions</h1>
          <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <h2 className="text-2xl font-semibold mt-8">1. Acceptance of Terms</h2>
          <p>By accessing and using Speech to Text PRO, you agree to be bound by these Terms and Conditions. This includes the terms and conditions of our third-party service providers:</p>
          <ul>
            <li>OpenAI</li>
            <li>Replicate.com</li>
            <li>Groq.com</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8">2. Service Description</h2>
          <p>Speech to Text PRO is a speech recognition and transcription service that uses artificial intelligence to convert spoken words into written text. The service includes additional AI-powered features for text processing and formatting.</p>

          <h2 className="text-2xl font-semibold mt-8">3. Usage Guidelines</h2>
          <p>Users must adhere to the following guidelines when using the service:</p>
          <ul>
            <li>Users are responsible for the content they transcribe</li>
            <li>Misuse or abuse of the service is prohibited</li>
            <li>Users must maintain the security of their accounts</li>
            <li>Compliance with all applicable laws is required</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8">4. Intellectual Property</h2>
          <p>Users retain ownership of their transcribed content. The service's software, design, and other materials are protected by intellectual property laws.</p>

          <h2 className="text-2xl font-semibold mt-8">5. Disclaimer of Warranties</h2>
          <p>The service is provided "as is" without warranties of any kind, either express or implied.</p>

          <h2 className="text-2xl font-semibold mt-8">6. Limitation of Liability</h2>
          <p>We shall not be liable for:</p>
          <ul>
            <li>Direct or indirect damages</li>
            <li>Loss of data</li>
            <li>Service interruptions</li>
            <li>Transcription accuracy issues</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8">7. Indemnification</h2>
          <p>Users agree to indemnify and hold harmless Speech to Text PRO from any claims arising from their use of the service.</p>

          <h2 className="text-2xl font-semibold mt-8">8. Modifications to Terms</h2>
          <p>We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of modified terms.</p>

          <h2 className="text-2xl font-semibold mt-8">9. Governing Law</h2>
          <p>These terms are governed by the laws of Germany. Any disputes shall be resolved in the courts of Passau, Germany.</p>

          <h2 className="text-2xl font-semibold mt-8">10. Contact Information</h2>
          <p>For questions about these terms, contact:<br />
          Email: florian.standhartinger@gmail.com<br />
          Phone: +49 178 1981631</p>

          <h2 className="text-2xl font-semibold mt-8">11. Service Availability</h2>
          <p>We strive to maintain service availability but do not guarantee uninterrupted access.</p>

          <h2 className="text-2xl font-semibold mt-8">12. AI Technology Usage</h2>
          <p>Our service utilizes AI technologies from various providers. The accuracy and reliability of AI-generated content may vary.</p>

          <p className="text-sm text-muted-foreground mt-12">© 2024 productivity-boost.com Betriebs UG (haftungsbeschränkt) & Co. KG. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
} 