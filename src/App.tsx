import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SkipToContent } from "@/components/SkipToContent";
import { ScrollToTop } from "@/components/ScrollToTop";
import { PerformanceMonitor } from "@/components/dev/PerformanceMonitor";
import { useLongTaskObserver } from "@/hooks/useLongTaskObserver";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RequireRoles } from "@/components/RequireRoles";
import { BrowserRouter, HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { GTMProvider } from "@/components/GTMProvider";
import { useSiteSettingsFixed } from "@/hooks/useSiteSettingsFixed";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { AuthProvider } from "@/hooks/useAuth";
import { AppErrorBoundary } from "@/components/AppErrorBoundary";
import { CookieBanner } from "@/components/CookieBanner";
import { BreadcrumbNavigation } from "@/components/BreadcrumbNavigation";
import { StructuredData } from "@/components/StructuredData";

// Eagerly import all route components (no lazy loading)
import Index from "./pages/IndexWithSEO";
import Strategy from "./pages/StrategyWithSEO";
import { ServicesWithSEO as Services } from "./pages/ServicesWithSEO";
import FAQs from "./pages/FAQPageWithSEO";
import Contact from "./pages/ContactWithSEO";
import About from "./pages/About";
import LearnWithSEO from "./pages/LearnWithSEO";
import LP_MentorshipApply from "./pages/LP_MentorshipApply";
import SignalsTools from "./pages/SignalsTools";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";
import RiskDisclaimer from "./pages/RiskDisclaimer";
import AffiliateDisclosure from "./pages/AffiliateDisclosure";
import NotFound from "./pages/NotFound";
import AdminImport from "./pages/AdminImport";
import AdminLeadsEnhanced from "./pages/AdminLeadsEnhanced";
import AdminPayments from "./pages/AdminPayments";
import Resources from "./pages/ResourcesWithSEO";
import CourseDetail from "./pages/CourseDetail";
import LibraryAdminEnhanced from "./pages/LibraryAdminEnhanced";
import BlogManagerEnhanced from "./pages/BlogManagerEnhanced";
import BlogEditor from "./pages/BlogEditor";
import BlogPublic from "./pages/BlogPublic";
import BlogPost from "./pages/BlogPost";
import FAQsManager from "./pages/FAQsManager";
import UsersRolesManager from "./pages/UsersRolesManager";
import SiteSettings from "./pages/SiteSettings";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import { AdminLayout } from "./layouts/AdminLayout";
import LP_DriveEducation from "./pages/LP_DriveEducation";
import PlacementQuiz from "./pages/PlacementQuiz";
import AdminTranslate from "./pages/AdminTranslate";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Debug logging to see if App is rendering
console.log('App.tsx is loading and rendering');

// Health check component
const HealthCheck = () => (
  <div>
    <Helmet>
      <meta name="robots" content="noindex, nofollow" />
    </Helmet>
    OK
  </div>
);

function App() {
  console.log('App component is rendering');
  const { settings } = useSiteSettingsFixed();

  // Monitor long tasks in production
  useLongTaskObserver({
    threshold: 50,
    onLongTask: (duration, taskType) => {
      // Log performance issues in production for monitoring
      if (process.env.NODE_ENV === 'production') {
        console.info(`Performance: ${Math.round(duration)}ms task (${taskType})`);
      }
    }
  });

  const Router = import.meta.env.PROD ? HashRouter : BrowserRouter;
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <GTMProvider gtmId={settings?.gtm_id || undefined}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
            storageKey="vite-ui-theme"
            themes={["dark", "light"]}
          >
            <TooltipProvider>
              <AuthProvider>
                <AppErrorBoundary>
                  <SkipToContent />
                  <PerformanceMonitor />
                  <CookieBanner />
                  <Toaster />
                  <Sonner />
                  <StructuredData />
                  <Router>
                    <ScrollToTop />
                    <AnalyticsProvider />
                    <BreadcrumbNavigation />
                    <Routes>
                      <Route path="/_health" element={<HealthCheck />} />
                      <Route path="/" element={<Index />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/strategy" element={<Strategy />} />
                      <Route path="/services" element={<Services />} />
                      <Route path="/services/learn" element={<LearnWithSEO />} />
                      <Route path="/learn" element={<Navigate to="/services/learn" replace />} />
                      <Route path="/mentorship" element={<LP_MentorshipApply />} />
                      <Route path="/signals-tools" element={<SignalsTools />} />
                      <Route path="/blog" element={<BlogPublic />} />
                      <Route path="/blog/:slug" element={<BlogPost />} />
                      <Route path="/faqs" element={<FAQs />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/resources" element={<Resources />} />
                      <Route path="/courses/:slug" element={<CourseDetail />} />
                      <Route path="/courses" element={<Navigate to="/resources#courses" replace />} />
                      <Route path="/lp/drive-education" element={<LP_DriveEducation />} />
                      <Route path="/lp/mentorship-apply" element={<Navigate to="/mentorship" replace />} />
                      <Route path="/placement-quiz" element={<PlacementQuiz />} />
                      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                      <Route path="/terms-of-use" element={<TermsOfUse />} />
                      <Route path="/risk-disclaimer" element={<RiskDisclaimer />} />
                      <Route path="/affiliate-disclosure" element={<AffiliateDisclosure />} />

                      <Route path="/admin" element={
                        <RequireRoles roles={['admin', 'super_admin']}>
                          <AdminLayout />
                        </RequireRoles>
                      }>
                        <Route index element={<AdminDashboard />} />
                        <Route path="blog" element={<BlogManagerEnhanced />} />
                        <Route path="blog/:id" element={<BlogEditor />} />
                        <Route path="faqs" element={<FAQsManager />} />
                        <Route path="users-roles" element={
                          <RequireRoles roles={['super_admin']}>
                            <UsersRolesManager />
                          </RequireRoles>
                        } />
                        <Route path="settings" element={<SiteSettings />} />
                        <Route path="library" element={<LibraryAdminEnhanced />} />
                        <Route path="leads" element={<AdminLeadsEnhanced />} />
                        <Route path="import" element={
                          <RequireRoles roles={['super_admin']}>
                            <AdminImport />
                          </RequireRoles>
                        } />
                        <Route path="payments" element={<AdminPayments />} />
                        <Route path="translate" element={
                          <RequireRoles roles={['super_admin']}>
                            <AdminTranslate />
                          </RequireRoles>
                        } />
                      </Route>

                      <Route path="/auth" element={<Auth />} />
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Router>
                </AppErrorBoundary>
              </AuthProvider>
            </TooltipProvider>
          </ThemeProvider>
        </GTMProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
