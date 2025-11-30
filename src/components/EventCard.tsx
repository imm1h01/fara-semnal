import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EventCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  location: string;
  imageUrl?: string;
  creatorId: string;
  relevanceScore?: number;
}

export const EventCard = ({
  id,
  title,
  description,
  category,
  date,
  location,
  imageUrl,
  relevanceScore,
}: EventCardProps) => {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ro-RO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer bg-gradient-to-br from-card to-muted/20" onClick={() => navigate(`/event/${id}`)}>
      {imageUrl && (
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform group-hover:scale-110"
          />
          {relevanceScore !== undefined && relevanceScore > 5 && (
            <Badge className="absolute top-3 right-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground">
              Recomandat
            </Badge>
          )}
        </div>
      )}
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-xl font-bold text-foreground line-clamp-2">{title}</h3>
          <Badge variant="outline" className="shrink-0">
            {category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-muted-foreground line-clamp-2">{description}</p>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(date)}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{location}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/event/${id}`);
          }}
        >
          Vezi detalii
        </Button>
      </CardFooter>
    </Card>
  );
};
