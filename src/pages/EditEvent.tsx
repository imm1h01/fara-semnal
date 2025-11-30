import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ref, get, update } from 'firebase/database';
import { database } from '@/services/firebase';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';

const CATEGORIES = [
    'Muzică',
    'Artă',
    'Sport',
    'Tech',
    'Food & Drinks',
    'Outdoor',
    'Wellness',
    'Educație',
    'Networking',
    'Charity',
];

interface EventData {
    title: string;
    description: string;
    category: string;
    date: string;
    location: string;
    imageUrl: string;
    tags: string[];
    creatorId: string;
}

const EditEvent = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [eventLoading, setEventLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        date: '',
        location: '',
        imageUrl: '',
        tags: '',
    });

    useEffect(() => {
        if (!user) {
            navigate('/auth');
            return;
        }

        if (!id) {
            toast({
                title: 'Eroare',
                description: 'ID-ul evenimentului lipsește.',
                variant: 'destructive',
            });
            navigate('/profile');
            return;
        }

        loadEvent();
    }, [user, navigate, id, toast]);

    const loadEvent = async () => {
        try {
            setEventLoading(true);
            const eventRef = ref(database, `events/${id}`);
            const eventSnapshot = await get(eventRef);

            if (!eventSnapshot.exists()) {
                toast({
                    title: 'Eveniment negăsit',
                    description: 'Acest eveniment nu mai există.',
                    variant: 'destructive',
                });
                navigate('/profile');
                return;
            }

            const eventData: EventData = eventSnapshot.val();

            if (eventData.creatorId !== user!.uid) {
                toast({
                    title: 'Nu ai permisiune',
                    description: 'Poți edita doar evenimentele create de tine.',
                    variant: 'destructive',
                });
                navigate('/profile');
                return;
            }

            setFormData({
                title: eventData.title || '',
                description: eventData.description || '',
                category: eventData.category || '',
                date: eventData.date || '',
                location: eventData.location || '',
                imageUrl: eventData.imageUrl || '',
                tags: eventData.tags ? eventData.tags.join(', ') : '',
            });
        } catch (error) {
            console.error('Error loading event:', error);
            toast({
                title: 'Eroare',
                description: 'A apărut o eroare la încărcarea evenimentului.',
                variant: 'destructive',
            });
            navigate('/profile');
        } finally {
            setEventLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.description || !formData.category || !formData.date || !formData.location) {
            toast({
                title: 'Completează toate câmpurile obligatorii',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);

        try {
            const tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);

            await update(ref(database, `events/${id}`), {
                title: formData.title,
                description: formData.description,
                category: formData.category,
                date: formData.date,
                location: formData.location,
                imageUrl: formData.imageUrl,
                tags: tags,
                updatedAt: new Date().toISOString(),
            });

            toast({
                title: 'Eveniment actualizat!',
                description: 'Evenimentul a fost actualizat cu succes.',
            });

            navigate('/profile');
        } catch (error) {
            console.error('Error updating event:', error);
            toast({
                title: 'Eroare',
                description: 'A apărut o eroare la actualizarea evenimentului.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    if (!user) return null;

    if (eventLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="container mx-auto px-4 py-8">
                <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="mb-6"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Înapoi
                </Button>

                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle className="text-3xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            Editează evenimentul
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Titlu *</Label>
                                <Input
                                    id="title"
                                    placeholder="Concert în parc, Workshop de fotografie..."
                                    value={formData.title}
                                    onChange={(e) => handleChange('title', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Descriere *</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Descrie evenimentul tău..."
                                    value={formData.description}
                                    onChange={(e) => handleChange('description', e.target.value)}
                                    rows={4}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Categorie *</Label>
                                <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selectează o categorie" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIES.map((cat) => (
                                            <SelectItem key={cat} value={cat}>
                                                {cat}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="date">Data *</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => handleChange('date', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="location">Locație *</Label>
                                <Input
                                    id="location"
                                    placeholder="București, Parcul Herăstrău"
                                    value={formData.location}
                                    onChange={(e) => handleChange('location', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="imageUrl">Link imagine (opțional)</Label>
                                <Input
                                    id="imageUrl"
                                    type="url"
                                    placeholder="https://example.com/image.jpg"
                                    value={formData.imageUrl}
                                    onChange={(e) => handleChange('imageUrl', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tags">Tag-uri (opțional, separate prin virgulă)</Label>
                                <Input
                                    id="tags"
                                    placeholder="live, outdoor, gratuit"
                                    value={formData.tags}
                                    onChange={(e) => handleChange('tags', e.target.value)}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                                disabled={loading}
                            >
                                {loading ? 'Se actualizează...' : 'Actualizează evenimentul'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};

export default EditEvent;