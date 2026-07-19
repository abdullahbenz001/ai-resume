import { AnalyzeForm } from "@/components/analyze-form";

export default function Home() {
  return (
    <div className="relative flex-1 overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,oklch(0.92_0.04_220),transparent),linear-gradient(180deg,oklch(0.99_0.01_220),oklch(0.97_0.01_240)_45%,oklch(0.985_0.005_220))] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,oklch(0.28_0.04_220),transparent),linear-gradient(180deg,oklch(0.16_0.01_260),oklch(0.145_0.01_260)_50%,oklch(0.13_0.01_260))]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] opacity-40 dark:opacity-25 [background-image:linear-gradient(oklch(0.55_0.02_220/0.12)_1px,transparent_1px),linear-gradient(90deg,oklch(0.55_0.02_220/0.12)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:linear-gradient(to_bottom,black,transparent)]"
      />

      <main className="relative mx-auto w-full max-w-5xl px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-12 lg:px-8">
        <section className="mb-10 sm:mb-14">
          <div className="max-w-2xl">
            <p className="mb-4 text-[13px] font-semibold tracking-[0.14em] text-teal-800 uppercase dark:text-teal-300/90">
              AI Resume Match
            </p>
            <h1 className="font-heading text-[2.15rem] leading-[1.15] font-semibold tracking-tight text-foreground sm:text-5xl sm:leading-[1.1]">
              Know your fit before you apply
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Paste a resume and job description. Get a clear match score, skill
              gaps, and concrete rewrite suggestions in seconds.
            </p>
          </div>
        </section>

        <AnalyzeForm />
      </main>
    </div>
  );
}
