import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Link } from "react-router-dom";
import { LINKS, getExternalLinkProps } from "@/constants/links";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main id="main" className="py-16 md:py-20">
        <section className="container px-4 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">About</h1>

          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-10">
            <Link to="/resources" className="underline text-primary font-semibold">Trader</Link>
            <span className="mx-3 text-muted-foreground">|</span>
            <Link to="/mentorship" className="underline text-primary font-semibold">Mentor</Link>
            <span className="mx-3 text-muted-foreground">|</span>
            <Link to="/strategy" className="underline text-primary font-semibold">DRIVE Strategy</Link>
            <span className="mx-3 text-muted-foreground">|</span>
            <a {...getExternalLinkProps(LINKS.telegram.community)} className="underline text-primary font-semibold">Traders in the Zone Community</a>
          </p>

          <div className="space-y-6 text-base md:text-lg leading-8 text-foreground">
            <p>
              Hello! I'm Kennedy Eshifulula, commonly known as KenneDyne spot, a dedicated Trader and Mentor with a mission to simplify the complexities of the foreign exchange market. My journey is backed by over 5 years of experience navigating the global currency landscape.
            </p>
            <p>
              My foundation is built on analytical rigor, stemming from my academic background in Actuarial Science. This unique blend of mathematical discipline and financial expertise informs every decision I make, allowing me to approach the markets not just as a trader, but as a risk manager first.
            </p>

            <h2 className="text-2xl md:text-3xl font-semibold mt-10">Trading with Institutional Insight</h2>
            <p>
              My core specialty revolves around institutional trading concepts and understanding Smart Money flow. I believe the true edge is found by tracking the footprints of major market players. This approach led me to develop my proprietary methodology: the Smart Money DRIVE Concept—a systematic strategy designed for identifying high-probability opportunities while prioritizing risk management.
            </p>

            <h3 className="text-xl md:text-2xl font-semibold mt-8">My expertise includes:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Advanced Technical Analysis focused on supply and demand zones and institutional Support &amp; Resistance</li>
              <li>Disciplined application of the Smart Money DRIVE Concept</li>
              <li>In-depth Risk Management</li>
            </ul>

            <h2 className="text-2xl md:text-3xl font-semibold mt-10">Founder of Traders In The Zone</h2>
            <p>
              Beyond my own trading, I am the Founder of Traders In The Zone, a thriving global trading community. My passion is helping ambitious traders connect, learn, and grow together, transforming complex theories into actionable, disciplined strategies.
            </p>
            <p>
              If you're looking to elevate your understanding of the markets, I host regular online trading classes. For local members, I'm pleased to offer in-person guidance from our office: <strong>Cycad Place, 3rd Sunrise Avenue, Thika</strong>.
            </p>

            <h2 className="text-2xl md:text-3xl font-semibold mt-10">Risk Warning</h2>
            <p className="text-muted-foreground">
              Trading foreign exchange (Forex) and other leveraged products carries a high level of risk and may not be suitable for all investors. The high degree of leverage can work both against you and for you, potentially leading to losses that exceed your deposit. Before deciding to trade, you should carefully consider your investment objectives, level of experience, and risk appetite. You should not invest money that you cannot afford to lose. You should be aware of all the risks associated with foreign exchange trading, and seek advice from an independent financial advisor if you have any doubts. Past performance is not indicative of future results. This site provides educational and informational content only, and is not a recommendation or solicitation to buy or sell any financial instrument.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
