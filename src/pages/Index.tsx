import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Sparkles, Calendar, Users, Zap, X } from 'lucide-react';

const Index = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const openPopup = () => {
        setIsPopupOpen(true);
    };

    const closePopup = () => {
        setIsPopupOpen(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
            {/* Hero Section */}
            <div className="container mx-auto px-4 py-16">
                <div className="text-center mb-16">
                    <div className="flex justify-center mb-8 animate-fade-in">
                        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-secondary shadow-2xl">
                            <Sparkles className="h-12 w-12 text-primary-foreground" />
                        </div>
                    </div>

                    <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent animate-slide-up">
                        Fără semnal
                    </h1>

                    <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-slide-up">
                        Descoperă evenimente locale și conectează-te cu comunitatea ta.
                        Recomandări personalizate bazate pe preferințele tale.
                    </p>

                    <div className="flex gap-4 justify-center animate-slide-up">
                        <Button
                            size="lg"
                            onClick={() => navigate('/auth')}
                            className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-lg px-8 py-6"
                        >
                            Începe acum
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            onClick={openPopup}
                            className="text-lg px-8 py-6"
                        >
                            Află mai multe
                        </Button>
                    </div>
                </div>

                {/* Features */}
                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-20">
                    <div className="text-center p-6 rounded-2xl bg-card/50 backdrop-blur border border-border hover:shadow-lg transition-all">
                        <div className="flex justify-center mb-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20">
                                <Calendar className="h-8 w-8 text-primary" />
                            </div>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Evenimente locale</h3>
                        <p className="text-muted-foreground">
                            Descoperă ce se întâmplă în comunitatea ta și nu rata niciun eveniment
                        </p>
                    </div>

                    <div className="text-center p-6 rounded-2xl bg-card/50 backdrop-blur border border-border hover:shadow-lg transition-all">
                        <div className="flex justify-center mb-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20">
                                <Zap className="h-8 w-8 text-secondary" />
                            </div>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Recomandări AI</h3>
                        <p className="text-muted-foreground">
                            Algoritmul nostru învață preferințele tale și îți sugerează evenimente perfecte
                        </p>
                    </div>

                    <div className="text-center p-6 rounded-2xl bg-card/50 backdrop-blur border border-border hover:shadow-lg transition-all">
                        <div className="flex justify-center mb-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20">
                                <Users className="h-8 w-8 text-accent" />
                            </div>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Comunitate</h3>
                        <p className="text-muted-foreground">
                            Creează și împărtășește evenimente cu oameni care au aceleași pasiuni
                        </p>
                    </div>
                </div>
            </div>

            {/* Popup Modal */}
            {isPopupOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-background rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-foreground">Despre proiectul Fără semnal</h2>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={closePopup}
                                className="h-8 w-8 rounded-full"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="p-6 space-y-4 text-foreground">
                            <p>
                                <strong>Fără semnal</strong> este un proiect-pilot inovator dedicat reconectării tinerilor la viața reală și comunitară, într-un context în care dependența digitală și singurătatea devin provocări majore ale generației actuale. Pornind de la rezultatele unui studiu aplicat adolescenților, proiectul propune o abordare complexă: educație emoțională, activități extrașcolare, voluntariat și o platformă digitală inteligentă care transformă tehnologia într-un sprijin real pentru echilibrul personal.
                            </p>

                            <p>
                                Prin activități practice, provocări offline, ateliere, implicare civică și o disciplină opțională dedicată psihologiei conexiunii umane, proiectul urmărește să reducă izolarea socială, să îmbunătățească relațiile dintre elevi și să readucă sentimentul de apartenență în comunitate. <strong>Fără semnal</strong> oferă tinerilor instrumente pentru autocunoaștere, colaborare și echilibru digital, contribuind la dezvoltarea unei generații mai conectate, mai conștiente și mai implicate.
                            </p>

                            <p>
                                Platforma digitală cu AI este inima tehnologică a proiectului <strong>Fără semnal</strong>, concepută pentru a transforma utilizarea tehnologiei dintr-o sursă de dependență într-un instrument de reconectare socială. La înscriere, fiecare utilizator completează un scurt chestionar psihosocial, iar algoritmul de inteligență artificială generează un profil personalizat și recomandări adaptate nevoilor sale emoționale, sociale și educaționale.
                            </p>

                            <p>
                                Aplicația oferă sugestii pentru activități sportive, culturale, recreative sau de voluntariat, un calendar comunitar actualizat de școli și ONG-uri, precum și misiuni de detox digital, menite să sprijine un stil de vieță echilibrat. Tinerii își pot urmări progresul, pot bifa activitățile la care participă și pot descoperi oportunități prin care să se implice activ în comunitate.
                            </p>

                            <p>
                                Platforma este lansată inițial ca proiect-pilot în cadrul <em>Școala Altfel</em> / <em>Școala Verde</em>, urmând să fie extinsă la nivel local, național și apoi european. Este o soluție modernă, accesibilă și prietenoasă, creată pentru a ghida adolescenții spre activități semnificative din lumea reală și pentru a contribui la reducerea dependenței digitale.
                            </p>
                        </div>

                        <div className="sticky bottom-0 bg-background border-t border-border px-6 py-4 flex justify-end">
                            <Button onClick={closePopup} className="px-6">
                                Închide
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Index;