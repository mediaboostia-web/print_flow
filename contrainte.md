# Charte d'Architecture UI/UX : Directive d'Exclusion des Biais Visuels IA

**Version :** 1.0.0  
**Statut :** Strict & Obligatoire  
**Périmètre :** Conception UI/UX, Design Systems, Prototypes (Google Stitch), Architecture Code (Claude Code), Génération Frontend (Antigravity), Base de données & SaaS (Supabase).

---

## 1. Objectif & Cadre d'Application

Cette directive définit les normes d'excellence et d'unicité visuelle pour l'ensemble des produits digitaux conçus (SaaS, sites vitrines, applications web et landing pages B2B/PME). 

Elle interdit de manière absolue et explicite l'utilisation des clichés, motifs récurrents, composants et effets visuels sur-utilisés caractéristiques des plateformes et applications « générées par IA » ou « orientées IA ».

Chaque produit doit afficher un caractère propre, robuste, pro, axé sur l'ergonomie, la typographie et la lisibilité, s'inspirant des meilleurs standards éditoriaux et structurels (Dribbble Premium, Behance, 21dev, Swiss Design).

---

## 2. Liste Relevée des Éléments Interdits (Du moins au plus observé)

Il est strictement **INTERDIT** d'intégrer ou de générer les éléments suivants dans les maquettes, wireframes, styles CSS, composants React/Tailwind ou code source.

### A. Éléments Émergents & Gadgets (Niveau 1)
* 🚫 **Curseurs / Pointeurs « IA » Animés Fictifs :** Curseur secondaire simulé qui tape du texte ou clique tout seul pour feindre une démo dynamique.
* 🚫 **Champs de Prompt Géants en Guise de Hero Header :** Zone de saisie massive avec bouton « Generate » ou « Ask AI » remplaçant la proposition de valeur explicite.
* 🚫 **Compteurs de Tokens / Prompts Dynamiques Fictifs :** Badges affichant des métriques abstraites en temps réel (*ex: "1,240,500 prompts executed today"*).
* 🚫 **Boutons à Effet « Shimmer » / Lueur Mouvante Continue :** Animation CSS où une lumière traverse indéfiniment le bouton d'action principal.
* 🚫 **Widgets de Latence / Vitesse LLM :** Puces affichant la vitesse de réponse en millisecondes (*ex: "Ultra-fast 40ms latency"*).

### B. Clichés SaaS IA Classiques (Niveau 2)
* 🚫 **Icônes "Étincelle" / Magie (Four-point star ✦ / ✨) :** Omniprésence de l'étoile à 4 branches ou baguette magique à côté des titres, boutons, inputs ou items de menu.
* 🚫 **Cartes Bento Récursives Sans Hiérarchie (Bento Box Overdose) :** Grilles uniformes aux coins trop arrondis (`rounded-2xl` / `rounded-3xl`) mélangeant petits graphiques abstraits et morceaux de code déconnectés.
* 🚫 **Orbes / Sphères 3D Iridescentes (Glossy Orbs) :** Renders 3D de boules bleues, violettes ou chromées en apesanteur.
* 🚫 **Sélecteurs de Modèles LLM / Pills de Modèles :** Badges ou dropdowns affichant les noms de modèles de langage (*GPT-4o, Claude 3.5, Llama 3*) sur des interfaces métier.
* 🚫 **Glassmorphism Exagéré / Flou Massif :** Panneaux transparents avec des flous d'arrière-plan excessifs (`backdrop-blur-md` à `xl`) dégradant la lisibilité et le contraste.

### C. Motifs Ubiquitaires & Standards Saturation (Niveau 3 - Interdictions Majeures)
* 🚫 **Fond Sombre avec Halos Cyan & Violet (Glows Néon) :** Arrière-plan sombre (`#000000` / `#0B0F19`) maculé de cercles flous violacés ou cyans (`purple-600`, `indigo-500`, `cyan-400`).
* 🚫 **Titres H1 avec Mots en Gradient de Texte :** Masque de dégradé néon appliqué sur les mots clés du titre d'accroche.
* 🚫 **Effet de Machine à Écrire Indéfini (Typewriter Effect) :** Mots qui s'effacent et se réécrivent en boucle dans le titre principal.
* 🚫 **Bordures à Dégradé Néon Tournant (Animated Gradient Borders) :** Lignes de 1px faisant tourner une lueur colorée autour des cartes.
* 🚫 **Badges Flottants Brillants au-dessus du H1 :** Pilules style `[✨ Powered by AI 2.0 ->]` ou `[🚀 Announcing V2]` placées au-dessus du titre principal.
* 🚫 **Mockups Flottants en Fausse 3D / Isométrie Décalée :** Captures d'écran ou interfaces penchées à 15° avec ombre portée excessive.

---

## 3. Alternatives Opérationnelles & Directives de Style

| Élement Interdit | Alternative Obligatoire | Directive Technique & UX |
| :--- | :--- | :--- |
| **Gradients Néon / Halos Fluos** | Palettes organiques & fonds minéraux | Arrière-plans neutres (`#FAFAFA`, `#F8FAFC`, ou obscur brut `#0F172A`), bruitage de texture subtil (1-3% noise). |
| **Glassmorphism & Backdrop Blur** | Matériaux tangibles & Grilles 1px | Bordures monochromes nettes 1px (`border: 1px solid #E2E8F0` ou `#262626`), ombres tranchées (*Hard Shadows*). |
| **Bento Grids Génériques** | Grilles Éditoriales Asymétriques | Disposition Swiss Style sur 12 colonnes, ruptures de rythme par typographie XXL et colonnes impaires. |
| **Titres à Dégradé Brillant** | Typographie Expressive Dual-Font | Titrage en Serif éditorial raffiné (ex: *Newsreader*, *Playfair*, *Instrument Serif*) croisé avec un Sans-Serif ou Mono technique. |
| **Étincelles ✨ & Orbes 3D** | Puces typographiques & Indicateurs d'état | Indicateurs de statut monochromes (`[01]`, `• Active`, `[LIVE]`), micro-puces de données techniques. |

---

## 4. Prompts & Directives d'Exclusion pour les Outils IA

### Consigne d'Exclusion à Injecter dans Claude Code & Antigravity
> **SYSTEM DIRECTIVE - ANTI-AI VISUAL BIASED DESIGN:**  
> `DO NOT USE: dark mode violet/cyan background glows, glossy 3D floating orbs, 4-point sparkle icons (✨/✦), gradient-filled text headers, endless typewriter effects, generic glassmorphism cards with backdrop-blur, isometric floating app mockups, uniform Bento grids with rounded-3xl corners, animated neon borders.`  
> `USE INSTEAD: High-contrast editorial layout, 12-column asymmetric grid, 1px solid neutral borders, crisp typography (Serif + Technical Mono/Sans pairing), physical noise texture (1-3%), clean whitespace, functional micro-interactions.`

---

## 5. Validation & Checklist de Livrabilité (Quality Gate)

Avant toute validation de livrable (Maquette Google Stitch, Composant React Antigravity, Page Web) :

- [ ] Aucun fond sombre à halo violet/cyan n'est présent.
- [ ] Aucune icône d'étincelle à 4 branches (✨/✦) n'est utilisée sans justification d'icône métier stricte.
- [ ] Les titres ne contiennent aucun texte masqué par un dégradé de couleur.
- [ ] Les cartes d'information utilisent des bordures 1px nettes et non du glassmorphism flou.
- [ ] La typographie respecte la hiérarchie éditoriale (Serif/Sans/Mono) avec un fort contraste WCAG AAA.
- [ ] Les animations au survol sont rapides ($150	ext{ms}$ à $300	ext{ms}$), fonctionnelles et non décoratives.

