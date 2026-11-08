// Modèle de contenu. Toute fiche ou photo qui ne respecte pas ce schéma fait échouer la construction du site :
// impossible de publier une photo sans référence de consentement, ou une fiche sans famille.
import { defineCollection, reference } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

export const FAMILLES = {
  inflammatoires: 'Dermatoses inflammatoires',
  infections: 'Infections et infestations',
  tumeurs: 'Tumeurs cutanées',
  bulleuses: 'Maladies bulleuses auto-immunes',
  autres: 'Auto-immunité, pigmentation et phanères',
} as const;

export const LOCALISATIONS = ['Cuir chevelu', 'Visage', 'Tronc', 'Membres', 'Mains', 'Pieds', 'Ongles', 'Plis', 'Muqueuses', 'Organes génitaux'] as const;
export const LESIONS = ['Macule', 'Papule', 'Plaque', 'Nodule', 'Vésicule', 'Bulle', 'Pustule', 'Squames', 'Croûte', 'Érosion', 'Ulcération'] as const;

const source = z.object({
  titre: z.string(),
  organisme: z.string(),
  annee: z.number().int().optional(),
  url: z.url().optional(),
});

const fiches = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/fiches' }),
  schema: z.object({
    titre: z.string(),
    famille: z.enum(Object.keys(FAMILLES) as [keyof typeof FAMILLES, ...(keyof typeof FAMILLES)[]]),
    // a-rediger : listée « à venir », sans page · brouillon : publiée avec un bandeau « en relecture » · relue : publiée
    statut: z.enum(['a-rediger', 'brouillon', 'relue']).default('a-rediger'),
    chapo: z.string().default(''),
    essentiel: z.array(z.string()).max(6).default([]),
    sources: z.array(source).default([]),
    relecture: z.object({ par: z.string(), le: z.coerce.date() }).optional(),
    misAJour: z.coerce.date().optional(),
  }),
});

const referenceDatee = z.object({ reference: z.string().min(3), date: z.coerce.date() });

// Deux origines possibles :
// - patient : photo prise dans le service ; consentement écrit du patient obligatoire (référence, jamais l'identité) ;
// - publication : figure d'un article ; citation obligatoire. Elle reste verrouillée (équipe médicale)
//   tant qu'il n'y a ni autorisation écrite de l'éditeur, ni licence Creative Commons « CC BY… ».
const photos = defineCollection({
  loader: file('./src/content/photos/photos.yaml'),
  schema: z
    .object({
      fichier: z.string().regex(/^[a-z0-9][a-z0-9-]*$/, 'nom de fichier en minuscules, chiffres et tirets'),
      pathologie: reference('fiches'),
      localisation: z.enum(LOCALISATIONS),
      lesions: z.array(z.enum(LESIONS)).default([]),
      legende: z.string(),
      alt: z.string().min(10, 'décrivez la photo pour les lecteurs d’écran'),
      acces: z.enum(['libre', 'verrouillee']).default('libre'),
      origine: z.enum(['patient', 'publication']).default('patient'),
      consentement: referenceDatee.optional(),
      publication: z
        .object({
          citation: z.string().min(10, 'auteurs, titre court, revue, année'),
          doi: z.string().optional(),
          licence: z.string().optional(), // ex. « CC BY 4.0 », si l'article est en accès libre
          autorisation: referenceDatee.optional(), // accord écrit de l'éditeur ou de l'auteur
        })
        .optional(),
    })
    .superRefine((p, ctx) => {
      if (p.origine === 'patient' && !p.consentement) {
        ctx.addIssue({ code: 'custom', path: ['consentement'], message: 'photo de patient : référence du consentement obligatoire' });
      }
      if (p.origine === 'publication') {
        if (!p.publication) {
          ctx.addIssue({ code: 'custom', path: ['publication'], message: 'photo issue d’une publication : citation obligatoire' });
        } else if (p.acces === 'libre' && !p.publication.autorisation && !/^CC BY/i.test(p.publication.licence ?? '')) {
          ctx.addIssue({
            code: 'custom',
            path: ['acces'],
            message: 'photo de publication en accès libre : il faut l’autorisation de l’éditeur (publication.autorisation) ou une licence CC BY',
          });
        }
      }
    }),
});

const structures = defineCollection({
  loader: file('./src/content/dermoscopie/structures.json'),
  schema: z.object({
    nom: z.string(),
    definition: z.string(),
    evoque: z.string(),
    illustration: z.string(),
  }),
});

const rubriques = defineCollection({
  loader: file('./src/content/dermoscopie/rubriques.yaml'),
  schema: z.object({
    titre: z.string(),
    description: z.string(),
    illustration: z.string(),
    ordre: z.number(),
    sections: z.array(z.object({ titre: z.string().nullable().default(null), structures: z.array(reference('structures')) })),
  }),
});

export const collections = { fiches, photos, structures, rubriques };
