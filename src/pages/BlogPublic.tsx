import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, Calendar, Clock, User, Tag, ArrowLeft, ArrowRight, Star } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { SectionDivider } from '@/components/SectionDivider';
import { useI18n } from '@/i18n';
import { format } from 'date-fns';
import forexBlogHero from '@/assets/forex-blog-hero.jpg';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featured_image_url?: string;
  published_at: string;
  reading_time_mins: number;
  featured: boolean;
  authors?: { name: string; slug: string }[];
  categories?: { name: string; slug: string }[];
  tags?: { name: string; slug: string }[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface Author {
  id: string;
  name: string;
  slug: string;
}

const POSTS_PER_PAGE = 12;

export default function BlogPublic() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPosts, setTotalPosts] = useState(0);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);
  const [newsletterResult, setNewsletterResult] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  const page = parseInt(searchParams.get('page') || '1', 10);
  const searchTerm = searchParams.get('search') || '';
  const categoryFilter = searchParams.get('category') || '';
  const tagFilter = searchParams.get('tag') || '';
  const authorFilter = searchParams.get('author') || '';

  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  const updateSearchParams = (updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    
    // Reset to page 1 when filters change
    if ('page' in updates === false) {
      newParams.delete('page');
    }
    
    setSearchParams(newParams);
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('blog_posts')
        .select(`
          id,
          title,
          slug,
          excerpt,
          featured_image_url,
          published_at,
          reading_time_mins,
          featured,
          post_authors (
            authors (name, slug)
          ),
          post_categories (
            categories (name, slug)
          ),
          post_tags (
            tags (name, slug)
          )
        `, { count: 'exact' })
        .eq('published', true)
        .or('published_at.is.null,published_at.lte.' + new Date().toISOString())
        .order('featured', { ascending: false })
        .order('published_at', { ascending: false });

      // Apply filters
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,excerpt.ilike.%${searchTerm}%`);
      }

      // For complex filtering with relationships, we'll fetch all and filter client-side for MVP
      const { data: allPosts, error, count } = await query;
      
      if (error) throw error;

      // Transform and filter posts
      let filteredPosts = allPosts?.map(post => ({
        ...post,
        authors: post.post_authors?.map((pa: any) => pa.authors) || [],
        categories: post.post_categories?.map((pc: any) => pc.categories) || [],
        tags: post.post_tags?.map((pt: any) => pt.tags) || []
      })) || [];

      // Client-side filtering for relationships
      if (categoryFilter) {
        filteredPosts = filteredPosts.filter(post => 
          post.categories.some(cat => cat.slug === categoryFilter)
        );
      }

      if (tagFilter) {
        filteredPosts = filteredPosts.filter(post => 
          post.tags.some(tag => tag.slug === tagFilter)
        );
      }

      if (authorFilter) {
        filteredPosts = filteredPosts.filter(post => 
          post.authors.some(author => author.slug === authorFilter)
        );
      }

      // Pagination
      const startIndex = (page - 1) * POSTS_PER_PAGE;
      const endIndex = startIndex + POSTS_PER_PAGE;
      const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

      setPosts(paginatedPosts);
      setTotalPosts(filteredPosts.length);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTaxonomy = async () => {
    try {
      const [categoriesRes, tagsRes, authorsRes] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase.from('tags').select('*').order('name'),
        supabase.from('authors').select('*').order('name')
      ]);

      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (tagsRes.data) setTags(tagsRes.data);
      if (authorsRes.data) setAuthors(authorsRes.data);
    } catch (error) {
      console.error('Error fetching taxonomy:', error);
    }
  };

  useEffect(() => {
    fetchTaxonomy();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [page, searchTerm, categoryFilter, tagFilter, authorFilter]);

  const featuredPosts = posts.filter(post => post.featured).slice(0, 3);
  const regularPosts = posts.filter(post => !post.featured);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = newsletterEmail.trim();
    if (!email || !email.includes('@')) {
      setNewsletterResult({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }
    setNewsletterSubmitting(true);
    setNewsletterResult({ type: null, message: '' });
    try {
      const { data, error } = await supabase.functions.invoke('submit-newsletter-subscription', {
        body: { email, source_url: window.location.href },
      });
      if (error) throw error;
      if (data?.success) {
        setNewsletterResult({ type: 'success', message: 'Thanks! Please check your inbox to confirm your subscription.' });
        setNewsletterEmail('');
      } else {
        setNewsletterResult({ type: 'error', message: 'Unexpected response. Please try again.' });
      }
    } catch (err) {
      console.error('Newsletter subscription failed:', err);
      setNewsletterResult({ type: 'error', message: 'Subscription failed. Please try again later.' });
    } finally {
      setNewsletterSubmitting(false);
    }
  };

  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={t('blog_hero_title')}
        description={t('blog_hero_subtitle')}
        canonical="/blog"
        ogImage="/og/og-default.jpg"
      />
      
      <Navigation />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 hero-image">
            <img 
              src={forexBlogHero} 
              alt="Professional forex trading analysis workspace with multiple monitors displaying trading charts" 
              className="w-full h-full object-cover"
              loading="eager"
              width={1920}
              height={1080}
              
              onError={(e) => {
                console.warn('Hero image failed to load');
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-hero-premium grain-texture"></div>
          <div className="container px-4 relative z-20 on-hero">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="fluid-h1 text-white mb-6">{t('blog_hero_title')}</h1>
              <p className="text-hero-body mb-8 max-w-3xl mx-auto">{t('blog_hero_subtitle')}</p>
              <div className="p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 max-w-2xl mx-auto">
                <p className="text-sm">
                  <strong>Educational Content Only:</strong> All articles are for educational purposes. Not financial advice. Trading involves risk of loss.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-20">

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => updateSearchParams({ search: e.target.value })}
                  className="pl-10"
                />
              </div>
              
              <Select 
                value={categoryFilter} 
                onValueChange={(value) => updateSearchParams({ category: value === 'all' ? null : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.slug}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select 
                value={tagFilter} 
                onValueChange={(value) => updateSearchParams({ tag: value === 'all' ? null : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All tags" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  {tags.map(tag => (
                    <SelectItem key={tag.id} value={tag.slug}>
                      {tag.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select 
                value={authorFilter} 
                onValueChange={(value) => updateSearchParams({ author: value === 'all' ? null : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All authors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Authors</SelectItem>
                  {authors.map(author => (
                    <SelectItem key={author.id} value={author.slug}>
                      {author.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline"
                onClick={() => updateSearchParams({ 
                  search: null, 
                  category: null, 
                  tag: null, 
                  author: null 
                })}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Featured Posts */}
            {featuredPosts.length > 0 && page === 1 && !searchTerm && !categoryFilter && !tagFilter && !authorFilter && (
              <div className="mb-12">
                <div className="flex items-center gap-2 mb-6">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <h2 className="text-2xl font-bold">Featured Posts</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {featuredPosts.map((post) => (
                    <Card key={post.id} className="group hover:shadow-lg transition-shadow">
                      <div className="aspect-video relative overflow-hidden rounded-t-lg">
                        {post.featured_image_url ? (
                          <img
                            src={post.featured_image_url}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                            <div className="text-4xl font-bold text-primary/30">
                              {post.title.charAt(0)}
                            </div>
                          </div>
                        )}
                        <Badge className="absolute top-3 left-3 bg-yellow-500 text-yellow-900">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      </div>
                      <CardContent className="p-6">
                        <div className="space-y-3">
                          <h3 className="text-xl font-semibold line-clamp-2">
                            <Link 
                              to={`/blog/${post.slug}`}
                              className="hover:text-primary transition-colors"
                            >
                              {post.title}
                            </Link>
                          </h3>
                          
                          {post.excerpt && (
                            <p className="text-muted-foreground line-clamp-3">
                              {post.excerpt}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(post.published_at), 'MMM d, yyyy')}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {post.reading_time_mins} min read
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            {post.categories.slice(0, 2).map((category) => (
                              <Badge key={category.slug} variant="secondary" className="text-xs">
                                {category.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <Separator className="mt-12" />
              </div>
            )}

            {/* Regular Posts */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  {featuredPosts.length > 0 && page === 1 ? 'Latest Posts' : 'All Posts'}
                </h2>
                <p className="text-muted-foreground">
                  {totalPosts} post{totalPosts !== 1 ? 's' : ''} found
                </p>
              </div>

              {regularPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularPosts.map((post) => (
                    <Card key={post.id} className="group hover:shadow-lg transition-shadow">
                      <div className="aspect-video relative overflow-hidden rounded-t-lg">
                        {post.featured_image_url ? (
                          <img
                            src={post.featured_image_url}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                            <div className="text-4xl font-bold text-primary/30">
                              {post.title.charAt(0)}
                            </div>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-6">
                        <div className="space-y-3">
                          <h3 className="text-lg font-semibold line-clamp-2">
                            <Link 
                              to={`/blog/${post.slug}`}
                              className="hover:text-primary transition-colors"
                            >
                              {post.title}
                            </Link>
                          </h3>
                          
                          {post.excerpt && (
                            <p className="text-muted-foreground line-clamp-2 text-sm">
                              {post.excerpt}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(post.published_at), 'MMM d')}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {post.reading_time_mins} min
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-1">
                            {post.categories.slice(0, 2).map((category) => (
                              <Badge key={category.slug} variant="outline" className="text-xs">
                                {category.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    No posts found matching your criteria.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => updateSearchParams({ 
                      search: null, 
                      category: null, 
                      tag: null, 
                      author: null 
                    })}
                  >
                    Clear all filters
                  </Button>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => updateSearchParams({ page: (page - 1).toString() })}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateSearchParams({ page: pageNum.toString() })}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    disabled={page >= totalPages}
                    onClick={() => updateSearchParams({ page: (page + 1).toString() })}
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
        </div>

        <SectionDivider variant="wave" className="text-muted" />
        
        {/* Newsletter CTA */}
        <section className="py-20 near-footer-contrast grain-texture">
          <div className="container px-4 relative z-10 pointer-events-auto">
            <div className="max-w-4xl mx-auto text-center pointer-events-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Stay Updated with Our Newsletter
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Get weekly market insights, educational content, and trading tips delivered to your inbox.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto pointer-events-auto">
                <Input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 pointer-events-auto"
                  required
                />
                <Button type="submit" variant="hero" className="px-6 py-2 pointer-events-auto" disabled={newsletterSubmitting}>
                  {newsletterSubmitting ? 'Subscribing…' : 'Subscribe'}
                </Button>
              </form>
              {newsletterResult.type && (
                <p className={`text-sm mt-4 ${newsletterResult.type === 'success' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`} aria-live="polite">
                  {newsletterResult.message}
                </p>
              )}
              <p className="text-sm text-muted-foreground mt-2">
                No spam. Educational content only. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
