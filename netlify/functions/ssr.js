const fs = require('fs');
const path = require('path');

// List of valid SPA routes that should be served by index.html
const validRoutes = [
  '/',
  '/about',
  '/strategy',
  '/services',
  '/services/learn',
  '/learn',
  '/mentorship',
  '/signals-tools',
  '/blog',
  '/faqs',
  '/contact',
  '/resources',
  '/lp/drive-education',
  '/placement-quiz',
  '/privacy-policy',
  '/terms-of-use',
  '/risk-disclaimer',
  '/affiliate-disclaimer',
  '/admin',
  '/auth',
  '/_health',
  '/debug/ga'
];

// Routes that can have dynamic segments
const dynamicRoutes = [
  { pattern: /^\/blog\/[^/]+$/, route: '/blog/:slug' },
  { pattern: /^\/courses\/[^/]+$/, route: '/courses/:slug' },
  { pattern: /^\/admin\/blog\/[^/]+$/, route: '/admin/blog/:id' },
];

// Routes that accept query parameters
const routesWithQuery = ['/resources'];

function routeExists(pathname) {
  // Remove trailing slash for comparison (except for root)
  const normalizedPath = pathname === '/' ? '/' : pathname.replace(/\/$/, '');
  
  // Check exact matches
  if (validRoutes.includes(normalizedPath)) {
    return true;
  }
  
  // Check dynamic routes
  for (const { pattern } of dynamicRoutes) {
    if (pattern.test(normalizedPath)) {
      return true;
    }
  }
  
  // Check routes with query parameters
  for (const route of routesWithQuery) {
    if (normalizedPath === route) {
      return true;
    }
  }
  
  return false;
}

exports.handler = async (event) => {
  const { path: requestPath } = event;
  
  try {
    // Parse the path (remove query string)
    const pathname = new URL(`https://example.com${requestPath}`).pathname;
    
    // Check if route exists
    const exists = routeExists(pathname);
    
    if (!exists && !pathname.startsWith('/static/')) {
      // Return 404 for non-existent routes
      return {
        statusCode: 404,
        body: 'Not Found',
        headers: {
          'Content-Type': 'text/plain',
        }
      };
    }
    
    // Serve index.html for valid SPA routes
    const indexPath = path.join(__dirname, '../../dist/index.html');
    const indexContent = fs.readFileSync(indexPath, 'utf-8');
    
    return {
      statusCode: 200,
      body: indexContent,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      }
    };
  } catch (error) {
    console.error('SSR function error:', error);
    return {
      statusCode: 500,
      body: 'Internal Server Error'
    };
  }
};
