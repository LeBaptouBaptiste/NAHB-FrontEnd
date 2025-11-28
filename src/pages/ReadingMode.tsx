import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/atoms/button";
import { Card } from "../components/atoms/card";
import { ArrowLeft, BookOpen } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Badge } from "../components/atoms/badge";

interface Page {
	id: number;
	text: string;
	imageUrl?: string;
	isEnding?: boolean;
	endingLabel?: string;
	choices: { text: string; nextPage: number }[];
}

const storyPages: { [key: number]: Page } = {
	1: {
		id: 1,
		text: "You stand at the edge of the Forgotten Realm, a mystical land shrouded in ancient magic. The air crackles with energy, and before you lie two paths: one leading into a dark, enchanted forest, and the other toward a towering castle on a distant hill. Both paths hold secrets and dangers unknown.",
		imageUrl:
			"https://images.unsplash.com/photo-1534447677768-be436bb09401?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW50YXN5JTIwbGFuZHNjYXBlfGVufDF8fHx8MTc2Mzk5NjkzMXww&ixlib=rb-4.1.0&q=80&w=1080",
		choices: [
			{ text: "Enter the enchanted forest", nextPage: 2 },
			{ text: "Journey toward the castle", nextPage: 3 },
		],
	},
	2: {
		id: 2,
		text: "The forest is alive with whispers and shadows. Ancient trees tower above you, their branches forming a canopy that blocks out most of the light. You hear the sound of running water nearby and see a faint glow deeper in the woods.",
		imageUrl:
			"https://images.unsplash.com/photo-1641657381836-ff76cd128d37?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxteXN0ZXJ5JTIwZm9yZXN0fGVufDF8fHx8MTc2Mzk5NjkzMnww&ixlib=rb-4.1.0&q=80&w=1080",
		choices: [
			{ text: "Follow the sound of water", nextPage: 4 },
			{ text: "Investigate the mysterious glow", nextPage: 5 },
		],
	},
	3: {
		id: 3,
		text: "As you approach the castle, you notice it's far more imposing than it appeared from a distance. Dark clouds gather overhead, and you hear the distant roar of something large and powerful. The castle gates are open, almost invitingly so.",
		imageUrl:
			"https://images.unsplash.com/photo-1485465053475-dd55ed3894b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpZXZhbCUyMGNhc3RsZXxlbnwxfHx8fDE3NjM5NTY2OTV8MA&ixlib=rb-4.1.0&q=80&w=1080",
		choices: [
			{ text: "Enter through the main gates", nextPage: 6 },
			{ text: "Search for another entrance", nextPage: 7 },
		],
	},
	4: {
		id: 4,
		text: "You discover a crystal-clear stream flowing through the forest. As you kneel to drink, you notice your reflection shimmer and change, showing you a vision of possible futures. A ethereal voice speaks: 'The path of wisdom leads to eternal peace.' You feel a surge of magical energy coursing through you.",
		isEnding: true,
		endingLabel: "Peaceful Resolution",
		choices: [],
	},
	5: {
		id: 5,
		text: "The glow leads you to an ancient shrine where a powerful artifact rests on a pedestal. As you reach for it, dark shadows materialize around you. You must choose between claiming the artifact's power for yourself or destroying it to prevent it from falling into evil hands.",
		choices: [
			{ text: "Claim the artifact's power", nextPage: 8 },
			{ text: "Destroy the artifact", nextPage: 9 },
		],
	},
	6: {
		id: 6,
		text: "You enter the grand hall of the castle and are immediately confronted by a massive dragon. Its eyes glow with intelligence, and to your surprise, it speaks: 'Many have sought to slay me, but you... you are different. Join me, and together we could rule this realm.'",
		choices: [
			{ text: "Accept the dragon's alliance", nextPage: 10 },
			{ text: "Refuse and prepare for battle", nextPage: 11 },
		],
	},
	7: {
		id: 7,
		text: "You find a hidden passage that leads deep beneath the castle. In the darkness, you discover ancient magical texts and learn powerful spells that have been lost for centuries. Through study and dedication, you master these arcane arts and become a legendary mage.",
		isEnding: true,
		endingLabel: "True Mage",
		choices: [],
	},
	8: {
		id: 8,
		text: "The artifact's dark power corrupts you, turning you into a force of destruction. You become the very evil you once sought to prevent, ruling over the Forgotten Realm with an iron fist. Power has its price.",
		isEnding: true,
		endingLabel: "Dark Alliance",
		choices: [],
	},
	9: {
		id: 9,
		text: "Destroying the artifact releases a wave of purifying energy across the realm. Dark forces are banished, and you are hailed as a hero by all who inhabit this land. Your selfless act has saved countless lives and restored balance to the world.",
		isEnding: true,
		endingLabel: "Heroic Victory",
		choices: [],
	},
	10: {
		id: 10,
		text: "You and the dragon form an unprecedented alliance. Together, you bring order to the chaotic realm, ruling with wisdom and strength. The bond between human and dragon becomes the stuff of legends.",
		isEnding: true,
		endingLabel: "Dragon Rider",
		choices: [],
	},
	11: {
		id: 11,
		text: "The battle is fierce and devastating. Though you ultimately defeat the dragon, you realize too late that it was the guardian protecting the realm from an even greater evil. In its absence, darkness floods the land.",
		isEnding: true,
		endingLabel: "Pyrrhic Victory",
		choices: [],
	},
};

export function ReadingMode() {
	const navigate = useNavigate();
	const { id } = useParams();
	const [currentPageId, setCurrentPageId] = useState(1);
	const [pathHistory, setPathHistory] = useState<number[]>([1]);

	const currentPage = storyPages[currentPageId];

	const handleChoice = (nextPage: number) => {
		setCurrentPageId(nextPage);
		setPathHistory((prev) => [...prev, nextPage]);
	};

  const handleEndingComplete = () => {
    navigate(`/story/${id}/ending`, {
      state: {
        ending: currentPage.endingLabel,
        path: pathHistory
      }
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border/50 px-6 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/story/${id}`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Exit Story
          </Button>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="w-4 h-4" />
            <span>Page {pathHistory.length}</span>
          </div>
        </div>
      </div>

      {/* Main Reading Area */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl">
          <Card className="overflow-hidden">
            {currentPage.imageUrl && (
              <div className="aspect-video w-full bg-muted relative overflow-hidden">
                <ImageWithFallback
                  src={currentPage.imageUrl}
                  alt="Story illustration"
                  className="w-full h-full object-cover"
                />
                {currentPage.isEnding && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-gradient-to-r from-primary to-secondary text-white border-0">
                      {currentPage.endingLabel}
                    </Badge>
                  </div>
                )}
              </div>
            )}

            <div className="p-8 md:p-12">
              {/* Story Text */}
              <div className="prose prose-invert max-w-none mb-8">
                <p className="text-lg leading-relaxed">
                  {currentPage.text}
                </p>
              </div>

              {/* Choices or Ending */}
              {currentPage.isEnding ? (
                <div className="space-y-4">
                  <div className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/30 text-center">
                    <h3 className="mb-2">You've reached an ending!</h3>
                    <p className="text-muted-foreground">
                      Congratulations on completing this path through the story.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setCurrentPageId(1);
                        setPathHistory([1]);
                      }}
                    >
                      Replay Story
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handleEndingComplete}
                    >
                      View Results
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground mb-4">What do you do?</p>
                  {currentPage.choices.map((choice, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start h-auto py-4 px-6 hover:bg-primary/10 hover:border-primary/50 transition-all"
                      onClick={() => handleChoice(choice.nextPage)}
                    >
                      <span className="text-left">{choice.text}</span>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </Card>

					{/* Path Breadcrumb */}
					<div className="mt-6 flex items-center justify-center gap-2">
						{pathHistory.map((_pageId, index) => (
							<div
								key={index}
								className="flex items-center gap-2"
							>
								<div className="w-2 h-2 rounded-full bg-primary" />
								{index < pathHistory.length - 1 && (
									<div className="w-8 h-px bg-border" />
								)}
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
