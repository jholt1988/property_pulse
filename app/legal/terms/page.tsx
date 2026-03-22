export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Terms of Service</h1>
      <p className="text-sm text-gray-500">Version 0.1 · Effective 2026-02-22</p>
      <p>
        These Terms govern use of Property Pulse services by tenants, property managers, and
        administrators. By using the platform, you agree to these terms.
      </p>
      <h2 className="text-lg font-medium">Acceptable use</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>Provide accurate account and application information</li>
        <li>Use the service only for lawful property management activity</li>
        <li>Do not abuse, disrupt, or attempt unauthorized access</li>
      </ul>
      <h2 className="text-lg font-medium">Account actions</h2>
      <p>
        Accounts may be suspended or terminated for misuse, policy violations, or fraudulent
        activity. Access may also be restricted by the account owner (property organization).
      </p>
      <h2 className="text-lg font-medium">Service disclaimer</h2>
      <p>
        The service is provided “as is” and may change over time. Production legal language should
        be reviewed and finalized by counsel prior to go-live.
      </p>
      <p className="text-sm text-gray-500">
        Acceptance is recorded with timestamp and terms version during application submission.
      </p>
    </main>
  );
}
