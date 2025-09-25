import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  BookOpen, 
  TrendingUp, 
  Users,
  ArrowRight 
} from "lucide-react";

const paths = [
  {
    icon: BookOpen,
    title: "Learn",
    description: "Free & paid courses with progress tracking",
    features: ["Self-paced learning", "Quiz assessments", "Community access"],
    cta: "Start Learning"
  },
  {
    icon: TrendingUp,
    title: "Signals & Tools", 
    description: "How to use responsibly with risk rules",
    features: ["Study-grade signals", "Clear invalidation", "Risk notes included"],
    cta: "Try Signals on Demo"
  },
  {
    icon: Users,
    title: "Mentorship",
    description: "Cohort + 1:1 guidance, weekly reviews", 
    features: ["8-week cohort", "Personal feedback", "Journal audits"],
    cta: "Apply for Mentorship"
  }
];

export function ChoosePathSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Choose your path
            </h2>
            <p className="text-xl text-muted-foreground">
              Start where you are, progress at your pace
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {paths.map((path, index) => (
              <Card key={index} className="p-8 border border-border hover:shadow-card transition-all duration-200">
                <div className="text-center">
                  <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
                    <path.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    {path.title}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {path.description}
                  </p>
                  <ul className="space-y-2 mb-8">
                    {path.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="text-sm text-muted-foreground">
                        • {feature}
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" className="w-full">
                    {path.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}