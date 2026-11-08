# Atlas, ouvert de dermatologie

Le site aodermatologie.org : fiches de pathologies, atlas photo, dermoscopie et coffre-fort. Lupus, l'assistant, viendra plus tard. Sa page annonce son arrivée.

## Architecture

```
Navigateur ──► Express (server.mjs) : en-têtes de sécurité (CSP, HSTS…)
                 ├─ pages HTML générées à l'avance (dist/client) ─ rapides, sans base de données
                 ├─ /api/coffre        : vérifie le code, ouvre ou ferme la session
                 ├─ /api/photos        : légendes des photos verrouillées      ┐ seulement avec
                 └─ /api/photos/:id    : relaie une photo verrouillée          ┘ une session valide
                                              │
Bucket S3 PUBLIC  ◄── photos libres et floutées (lues directement par le navigateur)
Bucket S3 PRIVÉ   ◄── photos verrouillées (lues uniquement par le serveur)
```

- **Astro 7** génère toutes les pages au moment de la construction. Seules les routes `/api/*` tournent sur le serveur.
- **Aucune base de données** pour l'instant. Le contenu est fait de fichiers texte versionnés dans Git. Une base Postgres (avec pgvector) arrivera avec Lupus.
- **React** uniquement pour les parties interactives : recherche, liste, mur de photos, visionneuse, formulaire du coffre-fort.
- Les composants viennent du kit du design system (`src/kit`). Les couleurs, les polices et le mode sombre viennent de `src/styles/tokens.css`.

```
src/
  content/
    fiches/*.md              une fiche par pathologie (Markdown)
    photos/photos.yaml       la liste des photos et leur classement
    dermoscopie/             structures.json + rubriques.yaml
  content.config.ts          le modèle de contenu (vérifié à chaque construction)
  pages/                     une page par fichier ; pages/api = le serveur
  islands/                   parties interactives (React)
  kit/                       composants du design system
  lib/coffre.mjs             code, session, limite d'essais
  lib/stockage.mjs           lecture des photos privées (dossier local ou S3)
  plugins/rehype-fiche.mjs   sections repliables et encadrés des fiches
scripts/                     préparation des photos, empreinte du code
tests/                       tests automatiques (npm test)
```

## Travailler en local

Il faut Node 22.23.4 ou plus récent.

```bash
npm install
cp .env.example .env              # puis remplissez COFFRE_CODE_EMPREINTE et SESSION_SECRET (voir plus bas)
npm run photos:preparer           # versions web des photos → public/medias et stockage-local/prive
npm run dev                       # http://localhost:4321
```

Pour tester comme en production : `npm run build`, puis `npm start` sur http://localhost:8080. En local, mettez `COOKIE_SECURE=false` dans `.env`.

Vérifications :

```bash
npm test          # coffre-fort, stockage, mise en forme des fiches
npm run check     # types TypeScript et pages Astro
```

## Écrire une fiche

Chaque pathologie a un fichier `src/content/fiches/<nom>.md`. Le nom du fichier devient l'adresse (`/pathologies/acne`).

```markdown
---
titre: Acné
famille: inflammatoires          # inflammatoires · infections · tumeurs · bulleuses · autres
statut: brouillon                # a-rediger · brouillon · relue
chapo: Une ou deux phrases de présentation.
essentiel:
  - Trois à six points à retenir.
sources:
  - titre: Recommandations pour le traitement de l'acné
    organisme: Société française de dermatologie
    annee: 2024
    url: https://…
relecture: { par: Dr X, le: 2026-12-01 }
misAJour: 2026-11-07
---

## Clinique | Lésions rétentionnelles et inflammatoires

Texte, listes, **gras**…

> [!ALERTE]
> Acné fulminans : avis dermatologique en urgence.
```

Le statut contrôle la publication :

| Statut | Effet |
|---|---|
| `a-rediger` | La pathologie est grisée « à venir » et n'a pas de page. |
| `brouillon` | La page est publiée avec le badge « En relecture ». |
| `relue` | La page est publiée sans badge. |

Mise en forme :

- `## Titre | sous-titre` crée une section repliable, fermée par défaut.
- Il y a trois encadrés : `> [!ALERTE]`, `> [!PRECAUTION]` et `> [!RETENIR]`.
- Une ligne `[[photos]]` place les photos de la pathologie à cet endroit, en général dans « Clinique ». Le nombre de photos s'ajoute au sous-titre de la section (« … · 3 photos »). Sans cette ligne, les photos vont dans une section « Photos » en fin de fiche.
- Pas d'image dans le Markdown : les photos passent toutes par `photos.yaml`.

Si une fiche ne respecte pas le modèle, la construction s'arrête et dit pourquoi, par exemple une famille inconnue ou une photo sans consentement.

## Ajouter des photos

Une photo a l'une de deux origines :

| Origine | Obligatoire | Accès |
|---|---|---|
| `patient` (par défaut) | `consentement` : référence du formulaire signé, jamais l'identité du patient | `libre` ou `verrouillee` |
| `publication` | `publication.citation` : auteurs, titre court, revue, année (affichée avec la photo) | `verrouillee` tant qu'il n'y a ni `publication.autorisation` (accord écrit de l'éditeur), ni licence `CC BY…` |

Si une règle n'est pas respectée, la construction du site s'arrête et dit pourquoi. Une figure de publication ne peut donc pas passer en libre par erreur.

1. Déposez l'original dans `photos-sources/`. Ce dossier n'est **jamais** mis dans Git.
2. Décrivez la photo dans `src/content/photos/photos.yaml` :

   ```yaml
   - id: pemphigus-bouche-01
     fichier: pemphigus-bouche-01        # nom du fichier dans photos-sources/, sans extension
     pathologie: pemphigus               # nom du fichier de la fiche
     localisation: Muqueuses             # liste fixe : voir content.config.ts
     lesions: [Érosion]
     legende: Érosions buccales.
     alt: Muqueuse buccale avec plusieurs érosions.   # description pour les lecteurs d'écran
     acces: verrouillee
     origine: publication
     publication:
       citation: "Dupont A, et al. Titre court. Ann Dermatol Venereol. 2025;152:12-18."
       doi: 10.1016/…
       # licence: CC BY 4.0
       # autorisation: { reference: ACCORD-EDITEUR-01, date: 2027-01-15 }
   ```

   Pour une photo de patient, remplacez `origine` et `publication` par `consentement: { reference: CONS-2026-014, date: 2026-11-07 }`.
3. Lancez `npm run photos:envoyer` pour la production, ou `npm run photos:preparer` en local. Le script :
   - redresse et redimensionne la photo en 480 et 1600 px, au format WebP ;
   - **supprime toutes les métadonnées** (date, appareil, position GPS…), puis vérifie qu'il n'en reste aucune ;
   - envoie une photo `libre` dans le bucket public et une photo `verrouillee` dans le bucket privé.

Règles d'affichage :

- **Localisation « Organes génitaux »** : la photo est floutée d'office et s'affiche d'un clic, sans code.
- **Photo verrouillée** : la page n'en contient ni l'image, ni la légende, ni la source. Elle montre seulement le cadenas. Le reste n'est envoyé qu'après validation du code par le serveur.
- **Passer une photo en libre** une fois l'autorisation obtenue : ajoutez `autorisation`, mettez `acces: libre`, relancez `npm run photos:envoyer` (la photo passe dans le bucket public), puis reconstruisez le site.
- **Retirer une photo** (retrait du consentement, demande d'un éditeur) : supprimez sa ligne de `photos.yaml`, reconstruisez le site, puis supprimez les fichiers des buckets.

## Le coffre-fort

```bash
npm run coffre:hacher -- "VOTRE CODE"
```

Cette commande donne deux lignes, `COFFRE_CODE_EMPREINTE=…` et `SESSION_SECRET=…`, à copier dans les variables de l'hébergeur. Le code lui-même n'est enregistré nulle part.

Fonctionnement :

- **Saisie du code** : les espaces et la casse sont ignorés (« aod 2026 » = « AOD2026 »).
- **Limite d'essais** : 5 essais par adresse IP sur 15 minutes. Une limite globale de 200 échecs par heure protège aussi contre les essais répartis sur beaucoup d'adresses. Quand elle est atteinte, le coffre refuse tout le monde jusqu'à la fin de l'heure.
- **Session** :
  - un cookie `HttpOnly`, `SameSite=Strict` et `Secure`, que les scripts de la page ne peuvent pas lire ;
  - il disparaît à la fermeture du navigateur ;
  - il expire de toute façon après 12 heures, même si le navigateur restaure ses cookies.
- **Changer de code** : générez une nouvelle empreinte et augmentez `COFFRE_VERSION`. Toutes les sessions ouvertes se ferment.

Le compteur d'essais est gardé en mémoire. Si un jour le site tourne sur plusieurs serveurs en parallèle, il faudra le déplacer dans Redis ou Postgres.

## Mise en ligne chez Clever Cloud

Les photos relèvent des données de santé. Il faut donc le **contrat HDS** de Clever Cloud : il se demande à un Account Manager, par le formulaire de contact de leur page « Health Data Hosting ». Leur page HDS cite les environnements d'exécution (dont Node.js) et les bases de données, mais pas le stockage objet Cellar. **Demandez explicitement que Cellar soit inclus**, avec une région certifiée (Paris, Gravelines ou Roubaix).

### 1. Les buckets (Cellar)

Créez un add-on **Cellar**, puis deux buckets :

- `aod-photos-publiques`, en lecture publique (règle « public read » sur le bucket) ;
- `aod-photos-privees`, privé.

Envoyez les photos depuis votre ordinateur : remplissez `CELLAR_ADDON_HOST`, `CELLAR_ADDON_KEY_ID`, `CELLAR_ADDON_KEY_SECRET` (affichés dans la console de l'add-on) et les noms des buckets dans `.env`, puis lancez `npm run photos:envoyer`.

### 2. L'application (Node.js)

Créez une application **Node.js**, reliée au dépôt Git, et reliez-lui l'add-on Cellar. Clever Cloud ajoute alors lui-même les variables `CELLAR_ADDON_*`.

Variables d'environnement à saisir (le fichier `variables-clever-cloud.env` est prêt à coller dans le « mode expert ») :

| Variable | Valeur |
|---|---|
| `NODE_ENV` | `production` |
| `CC_POST_BUILD_HOOK` | `npm run build` |
| `ASTRO_TELEMETRY_DISABLED` | `1` |
| `SITE_URL` | `https://aodermatologie.org` |
| `TRUST_PROXY` | `1` |
| `COOKIE_SECURE` | `true` |
| `COFFRE_CODE_EMPREINTE` | sortie de `npm run coffre:hacher` |
| `SESSION_SECRET` | sortie de `npm run coffre:hacher` |
| `COFFRE_VERSION` | `1` |
| `STOCKAGE` | `s3` |
| `S3_BUCKET_PRIVE` | `aod-photos-privees` |
| `S3_BUCKET_PUBLIC` | `aod-photos-publiques` |
| `PUBLIC_MEDIA_URL` | `https://aod-photos-publiques.cellar-c2.services.clever-cloud.com` |

`PUBLIC_MEDIA_URL` est inscrite dans les pages au moment de la construction : si vous la changez, redéployez.

Clever Cloud installe les dépendances, lance `npm run build`, puis démarre `npm start` (le serveur écoute sur le port 8080, comme Clever Cloud l'attend).

### 3. Le domaine

Ajoutez `aodermatologie.org` dans l'onglet « Domain names » de l'application, puis créez chez votre registraire l'enregistrement DNS que Clever Cloud indique. Le certificat HTTPS est fourni automatiquement.

### 4. Contrôle

`https://aodermatologie.org/api/sante` doit répondre `{"ok":true}`. Testez ensuite le coffre-fort avec le code, puis l'affichage d'une photo verrouillée.

### Autre hébergeur

Le `Dockerfile` permet de déployer ailleurs, avec n'importe quel stockage compatible S3 (variables `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_REGION`) :

```bash
docker build --build-arg PUBLIC_MEDIA_URL=https://… -t atlas .
docker run -p 8080:8080 --env-file .env atlas
```

## Sécurité et RGPD : à faire avant l'ouverture

- [ ] Contrat HDS signé avec Clever Cloud, Cellar compris, région France.
- [ ] Figures de publications : autorisation de l'éditeur demandée avant tout passage en libre.
- [ ] Formulaire de consentement patient validé (usage pédagogique en ligne, droit de retrait), pour les photos du service.
- [ ] Registre des consentements tenu hors du site (référence, date, photo concernée).
- [ ] Mentions légales et page Confidentialité complétées (passages [À compléter]).
- [ ] Analyse avec le DPO de l'établissement, si les photos viennent du service.
- [ ] Code du coffre-fort transmis à l'équipe hors du site, jamais écrit dans le dépôt.
- [ ] Fiches relues : passer `statut: relue` et remplir `relecture`.
- [ ] Sauvegarde des buckets activée chez l'hébergeur.

Déjà en place :

- en-têtes de sécurité : CSP, HSTS, anti-iframe, `nosniff` ;
- polices servies par le site (aucun appel à Google) ;
- aucun cookie publicitaire ni de mesure d'audience ;
- métadonnées des photos supprimées et vérifiées ;
- photos verrouillées jamais envoyées sans session valide.

À durcir plus tard : la CSP autorise encore les scripts en ligne d'Astro (`'unsafe-inline'`). Il faudra les remplacer par des empreintes.
