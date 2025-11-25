import { useState } from "react";
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
  Upload,
  GitBranch 
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { ScrollArea } from "../components/ui/scroll-area";

interface Choice {
  id: string;
  text: string;
  targetPage: string;
}

interface Page {
  id: string;
  title: string;
  text: string;
  isEnding: boolean;
  endingLabel: string;
  choices: Choice[];
}

export function StoryEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [storyTitle, setStoryTitle] = useState("The Forgotten Realm");
  const [pages, setPages] = useState<Page[]>([
    {
      id: "1",
      title: "Opening",
      text: "You stand at the edge of the Forgotten Realm...",
      isEnding: false,
      endingLabel: "",
      choices: [
        { id: "c1", text: "Enter the forest", targetPage: "2" },
        { id: "c2", text: "Go to the castle", targetPage: "3" },
      ],
    },
    {
      id: "2",
      title: "Forest Path",
      text: "The forest is dark and mysterious...",
      isEnding: false,
      endingLabel: "",
      choices: [],
    },
    {
      id: "3",
      title: "Castle Gates",
      text: "The castle looms before you...",
      isEnding: false,
      endingLabel: "",
      choices: [],
    },
  ]);
  
  const [selectedPageId, setSelectedPageId] = useState("1");
  
  const selectedPage = pages.find(p => p.id === selectedPageId);

  const updatePage = (updates: Partial<Page>) => {
    setPages(pages.map(p => 
      p.id === selectedPageId ? { ...p, ...updates } : p
    ));
  };

  const addChoice = () => {
    if (!selectedPage) return;
    const newChoice: Choice = {
      id: `c${Date.now()}`,
      text: "New choice",
      targetPage: pages[0]?.id || "",
    };
    updatePage({
      choices: [...selectedPage.choices, newChoice],
    });
  };

  const updateChoice = (choiceId: string, updates: Partial<Choice>) => {
    if (!selectedPage) return;
    updatePage({
      choices: selectedPage.choices.map(c => 
        c.id === choiceId ? { ...c, ...updates } : c
      ),
    });
  };

  const deleteChoice = (choiceId: string) => {
    if (!selectedPage) return;
    updatePage({
      choices: selectedPage.choices.filter(c => c.id !== choiceId),
    });
  };

  const addPage = () => {
    const newPage: Page = {
      id: `${pages.length + 1}`,
      title: `Page ${pages.length + 1}`,
      text: "",
      isEnding: false,
      endingLabel: "",
      choices: [],
    };
    setPages([...pages, newPage]);
    setSelectedPageId(newPage.id);
  };

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
              value={storyTitle}
              onChange={(e) => setStoryTitle(e.target.value)}
              className="bg-transparent border-none text-lg font-semibold focus-visible:ring-0 px-2"
            />
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
            <Button size="sm" className="gap-2">
              <Save className="w-4 h-4" />
              Save
            </Button>
          </div>
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex">
        {/* Page List Sidebar */}
        <div className="w-64 border-r border-border/50 bg-card/30">
          <div className="p-4 border-b border-border/50">
            <Button 
              size="sm" 
              className="w-full gap-2"
              onClick={addPage}
            >
              <Plus className="w-4 h-4" />
              Add Page
            </Button>
          </div>
          
          <ScrollArea className="h-[calc(100vh-180px)]">
            <div className="p-2">
              {pages.map(page => (
                <div
                  key={page.id}
                  className={`p-3 rounded-lg mb-2 cursor-pointer transition-all ${
                    selectedPageId === page.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedPageId(page.id)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold">{page.title}</span>
                    {page.isEnding && (
                      <span className="text-xs px-2 py-0.5 rounded bg-secondary text-secondary-foreground">
                        END
                      </span>
                    )}
                  </div>
                  <div className="text-xs opacity-70">
                    {page.choices.length} choice{page.choices.length !== 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Page Editor */}
        <div className="flex-1">
          <ScrollArea className="h-[calc(100vh-80px)]">
            <div className="p-8 max-w-4xl mx-auto">
              {selectedPage ? (
                <div className="space-y-6">
                  {/* Page Title */}
                  <div className="space-y-2">
                    <Label htmlFor="page-title">Page Title</Label>
                    <Input
                      id="page-title"
                      value={selectedPage.title}
                      onChange={(e) => updatePage({ title: e.target.value })}
                      className="bg-input border-border/50"
                      placeholder="e.g., Opening Scene"
                    />
                    <p className="text-xs text-muted-foreground">
                      Internal name for organization (not shown to readers)
                    </p>
                  </div>

                  {/* Page Text */}
                  <div className="space-y-2">
                    <Label htmlFor="page-text">Page Content</Label>
                    <Textarea
                      id="page-text"
                      value={selectedPage.text}
                      onChange={(e) => updatePage({ text: e.target.value })}
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
                      <div className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mb-1">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG up to 5MB
                        </p>
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
                          onCheckedChange={(checked: boolean) => updatePage({ isEnding: checked })}
                        />
                      </div>

                      {selectedPage.isEnding && (
                        <div className="space-y-2">
                          <Label htmlFor="ending-label">Ending Label</Label>
                          <Input
                            id="ending-label"
                            value={selectedPage.endingLabel}
                            onChange={(e) => updatePage({ endingLabel: e.target.value })}
                            className="bg-input border-border/50"
                            placeholder="e.g., Heroic Victory"
                          />
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
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={addChoice}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Choice
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {selectedPage.choices.map((choice, index) => (
                          <div key={choice.id} className="p-4 border border-border/50 rounded-lg space-y-3">
                            <div className="flex items-start justify-between">
                              <span className="text-sm text-muted-foreground">Choice {index + 1}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteChoice(choice.id)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>

                            <div className="space-y-2">
                              <Label>Choice Text</Label>
                              <Input
                                value={choice.text}
                                onChange={(e) => updateChoice(choice.id, { text: e.target.value })}
                                className="bg-input border-border/50"
                                placeholder="What the reader sees..."
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Target Page</Label>
                              <Select
                                value={choice.targetPage}
                                onValueChange={(value: string) => updateChoice(choice.id, { targetPage: value })}
                              >
                                <SelectTrigger className="bg-input border-border/50">
                                  <SelectValue placeholder="Select target page" />
                                </SelectTrigger>
                                <SelectContent>
                                  {pages.map(p => (
                                    <SelectItem key={p.id} value={p.id}>
                                      {p.title} {p.isEnding && '(Ending)'}
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
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
