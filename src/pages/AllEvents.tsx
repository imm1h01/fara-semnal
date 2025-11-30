import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, get } from 'firebase/database';
import { database } from '@/services/firebase';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { EventCard } from '@/components/EventCard';
import { Loader2, Search } from 'lucide-react';

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

const AllEvents = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [events, setEvents] = useState<Event[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

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

                eventsArray.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                setEvents(eventsArray);
                setFilteredEvents(eventsArray);
            } catch (error) {
                console.error('Error loading events:', error);
            } finally {
                setLoading(false);
            }
        };

        loadEvents();
    }, [user, navigate]);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredEvents(events);
            return;
        }

        const query = searchQuery.toLowerCase().trim();
        const filtered = events.filter(event => {
            const searchInTitle = event.title.toLowerCase().includes(query);
            const searchInCategory = event.category.toLowerCase().includes(query);
            const searchInLocation = event.location.toLowerCase().includes(query);
            const searchInTags = event.tags?.some(tag => tag.toLowerCase().includes(query)) || false;
            const searchInDescription = event.description.toLowerCase().includes(query);

            return searchInTitle || searchInCategory || searchInLocation || searchInTags || searchInDescription;
        });

        setFilteredEvents(filtered);
    }, [searchQuery, events]);

    if (!user) return null;

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Toate evenimentele
                    </h1>
                    <p className="text-muted-foreground">
                        Descoperă toate evenimentele din comunitate
                    </p>
                </div>

                <div className="mb-8">
                    <div className="relative max-w-2xl">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Caută după nume, categorie, locație, tag-uri..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : filteredEvents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredEvents.map((event) => (
                            <EventCard key={event.id} {...event} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-lg text-muted-foreground mb-4">
                            {searchQuery ? 'Nu s-au găsit evenimente care să corespundă căutării.' : 'Nu există evenimente disponibile încă.'}
                        </p>
                        <p className="text-muted-foreground">
                            {searchQuery ? 'Încearcă să cauți cu alți termeni.' : 'Fii primul care creează un eveniment!'}
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AllEvents;