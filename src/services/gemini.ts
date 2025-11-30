import { ref, get } from 'firebase/database';
import { database } from './firebase';

interface UserProfile {
  interests: string[];
  preferredActivities: string[];
  psychosocialProfile: string;
  location?: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  location: string;
  tags?: string[];
}

/**
 * Generează recomandări personalizate folosind Gemini API
 * Trimite contextul utilizatorului și primește categorii/tags relevante
 */
export const getPersonalizedRecommendations = async (
  userId: string,
  userProfile: UserProfile
): Promise<string[]> => {
  try {
    const apiKey = process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('Gemini API key not configured');
      return userProfile.interests || [];
    }

    // Obținem istoricul interacțiunilor utilizatorului
    const interactionsRef = ref(database, `users/${userId}/interactions`);
    const interactionsSnapshot = await get(interactionsRef);
    const interactions = interactionsSnapshot.val() || {};

    const prompt = `Ești un asistent AI pentru o aplicație comunitară românească numită "Fără semnal".
    
Profil utilizator:
- Interese: ${userProfile.interests.join(', ')}
- Activități preferate: ${userProfile.preferredActivities.join(', ')}
- Profil psihosocial: ${userProfile.psychosocialProfile}
- Locație: ${userProfile.location || 'nedefinită'}

Istoric interacțiuni recente:
${JSON.stringify(interactions, null, 2)}

Te rog să generezi o listă de 2-3 categorii sau tag-uri de evenimente care ar fi cele mai relevante pentru acest utilizator.
Răspunde DOAR cu o listă de cuvinte cheie separate prin virgulă, fără alte explicații.

Exemple de categorii: muzică live, artă, sport, tech, food, outdoor, workshop, networking, charity, wellness`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get recommendations from Gemini');
    }

    const data = await response.json();
    const recommendationsText =
      data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Parse răspunsul și extrage tag-urile
    const recommendations = recommendationsText
      .split(',')
      .map((tag: string) => tag.trim().toLowerCase())
      .filter((tag: string) => tag.length > 0);

    return recommendations;
  } catch (error) {
    console.error('Error getting recommendations:', error);
    // Fallback la interesele utilizatorului dacă API-ul eșuează
    return userProfile.interests || [];
  }
};

/**
 * Calculează scorul de relevanță pentru un eveniment bazat pe recomandările AI
 */
export const calculateEventRelevance = (
  event: Event,
  recommendations: string[]
): number => {
  let score = 0;

  // Verifică dacă categoria evenimentului se potrivește
  if (recommendations.includes(event.category.toLowerCase())) {
    score += 5;
  }

  // Verifică tag-urile evenimentului
  const eventTags = event.tags || [];
  eventTags.forEach((tag) => {
    if (recommendations.includes(tag.toLowerCase())) {
      score += 3;
    }
  });

  // Verifică cuvintele din titlu și descriere
  const eventText = `${event.title} ${event.description}`.toLowerCase();
  recommendations.forEach((rec) => {
    if (eventText.includes(rec)) {
      score += 2;
    }
  });

  return score;
};
