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
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  const editorRef = React.useRef<MDXEditorMethods>(null);

  // Save cursor position when modal opens
  const openImageModal = useCallback(() => {
    try {
      const currentMarkdown = editorRef.current?.getMarkdown() ?? '';
      const selection = window.getSelection();

      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(document.querySelector('[contenteditable="true"]') || document.body);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        const offset = preCaretRange.toString().length;
        setCursorPosition(offset);
      } else {
        // No selection, insert at end
        setCursorPosition(currentMarkdown.length);
      }
    } catch (error) {
      // If position detection fails, insert at end
      setCursorPosition(editorRef.current?.getMarkdown()?.length ?? 0);
    }

    setIsImageModalOpen(true);
  }, []);

  const handleImageInsert = useCallback((imageUrl: string, altText: string, width?: number, height?: number, alignment: string = 'center', caption?: string) => {
    if (!editorRef.current) {
      toast.error('Editor is not ready');
      return;
    }

    try {
      // Build the image markdown
      let imageMarkdown = `![${altText}](${imageUrl})`;

      // Build final content with caption if provided
      let contentToInsert: string;
      if (caption) {
        // Use HTML figure for semantic captioning
        contentToInsert = `<figure>\n\n![${altText}](${imageUrl})\n\n<figcaption class="text-sm text-muted-foreground text-center">${caption}</figcaption>\n\n</figure>`;
      } else {
        contentToInsert = imageMarkdown;
      }

      // Add proper spacing - newlines before and after the image block
      const finalContent = `\n\n${contentToInsert}\n\n`;

      // Get the current markdown and append the image content
      const currentMarkdown = editorRef.current.getMarkdown();
      const newMarkdown = currentMarkdown + finalContent;

      // Update both the internal editor state and the parent component
      editorRef.current.setMarkdown(newMarkdown);
      onChange(newMarkdown);

      // Close modal
      setIsImageModalOpen(false);

      // Show success message
      setTimeout(() => {
        toast.success('Image inserted successfully');
      }, 100);
    } catch (error) {
      console.error('Failed to insert image:', error);
      toast.error('Failed to insert image. Please try again.');
    }
  }, [onChange, toast]);

  const imageUploadHandler = useCallback(async (image: File) => {
    // This function handles images dropped/pasted into editor
    // It's required by the imagePlugin but we handle uploads through the modal instead
    // Return a placeholder since we handle images through ImageUploadModal
    try {
      return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%23999" font-size="12"%3EImage%3C/text%3E%3C/svg%3E';
    } catch (error) {
      console.error('Image upload handler error:', error);
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
