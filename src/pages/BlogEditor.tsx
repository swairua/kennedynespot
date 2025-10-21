import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Save, Eye, Send, ArrowLeft, Clock, Star, Tag, User, FileText, Search, X, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EnhancedMarkdownRenderer } from '@/components/content/EnhancedMarkdownRenderer';
import { ContentFormatAnalyzer } from '@/components/editor/ContentFormatAnalyzer';
import { EditorChecklist } from '@/components/editor/EditorChecklist';
import { TranslationTabs } from '@/components/admin/TranslationTabs';
import { Languages } from 'lucide-react';
import { formatTypography, cleanPastedContent } from '@/utils/contentFormatter';
import { format } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import MarkdownGuide from '@/components/content/MarkdownGuide';
import { ImageInput } from '@/components/ui/image-input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const NAIROBI_TZ = 'Africa/Nairobi';

interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: 'draft' | 'in_review' | 'scheduled' | 'published' | 'archived';
  featured: boolean;
  published: boolean;
  scheduled_at?: string;
  published_at?: string;
  updated_at?: string;
  reading_time_mins: number;
  canonical_url?: string;
  meta_title?: string;
  meta_description?: string;
  meta_robots: string;
  og_title?: string;
  og_description?: string;
  og_image_url?: string;
  twitter_card: string;
  schema_type: string;
  schema_json_ld?: any;
  featured_image_url?: string;
  author_id: string;
  // Translations
  title_fr?: string;
  title_es?: string;
  title_de?: string;
  title_ru?: string;
  excerpt_fr?: string;
  excerpt_es?: string;
  excerpt_de?: string;
  excerpt_ru?: string;
  content_fr?: string;
  content_es?: string;
  content_de?: string;
  content_ru?: string;
  meta_title_fr?: string;
  meta_title_es?: string;
  meta_title_de?: string;
  meta_title_ru?: string;
  meta_description_fr?: string;
  meta_description_es?: string;
  meta_description_de?: string;
  meta_description_ru?: string;
  translation_status?: any;
}

interface Author {
  id: string;
  name: string;
  slug: string;
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

const calculateReadingTime = (content: string): number => {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
};

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export default function BlogEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isNew = id === 'new';

  const [post, setPost] = useState<BlogPost>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    status: 'draft',
    featured: false,
    published: false,
    reading_time_mins: 1,
    meta_robots: 'index,follow',
    twitter_card: 'summary_large_image',
    schema_type: 'Article',
    author_id: ''
  });

  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [relatedPosts, setRelatedPosts] = useState<string[]>([]);
  const [availablePosts, setAvailablePosts] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [scheduleDateTime, setScheduleDateTime] = useState('');
  const [slugStatus, setSlugStatus] = useState<'available' | 'taken' | 'checking' | 'idle'>('idle');
  const [conflictingPost, setConflictingPost] = useState<{id: string, title: string} | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Function to insert text at cursor position
  const insertTextAtCursor = (textToInsert: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentContent = post.content || '';
    
    const newContent = 
      currentContent.substring(0, start) + 
      textToInsert + 
      currentContent.substring(end);

    setPost({ ...post, content: newContent });
    
    // Restore cursor position after insertion
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
    }, 0);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch taxonomy data
      const [authorsRes, categoriesRes, tagsRes, postsRes] = await Promise.all([
        supabase.from('authors').select('*').order('name'),
        supabase.from('categories').select('*').order('name'),
        supabase.from('tags').select('*').order('name'),
        supabase.from('blog_posts').select('id, title, slug').order('title')
      ]);

      if (authorsRes.error) throw authorsRes.error;
      if (categoriesRes.error) throw categoriesRes.error;
      if (tagsRes.error) throw tagsRes.error;
      if (postsRes.error) throw postsRes.error;

      setAuthors(authorsRes.data || []);
      setCategories(categoriesRes.data || []);
      setTags(tagsRes.data || []);
      setAvailablePosts(postsRes.data || []);

      // If editing existing post, fetch it
      if (!isNew && id) {
        // Fetch post data first
        const { data: postData, error: postError } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('id', id)
          .single();

        if (postError) throw postError;

        // Then fetch relationships separately to avoid schema cache issues
        const [authorsRes, categoriesRes, tagsRes, relatedRes] = await Promise.all([
          supabase.from('post_authors').select('author_id').eq('post_id', id),
          supabase.from('post_categories').select('category_id').eq('post_id', id),
          supabase.from('post_tags').select('tag_id').eq('post_id', id),
          supabase.from('post_related').select('related_post_id').eq('post_id', id)
        ]);

        setPost(postData);
        setSelectedAuthors(authorsRes.data?.map((pa: any) => pa.author_id) || []);
        setSelectedCategories(categoriesRes.data?.map((pc: any) => pc.category_id) || []);
        setSelectedTags(tagsRes.data?.map((pt: any) => pt.tag_id) || []);
        setRelatedPosts(relatedRes.data?.map((pr: any) => pr.related_post_id) || []);
        
        if (postData.scheduled_at) {
          const nairobiTime = toZonedTime(new Date(postData.scheduled_at), NAIROBI_TZ);
          setScheduleDateTime(format(nairobiTime, "yyyy-MM-dd'T'HH:mm"));
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      const errorMessage = (error as any).message || String(error);
      const isSchemaError = errorMessage.includes('schema cache') || errorMessage.includes('could not find');
      
      toast({
        title: 'Error',
        description: isSchemaError 
          ? 'Database schema cache error. Please reload the page and try again.'
          : `Failed to fetch blog data: ${errorMessage}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const checkSlugAvailability = useCallback(async (slug: string) => {
    if (!slug) {
      setSlugStatus('idle');
      setConflictingPost(null);
      return;
    }
    
    setSlugStatus('checking');
    
    try {
      let query = supabase
        .from('blog_posts')
        .select('id, title')
        .eq('slug', slug);

      // Only exclude current post if we have a valid post ID
      if (post.id) {
        query = query.neq('id', post.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error checking slug:', error);
        setSlugStatus('idle');
        return;
      }
      
      if (data.length > 0) {
        setSlugStatus('taken');
        setConflictingPost(data[0]);
      } else {
        setSlugStatus('available');
        setConflictingPost(null);
      }
    } catch (error) {
      console.error('Error checking slug:', error);
      setSlugStatus('idle');
    }
  }, [post.id]);

  const generateUniqueSlug = async (baseSlug: string): Promise<string> => {
    let query = supabase
      .from('blog_posts')
      .select('slug')
      .like('slug', `${baseSlug}%`);

    // Only exclude current post if we have a valid post ID
    if (post.id) {
      query = query.neq('id', post.id);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error checking slug variants:', error);
      return baseSlug;
    }
    
    const existingSlugs = data.map(item => item.slug);
    
    if (!existingSlugs.includes(baseSlug)) {
      return baseSlug;
    }
    
    let counter = 1;
    let newSlug = `${baseSlug}-${counter}`;
    
    while (existingSlugs.includes(newSlug)) {
      counter++;
      newSlug = `${baseSlug}-${counter}`;
    }
    
    return newSlug;
  };

  const checkSlugUniqueness = async (slug: string): Promise<boolean> => {
    if (!slug) return false;
    
    let query = supabase
      .from('blog_posts')
      .select('id')
      .eq('slug', slug);

    // Only exclude current post if we have a valid post ID
    if (post.id) {
      query = query.neq('id', post.id);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error checking slug:', error);
      return false;
    }
    
    return data.length === 0;
  };

  // Auto-generate slug from title
  useEffect(() => {
    if (post.title && isNew) {
      const newSlug = generateSlug(post.title);
      setPost(prev => ({
        ...prev,
        slug: newSlug
      }));
    }
  }, [post.title, isNew]);

  // Auto-calculate reading time
  useEffect(() => {
    setPost(prev => ({
      ...prev,
      reading_time_mins: calculateReadingTime(prev.content)
    }));
  }, [post.content]);

  // Check slug availability when slug changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (post.slug) {
        checkSlugAvailability(post.slug);
      }
    }, 500); // Debounce for 500ms

    return () => clearTimeout(timeoutId);
  }, [post.slug, checkSlugAvailability]);

  const handleSave = async (shouldPublish = false) => {
    try {
      setSaving(true);

      // Validate required fields
      if (!post.title.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Title is required',
          variant: 'destructive',
        });
        return;
      }

      if (!post.slug.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Slug is required',
          variant: 'destructive',
        });
        return;
      }

      // Validate author_id for new posts
      let finalAuthorId = post.author_id;
      if (!finalAuthorId && authors.length > 0) {
        finalAuthorId = authors[0].id;
        setPost(prev => ({ ...prev, author_id: finalAuthorId }));
        toast({
          title: 'Author Auto-Selected',
          description: `Author was set to "${authors[0].name}" as default.`,
        });
      }

      if (!finalAuthorId) {
        toast({
          title: 'Validation Error',
          description: 'At least one author must be available. Please create an author first.',
          variant: 'destructive',
        });
        return;
      }

      // Auto-fix slug if needed
      let finalSlug = post.slug;
      const isSlugUnique = await checkSlugUniqueness(post.slug);
      if (!isSlugUnique) {
        finalSlug = await generateUniqueSlug(post.slug);
        setPost(prev => ({ ...prev, slug: finalSlug }));
        toast({
          title: 'Slug Auto-Fixed',
          description: `Slug was changed to "${finalSlug}" to avoid conflicts.`,
        });
      }

      const postData = {
        ...post,
        slug: finalSlug,
        author_id: finalAuthorId,
        published: shouldPublish || post.published,
        status: shouldPublish ? 'published' : post.status,
        published_at: shouldPublish && !post.published ? new Date().toISOString() : post.published_at
      };

      let savedPost;
      if (isNew) {
        const { data, error } = await supabase
          .from('blog_posts')
          .insert([postData])
          .select()
          .single();

        if (error) throw error;
        savedPost = data;
      } else {
        const { data, error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        savedPost = data;
      }

      // Update relationships
      const postId = savedPost.id;

      // Update authors - ensure at least one author
      await supabase.from('post_authors').delete().eq('post_id', postId);
      let authorsToInsert = selectedAuthors;
      
      // If no authors selected, use the first available author or create a default one
      if (authorsToInsert.length === 0) {
        if (authors.length > 0) {
          authorsToInsert = [authors[0].id];
        } else {
          // Create a default author if none exist
          const { data: defaultAuthor } = await supabase
            .from('authors')
            .insert({
              name: 'Admin',
              slug: 'admin',
              bio: 'Site administrator'
            })
            .select('id')
            .single();
          authorsToInsert = [defaultAuthor.id];
        }
      }
      
      const authorRelations = authorsToInsert.map(authorId => ({
        post_id: postId,
        author_id: authorId
      }));
      await supabase.from('post_authors').insert(authorRelations);

      // Update categories
      await supabase.from('post_categories').delete().eq('post_id', postId);
      if (selectedCategories.length > 0) {
        const categoryRelations = selectedCategories.map(categoryId => ({
          post_id: postId,
          category_id: categoryId
        }));
        await supabase.from('post_categories').insert(categoryRelations);
      }

      // Update tags
      await supabase.from('post_tags').delete().eq('post_id', postId);
      if (selectedTags.length > 0) {
        const tagRelations = selectedTags.map(tagId => ({
          post_id: postId,
          tag_id: tagId
        }));
        await supabase.from('post_tags').insert(tagRelations);
      }

      // Update related posts
      await supabase.from('post_related').delete().eq('post_id', postId);
      if (relatedPosts.length > 0) {
        const relatedRelations = relatedPosts.map(relatedId => ({
          post_id: postId,
          related_post_id: relatedId
        }));
        await supabase.from('post_related').insert(relatedRelations);
      }

      setPost(savedPost);
      
      toast({
        title: 'Success',
        description: shouldPublish ? 'Post published successfully' : 'Post saved successfully',
      });

      if (isNew) {
        navigate(`/admin/blog/${savedPost.id}`);
      }
    } catch (error) {
      console.error('Error saving post:', error);
      toast({
        title: 'Error',
        description: `Failed to save post: ${(error as any).message || error}`,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSchedule = async () => {
    if (!scheduleDateTime) {
      toast({
        title: 'Validation Error',
        description: 'Please select a schedule date and time',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      
      // Convert from Nairobi time to UTC
      const nairobiDate = new Date(scheduleDateTime);
      const utcDate = fromZonedTime(nairobiDate, NAIROBI_TZ);

      if (!isNew && id) {
        const { error } = await supabase.rpc('schedule_post', {
          _post_id: id,
          _scheduled_at: utcDate.toISOString()
        });

        if (error) throw error;

        setPost(prev => ({
          ...prev,
          status: 'scheduled',
          scheduled_at: utcDate.toISOString()
        }));

        toast({
          title: 'Success',
          description: 'Post scheduled successfully',
        });
      }
    } catch (error) {
      console.error('Error scheduling post:', error);
      toast({
        title: 'Error',
        description: `Failed to schedule post: ${(error as any).message || error}`,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Track unsaved changes
  useEffect(() => {
    if (!loading) {
      setHasUnsavedChanges(true);
    }
  }, [post.title, post.content, post.excerpt, selectedAuthors, selectedCategories, selectedTags, loading]);

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setShowCancelDialog(true);
    } else {
      navigate('/admin/blog');
    }
  };

  const confirmCancel = () => {
    setShowCancelDialog(false);
    navigate('/admin/blog');
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);

      if (data?.publicUrl) {
        setPost(prev => ({ ...prev, featured_image_url: data.publicUrl }));
        toast({
          title: "Success",
          description: "Image uploaded successfully!",
        });
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleAutoTranslate = async () => {
    if (!post.title || !post.excerpt) {
      toast({
        title: "Missing Content",
        description: "Please add at least a title and excerpt before translating.",
        variant: "destructive",
      });
      return;
    }

    setTranslating(true);
    const languages: Array<'fr' | 'es' | 'de' | 'ru'> = ['fr', 'es', 'de', 'ru'];
    const fields = ['title', 'excerpt', 'content', 'meta_title', 'meta_description'];
    
    let successCount = 0;
    let failureCount = 0;

    try {
      const updatedPost = { ...post };
      const newStatus = { ...(post.translation_status || {}) } as Record<string, 'auto' | 'complete' | 'pending' | 'missing'>;

      for (const lang of languages) {
        let langSuccess = false;
        
        for (const field of fields) {
          const sourceText = (post[field as keyof BlogPost] as string || '').trim();
          if (!sourceText) continue;

          try {
            const { data, error } = await supabase.functions.invoke('auto-translate-content', {
              body: {
                text: sourceText,
                targetLang: lang,
                sourceLang: 'en'
              }
            });

            if (error) {
              console.error(`Translation API error for ${field} to ${lang}:`, error);
              failureCount++;
              continue;
            }

            const translatedText = (data?.translatedText || '').trim();
            
            // Only update if translation actually changed the text
            if (translatedText && translatedText !== sourceText) {
              const targetField = `${field}_${lang}`;
              (updatedPost as any)[targetField] = translatedText;
              langSuccess = true;
              successCount++;
            } else {
              console.warn(`Translation for ${field} to ${lang} returned unchanged text`);
              failureCount++;
            }
          } catch (err) {
            console.error(`Failed to translate ${field} to ${lang}:`, err);
            failureCount++;
          }
        }

        // Only mark as 'auto' if at least one field was successfully translated
        if (langSuccess) {
          newStatus[lang] = 'auto';
        } else {
          newStatus[lang] = 'missing';
        }
      }

      updatedPost.translation_status = newStatus;
      setPost(updatedPost);
      
      if (successCount > 0) {
        toast({
          title: "Auto-Translation Complete",
          description: `Successfully translated ${successCount} fields. Remember to save your changes.${failureCount > 0 ? ` (${failureCount} failed)` : ''}`,
        });
      } else {
        toast({
          title: "Translation Service Unavailable",
          description: "The translation service is currently unavailable. Please try again later.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Translation error:', error);
      toast({
        title: "Translation Failed",
        description: error.message || "An error occurred during translation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setTranslating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Button>
          {hasUnsavedChanges && (
            <Button variant="outline" onClick={handleCancel} className="text-muted-foreground">
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold">
              {isNew ? 'Create New Post' : 'Edit Post'}
            </h1>
            {!isNew && (
              <p className="text-muted-foreground mt-1">
                Last updated: {format(new Date(post.updated_at || Date.now()), 'PPP')}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? 'Edit' : 'Preview'}
          </Button>
          <Button variant="outline" onClick={() => { handleSave(); setHasUnsavedChanges(false); }} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button onClick={() => { handleSave(true); setHasUnsavedChanges(false); }} disabled={saving}>
            <Send className="h-4 w-4 mr-2" />
            Publish
          </Button>
        </div>
      </div>

      {previewMode ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <h1>{post.title}</h1>
            {post.excerpt && <p className="lead">{post.excerpt}</p>}
            <EnhancedMarkdownRenderer 
              content={post.content}
              showTOC={false}
              showProgress={false}
              className="prose-sm"
            />
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="content" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="content" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="translations" className="flex items-center gap-2">
              <Languages className="h-4 w-4" />
              Translations
            </TabsTrigger>
            <TabsTrigger value="taxonomy" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Taxonomy
            </TabsTrigger>
            <TabsTrigger value="seo" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              SEO
            </TabsTrigger>
            <TabsTrigger value="workflow" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Workflow
            </TabsTrigger>
            <TabsTrigger value="media" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Media
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Post Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2 space-y-4">
                    <div>
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={post.title}
                        onChange={(e) => setPost(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter post title..."
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="slug">Slug *</Label>
                      <div className="relative">
                        <Input
                          id="slug"
                          value={post.slug}
                          onChange={(e) => setPost(prev => ({ ...prev, slug: e.target.value }))}
                          placeholder="post-slug"
                          className={`pr-10 ${
                            slugStatus === 'taken' ? 'border-destructive' : 
                            slugStatus === 'available' ? 'border-green-500' : ''
                          }`}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {slugStatus === 'checking' && (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-primary"></div>
                          )}
                          {slugStatus === 'available' && (
                            <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
                              <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                          {slugStatus === 'taken' && (
                            <div className="h-4 w-4 rounded-full bg-destructive flex items-center justify-center">
                              <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-1 space-y-1">
                        <p className="text-sm text-muted-foreground">
                          URL: /blog/{post.slug}
                        </p>
                        {slugStatus === 'taken' && conflictingPost && (
                          <div className="flex items-center gap-2 text-sm text-destructive">
                            <span>Slug already used by:</span>
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="h-auto p-0 text-destructive underline"
                              onClick={() => navigate(`/admin/blog/${conflictingPost.id}`)}
                            >
                              "{conflictingPost.title}"
                            </Button>
                          </div>
                        )}
                        {slugStatus === 'taken' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={async () => {
                              const newSlug = await generateUniqueSlug(post.slug);
                              setPost(prev => ({ ...prev, slug: newSlug }));
                            }}
                          >
                            Auto-fix slug
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="excerpt">Excerpt</Label>
                      <Textarea
                        id="excerpt"
                        value={post.excerpt}
                        onChange={(e) => setPost(prev => ({ ...prev, excerpt: e.target.value }))}
                        placeholder="Brief description of the post..."
                        rows={3}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="featured">Featured Post</Label>
                            <Switch
                              id="featured"
                              checked={post.featured}
                              onCheckedChange={(checked) => setPost(prev => ({ ...prev, featured: checked }))}
                            />
                          </div>
                          
                          <Separator />
                          
                          <div>
                            <Label className="text-sm text-muted-foreground">Reading Time</Label>
                            <p className="text-lg font-semibold">{post.reading_time_mins} min</p>
                          </div>
                          
                          <div>
                            <Label className="text-sm text-muted-foreground">Status</Label>
                            <Badge variant="outline">{post.status}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="content">Content *</Label>
                    <MarkdownGuide onInsert={insertTextAtCursor} />
                  </div>
                  <Textarea
                    ref={textareaRef}
                    id="content"
                    value={post.content}
                    onChange={(e) => setPost(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Write your post content in Markdown..."
                    rows={20}
                    className="font-mono"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Supports Markdown formatting
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="translations" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>🌐 Translations</CardTitle>
                  <Button 
                    onClick={handleAutoTranslate} 
                    disabled={translating || !post.title || !post.content}
                    variant="default"
                  >
                    {translating ? 'Translating...' : '🤖 Auto-Translate All'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <TranslationTabs translationStatus={post.translation_status}>
                  {(lang) => (
                    <div className="space-y-4">
                      {lang === 'en' ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>English is the source language. Edit content in the "Content" tab.</p>
                        </div>
                      ) : (
                        <>
                          <div>
                            <Label htmlFor={`title_${lang}`}>Title ({lang.toUpperCase()})</Label>
                            <Input
                              id={`title_${lang}`}
                              value={(post as any)[`title_${lang}`] || ''}
                              onChange={(e) => setPost(prev => ({ ...prev, [`title_${lang}`]: e.target.value }))}
                              placeholder={`Enter ${lang.toUpperCase()} translation...`}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor={`excerpt_${lang}`}>Excerpt ({lang.toUpperCase()})</Label>
                            <Textarea
                              id={`excerpt_${lang}`}
                              value={(post as any)[`excerpt_${lang}`] || ''}
                              onChange={(e) => setPost(prev => ({ ...prev, [`excerpt_${lang}`]: e.target.value }))}
                              placeholder={`Enter ${lang.toUpperCase()} excerpt...`}
                              rows={3}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor={`content_${lang}`}>Content ({lang.toUpperCase()})</Label>
                            <Textarea
                              id={`content_${lang}`}
                              value={(post as any)[`content_${lang}`] || ''}
                              onChange={(e) => setPost(prev => ({ ...prev, [`content_${lang}`]: e.target.value }))}
                              placeholder={`Enter ${lang.toUpperCase()} content...`}
                              rows={20}
                              className="font-mono"
                            />
                          </div>
                          
                          <Separator />
                          
                          <div>
                            <Label htmlFor={`meta_title_${lang}`}>Meta Title ({lang.toUpperCase()})</Label>
                            <Input
                              id={`meta_title_${lang}`}
                              value={(post as any)[`meta_title_${lang}`] || ''}
                              onChange={(e) => setPost(prev => ({ ...prev, [`meta_title_${lang}`]: e.target.value }))}
                              placeholder={`Enter ${lang.toUpperCase()} meta title...`}
                              maxLength={60}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor={`meta_description_${lang}`}>Meta Description ({lang.toUpperCase()})</Label>
                            <Textarea
                              id={`meta_description_${lang}`}
                              value={(post as any)[`meta_description_${lang}`] || ''}
                              onChange={(e) => setPost(prev => ({ ...prev, [`meta_description_${lang}`]: e.target.value }))}
                              placeholder={`Enter ${lang.toUpperCase()} meta description...`}
                              maxLength={160}
                              rows={3}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </TranslationTabs>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="taxonomy" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Authors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {authors.map((author) => (
                      <div key={author.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`author-${author.id}`}
                          checked={selectedAuthors.includes(author.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAuthors(prev => [...prev, author.id]);
                            } else {
                              setSelectedAuthors(prev => prev.filter(id => id !== author.id));
                            }
                          }}
                        />
                        <Label htmlFor={`author-${author.id}`} className="flex-1">
                          {author.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`category-${category.id}`}
                          checked={selectedCategories.includes(category.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCategories(prev => [...prev, category.id]);
                            } else {
                              setSelectedCategories(prev => prev.filter(id => id !== category.id));
                            }
                          }}
                        />
                        <Label htmlFor={`category-${category.id}`} className="flex-1">
                          {category.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tags.map((tag) => (
                      <div key={tag.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`tag-${tag.id}`}
                          checked={selectedTags.includes(tag.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTags(prev => [...prev, tag.id]);
                            } else {
                              setSelectedTags(prev => prev.filter(id => id !== tag.id));
                            }
                          }}
                        />
                        <Label htmlFor={`tag-${tag.id}`} className="flex-1">
                          {tag.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Related Posts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {availablePosts.filter(p => p.id !== post.id).map((relatedPost) => (
                      <div key={relatedPost.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`related-${relatedPost.id}`}
                          checked={relatedPosts.includes(relatedPost.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setRelatedPosts(prev => [...prev, relatedPost.id]);
                            } else {
                              setRelatedPosts(prev => prev.filter(id => id !== relatedPost.id));
                            }
                          }}
                        />
                        <Label htmlFor={`related-${relatedPost.id}`} className="flex-1 text-sm">
                          {relatedPost.title}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="seo" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Meta Tags</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="meta_title">Meta Title</Label>
                    <Input
                      id="meta_title"
                      value={post.meta_title || ''}
                      onChange={(e) => setPost(prev => ({ ...prev, meta_title: e.target.value }))}
                      placeholder="SEO title (60 characters max)"
                      maxLength={60}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {(post.meta_title || '').length}/60 characters
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="meta_description">Meta Description</Label>
                    <Textarea
                      id="meta_description"
                      value={post.meta_description || ''}
                      onChange={(e) => setPost(prev => ({ ...prev, meta_description: e.target.value }))}
                      placeholder="SEO description (160 characters max)"
                      maxLength={160}
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {(post.meta_description || '').length}/160 characters
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="canonical_url">Canonical URL</Label>
                    <Input
                      id="canonical_url"
                      value={post.canonical_url || ''}
                      onChange={(e) => setPost(prev => ({ ...prev, canonical_url: e.target.value }))}
                      placeholder="https://example.com/canonical-url"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="meta_robots">Meta Robots</Label>
                    <Select
                      value={post.meta_robots}
                      onValueChange={(value) => setPost(prev => ({ ...prev, meta_robots: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="index,follow">Index, Follow</SelectItem>
                        <SelectItem value="noindex,follow">No Index, Follow</SelectItem>
                        <SelectItem value="index,nofollow">Index, No Follow</SelectItem>
                        <SelectItem value="noindex,nofollow">No Index, No Follow</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Social Media</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="og_title">Open Graph Title</Label>
                    <Input
                      id="og_title"
                      value={post.og_title || ''}
                      onChange={(e) => setPost(prev => ({ ...prev, og_title: e.target.value }))}
                      placeholder="Facebook/LinkedIn title"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="og_description">Open Graph Description</Label>
                    <Textarea
                      id="og_description"
                      value={post.og_description || ''}
                      onChange={(e) => setPost(prev => ({ ...prev, og_description: e.target.value }))}
                      placeholder="Facebook/LinkedIn description"
                      rows={3}
                    />
                  </div>
                  
                  <ImageInput
                    label="Open Graph Image"
                    value={post.og_image_url || ''}
                    onChange={(value) => setPost(prev => ({ ...prev, og_image_url: value }))}
                    placeholder="Upload OG image or enter URL"
                    maxSizeText="Max 5MB, recommended: 1200x630px"
                    aspectRatio="aspect-[1200/630]"
                    bucketName="blog-images"
                  />
                  
                  <div>
                    <Label htmlFor="twitter_card">Twitter Card Type</Label>
                    <Select
                      value={post.twitter_card}
                      onValueChange={(value) => setPost(prev => ({ ...prev, twitter_card: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="summary">Summary</SelectItem>
                        <SelectItem value="summary_large_image">Summary Large Image</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Schema.org</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="schema_type">Schema Type</Label>
                    <Select
                      value={post.schema_type}
                      onValueChange={(value) => setPost(prev => ({ ...prev, schema_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Article">Article</SelectItem>
                        <SelectItem value="NewsArticle">News Article</SelectItem>
                        <SelectItem value="HowTo">How-To</SelectItem>
                        <SelectItem value="FAQ">FAQ</SelectItem>
                        <SelectItem value="VideoObject">Video</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="schema_json_ld">Custom JSON-LD (Optional)</Label>
                    <Textarea
                      id="schema_json_ld"
                      value={post.schema_json_ld ? JSON.stringify(post.schema_json_ld, null, 2) : ''}
                      onChange={(e) => {
                        try {
                          const parsed = e.target.value ? JSON.parse(e.target.value) : null;
                          setPost(prev => ({ ...prev, schema_json_ld: parsed }));
                        } catch {
                          // Invalid JSON - don't update
                        }
                      }}
                      placeholder='{"@context": "https://schema.org", "@type": "Article"}'
                      rows={6}
                      className="font-mono text-sm"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="workflow" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Publication Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={post.status}
                      onValueChange={(value) => setPost(prev => ({ ...prev, status: value as BlogPost['status'] }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="in_review">In Review</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="published">Published</Label>
                    <Switch
                      id="published"
                      checked={post.published}
                      onCheckedChange={(checked) => setPost(prev => ({ ...prev, published: checked }))}
                    />
                  </div>
                  
                  {post.published_at && (
                    <div>
                      <Label className="text-sm text-muted-foreground">Published At</Label>
                      <p className="text-sm">
                        {format(new Date(post.published_at), 'PPP p')} EAT
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Scheduling</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="schedule_datetime">Schedule Date & Time (EAT)</Label>
                    <Input
                      id="schedule_datetime"
                      type="datetime-local"
                      value={scheduleDateTime}
                      onChange={(e) => setScheduleDateTime(e.target.value)}
                    />
                  </div>
                  
                  <Button 
                    onClick={handleSchedule} 
                    disabled={saving || isNew || !scheduleDateTime}
                    className="w-full"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Schedule Post
                  </Button>
                  
                  {post.scheduled_at && (
                    <div>
                      <Label className="text-sm text-muted-foreground">Scheduled For</Label>
                      <p className="text-sm">
                        {format(toZonedTime(new Date(post.scheduled_at), NAIROBI_TZ), 'PPP p')} EAT
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="media" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Featured Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="featured_image_url">Featured Image URL</Label>
                  <Input
                    id="featured_image_url"
                    value={post.featured_image_url || ''}
                    onChange={(e) => setPost(prev => ({ ...prev, featured_image_url: e.target.value }))}
                    placeholder="https://example.com/featured-image.jpg"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Enter a URL for your featured image, or use the upload option below
                  </p>
                </div>
                
                <div className="border-t pt-4">
                  <Label htmlFor="image_upload">Upload Image</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="image_upload"
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          await handleImageUpload(file);
                          // Clear the input so the same file can be uploaded again
                          e.target.value = '';
                        }
                      }}
                      disabled={uploading}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('image_upload')?.click()}
                      disabled={uploading}
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      {uploading ? 'Uploading...' : 'Browse'}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload an image file to automatically set the URL above
                  </p>
                </div>
                
                {post.featured_image_url && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Preview</Label>
                    <img 
                      src={post.featured_image_url} 
                      alt="Featured image preview"
                      className="mt-2 max-w-xs rounded-lg border"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                <p className="text-sm text-muted-foreground">
                  Recommended size: 1200x630px for optimal social media sharing
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard Changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to leave without saving? All changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Editing</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}