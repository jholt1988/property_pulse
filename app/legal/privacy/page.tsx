export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Privacy Policy</h1>
      <p className="text-sm text-gray-500">Version 0.1 · Effective 2026-02-22</p>
      <p>
        This Privacy Policy explains what information Property Pulse collects, how it is used,
        and your choices. This version is intended for current app flows and should be reviewed
        by legal counsel before production launch.
      </p>
      <h2 className="text-lg font-medium">What we collect</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>Account details (name, email, phone, role)</li>
        <li>Property and lease related records</li>
        <li>Application and maintenance submission data</li>
        <li>Operational logs and security events</li>
      </ul>
      <h2 className="text-lg font-medium">How we use it</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>Provide tenant and manager workflows</li>
        <li>Support billing, inspections, and messaging features</li>
        <li>Detect abuse and maintain platform security</li>
      </ul>
      <h2 className="text-lg font-medium">Your choices</h2>
      <p>
        You may request correction or deletion of your data subject to legal and contractual
        obligations. Contact your property manager or system administrator for requests.
      </p>
      <p className="text-sm text-gray-500">
        Acceptance is recorded with timestamp and policy version during application submission.
      </p>
    </main>
  );
}
