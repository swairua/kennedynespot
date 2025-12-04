import React, { useCallback, useState } from 'react';
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  linkPlugin,
  linkDialogPlugin,
  imagePlugin,
  tablePlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  diffSourcePlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  CreateLink,
  InsertTable,
  InsertThematicBreak,
  ListsToggle,
  Separator,
  CodeToggle,
  InsertCodeBlock,
  type MDXEditorMethods,
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import { Button } from '@/components/ui/button';
import { ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ImageUploadModal } from './ImageUploadModal';

interface RichTextEditorProps {
  markdown: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  markdown,
  onChange,
  placeholder = 'Start writing your blog post...',
}) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const editorRef = React.useRef<MDXEditorMethods>(null);

  const handleImageInsert = useCallback((imageUrl: string, altText: string, width?: number, height?: number, alignment: string = 'center') => {
    if (!editorRef.current) {
      toast.error('Editor is not ready');
      return;
    }

    try {
      // Determine alignment class
      const alignmentClass = alignment === 'left' ? 'float-left mr-4 mb-4' :
                            alignment === 'right' ? 'float-right ml-4 mb-4' :
                            alignment === 'full' ? 'w-full' :
                            'mx-auto block';

      const widthAttr = width ? ` width="${width}"` : '';
      const heightAttr = height ? ` height="${height}"` : '';
      const styleAttr = alignment === 'full' && !width ? ' style="width: 100%"' : '';

      // Always use HTML format for consistency and proper rendering
      const imageHtml = `<img src="${imageUrl}" alt="${altText}"${widthAttr}${heightAttr} class="${alignmentClass}" loading="lazy" decoding="async" />`;

      // Create the complete image block with surrounding newlines for proper spacing
      // This ensures the image is treated as a block-level element
      const imageBlock = `\n\n${imageHtml}\n\n`;

      // Get the current markdown content
      const currentMarkdown = editorRef.current.getMarkdown();

      if (!currentMarkdown) {
        // If editor is empty, just insert without newlines
        editorRef.current.insertMarkdown(imageHtml);
      } else {
        // Insert at cursor position with proper spacing
        editorRef.current.insertMarkdown(imageBlock);
      }

      // Force a small delay to ensure DOM is updated before closing modal
      setTimeout(() => {
        setIsImageModalOpen(false);
        toast.success('Image inserted successfully');
      }, 100);
    } catch (error) {
      console.error('Failed to insert image:', error);
      toast.error('Failed to insert image. Please try again.');
    }
  }, [toast]);

  const imageUploadHandler = useCallback(async (image: File) => {
    // This function handles images dropped/pasted into editor
    // We'll upload to Supabase storage
    const formData = new FormData();
    formData.append('file', image);
    
    try {
      // For now, return a placeholder - we'll implement proper upload in modal
      return 'uploading...';
    } catch (error) {
      console.error('Image upload failed:', error);
      throw error;
    }
  }, []);

  const handleEditorDragOver = useCallback((e: React.DragEvent) => {
    // Check if dragging a media asset
    if (e.dataTransfer.types.includes('application/x-media-asset')) {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(true);
    }
  }, []);

  const handleEditorDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleEditorDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    // Get media asset data
    const assetData = e.dataTransfer.getData('application/x-media-asset');
    if (assetData) {
      try {
        const asset = JSON.parse(assetData);
        // Insert image at current cursor position
        handleImageInsert(asset.url, asset.alt || 'Image from media library', asset.width, asset.height);
        toast.success('Image inserted from media library');
      } catch (error) {
        console.error('Failed to parse dropped asset:', error);
        toast.error('Failed to insert image');
      }
    }
  }, [handleImageInsert]);

  return (
    <div
      className={cn(
        "border rounded-lg overflow-hidden bg-background relative transition-all mdx-editor-container",
        isDragOver && "ring-2 ring-primary ring-offset-2"
      )}
      onDragOver={handleEditorDragOver}
      onDragLeave={handleEditorDragLeave}
      onDrop={handleEditorDrop}
    >
      {isDragOver && (
        <div className="absolute inset-0 bg-primary/10 z-10 flex items-center justify-center pointer-events-none">
          <div className="bg-background/90 px-6 py-3 rounded-lg border-2 border-primary border-dashed">
            <p className="text-sm font-medium text-foreground">Drop image here to insert</p>
          </div>
        </div>
      )}
      
      <MDXEditor
        ref={editorRef}
        markdown={markdown}
        onChange={onChange}
        placeholder={placeholder}
        contentEditableClassName="prose prose-slate dark:prose-invert max-w-none min-h-[400px] p-4 focus:outline-none text-foreground dark:text-foreground"
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          linkPlugin(),
          linkDialogPlugin(),
          imagePlugin({
            imageUploadHandler,
          }),
          tablePlugin(),
          codeBlockPlugin({ defaultCodeBlockLanguage: 'javascript' }),
          codeMirrorPlugin({
            codeBlockLanguages: {
              javascript: 'JavaScript',
              typescript: 'TypeScript',
              python: 'Python',
              css: 'CSS',
              html: 'HTML',
              json: 'JSON',
            },
          }),
          markdownShortcutPlugin(),
          diffSourcePlugin({ viewMode: 'rich-text' }),
          toolbarPlugin({
            toolbarContents: () => (
              <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/30">
                <UndoRedo />
                <Separator />
                <BoldItalicUnderlineToggles />
                <Separator />
                <BlockTypeSelect />
                <Separator />
                <ListsToggle />
                <Separator />
                <CreateLink />
                <Separator />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsImageModalOpen(true)}
                  className="h-8 px-2"
                >
                  <ImageIcon className="h-4 w-4 mr-1" />
                  Image
                </Button>
                <Separator />
                <InsertTable />
                <Separator />
                <CodeToggle />
                <InsertCodeBlock />
                <Separator />
                <InsertThematicBreak />
              </div>
            ),
          }),
        ]}
      />
      
      <ImageUploadModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onInsert={handleImageInsert}
      />
    </div>
  );
};
