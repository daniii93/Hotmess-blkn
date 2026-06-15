<?php

declare(strict_types=1);

function hotmess_homepage_content(): array
{
    return [
        'hero' => [
            'eyebrow' => 'HOTMESS Philosophie',
            'headline' => 'Erinnerungen beginnen nicht auf der Tanzfläche. Sie beginnen mit den Menschen, die man unterwegs trifft.',
            'text' => 'HOTMESS verbindet außergewöhnliche Events, besondere Reiseziele und eine Community von Menschen, die mehr suchen als nur einen Abend. Von der ersten Vorfreude bis zur letzten Erinnerung entsteht ein Erlebnis, das weit über die Nacht hinausgeht.',
            'ctas' => [
                ['label' => 'Events entdecken', 'href' => '/events', 'variant' => 'primary'],
                ['label' => 'Passport entdecken', 'href' => '/membership', 'variant' => 'ghost'],
                ['label' => 'Wochenenden erleben', 'href' => '/packages', 'variant' => 'ghost'],
            ],
        ],
        'philosophy' => [
            'eyebrow' => 'Philosophie',
            'title' => 'Mehr als eine Nacht.',
            'paragraphs' => [
                'Die schönsten Geschichten entstehen selten nach Plan.',
                'Sie beginnen mit einer Einladung. Mit einem spontanen Gespräch. Mit einer Reise in eine Stadt, die man bisher nur vom Vorbeifahren kannte.',
                'HOTMESS wurde für Menschen geschaffen, die Erinnerungen sammeln statt Dinge. Für Menschen, die neue Orte entdecken möchten, echte Begegnungen schätzen und verstehen, dass die wertvollsten Momente oft ungeplant entstehen.',
            ],
            'cards' => [
                ['title' => 'Außergewöhnliche Erlebnisse', 'text' => 'Jede Stadt verändert die Energie. Jede Nacht schreibt ihre eigene Geschichte.'],
                ['title' => 'Ausgewählte Hotels', 'text' => 'Dort übernachten, wo die Community übernachtet. Kuratiert, persönlich und passend zum Erlebnis.'],
                ['title' => 'Echte Begegnungen', 'text' => 'Menschen aus verschiedenen Städten, Ländern und Lebenswelten an einem Ort vereint.'],
                ['title' => 'Der HOTMESS Passport', 'text' => 'Vorteile, besondere Zugänge und Erlebnisse für alle, die Teil der Community werden möchten.'],
            ],
        ],
        'nextWeekend' => [
            'eyebrow' => 'Nächstes HOTMESS Weekend',
            'title' => 'Eure nächste Geschichte beginnt hier.',
            'text' => 'Nicht jede Reise verändert etwas. Manche schon. Entdeckt das nächste HOTMESS Weekend inklusive Event, Hoteloptionen, Community-Erlebnissen und besonderen Vorteilen für Passport-Mitglieder.',
            'city' => 'Innsbruck',
            'event' => 'Innsbruck Private Weekend',
            'date' => '18. Juli 2026',
            'ctas' => [
                ['label' => 'Event ansehen', 'href' => '/events/innsbruck-private-weekend', 'variant' => 'primary'],
                ['label' => 'Wochenende ansehen', 'href' => '/packages', 'variant' => 'ghost'],
                ['label' => 'Hotel entdecken', 'href' => '/hotels', 'variant' => 'ghost'],
            ],
        ],
        'cities' => [
            'eyebrow' => 'HOTMESS Cities',
            'title' => 'Europa. Stadt für Stadt. Geschichte für Geschichte.',
            'text' => 'HOTMESS gehört keiner Stadt. Die Community bewegt sich von Ort zu Ort und verbindet Menschen über Grenzen hinweg. Jede Destination bringt ihre eigene Energie, ihre eigenen Begegnungen und ihre eigenen Erinnerungen mit sich.',
            'items' => [
                ['city' => 'Innsbruck', 'status' => 'Aktiv', 'href' => '/cities/innsbruck'],
                ['city' => 'Wien', 'status' => 'Demnächst', 'href' => '/cities/wien'],
                ['city' => 'Dubrovnik', 'status' => 'In Planung', 'href' => '/cities/dubrovnik'],
            ],
        ],
        'packages' => [
            'eyebrow' => 'HOTMESS Weekends',
            'title' => 'Nicht nur ein Ticket. Ein ganzes Wochenende.',
            'text' => 'Viele Gäste reisen bereits am Freitag an. Andere bleiben bis Sonntag oder länger. Genau deshalb gibt es HOTMESS Weekends. Kuratierte Pakete, die Event, Hotel, Community und besondere Erlebnisse zu einer einzigen Reise verbinden.',
            'cta' => ['label' => 'Wochenenden entdecken', 'href' => '/packages'],
            'items' => [
                ['title' => 'Basic Weekend', 'text' => 'Der Einstieg in das HOTMESS Erlebnis.'],
                ['title' => 'Travel Weekend', 'text' => 'Event und Hotel perfekt kombiniert.'],
                ['title' => 'VIP Weekend', 'text' => 'Mehr Komfort. Mehr Vorteile. Mehr Erlebnis.'],
                ['title' => 'Signature Weekend', 'text' => 'Das vollständigste HOTMESS Wochenende mit exklusiven Extras und limitierter Verfügbarkeit.'],
            ],
        ],
        'passport' => [
            'eyebrow' => 'HOTMESS Passport',
            'title' => 'Der Schlüssel zur Community.',
            'paragraphs' => [
                'Der HOTMESS Passport eröffnet Zugang zu Vorteilen, besonderen Erlebnissen und einer Community, die weit über einzelne Veranstaltungen hinausgeht.',
                'Nicht als Statussymbol.',
                'Sondern als Einladung, Teil von etwas Größerem zu werden.',
            ],
            'cta' => ['label' => 'Passport vergleichen', 'href' => '/membership'],
            'tiers' => [
                ['title' => 'Free Passport', 'benefits' => ['Kostenlos starten', 'Event-Erinnerungen', 'City Guides', 'Community Updates']],
                ['title' => 'Passport Plus', 'benefits' => ['Früherer Zugang', 'Hotelvorteile', 'Partnerangebote', 'Community-Erlebnisse']],
                ['title' => 'Passport Black', 'benefits' => ['Fast Lane', 'VIP Optionen', 'Bevorzugte Buchung', 'Concierge Zugang', 'Signature Vorteile']],
            ],
        ],
        'hotels' => [
            'eyebrow' => 'Host Hotels',
            'title' => 'Wo die Community zu Hause ist.',
            'text' => 'Ein gelungenes Wochenende beginnt nicht erst am Abend. Ausgewählte Hotelpartner bieten besondere Vorteile, kurze Wege, komfortable Aufenthalte und exklusive Extras für die HOTMESS Community.',
            'cta' => ['label' => 'Hotels entdecken', 'href' => '/hotels'],
            'items' => [
                ['title' => 'Standard Partner', 'text' => 'Verlässliche Hoteloptionen für Gäste, die ihr Wochenende bewusst planen.'],
                ['title' => 'Host Hotel', 'text' => 'Ausgewählte Partner mit Vorteilen, kurzen Wegen und Community-Nähe.'],
                ['title' => 'Signature Hotel', 'text' => 'Limitierte Premium-Aufenthalte für besondere HOTMESS Weekends.'],
            ],
        ],
        'community' => [
            'eyebrow' => 'HOTMESS Circle',
            'title' => 'Menschen machen den Unterschied.',
            'paragraphs' => [
                'Die besten Erinnerungen entstehen nicht durch Dekoration, Licht oder Musik.',
                'Sie entstehen durch Menschen.',
                'HOTMESS bringt Persönlichkeiten aus unterschiedlichen Städten, Ländern und Lebenswelten zusammen und schafft Räume für Begegnungen, die oft weit über ein Wochenende hinaus bestehen bleiben.',
            ],
            'cta' => ['label' => 'Community entdecken', 'href' => '/community'],
            'formats' => ['Brunch', 'Social Meetup', 'Partnerabend', 'Shopping Night', 'Travel Meetup', 'Member-only Erlebnis'],
        ],
        'concierge' => [
            'eyebrow' => 'HOTMESS Concierge',
            'title' => 'Euer persönlicher HOTMESS Concierge.',
            'text' => 'Von Eventempfehlungen über Hotels bis hin zu individuellen Wochenendplanungen. Der Concierge hilft dabei, aus einer Reise ein Erlebnis zu machen.',
            'cta' => ['label' => 'Concierge öffnen', 'href' => '/concierge'],
            'actions' => ['Mein nächstes Erlebnis finden', 'Hotel empfehlen lassen', 'Wochenende planen', 'Vorteile anzeigen'],
        ],
        'partners' => [
            'eyebrow' => 'Ausgewählte Partner',
            'title' => 'Ausgewählte Partner',
            'text' => 'Hotels, Restaurants, Lifestyle-Marken, Reiseanbieter und Locations, die das HOTMESS Erlebnis mitgestalten.',
            'cta' => ['label' => 'Partner werden', 'href' => '/partners/apply'],
        ],
        'gallery' => [
            'eyebrow' => 'Momente',
            'title' => 'Momente, die bleiben.',
            'paragraphs' => [
                'Unsere Aftermovies zeigen keine Veranstaltungen.',
                'Sie zeigen Menschen.',
                'Augenblicke.',
                'Emotionen.',
                'Und Erinnerungen, die noch lange nachwirken.',
            ],
            'cta' => ['label' => 'Galerie ansehen', 'href' => '/gallery'],
        ],
        'newsletter' => [
            'eyebrow' => 'Verbunden bleiben',
            'title' => 'Bleibt Teil der Geschichte.',
            'text' => 'Erfahrt zuerst von neuen Städten, besonderen Wochenenden, Community-Erlebnissen und exklusiven Vorteilen. Manche Geschichten beginnen mit einer einzigen Nachricht.',
            'fields' => [
                'email' => 'E-Mail-Adresse',
                'city' => 'Bevorzugte Stadt',
                'interest' => 'Interesse auswählen',
            ],
            'cta' => 'Eintragen',
        ],
    ];
}
