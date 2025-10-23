import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Info, CheckCircle, AlertTriangle, XCircle, 
  Copy, Check, ChevronDown, ChevronUp,
  BarChart3, ArrowRight, Play
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Callout Component
interface CalloutProps {
  type: 'info' | 'success' | 'warning' | 'danger';
  children: React.ReactNode;
  title?: string;
}

export const Callout: React.FC<CalloutProps> = ({ type, children, title }) => {
  const variants = {
    info: {
      bg: 'bg-blue-50 dark:bg-blue-950/50',
      border: 'border-blue-200 dark:border-blue-800',
      icon: Info,
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    success: {
      bg: 'bg-green-50 dark:bg-green-950/50',
      border: 'border-green-200 dark:border-green-800',
      icon: CheckCircle,
      iconColor: 'text-green-600 dark:text-green-400'
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-950/50',
      border: 'border-yellow-200 dark:border-yellow-800',
      icon: AlertTriangle,
      iconColor: 'text-yellow-600 dark:text-yellow-400'
    },
    danger: {
      bg: 'bg-red-50 dark:bg-red-950/50',
      border: 'border-red-200 dark:border-red-800',
      icon: XCircle,
      iconColor: 'text-red-600 dark:text-red-400'
    }
  };

  const variant = variants[type];
  const Icon = variant.icon;

  return (
    <div className={cn(
      'my-6 rounded-lg border p-4',
      variant.bg,
      variant.border
    )}>
      <div className="flex items-start gap-3">
        <Icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', variant.iconColor)} />
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="font-semibold text-foreground mb-2">{title}</h4>
          )}
          <div className="text-sm text-foreground/90 prose-sm prose-p:my-2 prose-p:last:mb-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// Code Block Component
interface CodeBlockProps {
  code: string;
  language?: string;
  showCopyButton?: boolean;
  showLineNumbers?: boolean;
  filename?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'javascript',
  showCopyButton = true,
  showLineNumbers = false,
  filename
}) => {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const lines = code.split('\n');

  return (
    <div className="my-6 rounded-lg border bg-muted/50 overflow-hidden">
      {filename && (
        <div className="flex items-center justify-between px-4 py-2 border-b bg-muted">
          <span className="text-sm font-mono text-muted-foreground">{filename}</span>
          <Badge variant="outline" className="text-xs">
            {language}
          </Badge>
        </div>
      )}
      <div className="relative">
        <pre className="p-4 overflow-x-auto text-sm font-mono">
          <code className={`language-${language}`}>
            {showLineNumbers ? (
              <table className="w-full">
                <tbody>
                  {lines.map((line, index) => (
                    <tr key={index}>
                      <td className="pr-4 text-muted-foreground select-none text-right">
                        {index + 1}
                      </td>
                      <td>{line}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              code
            )}
          </code>
        </pre>
        {showCopyButton && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 h-8 w-8 p-0"
            onClick={copyToClipboard}
            aria-label="Copy code"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

// Figure Component
interface FigureProps {
  src: string;
  alt: string;
  caption?: string;
  credit?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export const Figure: React.FC<FigureProps> = ({
  src,
  alt,
  caption,
  credit,
  width,
  height,
  priority = false
}) => {
  return (
    <figure className="my-8">
      <div className="rounded-lg overflow-hidden border bg-muted/50">
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="w-full h-auto"
          loading={priority ? 'eager' : 'lazy'}
        />
      </div>
      {(caption || credit) && (
        <figcaption className="mt-3 text-sm text-muted-foreground text-center">
          {caption && <span>{caption}</span>}
          {caption && credit && <span> </span>}
          {credit && <span className="italic">Credit: {credit}</span>}
        </figcaption>
      )}
    </figure>
  );
};

// FAQ Component
interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  items: FAQItem[];
  title?: string;
}

export const FAQ: React.FC<FAQProps> = ({ items, title = "Frequently Asked Questions" }) => {
  const [openItems, setOpenItems] = React.useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  return (
    <div className="my-8">
      <h3 className="text-xl font-semibold mb-6">{title}</h3>
      <div className="space-y-4">
        {items.map((item, index) => (
          <Card key={index} className="overflow-hidden">
            <button
              className="w-full text-left p-4 hover:bg-muted/50 transition-colors"
              onClick={() => toggleItem(index)}
              aria-expanded={openItems.has(index)}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-medium pr-4">{item.question}</h4>
                {openItems.has(index) ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                )}
              </div>
            </button>
            {openItems.has(index) && (
              <CardContent className="pt-0 pb-4 px-4">
                <div className="text-muted-foreground">{item.answer}</div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

// How-To Component
interface HowToStep {
  title: string;
  text: string;
  image?: string;
}

interface HowToProps {
  steps: HowToStep[];
  title?: string;
}

export const HowTo: React.FC<HowToProps> = ({ steps, title = "How to Guide" }) => {
  return (
    <div className="my-8">
      <h3 className="text-xl font-semibold mb-6">{title}</h3>
      <div className="space-y-6">
        {steps.map((step, index) => (
          <div key={index} className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold text-sm">
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium mb-2">{step.title}</h4>
              <p className="text-muted-foreground mb-3">{step.text}</p>
              {step.image && (
                <div className="rounded-lg overflow-hidden border bg-muted/50">
                  <img
                    src={step.image}
                    alt={`Step ${index + 1}: ${step.title}`}
                    className="w-full h-auto"
                    loading="lazy"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// KPI/Stat Component
interface KPIProps {
  label: string;
  value: string | number;
  hint?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
}

export const KPI: React.FC<KPIProps> = ({ label, value, hint, trend, icon }) => {
  return (
    <Card className="p-6 text-center">
      <CardContent className="p-0">
        {icon && (
          <div className="flex justify-center mb-3">
            {icon}
          </div>
        )}
        <div className="text-3xl font-bold text-primary mb-2">{value}</div>
        <div className="font-medium text-foreground mb-1">{label}</div>
        {hint && (
          <div className="text-sm text-muted-foreground">{hint}</div>
        )}
        {trend && (
          <Badge 
            variant={trend === 'up' ? 'default' : trend === 'down' ? 'destructive' : 'secondary'}
            className="mt-2"
          >
            {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'} {trend}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
};

// CTA Block Component
interface CTABlockProps {
  title: string;
  description: string;
  primaryButton: {
    text: string;
    href: string;
    utm?: string;
  };
  secondaryButton?: {
    text: string;
    href: string;
  };
  variant?: 'default' | 'accent';
}

export const CTABlock: React.FC<CTABlockProps> = ({
  title,
  description,
  primaryButton,
  secondaryButton,
  variant = 'default'
}) => {
  const bgClass = variant === 'accent' 
    ? 'bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20' 
    : 'bg-muted/50';

  return (
    <Card className={cn('my-8 p-8 text-center', bgClass)}>
      <CardContent className="p-0">
        <h3 className="text-2xl font-bold mb-3">{title}</h3>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">{description}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <a 
              href={primaryButton.utm ? `${primaryButton.href}?${primaryButton.utm}` : primaryButton.href}
              className="inline-flex items-center gap-2"
            >
              {primaryButton.text}
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
          {secondaryButton && (
            <Button asChild variant="outline" size="lg">
              <a href={secondaryButton.href}>
                {secondaryButton.text}
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Video Embed Component
interface VideoEmbedProps {
  src: string;
  title: string;
  thumbnail?: string;
  duration?: string;
}

export const VideoEmbed: React.FC<VideoEmbedProps> = ({
  src,
  title,
  thumbnail,
  duration
}) => {
  // autoplay videos on page load (muted to satisfy browser autoplay policies)
  const [isPlaying, setIsPlaying] = React.useState(true);

  const makeAutoplaySrc = (url: string) => {
    if (!url) return url;
    // if already has autoplay param, leave it
    if (url.includes('autoplay=1')) return url;
    const append = 'autoplay=1&mute=1';
    return url.includes('?') ? `${url}&${append}` : `${url}?${append}`;
  };

  return (
    <div className="my-8">
      <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
        {!isPlaying && thumbnail ? (
          <div className="relative w-full h-full cursor-pointer" onClick={() => setIsPlaying(true)}>
            <img
              src={thumbnail}
              alt={title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <Button size="lg" className="rounded-full w-16 h-16 p-0">
                <Play className="h-8 w-8 ml-1" />
              </Button>
            </div>
            {duration && (
              <Badge className="absolute bottom-4 right-4 bg-black/80 text-white">
                {duration}
              </Badge>
            )}
          </div>
        ) : (
          <iframe
            src={makeAutoplaySrc(src)}
            title={title}
            className="w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        )}
      </div>
      <p className="mt-3 text-sm font-medium text-center">{title}</p>
    </div>
  );
};
