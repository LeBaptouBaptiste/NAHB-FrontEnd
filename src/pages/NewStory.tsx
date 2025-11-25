import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "../components/Navigation";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { storyService, pageService, aiService, uploadService } from "../api/services";
import { Loader2, Wand2, BookOpen, Upload, Trash2 } from "lucide-react";

export function NewStory() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Manual Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [theme, setTheme] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  // AI Form State
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiTheme, setAiTheme] = useState("fantasy");
  const [numPages, setNumPages] = useState(5);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        setUploadingImage(true);
        const { url } = await uploadService.uploadImage(file);
        setImageUrl(url);
      } catch (error) {
        console.error("Failed to upload image:", error);
        setError("Failed to upload image");
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleManualCreate = async () => {
    if (!title) return;
    
    try {
      setLoading(true);
      setError(null);
      const story = await storyService.createStory({
        title,
        description,
        theme,
        imageUrl,
        status: 'draft'
      });
      // Create initial page
      await pageService.createPage(story._id, {
        content: "Once upon a time...",
        isEnding: false,
        choices: []
      });
      navigate(`/editor/${story._id}`);
    } catch (err) {
      console.error(err);
      setError("Failed to create story");
    } finally {
      setLoading(false);
    }
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt) return;

    try {
      setLoading(true);
      setError(null);
      // Calls the AI service which initiates the generation process
      const result = await aiService.generateStory({
        userPrompt: aiPrompt,
        theme: aiTheme,
        numPages,
        language: 'fr' // defaulting to French based on context
      });
      
      if (result && result.storyId) {
        navigate(`/editor/${result.storyId}`);
      } else {
        throw new Error("No story ID returned");
      }
    } catch (err) {
      console.error(err);
      setError("AI Generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-6 py-12 flex items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl">Create New Story</CardTitle>
            <CardDescription>
              Choose how you want to start your new adventure
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-4">
                {error}
              </div>
            )}
            
            <Tabs defaultValue="manual" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="manual">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Manual Creation
                </TabsTrigger>
                <TabsTrigger value="ai">
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate with AI
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="manual" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Story Title</Label>
                  <Input 
                    id="title" 
                    placeholder="The Lost Kingdom" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme/Genre</Label>
                  <Input 
                    id="theme" 
                    placeholder="Fantasy, Sci-Fi, Horror..." 
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Cover Image</Label>
                  {imageUrl ? (
                    <div className="space-y-2">
                      <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border/50">
                        <img 
                          src={imageUrl} 
                          alt="Story cover" 
                          className="h-full w-full object-cover"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8"
                          onClick={() => setImageUrl("")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer relative">
                      <input
                        type="file"
                        accept="image/*"
                        id="image"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                      />
                      {uploadingImage ? (
                        <>
                          <Loader2 className="w-8 h-8 mx-auto mb-2 text-muted-foreground animate-spin" />
                          <p className="text-sm text-muted-foreground">Uploading...</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground mb-1">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG up to 5MB
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="desc">Description</Label>
                  <Textarea 
                    id="desc" 
                    placeholder="A brief summary of your story..." 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <Button 
                  className="w-full mt-4" 
                  onClick={handleManualCreate} 
                  disabled={loading || !title}
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create Story
                </Button>
              </TabsContent>
              
              <TabsContent value="ai" className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg mb-4 text-sm text-muted-foreground">
                  AI generation will create a full story structure with pages and choices based on your prompt.
                  This process may take a minute.
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prompt">Story Prompt</Label>
                  <Textarea 
                    id="prompt" 
                    placeholder="A detective investigating a murder in a cyberpunk city..." 
                    className="min-h-[100px]"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ai-theme">Theme</Label>
                    <Input 
                      id="ai-theme" 
                      value={aiTheme}
                      onChange={(e) => setAiTheme(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pages">Approx. Pages</Label>
                    <Input 
                      id="pages" 
                      type="number" 
                      min={3} 
                      max={20}
                      value={numPages}
                      onChange={(e) => setNumPages(parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <Button 
                  className="w-full mt-4" 
                  onClick={handleAiGenerate}
                  disabled={loading || !aiPrompt}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Story...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Generate Story
                    </>
                  )}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
