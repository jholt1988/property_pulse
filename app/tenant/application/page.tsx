"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getPublicProperties, submitRentalApplication, type PublicProperty } from "@/lib/api";

const TERMS_VERSION = "0.1";
const PRIVACY_VERSION = "0.1";

export default function TenantApplicationPage() {
  const [properties, setProperties] = useState<PublicProperty[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [selectedUnitId, setSelectedUnitId] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [previousAddress, setPreviousAddress] = useState("");
  const [income, setIncome] = useState("");
  const [creditScore, setCreditScore] = useState("");
  const [monthlyDebt, setMonthlyDebt] = useState("");
  const [negativeAspectsExplanation, setNegativeAspectsExplanation] = useState("");

  const [authorizeCreditCheck, setAuthorizeCreditCheck] = useState(false);
  const [authorizeBackgroundCheck, setAuthorizeBackgroundCheck] = useState(false);
  const [authorizeEmploymentVerification, setAuthorizeEmploymentVerification] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getPublicProperties();
        setProperties(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setError(e?.message || "Failed to load properties");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const selectedProperty = useMemo(
    () => properties.find((p) => p.id === Number(selectedPropertyId)),
    [properties, selectedPropertyId],
  );

  const selectedUnit = useMemo(
    () => selectedProperty?.units?.find((u) => u.id === Number(selectedUnitId)),
    [selectedProperty, selectedUnitId],
  );

  const canSubmit =
    !!selectedPropertyId &&
    !!selectedUnitId &&
    !!fullName.trim() &&
    !!email.trim() &&
    !!phoneNumber.trim() &&
    !!previousAddress.trim() &&
    authorizeCreditCheck &&
    authorizeBackgroundCheck &&
    authorizeEmploymentVerification &&
    termsAccepted &&
    privacyAccepted;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessId(null);

    if (!canSubmit) {
      setError("Please complete required fields and accept all authorizations.");
      return;
    }

    setSubmitting(true);
    try {
      const token = document.cookie.match(/(?:^|; )session_token=([^;]+)/)?.[1];
      const result = await submitRentalApplication(
        {
          propertyId: Number(selectedPropertyId),
          unitId: Number(selectedUnitId),
          fullName: fullName.trim(),
          email: email.trim(),
          phoneNumber: phoneNumber.trim(),
          previousAddress: previousAddress.trim(),
          income: income ? Number(income) : undefined,
          creditScore: creditScore ? Number(creditScore) : undefined,
          monthlyDebt: monthlyDebt ? Number(monthlyDebt) : undefined,
          authorizeCreditCheck,
          authorizeBackgroundCheck,
          authorizeEmploymentVerification,
          termsAccepted,
          privacyAccepted,
          termsVersion: TERMS_VERSION,
          privacyVersion: PRIVACY_VERSION,
          negativeAspectsExplanation: negativeAspectsExplanation.trim() || undefined,
        },
        token,
      );

      setSuccessId(String(result?.id ?? `APP-${Date.now().toString().slice(-6)}`));
    } catch (e: any) {
      setError(e?.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <main className="p-6">Loading application form...</main>;

  return (
    <main className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold">Rental Application</h1>
        <p className="text-sm text-gray-500">Apply for an available unit with your property manager.</p>
      </header>

      {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {successId && (
        <div className="rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          Application submitted successfully. Reference ID: <b>{successId}</b>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded border p-4 space-y-3">
          <h2 className="font-medium">Property Selection</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <select
              className="rounded border px-3 py-2"
              value={selectedPropertyId}
              onChange={(e) => {
                setSelectedPropertyId(e.target.value);
                setSelectedUnitId("");
              }}
              required
            >
              <option value="">Select property</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>{p.name} — {p.address}</option>
              ))}
            </select>

            <select
              className="rounded border px-3 py-2"
              value={selectedUnitId}
              onChange={(e) => setSelectedUnitId(e.target.value)}
              disabled={!selectedProperty}
              required
            >
              <option value="">Select unit</option>
              {(selectedProperty?.units || []).map((u) => (
                <option key={u.id} value={u.id}>{u.name}{u.rent ? ` — $${u.rent}/mo` : ""}</option>
              ))}
            </select>
          </div>
        </section>

        <section className="rounded border p-4 space-y-3">
          <h2 className="font-medium">Applicant Info</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <input className="rounded border px-3 py-2" placeholder="Full legal name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            <input className="rounded border px-3 py-2" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input className="rounded border px-3 py-2" placeholder="Phone number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
            <input className="rounded border px-3 py-2" placeholder="Previous address" value={previousAddress} onChange={(e) => setPreviousAddress(e.target.value)} required />
            <input className="rounded border px-3 py-2" type="number" placeholder="Monthly income (optional)" value={income} onChange={(e) => setIncome(e.target.value)} />
            <input className="rounded border px-3 py-2" type="number" placeholder="Credit score (optional)" value={creditScore} onChange={(e) => setCreditScore(e.target.value)} />
          </div>
          <input className="rounded border px-3 py-2 w-full" type="number" placeholder="Monthly debt (optional)" value={monthlyDebt} onChange={(e) => setMonthlyDebt(e.target.value)} />
          <textarea className="w-full rounded border px-3 py-2" rows={3} placeholder="Anything you'd like us to know (optional)" value={negativeAspectsExplanation} onChange={(e) => setNegativeAspectsExplanation(e.target.value)} />
        </section>

        <section className="rounded border p-4 space-y-2 text-sm">
          <h2 className="font-medium">Authorizations</h2>
          <label className="flex items-start gap-2"><input type="checkbox" checked={authorizeCreditCheck} onChange={(e) => setAuthorizeCreditCheck(e.target.checked)} /> <span>I authorize a credit check.</span></label>
          <label className="flex items-start gap-2"><input type="checkbox" checked={authorizeBackgroundCheck} onChange={(e) => setAuthorizeBackgroundCheck(e.target.checked)} /> <span>I authorize a background check.</span></label>
          <label className="flex items-start gap-2"><input type="checkbox" checked={authorizeEmploymentVerification} onChange={(e) => setAuthorizeEmploymentVerification(e.target.checked)} /> <span>I authorize employment verification.</span></label>
          <label className="flex items-start gap-2"><input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} /> <span>I accept the <Link href="/legal/terms" className="underline">Terms of Service</Link>.</span></label>
          <label className="flex items-start gap-2"><input type="checkbox" checked={privacyAccepted} onChange={(e) => setPrivacyAccepted(e.target.checked)} /> <span>I accept the <Link href="/legal/privacy" className="underline">Privacy Policy</Link>.</span></label>
        </section>

        <div>
          <button type="submit" disabled={!canSubmit || submitting} className="rounded bg-black px-4 py-2 text-white disabled:opacity-50">
            {submitting ? "Submitting..." : "Submit Application"}
          </button>
          {!canSubmit && <p className="mt-2 text-xs text-gray-500">Complete required fields and all acknowledgements to submit.</p>}
        </div>
      </form>

      {selectedUnit?.rent ? <p className="text-xs text-gray-500">Selected unit rent: ${selectedUnit.rent}/month</p> : null}
    </main>
  );
}
