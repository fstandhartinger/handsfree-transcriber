export default function DataPrivacy() {
  return (
    <div className="legal-page bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="prose prose-sm sm:prose lg:prose-lg mx-auto dark:prose-invert">
          <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <h2 className="text-2xl font-semibold mt-8">1. Introduction</h2>
          <p>This Privacy Policy explains how Speech to Text PRO collects, uses, and protects your personal information.</p>

          <h2 className="text-2xl font-semibold mt-8">2. Information We Collect</h2>
          <p>We collect the following types of information:</p>
          <ul>
            <li>Account information (email, name, profile picture)</li>
            <li>Usage data and analytics</li>
            <li>Audio recordings during transcription</li>
            <li>Generated transcripts and modifications</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8">3. How We Use Your Information</h2>
          <p>Your information is used for:</p>
          <ul>
            <li>Providing and improving our services</li>
            <li>Service optimization and development</li>
            <li>Communication about updates and features</li>
            <li>Legal compliance and rights protection</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8">4. Cookies and Tracking</h2>
          <p>We use cookies and similar technologies for:</p>
          <ul>
            <li>Session management and authentication</li>
            <li>User preferences and settings</li>
            <li>Analytics and performance monitoring</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8">5. Analytics</h2>
          <p>We use analytics tools to understand service usage and improve user experience. This data is anonymized where possible.</p>

          <h2 className="text-2xl font-semibold mt-8">6. Data Security</h2>
          <p>We implement appropriate security measures to protect your information from unauthorized access, alteration, or destruction.</p>

          <h2 className="text-2xl font-semibold mt-8">7. Third-Party Services</h2>
          <p>We use the following third-party services:</p>
          <ul>
            <li>OpenAI - For AI-powered text processing</li>
            <li>Replicate.com - For AI model hosting</li>
            <li>Groq.com - For AI processing</li>
            <li>Google Analytics - For usage analytics</li>
            <li>Google Sign-In - For authentication</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8">8. Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal information. Contact us to exercise these rights.</p>

          <h2 className="text-2xl font-semibold mt-8">9. AI Processing</h2>
          <p>Your audio and text data may be processed by AI systems. We ensure appropriate safeguards for data protection during AI processing.</p>

          <h2 className="text-2xl font-semibold mt-8">10. Changes to Privacy Policy</h2>
          <p>We may update this policy periodically. Continued use of the service after changes constitutes acceptance.</p>

          <h2 className="text-2xl font-semibold mt-8">11. Contact Us</h2>
          <p>For privacy-related inquiries:<br />
          Email: florian.standhartinger@gmail.com<br />
          Phone: +49 178 1981631<br />
          Address: Reichenbergerstr. 2, 94036 Passau, Germany</p>

          <p className="text-sm text-muted-foreground mt-12">© 2024 productivity-boost.com Betriebs UG (haftungsbeschränkt) & Co. KG. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
} 