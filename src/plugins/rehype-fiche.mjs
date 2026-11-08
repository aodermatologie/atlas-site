// Transforme le Markdown d'une fiche :
// 1. « > [!ALERTE] … », « > [!PRECAUTION] … », « > [!RETENIR] … » deviennent les trois encadrés du design system ;
// 2. chaque titre « ## Titre | sous-titre » ouvre une section repliable, fermée par défaut (<details>) ;
// 3. une ligne « [[photos]] » marque l'endroit où la page insère les photos de la pathologie
//    (le nombre de photos s'ajoute au sous-titre de la section : « Lésions… · 3 photos »).
const ENCADRES = {
  ALERTE: ['alerte', 'Signe d’alerte'],
  PRECAUTION: ['precaution', 'Précaution'],
  RETENIR: ['retenir', 'À retenir'],
};

const el = (tagName, properties, children = []) => ({ type: 'element', tagName, properties, children });
const txt = (value) => ({ type: 'text', value });

const CHEVRON = el('svg', { className: ['aod-section__chevron'], width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ariaHidden: 'true' },
  [el('path', { d: 'm6 9 6 6 6-6' })]);

function texte(node) {
  if (node.type === 'text') return node.value;
  return (node.children ?? []).map(texte).join('');
}

function encadre(node) {
  if (node.type !== 'element' || node.tagName !== 'blockquote') return node;
  const enfants = node.children.filter((c) => !(c.type === 'text' && !c.value.trim()));
  const premier = enfants[0];
  if (!premier || premier.tagName !== 'p') return node;
  const debut = premier.children[0];
  const m = debut?.type === 'text' && debut.value.match(/^\s*\[!(ALERTE|PRECAUTION|RETENIR)\]\s*/);
  if (!m) return node;
  const [type, etiquette] = ENCADRES[m[1]];
  debut.value = debut.value.slice(m[0].length);
  if (!texte(premier).trim()) enfants.shift();
  return el('div', { className: ['aod-encadre', `aod-encadre--${type}`], role: type === 'alerte' ? 'note' : undefined }, [
    el('span', { className: ['aod-encadre__etiquette'] }, [txt(etiquette)]),
    el('div', { className: ['aod-encadre__corps'] }, enfants),
  ]);
}

export const MARQUEUR_PHOTOS = '[[photos]]';

function estMarqueurPhotos(node) {
  return node.type === 'element' && node.tagName === 'p' && texte(node).trim() === MARQUEUR_PHOTOS;
}

function marquerPhotos(section) {
  const textes = section.children[0].children[0];
  let sousTitre = textes.children.find((c) => c.properties?.className?.includes('aod-section__sous-titre'));
  if (!sousTitre) {
    sousTitre = el('span', { className: ['aod-section__sous-titre'] }, []);
    textes.children.push(sousTitre);
  }
  sousTitre.children.push(el('span', { dataAodNbPhotos: '' }));
}

export default function rehypeFiche() {
  return (arbre) => {
    const sortie = [];
    let section = null;
    for (const brut of arbre.children) {
      const node = encadre(brut);
      if (node.type === 'element' && node.tagName === 'h2') {
        const [titre, sousTitre] = texte(node).split('|').map((s) => s.trim());
        const id = node.properties?.id;
        const resume = el('summary', { className: ['aod-section__bouton'] }, [
          el('span', { className: ['aod-section__textes'] }, [
            el('h2', { className: ['aod-section__titre'], id }, [txt(titre)]),
            ...(sousTitre ? [el('span', { className: ['aod-section__sous-titre'] }, [txt(sousTitre)])] : []),
          ]),
          CHEVRON,
        ]);
        section = el('details', { className: ['aod-section'] }, [resume, el('div', { className: ['aod-section__contenu'] }, [])]);
        sortie.push(section);
        continue;
      }
      if (estMarqueurPhotos(node)) {
        if (section) marquerPhotos(section);
        (section ? section.children[1].children : sortie).push(el('div', { dataAodPhotos: '' }));
        continue;
      }
      if (section) section.children[1].children.push(node);
      else sortie.push(node);
    }
    arbre.children = sortie;
  };
}
