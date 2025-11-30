import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { ref, set } from 'firebase/database';
import { database } from '@/services/firebase';
import { useToast } from '@/hooks/use-toast';

const INTERESTS = [
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

const ACTIVITIES = [
    'Concerte',
    'Expoziții',
    'Workshop-uri',
    'Meetup-uri',
    'Evenimente sportive',
    'Festivaluri',
    'Conferințe',
    'Activități în natură',
];

const PROFILES = [
    { value: 'explorer', label: 'Explorator - îmi place să descopăr lucruri noi' },
    { value: 'social', label: 'Social - îmi place să cunosc oameni noi' },
    { value: 'creative', label: 'Creativ - caut inspirație și experiențe artistice' },
    { value: 'active', label: 'Activ - prefer activități fizice și energie' },
    { value: 'learner', label: 'Învățăcel - vreau să învăț lucruri noi' },
];

interface QuestionnaireModalProps {
    onClose?: () => void;
    onSuccess?: () => void;
    open?: boolean;
    isInitialSetup?: boolean;
}

export const QuestionnaireModal = ({
                                       onClose,
                                       onSuccess,
                                       open,
                                       isInitialSetup = false
                                   }: QuestionnaireModalProps) => {
    const { user, hasCompletedQuestionnaire, setHasCompletedQuestionnaire } = useAuth();
    const { toast } = useToast();
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
    const [selectedProfile, setSelectedProfile] = useState('');
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(false);

    const handleInterestToggle = (interest: string) => {
        setSelectedInterests((prev) =>
            prev.includes(interest)
                ? prev.filter((i) => i !== interest)
                : [...prev, interest]
        );
    };

    const handleActivityToggle = (activity: string) => {
        setSelectedActivities((prev) =>
            prev.includes(activity)
                ? prev.filter((a) => a !== activity)
                : [...prev, activity]
        );
    };

    const handleSubmit = async () => {
        if (!user) return;

        if (selectedInterests.length === 0 || selectedActivities.length === 0 || !selectedProfile || !location.trim()) {
            toast({
                title: 'Completează toate câmpurile',
                description: 'Te rugăm să completezi toate câmpurile obligatorii.',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);

        try {
            const profileData = {
                interests: selectedInterests,
                preferredActivities: selectedActivities,
                psychosocialProfile: selectedProfile,
                location: location.trim(),
                completedAt: new Date().toISOString(),
            };

            await set(ref(database, `users/${user.uid}/profile`), profileData);

            setHasCompletedQuestionnaire(true);

            toast({
                title: 'Profil salvat!',
                description: 'Vei primi recomandări personalizate bazate pe preferințele tale.',
            });

            onSuccess?.();
            onClose?.();
        } catch (error) {
            console.error('Error saving profile:', error);
            toast({
                title: 'Eroare',
                description: 'A apărut o eroare la salvarea profilului.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open !== undefined ? open : (!hasCompletedQuestionnaire && !!user)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
                <DialogHeader>
                    <DialogTitle className="text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Să te cunoaștem mai bine!
                    </DialogTitle>
                    <DialogDescription>
                        Răspunde la câteva întrebări pentru a primi recomandări personalizate.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="space-y-3">
                        <Label className="text-base font-semibold">Ce te interesează? *</Label>
                        <div className="grid grid-cols-2 gap-3">
                            {INTERESTS.map((interest) => (
                                <div key={interest} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={interest}
                                        checked={selectedInterests.includes(interest)}
                                        onCheckedChange={() => handleInterestToggle(interest)}
                                    />
                                    <label
                                        htmlFor={interest}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                        {interest}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-base font-semibold">Ce activități preferi? *</Label>
                        <div className="grid grid-cols-2 gap-3">
                            {ACTIVITIES.map((activity) => (
                                <div key={activity} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={activity}
                                        checked={selectedActivities.includes(activity)}
                                        onCheckedChange={() => handleActivityToggle(activity)}
                                    />
                                    <label
                                        htmlFor={activity}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                        {activity}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-base font-semibold">Cum te-ai descrie? *</Label>
                        <div className="space-y-2">
                            {PROFILES.map((profile) => (
                                <div key={profile.value} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={profile.value}
                                        checked={selectedProfile === profile.value}
                                        onCheckedChange={() => setSelectedProfile(profile.value)}
                                    />
                                    <label
                                        htmlFor={profile.value}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                        {profile.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label htmlFor="location" className="text-base font-semibold">
                            În ce oraș te afli? *
                        </Label>
                        <Input
                            id="location"
                            placeholder="ex: București, Cluj-Napoca"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="flex gap-2">
                    {!isInitialSetup && onClose && (
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                        >
                            Închide
                        </Button>
                    )}
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className={`${!isInitialSetup ? 'flex-1' : 'w-full'} bg-gradient-to-r from-primary to-secondary hover:opacity-90`}
                    >
                        {loading ? 'Se salvează...' : (isInitialSetup ? 'Salvează și continuă' : 'Salvează modificările')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};