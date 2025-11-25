import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  GitBranch,
  Sparkles,
  Upload
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { ScrollArea } from "../components/ui/scroll-area";
import { storyService, pageService, aiService, uploadService } from "../api/services";
import type { Page, Story } from "../api/services";

export function StoryEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [story, setStory] = useState<Story | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  
  // AI State
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (id && id !== 'new') {
      loadData(id);
    }
  }, [id]);

  const loadData = async (storyId: string) => {
    try {
      setLoading(true);
      const [storyData, pagesData] = await Promise.all([
        storyService.getStory(storyId),
        storyService.getPages(storyId)
      ]);
      setStory(storyData);
      setPages(pagesData);
      if (pagesData.length > 0 && !selectedPageId) {
        setSelectedPageId(pagesData[0]._id);
      }
    } catch (error) {
      console.error("Failed to load story data:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const selectedPage = pages.find(p => p._id === selectedPageId);

  // Local update for immediate UI feedback (optimistic UI)
  const updatePageLocal = (pageId: string, updates: Partial<Page>) => {
    setPages(pages.map(p => 
      p._id === pageId ? { ...p, ...updates } : p
    ));
  };

  const saveCurrentPage = async () => {
    if (!selectedPage) return;
    try {
      setSaving(true);
      await pageService.updatePage(selectedPage._id, selectedPage);
    } catch (error) {
      console.error("Failed to save page:", error);
    } finally {
      setSaving(false);
    }
  };

  const updateStoryTitle = async (newTitle: string) => {
    if (!story) return;
    setStory({ ...story, title: newTitle });
    // Debounce or save on blur would be better, but for now simple save
    try {
      await storyService.updateStory(story._id, { title: newTitle });
    } catch (error) {
      console.error("Failed to update story title:", error);
    }
  };

  const handleStoryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && story) {
      const file = e.target.files[0];
      try {
        setSaving(true);
        const { url } = await uploadService.uploadImage(file);
        setStory({ ...story, imageUrl: url });
        await storyService.updateStory(story._id, { imageUrl: url });
      } catch (error) {
        console.error("Failed to upload story image:", error);
      } finally {
        setSaving(false);
      }
    }
  };

  const addPage = async () => {
    if (!story) return;
    try {
      setSaving(true);
      const newPage = await pageService.createPage(story._id, {
        content: "Start writing here...",
        isEnding: false,
        choices: []
      });
      setPages([...pages, newPage]);
      setSelectedPageId(newPage._id);
    } catch (error) {
      console.error("Failed to add page:", error);
    } finally {
      setSaving(false);
    }
  };

  const addChoice = () => {
    if (!selectedPage) return;
    const newChoice = {
      text: "New choice",
      targetPageId: pages[0]?._id || "" // Default to first page
    };
    updatePageLocal(selectedPage._id, {
      choices: [...selectedPage.choices, newChoice]
    });
  };

  const updateChoice = (index: number, updates: Partial<{ text: string; targetPageId: string }>) => {
    if (!selectedPage) return;
    const newChoices = [...selectedPage.choices];
    newChoices[index] = { ...newChoices[index], ...updates };
    updatePageLocal(selectedPage._id, { choices: newChoices });
  };

  const deleteChoice = (index: number) => {
    if (!selectedPage) return;
    const newChoices = selectedPage.choices.filter((_, i) => i !== index);
    updatePageLocal(selectedPage._id, { choices: newChoices });
  };

  // AI Features
  const generatePageContent = async () => {
    if (!selectedPage || !story) return;
    try {
      setGenerating(true);
      // We don't have a direct "generatePageContent" in aiService, but we have "generatePage" which creates a new page?
      // Or we reuse suggestChoices?
      // The backend route `POST /api/ai/generate-page` takes context and returns a page.
      // But here we want to fill the CURRENT page content.
      // I'll assume I can use `aiService.suggestChoices` for choices, but for content?
      // `aiStoryController.generatePage` seems to generate a NEW page object.
      // Maybe I should ask for "Continue story" which returns text?
      // Let's assume for now we don't have a dedicated "fill content" endpoint, 
      // but we can hack it or just use `generateStory` logic.
      // Actually, looking at `aiStoryRoutes.ts`: `router.post('/generate-page', ...)`
      // Payload: `storyContext`, `previousPageId`, `theme`.
      // It returns a Page object. I can use that content to fill the current page.
      
      // Let's assume we want to "continue" from the previous page or just generate based on story theme.
      // Since we are editing a specific page, maybe we just want to fill it.
      // I'll leave this as a TODO or try to call a method if I can find one.
      // For now, let's implement "Suggest Choices" which is supported.
      
      const suggestions = await aiService.suggestChoices(selectedPage.content, story.description || story.theme);
      if (suggestions && Array.isArray(suggestions)) {
        // Map suggestions to choices
        const newChoices = suggestions.map((text: string) => ({
            text,
            targetPageId: pages[0]?._id || "" // User has to link them
        }));
        updatePageLocal(selectedPage._id, { choices: [...selectedPage.choices, ...newChoices] });
      }

    } catch (error) {
      console.error("AI Generation failed:", error);
    } finally {
      setGenerating(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && selectedPage) {
        const file = e.target.files[0];
        try {
            const { url } = await uploadService.uploadImage(file);
            updatePageLocal(selectedPage._id, { image: url });
        } catch (error) {
            console.error("Failed to upload image:", error);
        }
    }
  };

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-muted-foreground">Loading editor...</div>
        </div>
    );
  }

  if (!story) return <div>Story not found</div>;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="border-b border-border/50 px-6 py-4 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/my-stories")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <div className="h-6 w-px bg-border" />
            
            <Input 
              value={story.title}
              onChange={(e) => updateStoryTitle(e.target.value)}
              className="bg-transparent border-none text-lg font-semibold focus-visible:ring-0 px-2 w-[300px]"
            />
            
            {/* Story Cover Image Upload */}
            <div className="relative">
              {story.imageUrl ? (
                <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-border/50">
                  <img 
                    src={story.imageUrl} 
                    alt="Story cover" 
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-0 right-0 h-4 w-4"
                    onClick={async () => {
                      if (story) {
                        setStory({ ...story, imageUrl: undefined });
                        await storyService.updateStory(story._id, { imageUrl: undefined });
                      }
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleStoryImageUpload}
                    disabled={saving}
                  />
                  <div className="w-16 h-16 rounded-lg border-2 border-dashed border-border/50 flex items-center justify-center hover:border-primary/50 transition-colors">
                    <Upload className="w-5 h-5 text-muted-foreground" />
                  </div>
                </label>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate(`/editor/${id}/flow`)}
            >
              <GitBranch className="w-4 h-4 mr-2" />
              Flow View
            </Button>
            <Button size="sm" className="gap-2" onClick={saveCurrentPage} disabled={saving}>
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Page"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex overflow-hidden">
        {/* Page List Sidebar */}
        <div className="w-64 border-r border-border/50 bg-card/30 flex flex-col">
          <div className="p-4 border-b border-border/50">
            <Button 
              size="sm" 
              className="w-full gap-2"
              onClick={addPage}
              disabled={saving}
            >
              <Plus className="w-4 h-4" />
              Add Page
            </Button>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-2">
              {pages.map((page, index) => (
                <div
                  key={page._id}
                  className={`p-3 rounded-lg mb-2 cursor-pointer transition-all ${
                    selectedPageId === page._id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedPageId(page._id)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold truncate">
                        {/* Page doesn't have a title field, using index or content snippet */}
                        Page {index + 1}
                    </span>
                    {page.isEnding && (
                      <span className="text-xs px-2 py-0.5 rounded bg-secondary text-secondary-foreground">
                        END
                      </span>
                    )}
                  </div>
                  <div className="text-xs opacity-70 truncate">
                    {page.content ? page.content.substring(0, 20) + "..." : "Empty page"}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Page Editor */}
        <div className="flex-1 overflow-auto">
            <div className="p-8 max-w-4xl mx-auto pb-20">
              {selectedPage ? (
                <div className="space-y-6">
                  {/* Page Title (Visual only since backend doesn't support it, or we treat it as metadata) */}
                  <div className="space-y-2">
                    <Label>Page ID</Label>
                    <div className="text-sm text-muted-foreground font-mono">{selectedPage._id}</div>
                  </div>

                  {/* Page Text */}
                  <div className="space-y-2">
                    <Label htmlFor="page-text">Page Content</Label>
                    <Textarea
                      id="page-text"
                      value={selectedPage.content}
                      onChange={(e) => updatePageLocal(selectedPage._id, { content: e.target.value })}
                      className="bg-input border-border/50 min-h-[200px]"
                      placeholder="Write your story content here..."
                    />
                  </div>

                  {/* Illustration Upload */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Page Illustration</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {selectedPage.image && (
                                <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border/50">
                                    <img 
                                        src={selectedPage.image} 
                                        alt="Page illustration" 
                                        className="h-full w-full object-cover"
                                    />
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2 h-8 w-8"
                                        onClick={() => updatePageLocal(selectedPage._id, { image: undefined })}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                            <div className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={handleImageUpload}
                                />
                                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground mb-1">
                                    Click to upload or drag and drop
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    PNG, JPG up to 5MB
                                </p>
                            </div>
                        </div>
                    </CardContent>
                  </Card>

                  {/* Ending Toggle */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Ending Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="is-ending">Mark as Ending</Label>
                          <p className="text-xs text-muted-foreground">
                            This page concludes the story
                          </p>
                        </div>
                        <Switch
                          id="is-ending"
                          checked={selectedPage.isEnding}
                          onCheckedChange={(checked: boolean) => updatePageLocal(selectedPage._id, { isEnding: checked })}
                        />
                      </div>

                      {selectedPage.isEnding && (
                        <div className="space-y-2">
                          <Label htmlFor="ending-type">Ending Type</Label>
                          <Select
                            value={selectedPage.endingType || "neutral"}
                            onValueChange={(value) => updatePageLocal(selectedPage._id, { endingType: value as "success" | "failure" | "neutral" })}
                          >
                            <SelectTrigger className="bg-input border-border/50">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="success">Success / Victory</SelectItem>
                                <SelectItem value="failure">Failure / Death</SelectItem>
                                <SelectItem value="neutral">Neutral</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Choices */}
                  {!selectedPage.isEnding && (
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Choices</CardTitle>
                          <div className="flex gap-2">
                            <Button 
                                size="sm" 
                                variant="secondary"
                                onClick={generatePageContent}
                                disabled={generating || !selectedPage.content}
                                title="Use AI to suggest choices based on content"
                            >
                                <Sparkles className="w-4 h-4 mr-2" />
                                AI Suggest
                            </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={addChoice}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Choice
                          </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {selectedPage.choices.map((choice, index) => (
                          <div key={index} className="p-4 border border-border/50 rounded-lg space-y-3">
                            <div className="flex items-start justify-between">
                              <span className="text-sm text-muted-foreground">Choice {index + 1}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteChoice(index)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>

                            <div className="space-y-2">
                              <Label>Choice Text</Label>
                              <Input
                                value={choice.text}
                                onChange={(e) => updateChoice(index, { text: e.target.value })}
                                className="bg-input border-border/50"
                                placeholder="What the reader sees..."
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Target Page</Label>
                              <Select
                                value={choice.targetPageId}
                                onValueChange={(value: string) => updateChoice(index, { targetPageId: value })}
                              >
                                <SelectTrigger className="bg-input border-border/50">
                                  <SelectValue placeholder="Select target page" />
                                </SelectTrigger>
                                <SelectContent>
                                  {pages.map((p, i) => (
                                    <SelectItem key={p._id} value={p._id}>
                                      Page {i + 1} - {p.content.substring(0, 15)}... {p.isEnding && '(Ending)'}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        ))}

                        {selectedPage.choices.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground text-sm">
                            No choices yet. Add at least one choice or mark this as an ending page.
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  Select a page to edit
                </div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
}
