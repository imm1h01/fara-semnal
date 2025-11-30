import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, get, remove, set, onValue, off } from 'firebase/database';
import { database } from '@/services/firebase';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Calendar, MapPin, Trash2, Edit, Heart, Users, Loader2 } from 'lucide-react';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

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

interface InterestedUsers {
    [key: string]: {
        name: string;
        email: string;
        timestamp: number;
    };
}

interface UserProfile {
    name: string;
    location: string;
    interests: string[];
    preferredActivities: string[];
    psychosocialProfile: string;
}

const EventDetails = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [interestedUsers, setInterestedUsers] = useState<InterestedUsers>({});
    const [isInterested, setIsInterested] = useState(false);
    const [updatingInterest, setUpdatingInterest] = useState(false);
    const [creatorProfile, setCreatorProfile] = useState<UserProfile | null>(null);
    const [showCreatorDialog, setShowCreatorDialog] = useState(false);
    const [creatorEvents, setCreatorEvents] = useState<Event[]>([]);
    const [creatorInterestedEvents, setCreatorInterestedEvents] = useState<Event[]>([]);
    const [loadingCreatorData, setLoadingCreatorData] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/auth');
            return;
        }

        if (!id) {
            navigate('/dashboard');
            return;
        }

        const loadEvent = async () => {
            try {
                const eventRef = ref(database, `events/${id}`);
                const eventSnapshot = await get(eventRef);

                if (eventSnapshot.exists()) {
                    const eventData = { id, ...eventSnapshot.val() };
                    setEvent(eventData);

                    if (eventData.creatorId !== user.uid) {
                        loadCreatorProfile(eventData.creatorId);
                    }
                } else {
                    toast({
                        title: 'Eveniment negăsit',
                        description: 'Acest eveniment nu mai există.',
                        variant: 'destructive',
                    });
                    navigate('/dashboard');
                }
            } catch (error) {
                console.error('Error loading event:', error);
                toast({
                    title: 'Eroare',
                    description: 'A apărut o eroare la încărcarea evenimentului.',
                    variant: 'destructive',
                });
            } finally {
                setLoading(false);
            }
        };

        loadEvent();
    }, [id, user, navigate, toast]);

    useEffect(() => {
        if (!id) return;

        const interestedUsersRef = ref(database, `events/${id}/interestedUsers`);

        const unsubscribe = onValue(interestedUsersRef, (snapshot) => {
            const usersData = snapshot.val() || {};
            setInterestedUsers(usersData);

            if (user) {
                setIsInterested(!!usersData[user.uid]);
            }
        });

        return () => off(interestedUsersRef, 'value', unsubscribe);
    }, [id, user]);

    const loadCreatorProfile = async (creatorId: string) => {
        try {
            const profileRef = ref(database, `users/${creatorId}/profile`);
            const profileSnapshot = await get(profileRef);

            if (profileSnapshot.exists()) {
                const profileData = profileSnapshot.val();
                const userRef = ref(database, `users/${creatorId}`);
                const userSnapshot = await get(userRef);
                const userData = userSnapshot.val();

                setCreatorProfile({
                    name: userData?.name || profileData.name || 'Utilizator',
                    location: profileData.location || '',
                    interests: profileData.interests || [],
                    preferredActivities: profileData.preferredActivities || [],
                    psychosocialProfile: profileData.psychosocialProfile || ''
                });
            } else {
                const userRef = ref(database, `users/${creatorId}`);
                const userSnapshot = await get(userRef);
                const userData = userSnapshot.val();

                if (userData) {
                    setCreatorProfile({
                        name: userData.name || 'Utilizator',
                        location: '',
                        interests: [],
                        preferredActivities: [],
                        psychosocialProfile: ''
                    });
                }
            }
        } catch (error) {
            console.error('Error loading creator profile:', error);
        }
    };

    const loadCreatorData = async (creatorId: string) => {
        if (!creatorId) return;

        setLoadingCreatorData(true);
        try {
            const eventsRef = ref(database, 'events');
            const eventsSnapshot = await get(eventsRef);
            const eventsData = eventsSnapshot.val() || {};

            const allEvents: Event[] = Object.entries(eventsData).map(([id, data]: [string, any]) => ({
                id,
                ...data,
            }));

            const createdEvents = allEvents.filter(event => event.creatorId === creatorId);
            setCreatorEvents(createdEvents);

            const interestedEventsPromises = allEvents.map(async (event) => {
                const interestedRef = ref(database, `events/${event.id}/interestedUsers/${creatorId}`);
                const interestedSnapshot = await get(interestedRef);
                return interestedSnapshot.exists() ? event : null;
            });

            const interestedEventsResults = await Promise.all(interestedEventsPromises);
            setCreatorInterestedEvents(interestedEventsResults.filter(Boolean) as Event[]);
        } catch (error) {
            console.error('Error loading creator data:', error);
            toast({
                title: 'Eroare',
                description: 'A apărut o eroare la încărcarea datelor creatorului.',
                variant: 'destructive',
            });
        } finally {
            setLoadingCreatorData(false);
        }
    };

    const handleToggleInterest = async () => {
        if (!user || !event) return;

        setUpdatingInterest(true);
        try {
            const userInterestRef = ref(database, `events/${event.id}/interestedUsers/${user.uid}`);

            if (isInterested) {
                await remove(userInterestRef);
                toast({
                    title: 'Interes eliminat',
                    description: 'Ai eliminat interesul pentru acest eveniment.',
                });
            } else {
                await set(userInterestRef, {
                    name: user.displayName || 'Utilizator',
                    email: user.email,
                    timestamp: Date.now(),
                });
                toast({
                    title: 'Interes adăugat',
                    description: 'Ai exprimat interes pentru acest eveniment!',
                });
            }
        } catch (error) {
            console.error('Error updating interest:', error);
            toast({
                title: 'Eroare',
                description: 'A apărut o eroare la actualizarea interesului.',
                variant: 'destructive',
            });
        } finally {
            setUpdatingInterest(false);
        }
    };

    const handleDelete = async () => {
        if (!event || !user) return;

        setDeleting(true);
        try {
            const eventRef = ref(database, `events/${event.id}`);
            await remove(eventRef);

            toast({
                title: 'Eveniment șters',
                description: 'Evenimentul a fost șters cu succes.',
            });

            navigate('/dashboard');
        } catch (error) {
            console.error('Error deleting event:', error);
            toast({
                title: 'Eroare',
                description: 'A apărut o eroare la ștergerea evenimentului.',
                variant: 'destructive',
            });
        } finally {
            setDeleting(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('ro-RO', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }).format(date);
    };

    const handleCreatorClick = () => {
        if (event && event.creatorId !== user?.uid) {
            loadCreatorData(event.creatorId);
            setShowCreatorDialog(true);
        }
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

    if (!event) return null;

    const isCreator = user.uid === event.creatorId;
    const interestedCount = Object.keys(interestedUsers).length;

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

                <Card className="max-w-4xl mx-auto overflow-hidden">
                    {event.imageUrl && (
                        <div className="relative h-96 w-full">
                            <img
                                src={event.imageUrl}
                                alt={event.title}
                                className="h-full w-full object-cover"
                            />
                        </div>
                    )}

                    <CardContent className="p-8">
                        <div className="mb-6">
                            <div className="flex items-start justify-between mb-4">
                                <h1 className="text-4xl font-bold text-foreground">{event.title}</h1>
                                <Badge variant="outline" className="text-lg px-4 py-1">
                                    {event.category}
                                </Badge>
                            </div>

                            {event.tags && event.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {event.tags.map((tag, index) => (
                                        <Badge key={index} variant="secondary">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            )}

                            <div className="flex flex-col gap-3 text-lg mb-6">
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <Calendar className="h-5 w-5" />
                                    <span>{formatDate(event.date)}</span>
                                </div>
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <MapPin className="h-5 w-5" />
                                    <span>{event.location}</span>
                                </div>
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <Users className="h-5 w-5" />
                                    <span>{interestedCount} persoane interesate</span>
                                </div>
                                {!isCreator && creatorProfile && (
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <span>Postat de </span>
                                        <button
                                            onClick={handleCreatorClick}
                                            className="text-primary hover:underline font-medium"
                                        >
                                            {creatorProfile.name}
                                        </button>
                                        {creatorProfile.location && (
                                            <>
                                                <span>•</span>
                                                <span>{creatorProfile.location}</span>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="prose prose-lg max-w-none mb-8">
                            <p className="text-foreground whitespace-pre-wrap">{event.description}</p>
                        </div>

                        <div className="flex gap-4 pt-6 border-t border-border flex-wrap">
                            {isCreator ? (
                                <>
                                    <Button
                                        variant="outline"
                                        className="gap-2"
                                        onClick={() => navigate(`/edit-event/${event.id}`)}
                                    >
                                        <Edit className="h-4 w-4" />
                                        Editare
                                    </Button>

                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="outline" className="gap-2">
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
                                                {Object.entries(interestedUsers).map(([userId, userData]) => (
                                                    <div key={userId} className="flex justify-between items-center py-2 border-b">
                                                        <div>
                                                            <p className="font-medium">{userData.name}</p>
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
                                            <Button variant="destructive" className="gap-2">
                                                <Trash2 className="h-4 w-4" />
                                                Șterge evenimentul
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
                                                    onClick={handleDelete}
                                                    disabled={deleting}
                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                >
                                                    {deleting ? 'Se șterge...' : 'Șterge'}
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </>
                            ) : (
                                <Button
                                    onClick={handleToggleInterest}
                                    disabled={updatingInterest}
                                    variant={isInterested ? "default" : "outline"}
                                    className="gap-2"
                                >
                                    {updatingInterest ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Heart className={`h-4 w-4 ${isInterested ? 'fill-current' : ''}`} />
                                    )}
                                    {isInterested ? 'Ești interesat' : 'Sunt interesat'}
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </main>

            <Dialog open={showCreatorDialog} onOpenChange={setShowCreatorDialog}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Profil utilizator</DialogTitle>
                        <DialogDescription>
                            Informații despre {creatorProfile?.name || 'utilizator'}
                        </DialogDescription>
                    </DialogHeader>

                    {loadingCreatorData ? (
                        <div className="flex justify-center items-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold mb-3 text-lg">Informații personale</h3>
                                        <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
                                            <div>
                                                <p className="font-medium text-sm text-muted-foreground">Nume</p>
                                                <p className="text-foreground">{creatorProfile?.name || 'Nespecificat'}</p>
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm text-muted-foreground">Locație</p>
                                                <p className="text-foreground">{creatorProfile?.location || 'Nespecificată'}</p>
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm text-muted-foreground">Profil psihosocial</p>
                                                <p className="text-foreground">{creatorProfile?.psychosocialProfile || 'Nespecificat'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold mb-3 text-lg">Activități preferate</h3>
                                        {creatorProfile?.preferredActivities && creatorProfile.preferredActivities.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {creatorProfile.preferredActivities.map((activity, index) => (
                                                    <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                        {activity}
                                                    </Badge>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-muted-foreground text-sm">Nu sunt specificate activități preferate</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-3 text-lg">Interese</h3>
                                    {creatorProfile?.interests && creatorProfile.interests.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {creatorProfile.interests.map((interest, index) => (
                                                <Badge key={index} variant="secondary" className="text-sm">
                                                    {interest}
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground">Nu sunt specificate interese</p>
                                    )}
                                </div>
                            </div>

                            <div className="border-t pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="font-semibold mb-3 text-lg">Evenimente create ({creatorEvents.length})</h3>
                                        {creatorEvents.length > 0 ? (
                                            <div className="space-y-3 max-h-60 overflow-y-auto">
                                                {creatorEvents.map((event) => (
                                                    <div key={event.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                                        <p className="font-medium text-foreground">{event.title}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge variant="outline" className="text-xs">
                                                                {event.category}
                                                            </Badge>
                                                            <span className="text-xs text-muted-foreground">
                                                                {new Date(event.date).toLocaleDateString('ro-RO')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-muted-foreground text-sm">Nu a creat niciun eveniment</p>
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="font-semibold mb-3 text-lg">Evenimente interesante ({creatorInterestedEvents.length})</h3>
                                        {creatorInterestedEvents.length > 0 ? (
                                            <div className="space-y-3 max-h-60 overflow-y-auto">
                                                {creatorInterestedEvents.map((event) => (
                                                    <div key={event.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                                        <p className="font-medium text-foreground">{event.title}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge variant="outline" className="text-xs">
                                                                {event.category}
                                                            </Badge>
                                                            <span className="text-xs text-muted-foreground">
                                                                {new Date(event.date).toLocaleDateString('ro-RO')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-muted-foreground text-sm">Nu este interesat de niciun eveniment</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default EventDetails;