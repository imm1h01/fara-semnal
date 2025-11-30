import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, get, remove } from 'firebase/database';
import { database } from '@/services/firebase';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Heart, Users, Calendar, MapPin, Edit, Trash2 } from 'lucide-react';
import { QuestionnaireModal } from '@/components/QuestionnaireModal';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Event {
    id: string;
    title: string;
    description: string;
    category: string;
    date: string;
    location: string;
    imageUrl?: string;
    creatorId: string;
    tags?: string[];
}

interface InterestedUser {
    name: string;
    email: string;
    timestamp: number;
}

interface UserData {
    name: string;
    email: string;
    profile?: {
        interests: string[];
        preferredActivities: string[];
        psychosocialProfile: string;
        location: string;
        completedAt: string;
    };
}

const Profile = () => {
    const { user, hasCompletedQuestionnaire, setHasCompletedQuestionnaire } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [showQuestionnaire, setShowQuestionnaire] = useState(false);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [interestedEvents, setInterestedEvents] = useState<Event[]>([]);
    const [createdEvents, setCreatedEvents] = useState<Event[]>([]);
    const [interestedUsers, setInterestedUsers] = useState<{ [eventId: string]: { [userId: string]: InterestedUser } }>({});

    useEffect(() => {
        if (!user) {
            navigate('/auth');
            return;
        }

        loadProfileData();
    }, [user, navigate]);

    const loadProfileData = async () => {
        try {
            setLoading(true);

            const userRef = ref(database, `users/${user!.uid}`);
            const userSnapshot = await get(userRef);

            if (userSnapshot.exists()) {
                setUserData(userSnapshot.val());
            }

            const eventsRef = ref(database, 'events');
            const eventsSnapshot = await get(eventsRef);
            const eventsData = eventsSnapshot.val() || {};

            const eventsArray: Event[] = Object.entries(eventsData).map(([id, data]: [string, any]) => ({
                id,
                ...data,
            }));

            const userCreatedEvents = eventsArray.filter(event => event.creatorId === user!.uid);
            setCreatedEvents(userCreatedEvents);

            const userInterestedEvents = await Promise.all(
                eventsArray.map(async (event) => {
                    const interestedRef = ref(database, `events/${event.id}/interestedUsers/${user!.uid}`);
                    const interestedSnapshot = await get(interestedRef);
                    return interestedSnapshot.exists() ? event : null;
                })
            );

            setInterestedEvents(userInterestedEvents.filter(Boolean) as Event[]);

            const usersData: { [eventId: string]: { [userId: string]: InterestedUser } } = {};
            for (const event of userCreatedEvents) {
                const interestedUsersRef = ref(database, `events/${event.id}/interestedUsers`);
                const interestedUsersSnapshot = await get(interestedUsersRef);
                usersData[event.id] = interestedUsersSnapshot.val() || {};
            }
            setInterestedUsers(usersData);

        } catch (error) {
            console.error('Error loading profile data:', error);
            toast({
                title: 'Eroare',
                description: 'A apărut o eroare la încărcarea datelor profilului.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteEvent = async (eventId: string) => {
        try {
            await remove(ref(database, `events/${eventId}`));
            toast({
                title: 'Eveniment șters',
                description: 'Evenimentul a fost șters cu succes.',
            });
            loadProfileData();
        } catch (error) {
            console.error('Error deleting event:', error);
            toast({
                title: 'Eroare',
                description: 'A apărut o eroare la ștergerea evenimentului.',
                variant: 'destructive',
            });
        }
    };

    const handleRemoveInterest = async (eventId: string) => {
        try {
            await remove(ref(database, `events/${eventId}/interestedUsers/${user!.uid}`));
            toast({
                title: 'Interes eliminat',
                description: 'Ai eliminat interesul pentru acest eveniment.',
            });
            loadProfileData();
        } catch (error) {
            console.error('Error removing interest:', error);
            toast({
                title: 'Eroare',
                description: 'A apărut o eroare la eliminarea interesului.',
                variant: 'destructive',
            });
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('ro-RO', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }).format(date);
    };

    if (!user) return null;

    if (loading) {
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
            <QuestionnaireModal
                open={showQuestionnaire}
                onClose={() => setShowQuestionnaire(false)}
                onSuccess={() => {
                    setHasCompletedQuestionnaire(true);
                    loadProfileData();
                }}
                isInitialSetup={false}
            />

            <main className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Profilul meu
                    </h1>
                    <p className="text-muted-foreground">
                        Gestionează-ți datele personale și evenimentele
                    </p>
                </div>

                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Informații personale</CardTitle>
                        <CardDescription>
                            Datele tale de profil și preferințe
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Nume</label>
                            <p className="text-lg">{userData?.name || user.displayName || 'Nesetat'}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Email</label>
                            <p className="text-lg">{userData?.email || user.email}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Locație</label>
                            <p className="text-lg">{userData?.profile?.location || 'Nesetat'}</p>
                        </div>
                        <Button
                            onClick={() => setShowQuestionnaire(true)}
                            variant="outline"
                        >
                            {hasCompletedQuestionnaire ? 'Completează din nou chestionarul' : 'Completează chestionarul'}
                        </Button>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Heart className="h-5 w-5" />
                                Evenimente interesante
                            </CardTitle>
                            <CardDescription>
                                Evenimente la care ai exprimat interes
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {interestedEvents.length > 0 ? (
                                <div className="space-y-4">
                                    {interestedEvents.map((event) => (
                                        <div
                                            key={event.id}
                                            className="border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer group"
                                            onClick={() => navigate(`/event/${event.id}`)}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-semibold">{event.title}</h3>
                                                <Badge variant="outline">{event.category}</Badge>
                                            </div>
                                            <div className="space-y-1 text-sm text-muted-foreground mb-3">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4" />
                                                    {formatDate(event.date)}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4" />
                                                    {event.location}
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveInterest(event.id);
                                                }}
                                                className="w-full hover:bg-primary hover:text-primary-foreground transition-colors"
                                            >
                                                Elimină interes
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-center py-4">
                                    Nu ai exprimat interes pentru niciun eveniment încă.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Evenimentele mele
                            </CardTitle>
                            <CardDescription>
                                Evenimente create de tine
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {createdEvents.length > 0 ? (
                                <div className="space-y-4">
                                    {createdEvents.map((event) => {
                                        const eventInterestedUsers = interestedUsers[event.id] || {};
                                        const interestedCount = Object.keys(eventInterestedUsers).length;

                                        return (
                                            <div
                                                key={event.id}
                                                className="border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                                                onClick={() => navigate(`/event/${event.id}`)}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="font-semibold">{event.title}</h3>
                                                    <Badge variant="outline">{event.category}</Badge>
                                                </div>
                                                <div className="space-y-1 text-sm text-muted-foreground mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4" />
                                                        {formatDate(event.date)}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="h-4 w-4" />
                                                        {event.location}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Heart className="h-4 w-4" />
                                                        {interestedCount} persoane interesate
                                                    </div>
                                                </div>
                                                <div
                                                    className="flex gap-2 flex-wrap"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="gap-1"
                                                        onClick={() => navigate(`/edit-event/${event.id}`)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                        Editare
                                                    </Button>

                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="outline" size="sm" className="gap-1">
                                                                <Users className="h-4 w-4" />
                                                                Interesați ({interestedCount})
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Persoane interesate</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    {interestedCount} persoane s-au arătat interesate de evenimentul tău "{event.title}".
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <div className="max-h-60 overflow-y-auto">
                                                                {Object.entries(eventInterestedUsers).map(([userId, userData]) => (
                                                                    <div key={userId} className="flex justify-between items-center py-2 border-b">
                                                                        <div>
                                                                            <p className="font-medium">{userData.name}</p>
                                                                            <p className="text-sm text-muted-foreground">{userData.email}</p>
                                                                        </div>
                                                                        <Badge variant="secondary">
                                                                            {new Date(userData.timestamp).toLocaleDateString('ro-RO')}
                                                                        </Badge>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Închide</AlertDialogCancel>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>

                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="destructive" size="sm" className="gap-1">
                                                                <Trash2 className="h-4 w-4" />
                                                                Șterge
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Ești sigur?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Această acțiune nu poate fi anulată. Evenimentul va fi șters permanent.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Anulează</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleDeleteEvent(event.id)}
                                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                >
                                                                    Șterge
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-muted-foreground mb-4">
                                        Nu ai creat niciun eveniment încă.
                                    </p>
                                    <Button onClick={() => navigate('/create-event')}>
                                        Creează primul eveniment
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
};

export default Profile;