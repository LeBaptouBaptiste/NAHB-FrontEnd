import { Star, Eye } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface StoryCardProps {
  id: string;
  title: string;
  description: string;
  tags: string[];
  rating: number;
  plays: number;
  author?: string;
  imageUrl?: string;
  onClick?: () => void;
}

export function StoryCard({
  title,
  description,
  tags,
  rating,
  plays,
  author,
  imageUrl,
  onClick
}: StoryCardProps) {
  return (
    <Card
      className="overflow-hidden border-border/50 glow-hover cursor-pointer group bg-card/50 backdrop-blur-sm"
      onClick={onClick}
    >
      <div className="aspect-video w-full bg-muted relative overflow-hidden">
        {imageUrl ? (
          <ImageWithFallback
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center">
            <span className="text-4xl opacity-50">📖</span>
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-1">
          {tags.slice(0, 2).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="bg-emerald-950/90 dark:bg-emerald-900/90 text-emerald-50 backdrop-blur-sm text-xs border border-emerald-500/30"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <CardHeader className="pb-3">
        <h3 className="line-clamp-1 font-semibold">{title}</h3>
        {author && (
          <p className="text-sm text-muted-foreground">by {author}</p>
        )}
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-3 border-t border-border/50">
        <div className="flex items-center gap-1 text-sm font-medium">
          <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
          <span>{rating > 0 ? rating.toFixed(1) : 'New'}</span>
        </div>

        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Eye className="w-4 h-4" />
          <span>{plays.toLocaleString()}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
