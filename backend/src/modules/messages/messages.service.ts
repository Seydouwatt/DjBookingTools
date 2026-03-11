import { Injectable } from '@nestjs/common';

interface MessageVenue {
  name: string;
  city?: string;
  category?: string;
  instagram?: string;
}

@Injectable()
export class MessagesService {
  generateMessage(venue: MessageVenue, djName?: string, mixLink?: string): string {
    const dj = djName || 'DJ';
    const mix = mixLink || '[lien mix]';
    const cityLine = venue.city ? `basé(e) à ${venue.city}` : '';

    const intro = this.getIntroByCategory(venue.category);
    const closing = this.getClosingByCategory(venue.category);

    return `Salut la team ${venue.name} 👋

Je suis ${dj} ${cityLine} spécialisé Bass Music / Hip-hop / Afro / DnB.

${intro}

Voici un mix rapide pour vous donner une idée de mon univers :
${mix}

${closing}

Bonne journée !`;
  }

  private getIntroByCategory(category?: string): string {
    switch (category) {
      case 'guinguette':
        return "Je cherche quelques dates pour la saison printemps / été et je pense que mon univers sonore pourrait parfaitement coller à l'ambiance guinguette de votre lieu.";
      case 'peniche':
        return "Je cherche quelques dates pour animer des soirées sur des péniches et je pense que mon univers musical pourrait créer une belle ambiance chez vous.";
      case 'club':
        return "Je cherche à développer mes dates en club et je pense que mon set pourrait faire danser votre public.";
      case 'festival spot':
        return "Je cherche des opportunités pour jouer sur des events / festivals et je pense que mon univers pourrait bien coller à votre programmation.";
      default:
        return "Je cherche quelques dates pour la saison à venir et je pense que mon univers pourrait bien fonctionner chez vous.";
    }
  }

  private getClosingByCategory(category?: string): string {
    switch (category) {
      case 'club':
        return "Si ça vous branche d'en discuter, je suis dispo pour un échange ou pour envoyer un dossier artistique complet.";
      case 'guinguette':
        return "Si ça vous chauffe d'en discuter pour cet été, je serais ravi d'échanger !";
      default:
        return "Si ça vous chauffe d'en discuter je serais ravi d'échanger.";
    }
  }
}
