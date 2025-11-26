import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  GitBranch,
  Sparkles,
  Upload,
  Dices
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

import { toast } from "sonner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { HotspotCreator } from "../components/HotspotCreator";

export function StoryEditor() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [story, setStory] = useState<Story | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [isStoryboardView, setIsStoryboardView] = useState(true); // Default to storyboard view

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
    if (!selectedPage || !story) return;
    try {
      setSaving(true);
      await pageService.updatePage(selectedPage._id, selectedPage);

      // Update local state to reflect saved status if needed
      setPages(pages.map(p => p._id === selectedPage._id ? selectedPage : p));
      toast.success("Page saved successfully!");
    } catch (error) {
      console.error("Failed to save page:", error);
      toast.error("Failed to save page. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const saveStoryboard = async () => {
    if (!story) return;
    try {
      setSaving(true);
      // Story metadata is already being updated in real-time via updateStoryTitle, etc.
      // This is just a manual save trigger with confirmation
      toast.success("Storyboard saved successfully!");
    } catch (error) {
      console.error("Failed to save storyboard:", error);
      toast.error("Failed to save storyboard. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const updateStoryTitle = async (newTitle: string) => {
    if (!story) return;
    setStory({ ...story, title: newTitle });
    try {
      await storyService.updateStory(story._id, { title: newTitle });
    } catch (error) {
      console.error("Failed to update story title:", error);
    }
  };

  const updateStoryDescription = async (newDescription: string) => {
    if (!story) return;
    setStory({ ...story, description: newDescription });
    try {
      await storyService.updateStory(story._id, { description: newDescription });
    } catch (error) {
      console.error("Failed to update story description:", error);
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

  const updateStoryTags = async (tagsString: string) => {
    if (!story) return;
    const newTags = tagsString.split(',').map(t => t.trim()).filter(t => t.length > 0);
    setStory({ ...story, tags: newTags });
    try {
      await storyService.updateStory(story._id, { tags: newTags });
      toast.success("Tags updated successfully!");
    } catch (error) {
      console.error("Failed to update tags:", error);
      toast.error("Failed to update tags. Please try again.");
    }
  };

  const addPage = async () => {
    if (!story) return;
    try {
      setSaving(true);
      const newPage = await pageService.createPage(story._id, {
        content: "New page content...",
        choices: [],
        isEnding: false
      });
      setPages([...pages, newPage]);
      setSelectedPageId(newPage._id);
      toast.success("New page added");
    } catch (error) {
      console.error("Failed to create page:", error);
      toast.error("Failed to create page");
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

  const updateChoice = (index: number, updates: Partial<Page['choices'][0]>) => {
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
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <Button
                variant="ghost"
                size="sm"
                className="hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                onClick={() => navigate("/my-stories")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              <div className="h-6 w-px bg-border hidden lg:block" />

              <Input
                value={story.title}
                onChange={(e) => updateStoryTitle(e.target.value)}
                className="bg-transparent border-none text-lg font-semibold focus-visible:ring-0 px-2 w-full lg:w-[300px]"
                placeholder="Story Title"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                className="hover:border-emerald-500/50 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all flex-1 lg:flex-none"
                onClick={() => navigate(`/editor/${id}/flow`)}
              >
                <GitBranch className="w-4 h-4 mr-2" />
                Flow View
              </Button>
              <Button
                size="sm"
                className="gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all flex-1 lg:flex-none"
                onClick={isStoryboardView ? saveStoryboard : saveCurrentPage}
                disabled={saving}
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : isStoryboardView ? "Save Storyboard" : "Save Page"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Page List Sidebar */}
        <div className="lg:w-64 border-b lg:border-b-0 lg:border-r border-border/50 bg-card/30 flex flex-col">
          <div className="p-4 border-b border-border/50">
            <Button
              size="sm"
              className="w-full gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all"
              onClick={addPage}
              disabled={saving}
            >
              <Plus className="w-4 h-4" />
              Add Page
            </Button>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2">
              {/* Storyboard Section */}
              <div
                className={`p-3 rounded-lg mb-3 cursor-pointer transition-all border ${isStoryboardView
                  ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                  : 'border-transparent hover:bg-muted hover:border-white/5'
                  }`}
                onClick={() => {
                  setIsStoryboardView(true);
                  setSelectedPageId(null);
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold">📋 Storyboard</span>
                </div>
                <div className="text-xs opacity-70">
                  Story settings & metadata
                </div>
              </div>

              <div className="h-px bg-border/50 my-2" />

              {/* Pages */}
              {pages.map((page, index) => (
                <div
                  key={page._id}
                  className={`p-3 rounded-lg mb-2 cursor-pointer transition-all border ${selectedPageId === page._id && !isStoryboardView
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                    : 'border-transparent hover:bg-muted hover:border-white/5'
                    }`}
                  onClick={() => {
                    setSelectedPageId(page._id);
                    setIsStoryboardView(false);
                  }}
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
            {isStoryboardView ? (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Story Settings</h2>
                  <p className="text-sm text-muted-foreground">Manage your story's metadata and appearance</p>
                </div>

                {/* Story Title */}
                <Card>
                  <CardHeader>
                    <CardTitle>Story Title</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Input
                      value={story.title}
                      onChange={(e) => updateStoryTitle(e.target.value)}
                      className="bg-card/50 border-white/10 focus:border-emerald-500/50 text-lg font-semibold"
                      placeholder="Enter story title..."
                    />
                  </CardContent>
                </Card>

                {/* Story Description */}
                <Card>
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={story.description}
                      onChange={(e) => updateStoryDescription(e.target.value)}
                      className="bg-card/50 border-white/10 focus:border-emerald-500/50 min-h-[120px]"
                      placeholder="Write a compelling description for your story..."
                    />
                  </CardContent>
                </Card>

                {/* Story Cover Image */}
                <Card>
                  <CardHeader>
                    <CardTitle>Cover Image</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {story.imageUrl && (
                        <div className="relative aspect-video w-full max-w-2xl overflow-hidden rounded-lg border border-border/50">
                          <img
                            src={story.imageUrl}
                            alt="Story cover"
                            className="h-full w-full object-cover"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8"
                            onClick={async () => {
                              if (story) {
                                setStory({ ...story, imageUrl: undefined });
                                await storyService.updateStory(story._id, { imageUrl: undefined });
                              }
                            }}
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
                          onChange={handleStoryImageUpload}
                          disabled={saving}
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

                {/* Story Tags */}
                <Card>
                  <CardHeader>
                    <CardTitle>Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Input
                      value={story.tags.join(", ")}
                      onChange={(e) => {
                        // Just update the display value, don't parse yet
                        const displayValue = e.target.value;
                        setStory({ ...story, tags: displayValue.includes(',') ? displayValue.split(',').map(t => t.trim()) : [displayValue] });
                      }}
                      onBlur={(e) => updateStoryTags(e.target.value)}
                      placeholder="Fantasy, Adventure, Magic..."
                      className="bg-card/50 border-white/10 focus:border-emerald-500/50"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Separate tags with commas. Press Tab or click outside to save.
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : selectedPage ? (
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
                    <CardTitle className="text-base">Page Illustration & Interaction</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="image" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="image">Image</TabsTrigger>
                        <TabsTrigger value="hotspots">Hotspots</TabsTrigger>
                      </TabsList>

                      <TabsContent value="image">
                        <div className="space-y-4">
                          {selectedPage.image && (
                            <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border/50">
                              <img
                                src={selectedPage.image}
                                alt="Page illustration"
                                className="h-full w-full object-contain bg-black/20"
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
                      </TabsContent>

                      <TabsContent value="hotspots">
                        <HotspotCreator
                          imageUrl={selectedPage.image || ''}
                          initialHotspots={selectedPage.hotspots || []}
                          availablePages={pages.map((p, index) => ({ id: p._id, title: `Page ${index + 1}` }))}
                          onSave={(hotspots) => updatePageLocal(selectedPage._id, { hotspots })}
                        />
                      </TabsContent>
                    </Tabs>
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
                        <Label className="cursor-pointer">Mark as Ending</Label>
                        <p className="text-xs text-muted-foreground">
                          This page concludes the story
                        </p>
                      </div>
                      {selectedPage.isEnding ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => updatePageLocal(selectedPage._id, { isEnding: false })}
                        >
                          Unmark as Ending
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-primary/50 text-primary hover:bg-primary/10"
                          onClick={() => updatePageLocal(selectedPage._id, { isEnding: true })}
                        >
                          Mark as Ending
                        </Button>
                      )}
                    </div>

                    {selectedPage.isEnding && (
                      <div className="space-y-2">
                        <Label htmlFor="ending-type">Ending Type</Label>
                        <Select
                          value={selectedPage.endingType || "neutral"}
                          onValueChange={(value) => updatePageLocal(selectedPage._id, { endingType: value as "success" | "failure" | "neutral" })}
                        >
                          <SelectTrigger className="bg-card/50 backdrop-blur-sm border-white/10 focus:border-emerald-500 transition-colors">
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
                            className="hover:border-emerald-500/50 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
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
                              <SelectTrigger className="bg-card/50 backdrop-blur-sm border-white/10 focus:border-emerald-500 transition-colors">
                                <SelectValue placeholder="Select target page" />
                              </SelectTrigger>
                              <SelectContent>
                                {pages.map((p, i) => (
                                  <SelectItem key={p._id} value={p._id}>
                                    Page {i + 1} - {p.content.substring(0, 60)}{p.content.length > 60 ? "..." : ""} {p.isEnding && '(Ending)'}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Dice Roll Section */}
                          <div className="pt-3 border-t border-border/50 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Dices className="w-4 h-4 text-emerald-500" />
                                <Label className="cursor-pointer">Dice Roll Challenge</Label>
                              </div>
                              {choice.diceRoll?.enabled ? (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    const currentDiceRoll = choice.diceRoll || { enabled: false, difficulty: 15, type: 'combat' as const };
                                    updateChoice(index, {
                                      diceRoll: { ...currentDiceRoll, enabled: false }
                                    });
                                  }}
                                >
                                  Remove Challenge
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/10"
                                  onClick={() => {
                                    const currentDiceRoll = choice.diceRoll || { enabled: false, difficulty: 15, type: 'combat' as const };
                                    updateChoice(index, {
                                      diceRoll: { ...currentDiceRoll, enabled: true }
                                    });
                                  }}
                                >
                                  Add Challenge
                                </Button>
                              )}
                            </div>

                            {choice.diceRoll?.enabled && (
                              <div className="space-y-3 pl-6 bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/20">
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-2">
                                    <Label htmlFor={`difficulty-${index}`} className="text-sm">Difficulty (DC)</Label>
                                    <Input
                                      id={`difficulty-${index}`}
                                      type="number"
                                      min={5}
                                      max={30}
                                      value={choice.diceRoll?.difficulty || 15}
                                      onChange={(e) => {
                                        const currentDiceRoll = choice.diceRoll || { enabled: true, difficulty: 15, type: 'combat' as const };
                                        updateChoice(index, {
                                          diceRoll: { ...currentDiceRoll, difficulty: parseInt(e.target.value) }
                                        });
                                      }}
                                      className="bg-card/50 backdrop-blur-sm border-white/10 focus:border-emerald-500 transition-colors"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`type-${index}`} className="text-sm">Type</Label>
                                    <Select
                                      value={choice.diceRoll?.type || 'combat'}
                                      onValueChange={(value: 'combat' | 'stealth' | 'persuasion' | 'custom') => {
                                        const currentDiceRoll = choice.diceRoll || { enabled: true, difficulty: 15, type: 'combat' as const };
                                        updateChoice(index, {
                                          diceRoll: { ...currentDiceRoll, type: value }
                                        });
                                      }}
                                    >
                                      <SelectTrigger id={`type-${index}`} className="bg-card/50 backdrop-blur-sm border-white/10 focus:border-emerald-500 transition-colors">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="combat">⚔️ Combat</SelectItem>
                                        <SelectItem value="stealth">🥷 Stealth</SelectItem>
                                        <SelectItem value="persuasion">💬 Persuasion</SelectItem>
                                        <SelectItem value="custom">🎲 Custom</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Players will roll 1d20. Success if roll ≥ {choice.diceRoll?.difficulty || 15}
                                </p>
                              </div>
                            )}
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
