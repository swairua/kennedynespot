import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useLocation, Link } from "react-router-dom";
import { Fragment } from "react";
import { createBreadcrumbSchema } from "@/utils/seoHelpers";
import { Helmet } from "react-helmet-async";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

function getRouteLabel(path: string, content: any) {
  // Prefer navigation entries
  const navLink = content?.navigation?.links?.find((l: any) => l.href === path);
  if (navLink?.name) return navLink.name;

  // Check pages content
  const pages = content?.pages || {};
  switch (path) {
    case '/':
      return 'Home';
    case '/about':
      return pages.about?.title ?? 'About';
    case '/strategy':
      return pages.driveStrategy?.title ?? 'Strategy';
    case '/services':
      return content?.services?.title ?? 'Services';
    case '/services/learn':
      return 'Learn';
    case '/mentorship':
      return pages.contact?.title ?? 'Mentorship';
    case '/placement-quiz':
      return 'Placement Quiz';
    case '/blog':
      return pages.blog?.title ?? 'Blog';
    case '/faqs':
      return pages.faqs?.title ?? 'FAQs';
    case '/contact':
      return pages.contact?.title ?? 'Contact';
    case '/resources':
      return 'Resources';
    case '/lp/drive-education':
      return 'Drive Education';
    case '/privacy-policy':
      return 'Privacy Policy';
    case '/terms-of-use':
      return 'Terms of Use';
    case '/risk-disclaimer':
      return 'Risk Disclaimer';
    case '/affiliate-disclosure':
      return 'Affiliate Disclosure';
    default:
      return path.split('/').pop()?.replace(/-/g, ' ')?.replace(/(^|\s)\S/g, (l: string) => l.toUpperCase()) || path;
  }
}

export function BreadcrumbNavigation() {
  const location = useLocation();
  const { content } = useSiteContent();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  // Don't show breadcrumbs on home page or admin routes
  if (location.pathname === '/' || location.pathname.startsWith('/admin')) {
    return null;
  }

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: getRouteLabel('/', content), href: '/' }
  ];

  // Special handling for course pages - virtually nest them under Resources
  if (location.pathname.startsWith('/courses/')) {
    breadcrumbItems.push(
      { label: getRouteLabel('/resources', content), href: '/resources' },
      { label: 'Courses', href: '/resources#courses' }
    );

    // Add the course name as the final breadcrumb
    const courseSlug = pathSegments[1];
    const courseName = courseSlug.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');

    breadcrumbItems.push({
      label: courseName,
      href: undefined // Current page, no link
    });
  } else {
    // Regular breadcrumb generation for other pages
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const label = getRouteLabel(currentPath, content);

      breadcrumbItems.push({
        label,
        href: index === pathSegments.length - 1 ? undefined : currentPath
      });
    });
  }

  // Create schema for SEO
  const schemaItems = breadcrumbItems.map(item => ({
    name: item.label,
    url: item.href ? `${window.location.origin}${item.href}` : window.location.href
  }));

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(createBreadcrumbSchema(schemaItems))}
        </script>
      </Helmet>

      <nav aria-label="Breadcrumb" className="py-4">
        <div className="container px-4">
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbItems.map((item, index) => (
                <Fragment key={item.label}>
                  <BreadcrumbItem>
                    {item.href ? (
                      <BreadcrumbLink asChild>
                        <Link to={item.href}>{item.label}</Link>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{item.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                  {index < breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
                </Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </nav>
    </>
  );
}
