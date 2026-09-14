import Link from "next/link";
import { PassportCardMock } from "@/components/PassportCardMock";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

const steps = [
  {
    n: "01",
    title: "Issue a pointer",
    body: "Your card and app show a random QR token — never blood group, never allergies, never a name.",
  },
  {
    n: "02",
    title: "Scan in the Golden Hour",
    body: "Anyone with the token opens crash data: blood group, allergies, chronic conditions, and ICE contacts.",
  },
  {
    n: "03",
    title: "Unlock the ledger",
    body: "Authenticated clinicians reach the full clinical record. Row-level security keeps that door closed to everyone else.",
  },
];

const features = [
  {
    title: "Zero-data QR",
    body: "The printed code is a 128-bit pointer. Medical data lives in the cloud, gated by Postgres.",
  },
  {
    title: "Crash data in two seconds",
    body: "A single SECURITY DEFINER function returns only what a responder needs, and writes an audit row every time.",
  },
  {
    title: "Two-tier access",
    body: "Public emergency snapshot for the field. Full ledger only for verified clinicians and admins.",
  },
  {
    title: "Patient-owned passport",
    body: "People manage blood group, allergies, conditions, and ICE contacts from a living dashboard.",
  },
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(33,120,104,0.07),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(244,238,218,0.7),transparent_45%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute top-24 right-[12%] hidden h-72 w-72 rounded-full border border-brand/20 lg:block"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute top-40 right-[8%] hidden h-48 w-48 rounded-full border border-brand/15 lg:block"
          />

          <div className="relative mx-auto grid max-w-6xl items-center gap-16 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
            <div>
              <p className="text-xs font-semibold tracking-[0.28em] uppercase">
                Medical identity · Golden Hour
              </p>
              <h1 className="mt-5 font-display text-5xl leading-[1.05] font-semibold tracking-tight sm:text-6xl lg:text-7xl">
                Emergency data, without exposing a life story.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-brand/75">
                VitalTag is a dynamic emergency medical passport. First
                responders get verified crash data in seconds. Hospitals get the
                ledger. Patients keep control of what lives on the card — which
                is nothing but a pointer.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  href="/signup"
                  className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-cream transition hover:bg-brand-dark"
                >
                  Create your passport
                </Link>
                <Link
                  href="/login"
                  className="rounded-full border border-brand/30 px-6 py-3 text-sm font-semibold transition hover:bg-brand/10"
                >
                  Log in
                </Link>
              </div>
              <dl className="mt-14 grid max-w-lg grid-cols-3 gap-6 border-t border-brand/15 pt-8">
                <div>
                  <dt className="text-[0.65rem] tracking-[0.18em] uppercase text-brand/55">
                    Scan
                  </dt>
                  <dd className="mt-1 font-display text-2xl font-semibold">
                    &lt;2s
                  </dd>
                </div>
                <div>
                  <dt className="text-[0.65rem] tracking-[0.18em] uppercase text-brand/55">
                    Tiers
                  </dt>
                  <dd className="mt-1 font-display text-2xl font-semibold">
                    Two
                  </dd>
                </div>
                <div>
                  <dt className="text-[0.65rem] tracking-[0.18em] uppercase text-brand/55">
                    Login to scan
                  </dt>
                  <dd className="mt-1 font-display text-2xl font-semibold">
                    None
                  </dd>
                </div>
              </dl>
            </div>
            <PassportCardMock />
          </div>
        </section>

        <section
          id="how-it-works"
          className="border-t border-brand/15 bg-background-elevated/60"
        >
          <div className="mx-auto max-w-6xl px-6 py-20">
            <p className="text-xs font-semibold tracking-[0.28em] uppercase">
              How it works
            </p>
            <h2 className="mt-3 max-w-2xl font-display text-4xl font-semibold tracking-tight">
              A card in the field. A ledger in the hospital.
            </h2>
            <ol className="mt-12 grid gap-6 md:grid-cols-3">
              {steps.map((step) => (
                <li
                  key={step.n}
                  className="rounded-3xl border border-brand/15 bg-cream p-7"
                >
                  <p className="font-display text-3xl text-brand/35">{step.n}</p>
                  <h3 className="mt-4 font-display text-xl font-semibold">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-brand/70">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="access" className="border-t border-brand/15">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold tracking-[0.28em] uppercase">
                Access model
              </p>
              <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight">
                Two doors. One token.
              </h2>
              <p className="mt-4 text-brand/70">
                The QR never carries PHI. Postgres enforces who may see what —
                not a checkbox in the app.
              </p>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-2">
              <article className="relative overflow-hidden rounded-3xl border border-brand/20 bg-cream p-8">
                <p className="text-[0.65rem] font-semibold tracking-[0.24em] uppercase">
                  Tier 1
                </p>
                <h3 className="mt-2 font-display text-3xl font-semibold">
                  Emergency crash data
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-brand/70">
                  Anyone with the QR token. No account. Blood group, allergies,
                  chronic conditions, ICE contacts — and an audit log on every
                  call.
                </p>
                <p className="mt-8 font-mono text-xs text-brand/55">
                  GET /emergency/&lt;qr_token&gt;
                </p>
              </article>

              <article className="rounded-3xl bg-brand p-8 text-cream">
                <p className="text-[0.65rem] font-semibold tracking-[0.24em] uppercase opacity-70">
                  Tier 2
                </p>
                <h3 className="mt-2 font-display text-3xl font-semibold">
                  Full clinical ledger
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-cream/80">
                  Authenticated clinicians and admins. Row-level security on
                  clinical records. Designed for the hospital terminal, not the
                  roadside.
                </p>
                <Link
                  href="/terminal"
                  className="mt-8 inline-flex text-sm font-semibold underline decoration-cream/40 underline-offset-4 hover:decoration-cream"
                >
                  Open the hospital terminal
                </Link>
              </article>
            </div>
          </div>
        </section>

        <section className="border-t border-brand/15">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <h2 className="font-display text-4xl font-semibold tracking-tight">
              Built for the minute it matters.
            </h2>
            <div className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-brand/15 bg-brand/15 sm:grid-cols-2">
              {features.map((feature) => (
                <article key={feature.title} className="bg-cream p-8">
                  <h3 className="font-display text-xl font-semibold">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-brand/70">
                    {feature.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="for-hospitals"
          className="border-t border-brand/15 bg-background-elevated/60"
        >
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-2">
            <div>
              <p className="text-xs font-semibold tracking-[0.28em] uppercase">
                For hospitals
              </p>
              <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight">
                A terminal for staff, not a second EHR.
              </h2>
              <p className="mt-4 leading-relaxed text-brand/70">
                Look up a passport, confirm contraindications, and read the
                ledger when the role allows it. Pharmacy holds are in the
                schema for the next module.
              </p>
              <Link
                href="/signup"
                className="mt-8 inline-flex rounded-full bg-brand px-6 py-3 text-sm font-semibold text-cream transition hover:bg-brand-dark"
              >
                Request clinician access
              </Link>
            </div>
            <div className="rounded-3xl border border-brand/15 bg-cream p-8">
              <p className="text-xs tracking-[0.2em] uppercase text-brand/55">
                Surfaces
              </p>
              <ul className="mt-6 divide-y divide-brand/10">
                <li className="flex items-baseline justify-between py-4">
                  <span className="font-medium">Public scan</span>
                  <span className="text-sm text-brand/60">No login</span>
                </li>
                <li className="flex items-baseline justify-between py-4">
                  <span className="font-medium">Patient dashboard</span>
                  <span className="text-sm text-brand/60">Owner</span>
                </li>
                <li className="flex items-baseline justify-between py-4">
                  <span className="font-medium">Hospital terminal</span>
                  <span className="text-sm text-brand/60">Clinician</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="border-t border-brand/15">
          <div className="mx-auto max-w-6xl px-6 py-24 text-center">
            <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              Carry a pointer.
              <br />
              Not your chart.
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-brand/70">
              Set up a passport, print the QR, and keep crash data ready for
              the people who need it first.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/signup"
                className="rounded-full bg-brand px-7 py-3 text-sm font-semibold text-cream transition hover:bg-brand-dark"
              >
                Get a VitalTag
              </Link>
              <Link
                href="/dashboard"
                className="rounded-full border border-brand/30 px-7 py-3 text-sm font-semibold transition hover:bg-brand/10"
              >
                Go to dashboard
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
