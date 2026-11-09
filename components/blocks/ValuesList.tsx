import { Reveal } from '@/components/Reveal';
import { getValues } from '@/lib/cms';

/** The brand values as a calm two-column list. */
export async function ValuesList() {
  const values = await getValues();
  return (
    <ul className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
      {values.map((v, i) => (
        <Reveal as="li" key={v.title} delay={(i % 2) * 0.06}>
          <h3 className="font-display text-heading text-teal">{v.title}</h3>
          <p className="mt-2 max-w-md text-body text-ink-soft">{v.desc}</p>
        </Reveal>
      ))}
    </ul>
  );
}
