import { useLocation } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import Index from "./Index";
import tradingWorkspace from "@/assets/trading-workspace.jpg";

const IndexWithSEO = () => {
  const location = useLocation();
  const canonical = `https://institutional-trader.com${location.pathname}`;

  return (
    <>
      <SEOHead
        title="KenneDyne spot | Professional Forex Education & DRIVE Strategy"
        description="Master institutional trading concepts with our structured education program and proven DRIVE framework. Professional forex mentorship, risk management, and systematic trading education."
        keywords="institutional trading education, forex mentorship, DRIVE strategy, trading psychology, risk management, smart money concepts, forex education Kenya"
        canonical={canonical}
        lcpImage={tradingWorkspace}
        lcpPreloads={[
          { href: tradingWorkspace, media: "(min-width: 1024px)" },
          { href: tradingWorkspace, media: "(max-width: 1023px)" }
        ]}
      />
      <Index />
    </>
  );
};

export default IndexWithSEO;
