import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, get } from 'firebase/database';
import { database } from '@/services/firebase';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { EventCard } from '@/components/EventCard';
import { QuestionnaireModal } from '@/components/QuestionnaireModal';
import { Loader2 } from 'lucide-react';

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

const Dashboard = () => {
    const { user, hasCompletedQuestionnaire } = useAuth();
    const navigate = useNavigate();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [showQuestionnaire, setShowQuestionnaire] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/auth');
            return;
        }

        const loadEvents = async () => {
            try {
                const eventsRef = ref(database, 'events');
                const eventsSnapshot = await get(eventsRef);
                const eventsData = eventsSnapshot.val() || {};

                const eventsArray: Event[] = Object.entries(eventsData).map(([id, data]: [string, any]) => ({
                    id,
                    ...data,
                }));

                if (hasCompletedQuestionnaire) {
                    const profileRef = ref(database, `users/${user.uid}/profile`);
                    const profileSnapshot = await get(profileRef);
                    const profile = profileSnapshot.val();

                    if (profile && profile.location && profile.interests) {
                        const userLocation = profile.location.toLowerCase();
                        const userInterests = profile.interests.map((interest: string) => interest.toLowerCase());

                        const filteredEvents = eventsArray
                            .filter(event =>
                                event.location.toLowerCase().includes(userLocation) &&
                                userInterests.some((interest: string) =>
                                    event.category.toLowerCase().includes(interest) ||
                                    event.tags?.some(tag => tag.toLowerCase().includes(interest))
                                )
                            )
                            .slice(0, 6);

                        setEvents(filteredEvents);
                    } else {
                        setEvents([]);
                    }
                } else {
                    setEvents([]);
                    setShowQuestionnaire(true);
                }
            } catch (error) {
                console.error('Error loading events:', error);
                setEvents([]);
            } finally {
                setLoading(false);
            }
        };

        loadEvents();
    }, [user, navigate, hasCompletedQuestionnaire]);

    if (!user) return null;

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            {showQuestionnaire && (
                <QuestionnaireModal
                    isInitialSetup={true}
                    onSuccess={() => setShowQuestionnaire(false)}
                />
            )}

            <main className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Pentru tine
                    </h1>
                    <p className="text-muted-foreground">
                        {hasCompletedQuestionnaire
                            ? 'Evenimente recomandate bazate pe preferințele tale'
                            : 'Completează chestionarul pentru recomandări personalizate'}
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : events.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map((event) => (
                            <EventCard key={event.id} {...event} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-lg text-muted-foreground mb-4">
                            {hasCompletedQuestionnaire
                                ? 'Nu există evenimente care să se potrivească cu preferințele tale în locația ta.'
                                : 'Completează chestionarul pentru a vedea evenimente personalizate.'}
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;