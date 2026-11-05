import { telHref } from "@/lib/site";

/** Full-bleed cinematic hero: drone video, else a slow Ken Burns photo, else animated brick. */
export default function Hero({ video, image, headline, subhead, phone, stats }: {
  video?: string; image?: string; headline: string; subhead: string; phone: string;
  stats: { n: string; l: string }[];
}) {
  const words = headline.split(/\s+/);
  return (
    <section className="cine">
      <div className="cine-media" aria-hidden="true">
        {video ? (
          <video autoPlay muted loop playsInline preload="metadata" poster={image}>
            <source src={video} />
          </video>
        ) : image ? (
          <img src={image} alt="" className="kenburns" />
        ) : (
          <div className="cine-brick" />
        )}
        <div className="cine-shade" />
      </div>
      <div className="cine-inner">
        <div className="eyebrow cine-rise" style={{ ["--d" as string]: "0ms" }}>Bricktown · Oklahoma City</div>
        <h1 className="cine-title">
          {words.map((w, i) => (
            <span key={i} className="cine-word" style={{ ["--d" as string]: `${120 + i * 110}ms` }}>{w}{" "}</span>
          ))}
        </h1>
        <p className="cine-rise" style={{ ["--d" as string]: `${200 + words.length * 110}ms` }}>{subhead}</p>
        <div className="row cine-rise" style={{ ["--d" as string]: `${320 + words.length * 110}ms`, marginTop: 20 }}>
          <a className="btn" href="#listings">View properties</a>
          <a className="btn ghost light" href="#map">See the map</a>
          <a className="btn ghost light" href={telHref(phone)}>Call {phone}</a>
        </div>
        <div className="hero-stats cine-rise" style={{ ["--d" as string]: `${440 + words.length * 110}ms` }}>
          {stats.map((s) => <div key={s.l}><b>{s.n}</b><span>{s.l}</span></div>)}
        </div>
      </div>
      <a href="#listings" className="cine-scroll" aria-label="Scroll to properties"><span /></a>
    </section>
  );
}
