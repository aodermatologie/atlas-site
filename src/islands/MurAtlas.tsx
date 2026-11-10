// Mur de photos de l'atlas : trois filtres combinables (pathologie, localisation, lésion élémentaire),
// « ou » dans un filtre, « et » entre les filtres. Visionneuse au clic.
// Les photos verrouillées s'affichent seulement si le coffre-fort est ouvert (vérifié auprès du serveur).
import * as React from 'react';
import { Bouton } from '../kit/Boutons';
import { Compteur, EtatVide } from '../kit/Contenus';
import { FiltreDeroulant, Pastille, VoletFiltre, type Option } from '../kit/Filtres';
import { IconeChevronBas } from '../kit/icones';
import { Vignette, Visionneuse, type Photo } from '../kit/Photos';
import type { PhotoAffichee } from '../lib/site';
import { useCoffre } from './useCoffre';

type Cle = 'pathologie' | 'localisation' | 'lesion';
const TITRES: Record<Cle, string> = { pathologie: 'Pathologie', localisation: 'Localisation', lesion: 'Lésion élémentaire' };

function useMobile() {
  const [mobile, setMobile] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia('(max-width: 760px)');
    const maj = () => setMobile(mq.matches);
    maj();
    mq.addEventListener('change', maj);
    return () => mq.removeEventListener('change', maj);
  }, []);
  return mobile;
}

export default function MurAtlas({ photos, localisations, lesions }: { photos: PhotoAffichee[]; localisations: string[]; lesions: string[] }) {
  const [sel, setSel] = React.useState<Record<Cle, string[]>>({ pathologie: [], localisation: [], lesion: [] });
  const { ouvert: deverrouille, details } = useCoffre();
  const [devoilees, setDevoilees] = React.useState<string[]>([]);
  const [vue, setVue] = React.useState<number | null>(null);
  const [volet, setVolet] = React.useState<Cle | null>(null);
  const mobile = useMobile();

  const valeurs: Record<Cle, (p: PhotoAffichee) => string[]> = {
    pathologie: (p) => [p.pathologie],
    localisation: (p) => [p.localisation],
    lesion: (p) => p.lesions,
  };
  const options = (cle: Cle, liste: string[]): Option[] =>
    liste.map((v) => ({ valeur: v, libelle: v, compte: photos.filter((p) => valeurs[cle](p).includes(v)).length }));
  const pathologies = [...new Set(photos.map((p) => p.pathologie))].sort((a, b) => a.localeCompare(b, 'fr'));
  const listes: Record<Cle, Option[]> = {
    pathologie: options('pathologie', pathologies),
    localisation: options('localisation', localisations),
    lesion: options('lesion', lesions),
  };

  const visibles = photos.filter((p) => (Object.keys(sel) as Cle[]).every((k) => !sel[k].length || valeurs[k](p).some((v) => sel[k].includes(v))));

  // Une photo verrouillée devient une photo ordinaire une fois le coffre ouvert : elle passe alors par /api/photos.
  const enPhoto = (p: PhotoAffichee, grande = false): Photo => {
    const ouverte = p.etat === 'verrouillee' && deverrouille;
    return {
      id: p.id, alt: details[p.id]?.alt ?? p.alt, pathologie: p.pathologie, localisation: p.localisation, lesions: p.lesions, legende: details[p.id]?.legende ?? p.legende, source: details[p.id]?.source ?? p.source, hrefFiche: p.hrefFiche,
      etat: ouverte ? 'libre' : p.etat,
      src: ouverte ? `/api/photos/${p.id}?taille=${grande ? 1600 : 480}` : grande ? p.srcGrande : p.src,
    };
  };
  const ouvrables = visibles.filter((p) => p.etat !== 'verrouillee' || deverrouille);
  const actifs = (Object.keys(sel) as Cle[]).flatMap((k) => sel[k].map((v) => ({ k, v })));
  const changer = (k: Cle) => (s: string[]) => setSel((x) => ({ ...x, [k]: s }));
  const nTotal = visibles.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="aod-filtres">
        {(Object.keys(TITRES) as Cle[]).map((k) =>
          mobile ? (
            <button key={k} type="button" className={`aod-filtre${sel[k].length ? ' aod-filtre--actif' : ''}`} onClick={() => setVolet(k)} aria-haspopup="dialog">
              {sel[k].length ? `${TITRES[k]} · ${sel[k].length}` : TITRES[k]}<IconeChevronBas taille={16} />
            </button>
          ) : (
            <FiltreDeroulant key={k} titre={TITRES[k]} options={listes[k]} selection={sel[k]} onChange={changer(k)} />
          ),
        )}
        <span style={{ marginLeft: 'auto' }}><Compteur n={nTotal} singulier="photo" pluriel="photos" aucun="Aucune photo" /></span>
      </div>

      {actifs.length > 0 && (
        <div className="aod-filtres">
          {actifs.map(({ k, v }) => <Pastille key={k + v} libelle={v} onRetirer={() => changer(k)(sel[k].filter((x) => x !== v))} />)}
          <Bouton variante="discret" compact onClick={() => setSel({ pathologie: [], localisation: [], lesion: [] })}>Tout effacer</Bouton>
        </div>
      )}

      {photos.length === 0 ? (
        <EtatVide titre="Les photos arrivent bientôt" texte="L’atlas se remplit au fil des ajouts." />
      ) : nTotal === 0 ? (
        <EtatVide titre="Aucune photo ne correspond" texte="Retirez un filtre pour élargir la recherche."
          action={<Bouton variante="secondaire" compact onClick={() => setSel({ pathologie: [], localisation: [], lesion: [] })}>Effacer les filtres</Bouton>} />
      ) : (
        <div className="aod-galerie">
          {visibles.map((p) => (
            <Vignette key={p.id} photo={enPhoto(p)} hrefCoffre="/coffre-fort" devoilee={devoilees.includes(p.id)}
              onDevoiler={() => setDevoilees((d) => [...d, p.id])} onOuvrir={() => setVue(ouvrables.findIndex((o) => o.id === p.id))} />
          ))}
        </div>
      )}

      {vue !== null && vue >= 0 && (
        <Visionneuse photos={ouvrables.map((p) => enPhoto(p, true))} index={vue} onChanger={setVue} onFermer={() => setVue(null)}
          devoilees={devoilees} onDevoiler={(id) => setDevoilees((d) => [...d, id])} />
      )}

      {volet && (
        <VoletFiltre titre={TITRES[volet]} options={listes[volet]} selection={sel[volet]} onChange={changer(volet)} ouvert onFermer={() => setVolet(null)}
          libelleAction={nTotal === 0 ? 'Aucune photo' : nTotal === 1 ? 'Afficher 1 photo' : `Afficher ${nTotal} photos`} />
      )}
    </div>
  );
}
