(() => {
"use strict";
/* ================= À COMPLÉTER AVANT PUBLICATION =================
   Ces informations s'affichent dans la page « À propos ». */
const SITE = {
  nom: "Le Bon Toit",
  auteur: "",                 // ton prénom ou pseudo (facultatif)
  contact: "",                // ton adresse e-mail : c'est là qu'arrivent les propositions et signalements
  formulaire: "",             // facultatif : adresse d'envoi d'un service de formulaire (ex. https://formspree.io/f/xxxx)
  liens: {                    // facultatif : tes réseaux (laisse vide ce que tu n'as pas encore)
    discord: "", instagram: "", youtube: "", facebook: "", strava: "", site: ""
  },
  hebergeur: {                // obligatoire : coordonnées de l'hébergeur du site
    nom: "Cloudflare, Inc.",
    adresse: "101 Townsend Street, San Francisco, CA 94107, États-Unis",
    telephone: ""             // facultatif : la loi n'exige que le nom et l'adresse de l'hébergeur pour un particulier anonyme
  }
};
/* ================================================================= */
/* Copie intacte de la page, utilisée pour créer les fichiers de partage */
const SOURCE = "<!doctype html>\n" + document.documentElement.outerHTML;
const RE_DONNEES = new RegExp('(<script type="application/json" id="donnees' + 'Partagees">)[\\s\\S]*?(<\/script>)');

const KEY = "carnet-cabanes-v1", KEY_FOND = "carnet-cabanes-fond", KEY_VUE = "carnet-cabanes-vue", KEY_FILTRE = "carnet-cabanes-filtres",
  KEY_CALQUES = "carnet-cabanes-calques", KEY_COUL = "carnet-cabanes-couleurs", KEY_BK = "carnet-cabanes-derniere-sauvegarde", KEY_NOM = "carnet-cabanes-prenom",
  SS_MON = "carnet-cabanes-voir-mon-carnet", SS_MSG = "carnet-cabanes-message",
  KEY_FAVS = "le-bon-toit-favoris", KEY_INFO = "le-bon-toit-info-fermee", KEY_PSEUDO = "le-bon-toit-pseudo";

let PARTAGE = null;
try { const t = document.getElementById("donneesPartagees").textContent.trim(); if (t) PARTAGE = JSON.parse(t); } catch(e){}
const ssGet = k => { try { return sessionStorage.getItem(k); } catch(e){ return null; } };
const ssSet = (k,v) => { try { v == null ? sessionStorage.removeItem(k) : sessionStorage.setItem(k,v); } catch(e){} };
const modePartage = !!(PARTAGE && Array.isArray(PARTAGE.cabanes) && !ssGet(SS_MON));
if (modePartage) document.body.classList.add("partage");
const P = (perso, pub) => modePartage ? pub : perso;
/* Coordonnées du site : saisies au moment de « Préparer la version en ligne », puis intégrées au fichier publié */
const KEY_SITE = "le-bon-toit-site";
(() => { let m = null; try { m = modePartage ? PARTAGE.site : JSON.parse(localStorage.getItem(KEY_SITE)); } catch(e){}
  if (!m) return;
  if (m.contact && !SITE.contact) SITE.contact = m.contact;
  if (m.formulaire && !SITE.formulaire) SITE.formulaire = m.formulaire;
  if (m.hebergeur && m.hebergeur.nom) SITE.hebergeur = {...SITE.hebergeur, ...m.hebergeur};
  if (m.telephone && !SITE.hebergeur.telephone) SITE.hebergeur.telephone = m.telephone;
  if (m.auteur && !SITE.auteur) SITE.auteur = m.auteur;
  if (m.liens) for (const k in m.liens) if (m.liens[k] && !SITE.liens[k]) SITE.liens[k] = m.liens[k]; })();   /* libellé selon le mode : carnet perso ou site public */
const AUTEUR = modePartage ? (PARTAGE.par || "") : (SITE.auteur || (() => { try { return localStorage.getItem("carnet-cabanes-prenom") || ""; } catch(e){ return ""; } })());

const OPTIONS = {
  type: ["Cabane pastorale","Cabane non gardée","Refuge gardé","Gîte d'étape","Orri / abri","Autre"],
  etat: ["Inconnu","Très bon","Bon","Correct","Délabré"],
  chauffage: ["Inconnu","Cheminée","Poêle","Aucun"],
  bois: ["Inconnu","Bois sur place","Un peu de bois","À monter soi-même"],
  eau: ["Inconnu","Source à côté","Source < 15 min","Torrent / lac","Pas d'eau"],
  couchage: ["Inconnu","Bat-flanc","Matelas","Lits","Au sol"],
  ouverture: ["Inconnu","Toujours ouvert","Partie hiver ouverte","Fermé hors saison"],
  reseau: ["Inconnu","Oui","Faible","Non"],
  difficulte: ["Inconnu","Facile","Moyen","Difficile","Très difficile"],
  balisage: ["Inconnu","Sentier balisé","Sentier non balisé","Hors sentier"],
  meteo: ["Non précisé","Grand beau","Nuageux","Brouillard","Pluie","Orage","Neige","Grand vent"],
  monde: ["Non précisé","Seul(s)","1 à 5 personnes","Bien rempli","Complet"]
};
const CRITERES = [["cadre","Cadre et vue"],["confort","Confort"],["chaleur","Chauffage"],["eau","Eau"],["balade","Beauté de la marche"],["calme","Tranquillité"]];
const CRIT_COURT = {cadre:"Cadre",confort:"Confort",chaleur:"Chauffage",eau:"Eau",balade:"Marche",calme:"Calme"};
const EQUIP = [["eauPotable","Eau potable"],["hiver","Adaptée à l'hiver"],["foret","Forêt à proximité"],["lac","Lac à proximité"],["vue","Belle vue"],
  ["sommet","Sommet à proximité"],["ferme","Fermée au vent"],["table","Table et bancs"],["couvertures","Couvertures"],["vaisselle","Vaisselle, casseroles"],
  ["toilettes","Toilettes"],["reserveBois","Réserve de bois"],["raquettes","Accès raquettes / ski"],["vtt","Accessible à VTT"],["bivouac","Bivouac possible autour"],
  ["riviere","Rivière / torrent à proximité"],["electricite","Électricité (prises, éclairage)"]];
const WARN = [["patous","Patous / troupeaux l'été"],["frequentee","Très fréquentée"],["expose","Accès exposé (avalanche, passage aérien)"],["rongeurs","Souris / rongeurs"]];
const SAISONS = [["printemps","Printemps"],["ete","Été"],["automne","Automne"],["hiver","Hiver"]];
const DIFF = ["Facile","Moyen","Difficile","Très difficile"];

const F_EQUIP = [
  ["feu","Cheminée / poêle", c => aFeu(c)],
  ["boisPlace","Bois sur place", c => aBois(c)],
  ["eauProche","Point d'eau proche", c => aEau(c)],
  ["eauPotable","Eau potable", c => !!c.equip.eauPotable],
  ["hiver","Adaptée à l'hiver", c => !!c.equip.hiver || c.ouverture === "Partie hiver ouverte"],
  ["toujours","Toujours ouverte", c => c.ouverture === "Toujours ouvert" || c.ouverture === "Partie hiver ouverte"],
  ["foret","Forêt", c => !!c.equip.foret],
  ["lac","Lac", c => !!c.equip.lac],
  ["vue","Belle vue", c => !!c.equip.vue || (c.crit.cadre||0) >= 4],
  ["sommet","Sommet proche", c => !!c.equip.sommet],
  ["ferme","Fermée au vent", c => !!c.equip.ferme],
  ["table","Table et bancs", c => !!c.equip.table],
  ["couvertures","Couvertures", c => !!c.equip.couvertures],
  ["vaisselle","Vaisselle", c => !!c.equip.vaisselle],
  ["toilettes","Toilettes", c => !!c.equip.toilettes],
  ["matelas","Matelas ou lits", c => c.couchage === "Matelas" || c.couchage === "Lits"],
  ["raquettes","Accès raquettes / ski", c => !!c.equip.raquettes],
  ["vtt","Accessible à VTT", c => !!c.equip.vtt],
  ["bivouac","Bivouac autour", c => !!c.equip.bivouac],
  ["riviere","Rivière proche", c => !!c.equip.riviere],
  ["electricite","Électricité", c => !!c.equip.electricite],
  ["reseau","Réseau", c => c.reseau === "Oui" || c.reseau === "Faible"]
];
const F_EVITER = [
  ["patous","Sans patous", c => !c.warn.patous],
  ["frequentee","Peu fréquentée", c => !c.warn.frequentee && c.crit.calme !== 1],
  ["expose","Accès non exposé", c => !c.warn.expose],
  ["rongeurs","Sans rongeurs", c => !c.warn.rongeurs],
  ["delabre","Pas délabrée", c => c.etat !== "Délabré"],
  ["berger","Sans berger l'été", c => !c.berger]
];

const EXEMPLES = [
  {id:"ex1", exemple:true, nom:"Exemple · Cabane du replat", type:"Cabane pastorale", statut:"faite", coeur:true,
   lat:42.8705, lng:-0.4380, alt:1780, massif:"Exemple", depart:"Parking du lac", dist:4.2, dplus:650, duree:"2h", difficulte:"Moyen", balisage:"Sentier balisé",
   etat:"Bon", chauffage:"Cheminée", bois:"Un peu de bois", eau:"Source à côté", couchage:"Bat-flanc", places:6, ouverture:"Toujours ouvert", reseau:"Non",
   equip:{foret:true, vue:true, ferme:true, table:true, eauPotable:true, bivouac:true}, warn:{patous:true}, saisons:["ete","automne"],
   crit:{cadre:5, confort:3, chaleur:4, eau:5, balade:4, calme:4},
   visites:[{id:"v1", date:"2026-08-14", nuit:true, meteo:"Grand beau", monde:"Seul(s)", avec:"", montee:"1h50", etat:"Bon", bois:"Un peu de bois", eau:"Source à côté",
     crit:{cadre:5, confort:3, chaleur:4, eau:5, balade:4, calme:4}, coeur:true, com:"Fiche d'exemple : voilà à quoi ressemble un retour de sortie."}],
   lien:"", notes:"Fiche d'exemple. Supprime-la quand tu as ajouté tes propres cabanes.", cree:1},
  {id:"ex2", exemple:true, nom:"Exemple · Orri sous la crête", type:"Orri / abri", statut:"afaire", envie:4,
   lat:42.8350, lng:-0.3920, alt:2050, massif:"Exemple", depart:"", dist:6, dplus:1100, duree:"3h30", difficulte:"Difficile", balisage:"Sentier non balisé",
   etat:"Inconnu", chauffage:"Aucun", bois:"À monter soi-même", eau:"Torrent / lac", couchage:"Au sol", places:2, ouverture:"Toujours ouvert", reseau:"Inconnu",
   equip:{lac:true, sommet:true}, warn:{}, saisons:["ete"], crit:{}, visites:[], lien:"", notes:"Une cabane à faire est en orange sur la carte.", cree:2}
];

/*@@CULTURE@@*/
/* Textes proposés par les randonneurs et validés par l'auteur */
const KEY_CULT = "le-bon-toit-culture-ajouts";
const culturesAjoutees = () => { try { return modePartage ? (PARTAGE.culture || []) : (JSON.parse(localStorage.getItem(KEY_CULT)) || []); } catch(e){ return []; } };
culturesAjoutees().forEach(a => { if (a && a.id && a.titre && !CULTURE.some(x => x.id === a.id)) CULTURE.push(a); });

/* ================= Utilitaires ================= */
const $ = s => document.querySelector(s);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,7);
const esc = s => String(s ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const num = v => (v === "" || v == null || isNaN(+v)) ? null : +v;
const fr1 = v => (Math.round(v*10)/10).toFixed(1).replace(".", ",");
const fmtKm = v => v == null ? "" : String(v).replace(".", ",") + " km";
const fmtAlt = v => v == null ? "" : Math.round(v).toLocaleString("fr-FR").replace(/\u202f/g, "\u00a0") + "\u00a0m";
const fmtDate = d => d ? new Date(d + "T12:00:00").toLocaleDateString("fr-FR", {day:"numeric", month:"long", year:"numeric"}) : "";
const fmtDateCourt = d => d ? new Date(d + "T12:00:00").toLocaleDateString("fr-FR", {day:"2-digit", month:"2-digit", year:"2-digit"}) : "";
const auj = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0,10); };
const fmtDuree = m => { m = Math.round(m/5)*5; const h = Math.floor(m/60), r = m%60; return h ? `${h}h${r?String(r).padStart(2,"0"):""}` : `${r} min`; };
const fmtTaille = o => o > 1e6 ? (o/1e6).toFixed(o > 1e7 ? 0 : 1).replace(".",",") + " Mo" : Math.max(1, Math.round(o/1e3)) + " ko";
const slug = s => String(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,40) || "carnet";
const lsGet = k => { try { return localStorage.getItem(k); } catch(e){ return null; } };
const lsSet = (k,v) => { try { localStorage.setItem(k,v); } catch(e){} };
let toastT;
function toast(msg, ms=3200){ const t=$("#toast"); t.textContent=msg; t.hidden=false; clearTimeout(toastT); toastT=setTimeout(()=>t.hidden=true, ms); }

function minutes(s){
  if (s == null || s === "") return null;
  s = String(s).toLowerCase().replace(/\s+/g, "").replace(",", ".");
  let m = s.match(/^(\d+)(?:h|:)(\d{1,2})?(?:min|mn)?$/); if (m) return (+m[1])*60 + (+m[2]||0);
  m = s.match(/^(\d+)(?:min|mn|m)$/); if (m) return +m[1];
  m = s.match(/^(\d+(?:\.\d+)?)$/); if (m) return +m[1] <= 12 ? Math.round(+m[1]*60) : +m[1];
  return null;
}
function hav(a, b){ const R = 6371000, r = Math.PI/180, dLa = (b[0]-a[0])*r, dLo = (b[1]-a[1])*r;
  const x = Math.sin(dLa/2)**2 + Math.cos(a[0]*r)*Math.cos(b[0]*r)*Math.sin(dLo/2)**2; return 2*R*Math.asin(Math.sqrt(x)); }

const aFeu = c => c.chauffage === "Cheminée" || c.chauffage === "Poêle";
const aBois = c => c.bois === "Bois sur place" || c.bois === "Un peu de bois" || !!c.equip.reserveBois;
const aEau = c => c.eau === "Source à côté" || c.eau === "Source < 15 min" || c.eau === "Torrent / lac";
function score(c){
  const v = CRITERES.map(([k]) => c.crit[k]).filter(x => x > 0);
  return v.length ? v.reduce((a,b)=>a+b,0) / v.length : 0;
}
const ressenti = c => c.ressenti || 0;
const noteAff = c => ressenti(c) || score(c);
const nbNuits = c => c.visites.filter(v => v.nuit).length;
const derniere = c => c.visites.reduce((m,v) => v.date && v.date > m ? v.date : m, "") || "";
const couleurScore = s => `var(--n${Math.round(s)})`;
let modeCouleur = lsGet(KEY_COUL) === "note" ? "note" : "statut";
const couleur = c => c.statut === "afaire" ? "var(--afaire)" : (modeCouleur === "note" ? couleurScore(noteAff(c)) : "var(--faite)");
const badgeRess = c => ressenti(c) ? `<span class="ress" title="${P("Mon ressenti","Note de l'auteur")}">★ ${fr1(ressenti(c))}</span>` : "";
const badgeCrit = c => score(c) ? `<span class="score" style="--c:${couleurScore(score(c))}" title="Note par critères">${fr1(score(c))}</span>` : "";
const badgeScore = c => (badgeRess(c) + badgeCrit(c)) || `<span class="score vide">–</span>`;
function etoiles(n){ n = Math.round(n||0); return `<span class="stars" aria-label="${n} sur 5">${"★".repeat(n)}<i>${"★".repeat(5-n)}</i></span>`; }
function acces(c){ return [c.dist!=null?fmtKm(c.dist):"", c.dplus!=null?c.dplus+" m D+":"", c.duree||""].filter(Boolean).join(" · "); }
function feats(c){
  const f = [];
  if (aFeu(c)) f.push(`<span class="feat"><svg><use href="#i-feu"/></svg>${esc(c.chauffage)}</span>`);
  if (aBois(c)) f.push(`<span class="feat"><svg><use href="#i-bois"/></svg>Bois</span>`);
  if (aEau(c)) f.push(`<span class="feat"><svg><use href="#i-eau"/></svg>${c.equip.eauPotable ? "Eau potable" : "Eau"}</span>`);
  if (c.equip.hiver || c.ouverture === "Partie hiver ouverte") f.push(`<span class="feat"><svg><use href="#i-neige"/></svg>Hiver</span>`);
  if (c.places) f.push(`<span class="feat"><svg><use href="#i-lit"/></svg>${c.places} pl.</span>`);
  if (c.photos.length) f.push(`<span class="feat"><svg><use href="#i-photo"/></svg>${c.photos.length}</span>`);
  return f.join("");
}
/* Mention discrète : cabane testée par le créateur du site, ou pas encore */
const testeePar = () => AUTEUR ? `Testée par ${esc(AUTEUR)}` : P("Faite", "Testée par le créateur");
const tagStatut = c => c.statut === "afaire"
  ? `<span class="statut afaire">${P("À faire", "Pas encore testée")}</span>`
  : `<span class="statut" title="${P("Tu y es allé","Le créateur du site y est allé")}"><svg aria-hidden="true"><use href="#i-check"/></svg>${testeePar()}</span>`;
function rateWidget(el, label){
  let val = 0, orig = 0, touched = false;
  el.classList.add("rate"); el.setAttribute("role","radiogroup"); el.setAttribute("aria-label", label);
  el.innerHTML = [1,2,3,4,5].map(i => `<button type="button" role="radio" data-n="${i}" aria-label="${i} sur 5">★</button>`).join("") + `<span class="rv"></span>`;
  const maj = () => { const r = Math.round(val);
    el.querySelectorAll("button").forEach(b => { const n = +b.dataset.n; b.classList.toggle("on", n <= r); b.setAttribute("aria-checked", n === r); });
    el.querySelector(".rv").textContent = val ? (Number.isInteger(val) ? val : fr1(val)) : ""; };
  el.addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; const n = +b.dataset.n; val = (Math.round(val) === n ? 0 : n); touched = true; maj(); });
  return { set(v){ val = orig = v || 0; touched = false; maj(); }, get(){ return touched ? val : orig; } };
}
const selectOpts = (el, list) => el.innerHTML = list.map(o => `<option>${esc(o)}</option>`).join("");
async function copier(txt){
  try { await navigator.clipboard.writeText(txt); return true; }
  catch(e){ const ta = document.createElement("textarea"); ta.value = txt; document.body.appendChild(ta); ta.select(); let ok = false; try { ok = document.execCommand("copy"); } catch(_){} ta.remove(); return ok; }
}
function telecharger(nom, contenu, type){
  const url = URL.createObjectURL(contenu instanceof Blob ? contenu : new Blob([contenu], {type}));
  const a = document.createElement("a"); a.href = url; a.download = nom; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url), 4000);
}
const blobVersDataURL = b => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(b); });
function dataURLVersBlob(d){ const [h, b64] = d.split(","); const mime = (h.match(/data:([^;]+)/)||[])[1] || "image/jpeg";
  const bin = atob(b64); const u = new Uint8Array(bin.length); for (let i=0;i<bin.length;i++) u[i] = bin.charCodeAt(i); return new Blob([u], {type:mime}); }

/* ================= IndexedDB (photos, réglages) ================= */
const idb = (() => {
  let dbp = null;
  const ouvrir = () => dbp || (dbp = new Promise((res, rej) => {
    const r = indexedDB.open("carnet-cabanes", 1);
    r.onupgradeneeded = () => { r.result.createObjectStore("photos", {keyPath:"id"}); r.result.createObjectStore("meta"); };
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  }));
  const req = r => new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  const st = async (n, m) => (await ouvrir()).transaction(n, m).objectStore(n);
  return {
    get: async (n,k) => req((await st(n,"readonly")).get(k)),
    put: async (n,v,k) => req(k === undefined ? (await st(n,"readwrite")).put(v) : (await st(n,"readwrite")).put(v,k)),
    del: async (n,k) => req((await st(n,"readwrite")).delete(k)),
    all: async n => req((await st(n,"readonly")).getAll())
  };
})();

/* ================= Données ================= */
function migrer(c){
  if (c.statut !== "afaire") c.statut = "faite";
  c.equip = c.equip || {}; c.warn = c.warn || {}; c.saisons = Array.isArray(c.saisons) ? c.saisons : [];
  c.crit = c.crit || {}; c.visites = Array.isArray(c.visites) ? c.visites : []; c.photos = Array.isArray(c.photos) ? c.photos : [];
  c.avisV = Array.isArray(c.avisV) ? c.avisV : []; c.sigV = Array.isArray(c.sigV) ? c.sigV : [];
  if (c.statut === "faite" && !c.visites.length && c.date) c.visites.push({id:uid(), date:c.date});
  for (const k of ["difficulte","balisage","etat","chauffage","bois","eau","couchage","ouverture","reseau"]) if (!c[k]) c[k] = "Inconnu";
  if (c.note && c.ressenti == null) c.ressenti = c.note;   /* ancienne note globale = ressenti */
  delete c.note;
  if (c.v4 !== 1 && typeof c.id === "string" && c.id.startsWith("xl-")){   /* complète une fois les cabanes importées de l'Excel */
    const k = c.id.slice(3);
    if (XL_BERGER.has(k) && c.berger == null) c.berger = true;
    if (XL_RIVIERE.has(k) && c.equip.riviere == null) c.equip.riviere = true;
    c.v4 = 1;
  }
  return c;
}
const XL_BERGER = new Set(["llassies","pradettes","lhurs","caraussans","barlonguere","port-urets","col-terme","sarnes","etang-tort","prat-baillat","cuyalar-lagne","lapassa","saoutelle","caillaous","ansabere","bassia","esquierry","rat"]);
const XL_RIVIERE = new Set(["rieutort","barlonguere","lacarde","counc","petite-estibere","lourde","sausse","pomero","esquierry","hilette","urets"]);
function chargerLocal(){
  try { const r = localStorage.getItem(KEY); if (r !== null){ const d = JSON.parse(r); if (Array.isArray(d)) return d.map(migrer); } } catch(e){}
  return null;
}
let cabanes = modePartage ? PARTAGE.cabanes.map(migrer) : (chargerLocal() || JSON.parse(JSON.stringify(EXEMPLES)).map(migrer));
let favoris = new Set(); try { favoris = new Set(JSON.parse(lsGet(KEY_FAVS)) || []); } catch(e){}
const sauverFavoris = () => lsSet(KEY_FAVS, JSON.stringify([...favoris]));
const photosDB = new Map();
const urlCache = new Map();
function urlPhoto(p){ if (!urlCache.has(p.id)) urlCache.set(p.id, URL.createObjectURL(p.blob)); return urlCache.get(p.id); }

let bkTimer = null;
function sauver(){
  if (modePartage) return;
  try { localStorage.setItem(KEY, JSON.stringify(cabanes)); }
  catch(e){ toast("Impossible d'enregistrer dans ce navigateur. Télécharge une sauvegarde."); }
  clearTimeout(bkTimer); bkTimer = setTimeout(ecrireSauvegarde, 1500);
}

/* ================= Carte ================= */
const ign = (layer, fmt) => `https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${layer}&STYLE=normal&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=${fmt}`;
const OSM = "© contributeurs OpenStreetMap";
const fonds = {
  "Rando · OSM + sentiers": L.layerGroup([
    L.tileLayer("https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png", {maxZoom:20, attribution:OSM+" · tuiles OSM France"}),
    L.tileLayer("https://tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png", {maxZoom:18, opacity:.9, attribution:"sentiers © Waymarked Trails"})
  ]),
  "Topo · OpenTopoMap": L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {maxZoom:17, attribution:OSM+", SRTM · © OpenTopoMap (CC-BY-SA)"}),
  "Topo · IGN Espagne (MTN)": L.tileLayer("https://www.ign.es/wmts/mapa-raster?layer=MTN&style=default&tilematrixset=GoogleMapsCompatible&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/jpeg&TileMatrix={z}&TileCol={x}&TileRow={y}", {maxZoom:18, attribution:"© IGN España"}),
  "Plan IGN": L.tileLayer(ign("GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2","image/png"), {maxZoom:19, attribution:"© IGN Géoplateforme"}),
  "OpenStreetMap": L.tileLayer("https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png", {maxZoom:20, attribution:OSM+" · tuiles OSM France"}),
  "CyclOSM (sentiers, pistes)": L.tileLayer("https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png", {maxZoom:20, attribution:OSM+" · CyclOSM"}),
  "OSM Humanitaire": L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {maxZoom:20, attribution:OSM+" · HOT"}),
  "Photo aérienne IGN": L.tileLayer(ign("ORTHOIMAGERY.ORTHOPHOTOS","image/jpeg"), {maxZoom:19, attribution:"© IGN Géoplateforme"})
};
/* Le serveur officiel d'OpenStreetMap refuse les pages ouvertes depuis un fichier : on ne le propose qu'une fois le carnet en ligne */
if (location.protocol === "https:") fonds["OpenStreetMap (officiel) + sentiers"] = L.layerGroup([
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {maxZoom:19, attribution:OSM}),
  L.tileLayer("https://tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png", {maxZoom:18, opacity:.9, attribution:"sentiers © Waymarked Trails"})
]);
const calques = {
  "Sentiers de rando balisés": L.tileLayer("https://tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png", {maxZoom:18, opacity:.85, attribution:"© Waymarked Trails"}),
  "Pentes > 30° (IGN)": L.tileLayer(ign("GEOGRAPHICALGRIDSYSTEMS.SLOPES.MOUNTAIN","image/png"), {maxZoom:17, opacity:.55, attribution:"© IGN"})
};
let vue = null; try { vue = JSON.parse(lsGet(KEY_VUE)); if (!vue || !isFinite(vue.lat) || !isFinite(vue.lng) || !isFinite(vue.z)) vue = null; } catch(e){}
const map = L.map("map", {zoomControl:false}).setView(vue ? [vue.lat, vue.lng] : [42.85, 0.15], vue ? vue.z : 9);
L.control.zoom({position:"topright"}).addTo(map);
L.control.scale({imperial:false, position:"bottomright"}).addTo(map);
if (!lsGet("carnet-cabanes-fond-rando")){ lsSet(KEY_FOND, "Rando · OSM + sentiers"); lsSet("carnet-cabanes-fond-rando", "1"); }  /* nouvelle carte rando affichée une première fois */
const fondNom = fonds[lsGet(KEY_FOND)] ? lsGet(KEY_FOND) : "Rando · OSM + sentiers";
fonds[fondNom].addTo(map);
let calquesOn = []; try { calquesOn = JSON.parse(lsGet(KEY_CALQUES)) || []; } catch(e){}
calquesOn.forEach(n => calques[n] && calques[n].addTo(map));
L.control.layers(fonds, calques, {position:"topright"}).addTo(map);
/* La carte se recalcule dès que sa zone change de taille (sinon une partie peut rester vide) */
if (window.ResizeObserver){ let roT; new ResizeObserver(() => { clearTimeout(roT); roT = setTimeout(() => { if (!$("#map").clientWidth) return; map.invalidateSize({pan:false}); if (typeof placerIJ === "function") placerIJ(); }, 60); }).observe($("#map")); }
addEventListener("load", () => map.invalidateSize({pan:false}));
map.on("baselayerchange", e => lsSet(KEY_FOND, e.name));
map.on("overlayadd overlayremove", () => lsSet(KEY_CALQUES, JSON.stringify(Object.keys(calques).filter(n => map.hasLayer(calques[n])))));
map.on("moveend", () => { if (modePartage || !$("#map").clientWidth) return; const c = map.getCenter(); if (isFinite(c.lat) && isFinite(c.lng)) lsSet(KEY_VUE, JSON.stringify({lat:c.lat, lng:c.lng, z:map.getZoom()})); });

const Legende = L.Control.extend({ options:{position:"bottomleft"}, onAdd(){
  const d = L.DomUtil.create("div", "legende");
  d.innerHTML = `<div class="seg" role="group" aria-label="Couleur des repères"><button type="button" data-c="statut">Par statut</button><button type="button" data-c="note">Par note</button></div><div class="lg-items" id="lgItems"></div>`;
  L.DomEvent.disableClickPropagation(d); L.DomEvent.disableScrollPropagation(d);
  d.addEventListener("click", e => { const b = e.target.closest("button[data-c]"); if (!b) return; modeCouleur = b.dataset.c; lsSet(KEY_COUL, modeCouleur); majLegende(); rendre(); });
  return d; }});
map.addControl(new Legende());
function majLegende(){
  document.querySelectorAll(".legende [data-c]").forEach(b => b.classList.toggle("on", b.dataset.c === modeCouleur));
  const it = $("#lgItems"); if (!it) return;
  it.innerHTML = (modeCouleur === "statut"
    ? `<div><i style="background:var(--faite)"></i>${P("Faite (déjà visitée)","Testée par le créateur")}</div>`
    : `<div><span class="lg-grad"></span> Note 1 → 5</div><div><i style="background:var(--n0)"></i>${P("Faite, pas notée","Testée, pas notée")}</div>`)
    + `<div><i style="background:var(--afaire)"></i>${P("À faire","Pas encore testée")}</div><div><span class="coeur" style="width:11px;text-align:center">♥</span>Coup de cœur${P(""," de l'auteur")}</div>`
    + (typeof riOn !== "undefined" && riOn ? `<div><i style="background:#fff;box-shadow:inset 0 0 0 2px #56604F"></i>Autres abris (refuges.info), non vérifiés</div>` : "");
}

const pinSvg = `<svg viewBox="0 0 32 40"><path class="p" d="M16 38.5S3.5 24.5 3.5 15.5a12.5 12.5 0 1 1 25 0c0 9-12.5 23-12.5 23z"/><path class="h" d="M9.5 17.5 16 11l6.5 6.5V22h-13z"/><circle class="cc" cx="26" cy="5.5" r="4.5"/></svg>`;
function icone(c, sel){
  return L.divIcon({className:"pin"+(c.coeur?" coeur":"")+(sel?" sel":""),
    html:pinSvg.replace("<svg", `<svg style="--c:${couleur(c)}"`), iconSize:[30,38], iconAnchor:[15,37], popupAnchor:[0,-34]});
}
const iconeTmp = L.divIcon({className:"pin tmp", html:pinSvg, iconSize:[30,38], iconAnchor:[15,37]});
const iconeDepart = L.divIcon({className:"flag", html:`<svg viewBox="0 0 28 34"><path d="M5 33V3" stroke="#1c2924" stroke-width="2.5" stroke-linecap="round"/><path d="M6 3h17l-4 6 4 6H6z" fill="#2c7a4b" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/></svg>`, iconSize:[28,34], iconAnchor:[5,33]});
const calque = L.layerGroup().addTo(map);
const traceLayer = L.layerGroup().addTo(map);
const marqueurs = new Map();

function popupHtml(c){
  const ph = idsPhotos(c)[0], p = ph ? photosDB.get(ph) : null;
  return `<div class="pop">${p?`<img class="pop-img" src="${p.thumb}" alt="">`:""}<h4>${c.coeur?'<span class="coeur">♥</span> ':""}${esc(c.nom)}</h4>
    <div class="sub">${esc(c.type)}${c.alt!=null?" · "+fmtAlt(c.alt):""}${c.massif?" · "+esc(c.massif):""}</div>
    <div class="line">${tagStatut(c)}${c.statut==="afaire" ? (c.envie?etoiles(c.envie):"") : badgeScore(c)}</div>
    ${acces(c) ? `<div class="sub" style="margin:6px 0 0">${esc(acces(c))}</div>` : ""}
    <div class="line" style="margin-top:6px">${feats(c)}</div>
    <div class="act"><button class="btn primary" type="button" data-voir="${esc(c.id)}">Voir la fiche</button>
    ${c.statut==="afaire" && !modePartage ? `<button class="btn ghost" type="button" data-fait="${esc(c.id)}">J'y suis allé</button>` : ""}</div></div>`;
}

/* ================= Filtres ================= */
const DEF_FILTRE = {q:"", statut:"tous", types:[], ressMin:0, noteMin:0, envieMin:0, coeur:false, nuit:false, photos:false, favoris:false, altMin:null, altMax:null, distMax:null, dplusMax:null,
  dureeMax:null, diffMax:"", balisage:"", placesMin:null, equip:[], saisons:[], eviter:[], massif:""};
let filtre = {...DEF_FILTRE};
if (!modePartage) try { const f = JSON.parse(lsGet(KEY_FILTRE)); if (f) filtre = {...DEF_FILTRE, ...f}; } catch(e){}
const sauverFiltre = () => { if (!modePartage) lsSet(KEY_FILTRE, JSON.stringify(filtre)); };
const TRI_OPTS = modePartage
  ? [["ressenti","Tri : note de l'auteur"],["note","Tri : note détaillée"],["nom","Tri : nom"],["alt","Tri : altitude"],["dist","Tri : distance d'accès"],["duree","Tri : durée d'accès"],["visite","Tri : dernier passage"]]
  : [["ressenti","Tri : ressenti"],["note","Tri : note critères"],["envie","Tri : envie"],["nom","Tri : nom"],["alt","Tri : altitude"],["dist","Tri : distance d'accès"],["duree","Tri : durée d'accès"],["visite","Tri : dernière visite"],["recent","Tri : ajout récent"]];
let tri = lsGet("carnet-cabanes-tri") || "ressenti";
if (!TRI_OPTS.some(([k]) => k === tri)) tri = "ressenti";

function passe(c, f){
  const q = f.q.trim().toLowerCase();
  if (q && ![c.nom,c.massif,c.depart,c.notes,c.mot,c.type,...c.visites.map(v=>v.com)].join(" ").toLowerCase().includes(q)) return false;
  if (f.statut !== "tous" && c.statut !== f.statut) return false;
  if (f.types.length && !f.types.includes(c.type)) return false;
  if (f.ressMin && ressenti(c) < f.ressMin) return false;
  if (f.noteMin && score(c) < f.noteMin) return false;
  if (f.envieMin && c.statut === "afaire" && (c.envie||0) < f.envieMin) return false;
  if (f.coeur && !c.coeur) return false;
  if (f.favoris && !favoris.has(c.id)) return false;
  if (f.nuit && !nbNuits(c)) return false;
  if (f.photos && !c.photos.length) return false;
  if (f.altMin != null && (c.alt == null || c.alt < f.altMin)) return false;
  if (f.altMax != null && (c.alt == null || c.alt > f.altMax)) return false;
  if (f.distMax != null && (c.dist == null || c.dist > f.distMax)) return false;
  if (f.dplusMax != null && (c.dplus == null || c.dplus > f.dplusMax)) return false;
  if (f.dureeMax != null){ const m = minutes(c.duree); if (m == null || m > f.dureeMax*60) return false; }
  if (f.diffMax){ const i = DIFF.indexOf(c.difficulte); if (i < 0 || i > DIFF.indexOf(f.diffMax)) return false; }
  if (f.balisage === "Sentier balisé" && c.balisage !== "Sentier balisé") return false;
  if (f.balisage === "nonhors" && !(c.balisage === "Sentier non balisé" || c.balisage === "Hors sentier")) return false;
  if (f.placesMin != null && (c.places == null || c.places < f.placesMin)) return false;
  for (const k of f.equip){ const d = F_EQUIP.find(x=>x[0]===k); if (d && !d[2](c)) return false; }
  for (const k of f.eviter){ const d = F_EVITER.find(x=>x[0]===k); if (d && !d[2](c)) return false; }
  if (f.saisons.length && !f.saisons.every(s => c.saisons.includes(s))) return false;
  if (f.massif && c.massif !== f.massif) return false;
  return true;
}
const TRIS = {
  ressenti:(a,b)=>ressenti(b)-ressenti(a) || score(b)-score(a) || (b.envie||0)-(a.envie||0) || a.nom.localeCompare(b.nom,"fr"),
  note:(a,b)=>score(b)-score(a) || ressenti(b)-ressenti(a) || (b.envie||0)-(a.envie||0) || a.nom.localeCompare(b.nom,"fr"),
  envie:(a,b)=>(b.envie||0)-(a.envie||0) || score(b)-score(a),
  nom:(a,b)=>a.nom.localeCompare(b.nom,"fr"),
  alt:(a,b)=>(b.alt??-1)-(a.alt??-1),
  dist:(a,b)=>(a.dist??1e9)-(b.dist??1e9),
  duree:(a,b)=>(minutes(a.duree)??1e9)-(minutes(b.duree)??1e9),
  visite:(a,b)=>derniere(b).localeCompare(derniere(a)),
  recent:(a,b)=>(b.cree||0)-(a.cree||0)
};
const filtrees = () => cabanes.filter(c => passe(c, filtre)).sort(TRIS[tri] || TRIS.note);

function filtresActifs(){
  const a = [], f = filtre, rm = fn => () => { fn(); sauverFiltre(); syncFiltresUI(); rendre(); };
  f.types.forEach(t => a.push([t, rm(()=>f.types = f.types.filter(x=>x!==t))]));
  if (f.ressMin) a.push([`${P("Ressenti","Note")} ≥ ${String(f.ressMin).replace(".",",")}`, rm(()=>f.ressMin=0)]);
  if (f.noteMin) a.push([`${P("Note critères","Note détaillée")} ≥ ${String(f.noteMin).replace(".",",")}`, rm(()=>f.noteMin=0)]);
  if (f.envieMin) a.push([`Envie ≥ ${f.envieMin}`, rm(()=>f.envieMin=0)]);
  if (f.coeur) a.push(["♥ Coups de cœur", rm(()=>f.coeur=false)]);
  if (f.favoris) a.push(["Mes favoris", rm(()=>f.favoris=false)]);
  if (f.nuit) a.push([P("Déjà dormi","Nuit de l'auteur"), rm(()=>f.nuit=false)]);
  if (f.photos) a.push(["Avec photos", rm(()=>f.photos=false)]);
  if (f.altMin != null) a.push([`Alt. ≥ ${f.altMin} m`, rm(()=>f.altMin=null)]);
  if (f.altMax != null) a.push([`Alt. ≤ ${f.altMax} m`, rm(()=>f.altMax=null)]);
  if (f.distMax != null) a.push([`≤ ${String(f.distMax).replace(".",",")} km`, rm(()=>f.distMax=null)]);
  if (f.dplusMax != null) a.push([`D+ ≤ ${f.dplusMax} m`, rm(()=>f.dplusMax=null)]);
  if (f.dureeMax != null) a.push([`≤ ${String(f.dureeMax).replace(".",",")} h`, rm(()=>f.dureeMax=null)]);
  if (f.diffMax) a.push([`Jusqu'à ${f.diffMax.toLowerCase()}`, rm(()=>f.diffMax="")]);
  if (f.balisage) a.push([f.balisage === "nonhors" ? "Non balisé" : "Balisé", rm(()=>f.balisage="")]);
  if (f.placesMin != null) a.push([`≥ ${f.placesMin} places`, rm(()=>f.placesMin=null)]);
  f.equip.forEach(k => { const d = F_EQUIP.find(x=>x[0]===k); if (d) a.push([d[1], rm(()=>f.equip = f.equip.filter(x=>x!==k))]); });
  f.saisons.forEach(k => { const d = SAISONS.find(x=>x[0]===k); if (d) a.push([d[1], rm(()=>f.saisons = f.saisons.filter(x=>x!==k))]); });
  f.eviter.forEach(k => { const d = F_EVITER.find(x=>x[0]===k); if (d) a.push([d[1], rm(()=>f.eviter = f.eviter.filter(x=>x!==k))]); });
  if (f.massif) a.push([f.massif, rm(()=>f.massif="")]);
  return a;
}
const chipsHtml = (list, attr) => list.map(([k,l]) => `<button type="button" class="chip" data-${attr}="${esc(k)}">${esc(l)}</button>`).join("");
$("#fTypes").innerHTML = OPTIONS.type.map(t => `<button type="button" class="chip" data-t="${esc(t)}">${esc(t)}</button>`).join("");
$("#fEquip").innerHTML = chipsHtml(F_EQUIP, "e");
$("#fSaisons").innerHTML = chipsHtml(SAISONS, "s");
$("#fEviter").innerHTML = chipsHtml(F_EVITER, "v");
$("#fDiffMax").innerHTML = `<option value="">Peu importe</option>` + DIFF.map(d => `<option>${d}</option>`).join("");
const toggleArr = (arr, v) => arr.includes(v) ? arr.filter(x=>x!==v) : [...arr, v];
$("#fpanel").addEventListener("click", e => {
  const b = e.target.closest(".chip"); if (!b) return;
  if (b.dataset.t) filtre.types = toggleArr(filtre.types, b.dataset.t);
  else if (b.dataset.e) filtre.equip = toggleArr(filtre.equip, b.dataset.e);
  else if (b.dataset.s) filtre.saisons = toggleArr(filtre.saisons, b.dataset.s);
  else if (b.dataset.v) filtre.eviter = toggleArr(filtre.eviter, b.dataset.v);
  else if (b.dataset.b) filtre[b.dataset.b] = !filtre[b.dataset.b];
  sauverFiltre(); syncFiltresUI(); rendre();
});
const BIND = [["#fRessMin","ressMin",true,0],["#fNoteMin","noteMin",true,0],["#fEnvieMin","envieMin",true,0],["#fAltMin","altMin",true,null],["#fAltMax","altMax",true,null],
  ["#fDistMax","distMax",true,null],["#fDplusMax","dplusMax",true,null],["#fDureeMax","dureeMax",true,null],["#fPlacesMin","placesMin",true,null],
  ["#fDiffMax","diffMax",false,""],["#fBalisage","balisage",false,""],["#fMassif","massif",false,""]];
let fT;
BIND.forEach(([sel, k, isNum, vide]) => $(sel).addEventListener("input", e => {
  const v = e.target.value; filtre[k] = isNum ? (num(v) ?? vide) : v;
  clearTimeout(fT); fT = setTimeout(() => { sauverFiltre(); syncFiltresUI(false); rendre(); }, 120);
}));
function syncFiltresUI(champs=true){
  const f = filtre;
  document.querySelectorAll("#fTypes .chip").forEach(b => b.classList.toggle("on", f.types.includes(b.dataset.t)));
  document.querySelectorAll("#fEquip .chip").forEach(b => b.classList.toggle("on", f.equip.includes(b.dataset.e)));
  document.querySelectorAll("#fSaisons .chip").forEach(b => b.classList.toggle("on", f.saisons.includes(b.dataset.s)));
  document.querySelectorAll("#fEviter .chip").forEach(b => b.classList.toggle("on", f.eviter.includes(b.dataset.v)));
  document.querySelectorAll("#fpanel [data-b]").forEach(b => b.classList.toggle("on", !!f[b.dataset.b]));
  if (champs){
    const massifs = [...new Set(cabanes.map(c=>c.massif).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"fr"));
    $("#fMassif").innerHTML = `<option value="">Tous les massifs</option>` + massifs.map(m=>`<option>${esc(m)}</option>`).join("");
    $("#massifs").innerHTML = massifs.map(m=>`<option value="${esc(m)}">`).join("");
    BIND.forEach(([sel,k]) => { $(sel).value = f[k] ?? ""; });
    $("#q").value = f.q;
    document.querySelectorAll("#segStatut button").forEach(b => b.classList.toggle("on", b.dataset.v === f.statut));
  }
  const act = filtresActifs();
  $("#nbFiltres").textContent = act.length || "";
  $("#resetF").hidden = !act.length && !f.q && f.statut === "tous";
  const box = $("#actifs"); box.innerHTML = "";
  act.forEach(([l, fn]) => { const b = document.createElement("button"); b.type = "button"; b.className = "actif"; b.innerHTML = `${esc(l)}<b aria-hidden="true">×</b>`;
    b.setAttribute("aria-label", "Retirer le filtre " + l); b.onclick = fn; box.appendChild(b); });
}
$("#btnFiltres").addEventListener("click", e => { const p = $("#fpanel"); p.hidden = !p.hidden; e.currentTarget.setAttribute("aria-expanded", !p.hidden);
  e.currentTarget.classList.toggle("on", !p.hidden); if (!p.hidden) $("#listeScroll").scrollTop = 0; });
$("#resetF").addEventListener("click", () => { filtre = {...DEF_FILTRE}; sauverFiltre(); syncFiltresUI(); rendre(); });
$("#q").addEventListener("input", e => { filtre.q = e.target.value; clearTimeout(fT); fT = setTimeout(()=>{ sauverFiltre(); syncFiltresUI(false); rendre(); }, 120); });
$("#segStatut").addEventListener("click", e => { const b = e.target.closest("button"); if(!b) return; filtre.statut = b.dataset.v; sauverFiltre(); syncFiltresUI(); rendre(); });
$("#tri").innerHTML = TRI_OPTS.map(([k,l]) => `<option value="${k}">${l}</option>`).join("");
$("#tri").value = tri;
$("#tri").addEventListener("change", e => { tri = e.target.value; lsSet("carnet-cabanes-tri", tri); rendre(); });

/* ================= Rendu liste + carte ================= */
let selId = null, edition = null, tmpMarker = null, placement = false, vueCourante = "liste";

function rendre(){
  const l = filtrees();
  calque.clearLayers(); marqueurs.clear();
  l.forEach(c => {
    if (c.lat==null || c.lng==null || (edition && edition.id===c.id)) return;
    const m = L.marker([c.lat, c.lng], {icon:icone(c, c.id===selId), title:c.nom, riseOnHover:true, zIndexOffset:c.id===selId?500:0})
      .bindPopup(popupHtml(c), {maxWidth:300});
    m.on("click", () => { selId = c.id; majSelection(); });
    m.addTo(calque); marqueurs.set(c.id, m);
  });
  const n = l.length, tot = cabanes.length;
  $("#count").textContent = (n===tot ? `${n} cabane${n>1?"s":""}` : `${n} sur ${tot}`);
  $("#handleTxt").textContent = `${modePartage ? "Les cabanes" : "Mes cabanes"} · ${n}${n!==tot?" / "+tot:""}`;
  $("#nTous").textContent = tot; $("#nFaite").textContent = cabanes.filter(c=>c.statut==="faite").length; $("#nAfaire").textContent = cabanes.filter(c=>c.statut==="afaire").length;
  $("#exBar").innerHTML = !modePartage && cabanes.some(c=>c.exemple) ? `<div class="exbar"><span>Les fiches « exemple » sont là pour la démo.</span><button class="linkbtn" type="button" id="delEx">Supprimer les exemples</button></div>` : "";
  const list = $("#list");
  if (!tot) list.innerHTML = `<div class="empty"><strong>Ton carnet est vide</strong><span>Clique sur « Ajouter une cabane » puis sur la carte, ou active refuges.info pour piocher des cabanes existantes.</span></div>`;
  else if (!n && filtre.favoris && !favoris.size) list.innerHTML = `<div class="empty"><strong>Pas encore de favori</strong><span>Ouvre la fiche d'une cabane et clique sur « Garder » pour la retrouver ici.</span></div>`;
  else if (!n) list.innerHTML = `<div class="empty"><strong>Aucune cabane ne correspond</strong><span>Retire un filtre pour en voir plus.</span></div>`;
  else list.innerHTML = l.map(c => `
    <div class="card${c.id===selId?" sel":""}" data-id="${esc(c.id)}" tabindex="0" role="button">
      <span class="dot" style="background:${couleur(c)}"></span>
      <h3>${c.coeur?'<span class="coeur" aria-label="Coup de cœur">♥</span> ':""}${esc(c.nom)}</h3>
      <span class="right"><span class="alt">${fmtAlt(c.alt)}</span>${c.statut==="faite"?badgeScore(c):""}</span>
      <div class="meta">${esc(c.type)}${c.massif?" · "+esc(c.massif):""}${acces(c)?" · "+esc(acces(c)):""}</div>
      <div class="feats">${tagStatut(c)}${c.statut==="afaire"&&c.envie?etoiles(c.envie):""}${feats(c)}${c.exemple?'<span class="tag ex">exemple</span>':""}</div>
    </div>`).join("");
  if (vueCourante === "detail") rendreDetail();
  majCabanes3D();
  if (!$("#pageClassement").hidden) rendreClassement();
  rendreBandeau();
}
function majSelection(){
  document.querySelectorAll(".card").forEach(el => el.classList.toggle("sel", el.dataset.id === selId));
  marqueurs.forEach((m, id) => { const c = cabanes.find(x=>x.id===id); if (c){ m.setIcon(icone(c, id===selId)); m.setZIndexOffset(id===selId?500:0); } });
  majTrace();
}
function cibleCentree(c, z){
  let cible = L.latLng(c.lat, c.lng);
  if (innerWidth <= 760 && !$("#panel").classList.contains("closed")){   /* sur mobile, garder le repère au-dessus du tiroir */
    const pt = map.project(cible, z).add([0, map.getSize().y * 0.3]); cible = map.unproject(pt, z);
  }
  return cible;
}
function centrer(c, ouvrir=true){
  if (!c || c.lat == null) return;
  const z = Math.max(map.getZoom(), 14);
  map.flyTo(cibleCentree(c, z), z, {duration:.6});
  if (ouvrir) setTimeout(() => marqueurs.get(c.id)?.openPopup(), 650);
}
function majTrace(){
  traceLayer.clearLayers();
  const c = cabanes.find(x=>x.id===selId);
  if (!c || !c.trace || !c.trace.length || vueCourante !== "detail") return;
  L.polyline(c.trace.map(p=>[p[0],p[1]]), {color:"#B8461F", weight:4, opacity:.8, dashArray:"6 6"}).addTo(traceLayer);
  if (c.departLat != null) L.marker([c.departLat, c.departLng], {icon:iconeDepart, interactive:false}).addTo(traceLayer);
}

$("#list").addEventListener("click", e => { const c = e.target.closest(".card"); if (c) ouvrirDetail(c.dataset.id, true); });
$("#list").addEventListener("keydown", e => { if (e.key==="Enter"){ const c = e.target.closest(".card"); if (c) ouvrirDetail(c.dataset.id, true); }});
$("#exBar").addEventListener("click", async e => { if (e.target.id !== "delEx") return;
  for (const c of cabanes.filter(c=>c.exemple)) await supprimerPhotosCabane(c);
  cabanes = cabanes.filter(c=>!c.exemple); sauver(); syncFiltresUI(); rendre(); toast("Exemples supprimés"); });
$("#handle").addEventListener("click", () => $("#panel").classList.toggle("closed"));
function majBtnListe(){
  const rep = $("#pageCarte").classList.contains("replie");
  $("#btnListe").innerHTML = rep ? `<svg viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>Afficher la liste` : `<svg viewBox="0 0 24 24"><use href="#i-back"/></svg>Masquer la liste`;
  $("#btnListe").setAttribute("aria-expanded", !rep);
}
function replierListe(rep){
  $("#pageCarte").classList.toggle("replie", rep); lsSet("carnet-cabanes-liste-repliee", rep ? "1" : "");
  majBtnListe(); map.invalidateSize({pan:false});
}
$("#btnListe").addEventListener("click", () => replierListe(!$("#pageCarte").classList.contains("replie")));
if (lsGet("carnet-cabanes-liste-repliee") === "1" && innerWidth > 760) $("#pageCarte").classList.add("replie");
majBtnListe();
$("#btnFit").addEventListener("click", () => {
  const pts = filtrees().filter(c=>c.lat!=null).map(c=>[c.lat,c.lng]);
  if (!pts.length){ toast("Aucune cabane à afficher"); return; }
  map.fitBounds(L.latLngBounds(pts), {padding:[50,50], maxZoom:14});
  if (innerWidth <= 760) $("#panel").classList.add("closed");
});
map.on("popupopen", e => {
  const el = e.popup.getElement();
  const v = el.querySelector("[data-voir]"), f = el.querySelector("[data-fait]"), r = el.querySelector("[data-ri-add]");
  if (v) v.onclick = () => ouvrirDetail(v.dataset.voir, false);
  if (f) f.onclick = () => ouvrirRetour(f.dataset.fait);
  if (r) r.onclick = () => ajouterDepuisRI(r.dataset.riAdd);
});

/* ================= Vues du panneau ================= */
const VUES = {liste:"#vueListe", detail:"#vueDetail", fiche:"#vueFiche", retour:"#vueRetour", itin:"#vueItin"};
function montrerVue(v){
  if (vueCourante === "itin" && v !== "itin") quitterItin();
  vueCourante = v;
  if (v !== "liste" && $("#pageCarte").classList.contains("replie")) replierListe(false);
  for (const [nom, id] of Object.entries(VUES)) $(id).hidden = (nom !== v);
  if (v !== "detail" && en3D) quitter3D();   /* le relief accompagne la fiche ; liste, itinéraire et édition restent en 2D */
  if (v !== "liste") $("#panel").classList.remove("closed");
  majTrace(); majHash();
}
$("#detailBack").addEventListener("click", () => montrerVue("liste"));

/* ---- Détail ---- */
function ouvrirDetail(id, voler){
  selId = id; montrerVue("detail"); rendreDetail(); majSelection(); majHash();
  const c = cabanes.find(x=>x.id===id);
  /* la 3D s'ouvre d'elle-même avec la fiche (réglable dans Mon carnet) ; sinon, ou si elle échoue, la carte 2D se centre */
  if (c && c.lat != null && (en3D || auto3D())) entrer3D(c).then(ok => { if (!ok && voler) centrer(c, false); });
  else if (voler) centrer(c, false);
  $("#vueDetail .scroll").scrollTop = 0;
}
const vignettes = ids => ids.map(id => { const p = photosDB.get(id); return p ? `<button type="button" class="vig" data-ph="${esc(id)}" aria-label="Voir la photo"><img src="${p.thumb}" alt=""></button>` : ""; }).join("");
const moisAnnee = d => d ? new Date(d + "T12:00:00").toLocaleDateString("fr-FR", {month:"long", year:"numeric"}) : "";
const recoHtml = r => r === true ? `<span class="reco oui"><svg aria-hidden="true"><use href="#i-pouce"/></svg>Recommande</span> ` : r === false ? `<span class="reco non"><svg aria-hidden="true"><use href="#i-pouce"/></svg>Ne recommande pas</span> ` : "";
function etatConstate(c){
  const sigs = (c.sigV || []).filter(x => x.date && x.etat);
  const vs = [...c.visites.filter(v => v.date), ...sigs.map(x => ({date: x.date.length === 7 ? x.date + "-15" : x.date, etat: x.etat}))].sort((a,b) => b.date.localeCompare(a.date));
  const v = vs.find(v => v.etat && v.etat !== "Inconnu") || vs[0];
  return v ? v.date : "";
}
const classeEtat = e => (e === "Très bon" || e === "Bon") ? "" : e === "Correct" ? "moyen" : e === "Délabré" ? "mauvais" : "inconnu";
function faitsHtml(c){
  const li = [], it = (ic, t, na) => li.push(`<li${na?' class="na"':""}><svg aria-hidden="true"><use href="#${ic}"/></svg><span>${t}</span></li>`);
  const bois = {"Bois sur place":"bois sur place","Un peu de bois":"un peu de bois sur place","À monter soi-même":"bois à monter soi-même"}[c.bois];
  if (aFeu(c)) it("i-feu", esc(c.chauffage) + (bois ? ", " + bois : c.equip.reserveBois ? ", réserve de bois" : ""));
  else if (c.chauffage === "Aucun") it("i-feu", "Ni cheminée ni poêle" + (bois ? " · " + bois : ""), true);
  else if (bois) it("i-bois", bois.charAt(0).toUpperCase() + bois.slice(1));
  const eau = {"Source à côté":"Source juste à côté","Source < 15 min":"Source à moins de 15 min","Torrent / lac":"Eau du torrent ou du lac, à traiter","Pas d'eau":"Pas d'eau à proximité"}[c.eau];
  if (eau) it("i-eau", eau + (c.equip.eauPotable && c.eau !== "Pas d'eau" ? " (potable)" : ""), c.eau === "Pas d'eau");
  else if (c.equip.eauPotable) it("i-eau", "Eau potable");
  const couch = {"Bat-flanc":"Couchage sur bat-flanc","Matelas":"Matelas","Lits":"Lits","Au sol":"Couchage au sol"}[c.couchage];
  if (couch || c.places) it("i-lit", [couch, c.places ? `${c.places} place${c.places>1?"s":""}` : ""].filter(Boolean).join(", "));
  const ouv = {"Toujours ouvert":"Ouverte toute l'année","Partie hiver ouverte":"Partie hiver ouverte toute l'année","Fermé hors saison":"Fermée hors saison"}[c.ouverture];
  if (ouv) it("i-cle", ouv, c.ouverture === "Fermé hors saison");
  if (c.berger) it("i-berger", "Occupée l'été par un berger");
  const res = {"Oui":"Réseau téléphone","Faible":"Réseau faible","Non":"Pas de réseau"}[c.reseau];
  if (res) it("i-signal", res, c.reseau === "Non");
  return li.length ? `<ul class="faits">${li.join("")}</ul>` : "";
}

/* ---- Photo principale en tête de fiche, avec flèches pour passer aux autres ---- */
let carIdx = 0, carCid = null;
const idsPhotos = c => { const ids = c.photos.filter(id => photosDB.has(id)); const i = ids.indexOf(c.photoPrincipale); if (i > 0){ ids.splice(i, 1); ids.unshift(c.photoPrincipale); } return ids; };
function carrouselHtml(c){
  const ids = idsPhotos(c);
  if (carCid !== c.id){ carCid = c.id; carIdx = 0; }
  const ajout = mini => `<label class="carr-add${mini?" mini":""}" tabindex="0" title="Ajouter des photos"${mini?' aria-label="Ajouter des photos"':""}><input type="file" accept="image/*" multiple hidden data-addph><svg aria-hidden="true"><use href="#${mini?"i-plus":"i-photo"}"/></svg>${mini?"":"Ajouter des photos de la cabane"}</label>`;
  if (!ids.length) return modePartage ? "" : ajout(false);
  carIdx = (carIdx + ids.length) % ids.length;
  const p = photosDB.get(ids[carIdx]);
  return `<div class="hero">
      <button class="hero-img" type="button" data-carzoom aria-label="Agrandir la photo"><img src="${urlPhoto(p)}" alt="${esc(p.legende || c.nom)}">${p.legende || p.auteur ? `<span class="carr-leg">${esc(p.legende || "")}${p.legende && p.auteur ? " · " : ""}${p.auteur ? "Photo : " + esc(p.auteur) : ""}</span>` : ""}</button>
      ${ids.length > 1 ? `<button class="hero-nav prev" type="button" data-car="-1" aria-label="Photo précédente"><svg aria-hidden="true"><use href="#i-back"/></svg></button><button class="hero-nav next" type="button" data-car="1" aria-label="Photo suivante"><svg aria-hidden="true"><use href="#i-next"/></svg></button><span class="hero-n">${carIdx+1} / ${ids.length}</span>` : ""}
    </div>
    ${ids.length > 1 || !modePartage ? `<div class="carr-thumbs">${ids.map((id,i) => `<button type="button" class="${i===carIdx?"on":""}" data-cari="${i}" aria-label="Photo ${i+1}"${i===carIdx?' aria-current="true"':""}><img src="${photosDB.get(id).thumb}" alt=""></button>`).join("")}${modePartage ? "" : ajout(true)}</div>` : ""}`;
}
function rendreCarrousel(){
  const c = cabanes.find(x => x.id === selId), h = $("#detHero"); if (!c || !h) return;
  h.innerHTML = carrouselHtml(c); h.hidden = !h.innerHTML.trim();
}
$("#vueDetail").addEventListener("click", e => {
  const c = cabanes.find(x => x.id === selId); if (!c) return;
  const nav = e.target.closest("[data-car]"), th = e.target.closest("[data-cari]"), zm = e.target.closest("[data-carzoom]");
  if (nav){ carIdx += +nav.dataset.car; rendreCarrousel(); }
  else if (th){ carIdx = +th.dataset.cari; rendreCarrousel(); }
  else if (zm){ ouvrirLightbox(c, idsPhotos(c)[carIdx]); }
});
$("#vueDetail").addEventListener("change", e => {
  if (!e.target.matches("[data-addph]")) return;
  const c = cabanes.find(x => x.id === selId); const fs = [...e.target.files]; e.target.value = "";
  if (c && fs.length) ajouterPhotos(c, fs);
});
$("#vueDetail").addEventListener("keydown", e => {
  const l = e.target.closest(".carr-add"); if (l && (e.key === "Enter" || e.key === " ")){ e.preventDefault(); l.querySelector("input").click(); }
});

function rendreDetail(){
  const c = cabanes.find(x=>x.id===selId);
  if (!c){ montrerVue("liste"); return; }
  const s = score(c), r = ressenti(c), note = r || s;
  const accesLigne = [c.depart ? "Depuis " + esc(c.depart) : "", c.dist != null && c.duree ? fmtKm(c.dist) : "", c.dplus != null ? "+" + c.dplus + " m" : "",
    c.difficulte !== "Inconnu" ? esc(c.difficulte.toLowerCase()) : "", c.balisage !== "Inconnu" ? esc(c.balisage.toLowerCase()) : ""].filter(Boolean).join(" · ");
  const eq = EQUIP.filter(([k]) => c.equip[k] && k !== "eauPotable" && k !== "reserveBois").map(([,l]) => `<span class="pill">${esc(l)}</span>`);
  const wa = WARN.filter(([k]) => c.warn[k]).map(([,l]) => `<span class="pill warn">${esc(l)}</span>`);
  const sa = SAISONS.filter(([k]) => c.saisons.includes(k)).map(([,l]) => `<span class="pill">${l}</span>`);
  const hasCrit = CRITERES.some(([k]) => c.crit[k] > 0);
  const nbRetNotes = c.visites.filter(v=>v.crit && Object.values(v.crit).some(x=>x>0)).length;
  const visites = [...c.visites].sort((a,b) => (b.date||"").localeCompare(a.date||""));
  const dEtat = etatConstate(c), fav = favoris.has(c.id);
  const stats = [["Altitude", c.alt!=null ? fmtAlt(c.alt) : ""], ["Places", c.places ? String(c.places) : ""], ["Accès", c.duree || (c.dist!=null ? fmtKm(c.dist) : "")]].filter(([,v]) => v);
  const signature = P("Mon mot, affiché sur le site", AUTEUR ? `Le mot de ${esc(AUTEUR)}` : "Le mot de l'auteur");
  const noteTxt = modePartage
    ? (note ? `${etoiles(note)} <span>${fr1(note)} / 5</span>` : "")
    : [r ? `<span class="ress" title="Mon ressenti">★ ${fr1(r)}</span>` : "", s ? `<span class="score" style="--c:${couleurScore(s)}" title="Note par critères">${fr1(s)}</span>` : ""].filter(Boolean).join(" ");
  const motBlk = (c.mot || note || hasCrit) ? `<figure class="mot">
      ${c.mot ? `<blockquote>${esc(c.mot)}</blockquote>` : (modePartage ? "" : `<p class="hint">Pas encore de mot public. Écris-le dans « Modifier » : c'est lui qui s'affiche sur le site.</p>`)}
      <figcaption>${noteTxt}<span>${signature}${nbNuits(c) ? ` · ${nbNuits(c)} nuit${nbNuits(c)>1?"s":""} sur place` : ""}</span></figcaption>
      ${hasCrit ? `<details><summary>Détail de la note${nbRetNotes ? ` (moyenne de ${nbRetNotes} sortie${nbRetNotes>1?"s":""})` : ""}</summary><div class="crits">${CRITERES.map(([k,l]) => { const v = c.crit[k]||0; return `<div class="crit"><span>${l}</span><span class="bar"><i style="width:${v*20}%"></i></span><b>${v?(Number.isInteger(v)?v:fr1(v)):"–"}</b></div>`; }).join("")}</div></details>` : ""}
    </figure>` : (modePartage ? "" : `<p class="hint">Pas encore de note ni de mot public pour cette cabane.</p>`);
  const passage = v => {
    const meta = [v.nuit?"Nuit sur place":"", v.meteo&&v.meteo!=="Non précisé"?v.meteo:"", v.monde&&v.monde!=="Non précisé"?v.monde:"", v.montee?"Montée "+v.montee:"",
      !modePartage && v.avec ? "Avec "+v.avec : "", v.etat&&v.etat!=="Inconnu" ? "État : "+v.etat.toLowerCase() : ""].filter(Boolean).join(" · ");
    const cv = CRITERES.map(([k])=>v.crit?.[k]).filter(x=>x>0); const moy = cv.length ? cv.reduce((a,b)=>a+b,0)/cv.length : 0;
    const ph = c.photos.filter(id => photosDB.get(id)?.visiteId === v.id);
    return `<div class="visite"><div class="visite-h"><strong>${v.date ? (modePartage ? moisAnnee(v.date) : fmtDate(v.date)) : "Date inconnue"}</strong><span>${recoHtml(v.reco)}${v.ressenti?`<span class="ress">★ ${fr1(v.ressenti)}</span> `:""}${!modePartage && moy?`<span class="score" style="--c:${couleurScore(moy)}">${fr1(moy)}</span>`:""}</span></div>
      ${meta?`<div class="m">${esc(meta)}</div>`:""}${v.coeur?'<div class="m" style="color:var(--rouge)">♥ Coup de cœur</div>':""}
      ${v.com?`<p>${esc(v.com)}</p>`:""}
      ${ph.length?`<div class="galerie">${vignettes(ph)}</div>`:""}
      <div class="act no-partage"><button class="linkbtn" type="button" data-vedit="${esc(v.id)}">Modifier</button><button class="linkbtn" type="button" data-vdel="${esc(v.id)}">Supprimer</button></div></div>`;
  };
  const src = c.lien ? (/refuges\.info/.test(c.lien) ? "refuges.info" : /pyrenees-refuges/.test(c.lien) ? "pyrenees-refuges.com" : c.lien.replace(/^https?:\/\/(www\.)?/,"").split("/")[0]) : "";
  $("#detail").innerHTML = `
    <div id="detHero" class="det-hero"></div>
    <div class="det-top">
      <div class="kicker">${esc(c.type)}${c.massif?" · "+esc(c.massif):""}</div>
      <h3>${c.coeur?'<span class="coeur" title="Coup de cœur" aria-label="Coup de cœur">♥</span> ':""}${esc(c.nom)}</h3>
      <div class="det-tags">${tagStatut(c)}${c.exemple?'<span class="tag ex">exemple</span>':""}${c.partageePar?`<span class="tag">partagée par ${esc(c.partageePar)}</span>`:""}</div>
    </div>
    ${stats.length ? `<div class="det-stats" style="grid-template-columns:repeat(${stats.length},minmax(0,1fr))">${stats.map(([l,v]) => `<div class="stat"><div class="l">${l}</div><div class="v">${esc(v)}</div></div>`).join("")}</div>` : ""}
    ${accesLigne ? `<p class="acces-line">${accesLigne}${c.trace ? " · tracé sur la carte" : ""}</p>` : ""}
    <div class="det-actions">
      <button class="btn primary no-partage" type="button" id="dRetour"><svg><use href="#i-check"/></svg>${c.statut==="afaire"?"J'y suis allé":"Donner mon avis"}</button>
      <button class="btn ghost no-partage" type="button" id="dEdit">Modifier</button>
      <button class="btn ${modePartage?"primary":"ghost"}" type="button" id="dItin"><svg><use href="#i-route"/></svg>Itinéraire</button>
      <button class="btn ghost" type="button" id="dMeteo">Météo</button>
      <button class="btn ghost partage-only" type="button" id="dFav" aria-pressed="${fav}"><svg><use href="#${fav?"i-garde":"i-garder"}"/></svg>${fav?"Gardée":"Garder"}</button>
      <button class="btn ghost" type="button" id="dShare"><svg><use href="#i-share"/></svg>Partager</button>
      ${c.lien ? `<a class="btn ghost" href="${esc(c.lien)}" target="_blank" rel="noopener" title="Ouvrir la fiche ${esc(src)} dans un nouvel onglet">Fiche ${esc(src)} <span aria-hidden="true">↗</span></a>` : ""}
    </div>
    ${c.lat != null ? `<p class="voir">Voir le point exact : <a href="${lienGoogleMaps(c)}" target="_blank" rel="noopener">Google Maps ↗</a> · <a href="${lienGoogleEarth(c)}" target="_blank" rel="noopener">Google Earth ↗</a></p>` : ""}
    ${c.statut==="afaire" && !modePartage ? `<div class="blk"><h4>Mon envie</h4><div>${c.envie?etoiles(c.envie):'<span class="hint">Pas encore notée</span>'}</div></div>` : ""}
    <div class="blk"><h4>Sur place</h4>
      ${faitsHtml(c) || `<p class="hint">Pas encore d'information sur l'équipement.</p>`}
      ${eq.length || wa.length ? `<div class="pills">${eq.join("")}${wa.join("")}</div>` : ""}
    </div>
    <div class="etat-row">
      <span class="etat-pill ${classeEtat(c.etat)}">${c.etat === "Inconnu" ? "État inconnu" : "État : " + esc(c.etat.toLowerCase())}${c.etat !== "Inconnu" ? (dEtat ? ` · constaté en ${moisAnnee(dEtat)}` : " · non daté") : ""}</span>
      <button class="linkbtn partage-only" type="button" id="dSignal"><svg width="14" height="14" aria-hidden="true" style="vertical-align:-2px"><use href="#i-flag"/></svg> Signaler l'état</button>
      <button class="linkbtn partage-only" type="button" id="dAvis">Donner mon avis ou corriger la fiche</button>
    </div>
    ${motBlk}
    ${avisVHtml(c)}
    ${sa.length ? `<div class="blk"><h4>Saisons recommandées</h4><div class="pills">${sa.join("")}</div></div>` : ""}
    <div class="blk" id="blkMeteo"><h4>Météo à la cabane <span class="lc">${c.alt!=null?"calculée pour "+fmtAlt(c.alt):""}</span></h4><div id="meteo"><p class="hint">Chargement des prévisions…</p></div></div>
    ${visites.length || !modePartage ? `<div class="blk"><h4>${P("Mes avis", AUTEUR ? "Avis de " + esc(AUTEUR) : "Avis du créateur")} <span class="lc">${visites.length||""}</span></h4>
      ${visites.length ? visites.map(passage).join("") : `<p class="hint">Aucun retour pour l'instant.${c.statut==="afaire" ? " Quand tu y seras allé, clique sur « J'y suis allé »." : " Ajoute ta première sortie : sa date servira d'« état constaté »."}</p>`}
    </div>` : ""}
    ${!modePartage ? `<div class="prive"><h4 class="kicker" style="margin:0">Privé, jamais publié par défaut</h4>${c.notes ? `<p class="notes">${esc(c.notes)}</p>` : `<p class="hint">Pas de notes privées.</p>`}</div>`
      : `${c.notes ? `<div class="blk"><h4>Notes</h4><p class="notes">${esc(c.notes)}</p></div>` : ""}`}`;
  $("#dRetour").onclick = () => ouvrirRetour(c.id);
  $("#dEdit").onclick = () => ouvrirFiche(c);
  $("#dItin").onclick = () => ouvrirItin(c.id);
  $("#dMeteo").onclick = () => $("#blkMeteo").scrollIntoView({behavior:"smooth", block:"start"});
  $("#dFav").onclick = () => { if (favoris.has(c.id)) favoris.delete(c.id); else favoris.add(c.id); sauverFavoris(); rendreDetail();
    toast(favoris.has(c.id) ? "Gardée dans tes favoris (filtre « Mes favoris »)" : "Retirée de tes favoris"); };
  $("#dShare").onclick = () => modePartage ? partagerLien(c) : ouvrirPartage("une", c.id);
  $("#dSignal").onclick = () => signalerEtat(c);
  $("#dAvis").onclick = () => donnerAvis(c);
  $("#detail").querySelectorAll("[data-avdel],[data-sigdel]").forEach(b => b.onclick = () => {
    if (!b.classList.contains("arm")){ b.classList.add("arm"); b.textContent = "Confirmer ?"; return; }
    if (b.dataset.avdel) retirerContribFiche(c, "avisV", b.dataset.avdel); else retirerContribFiche(c, "sigV", b.dataset.sigdel);
  });
  $("#detail").querySelectorAll("[data-ph]").forEach(b => b.onclick = () => ouvrirLightbox(c, b.dataset.ph));
  $("#detail").querySelectorAll("[data-vedit]").forEach(b => b.onclick = () => ouvrirRetour(c.id, b.dataset.vedit));
  $("#detail").querySelectorAll("[data-vdel]").forEach(b => b.onclick = async () => {
    if (!b.classList.contains("arm")){ b.classList.add("arm"); b.textContent = "Confirmer la suppression"; setTimeout(()=>{ if (b.isConnected){ b.classList.remove("arm"); b.textContent = "Supprimer"; } }, 4000); return; }
    for (const id of c.photos.filter(id => photosDB.get(id)?.visiteId === b.dataset.vdel)){ const p = photosDB.get(id); p.visiteId = null; await enregistrerPhoto(p); }
    c.visites = c.visites.filter(v => v.id !== b.dataset.vdel); recalcCrit(c); sauver(); rendre(); toast("Retour supprimé");
  });
  rendreCarrousel();
  rendreMeteo(c);
}
async function partagerLien(c){
  const url = location.href.split("#")[0] + "#c=" + encodeURIComponent(c.id);
  if (navigator.share){ try { await navigator.share({title:c.nom, text:`${c.nom} sur ${SITE.nom}`, url}); return; } catch(e){ if (e && e.name === "AbortError") return; } }
  toast(await copier(url) ? "Lien de la fiche copié" : "Copie impossible dans ce navigateur");
}
$("#dCentrer").addEventListener("click", () => { centrer(cabanes.find(x=>x.id===selId)); if (innerWidth<=760) $("#panel").classList.add("closed"); });

/* ================= Météo (Open-Meteo) ================= */
const meteoCache = new Map();
function wmo(code){
  if (code === 0) return ["w-soleil","Grand beau"];
  if (code <= 2) return ["w-eclaircie","Éclaircies"];
  if (code === 3) return ["w-nuage","Couvert"];
  if (code === 45 || code === 48) return ["w-brouillard","Brouillard"];
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return ["w-neige","Neige"];
  if (code >= 95) return ["w-orage","Orage"];
  if (code >= 51) return ["w-pluie","Pluie"];
  return ["w-nuage","Nuageux"];
}
async function chargerMeteo(c){
  const k = [c.id, c.lat, c.lng, c.alt].join(":"), m = meteoCache.get(k);
  if (m && Date.now() - m.t < 30*60e3) return m.d;
  const u = `https://api.open-meteo.com/v1/forecast?latitude=${c.lat.toFixed(4)}&longitude=${c.lng.toFixed(4)}${c.alt!=null?`&elevation=${Math.round(c.alt)}`:""}`
    + `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,snowfall_sum,wind_speed_10m_max&hourly=snow_depth,freezing_level_height&timezone=Europe%2FParis&forecast_days=7`;
  const r = await fetch(u); if (!r.ok) throw new Error(r.status);
  const d = await r.json(); meteoCache.set(k, {t:Date.now(), d}); return d;
}
function rendreMeteo(c){
  if (c.lat == null) return;
  chargerMeteo(c).then(d => {
    const box = document.getElementById("meteo"); if (!box || selId !== c.id) return;
    const D = d.daily, H = d.hourly || {}, now = Date.now();
    let iNow = 0, best = Infinity; (H.time||[]).forEach((t,i) => { const dt = Math.abs(new Date(t).getTime() - now); if (dt < best){ best = dt; iNow = i; } });
    const neige = H.snow_depth ? H.snow_depth[iNow] : null, iso = H.freezing_level_height ? H.freezing_level_height[iNow] : null;
    const cumul = (D.snowfall_sum||[]).reduce((a,b)=>a+(b||0),0);
    const jours = D.time.map((t,i) => {
      const [ic, lib] = wmo(D.weather_code[i]); const dt = new Date(t + "T12:00:00");
      const nom = i === 0 ? "Auj." : i === 1 ? "Dem." : dt.toLocaleDateString("fr-FR", {weekday:"short", day:"numeric"});
      const sn = D.snowfall_sum[i] || 0, pr = D.precipitation_sum[i] || 0, w = D.wind_speed_10m_max[i] || 0;
      return `<div class="mj" title="${lib}"><span class="d">${nom}</span><svg role="img" aria-label="${lib}"><use href="#${ic}"/></svg>
        <span class="t"><b>${Math.round(D.temperature_2m_max[i])}°</b> / ${Math.round(D.temperature_2m_min[i])}°</span>
        ${sn >= 0.5 ? `<span class="s">${Math.round(sn)} cm</span>` : pr >= 0.5 ? `<span class="p">${Math.round(pr)} mm</span>` : `<span class="p">sec</span>`}
        <span class="${w>=50?"w":"p"}">${Math.round(w)} km/h</span></div>`;
    }).join("");
    box.innerHTML = `<div class="meteo-sum">
        <span>Neige au sol estimée : <b>${neige == null ? "–" : neige < 0.02 ? "aucune" : Math.round(neige*100) + " cm"}</b></span>
        <span>Isotherme 0 °C : <b>${iso == null ? "–" : fmtAlt(Math.round(iso/50)*50)}</b></span>
        <span>Neige fraîche sur 7 j : <b>${Math.round(cumul)} cm</b></span>
      </div>
      <div class="meteo-strip">${jours}</div>
      <p class="hint">Prévisions Open-Meteo (modèle). Avant de partir, recoupe avec <a href="https://meteofrance.com/meteo-montagne" target="_blank" rel="noopener">Météo-France montagne</a> et, en hiver, le bulletin d'avalanche.</p>`;
  }).catch(() => { const box = document.getElementById("meteo"); if (box && selId === c.id) box.innerHTML = '<p class="hint">Météo indisponible pour le moment (pas de connexion ?).</p>'; });
}

/* ================= Photos ================= */
async function redim(file, max, q, url){
  const bmp = await createImageBitmap(file);
  const s = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const cv = document.createElement("canvas"); cv.width = Math.max(1, Math.round(bmp.width*s)); cv.height = Math.max(1, Math.round(bmp.height*s));
  cv.getContext("2d").drawImage(bmp, 0, 0, cv.width, cv.height); if (bmp.close) bmp.close();
  if (url) return cv.toDataURL("image/jpeg", q);
  return await new Promise((res, rej) => cv.toBlob(b => b ? res(b) : rej(new Error("toBlob")), "image/jpeg", q));
}
async function enregistrerPhoto(p){ photosDB.set(p.id, p); if (!modePartage) await idb.put("photos", p); }
async function ajouterPhotos(c, files, visiteId, date, auteur, avisId){
  if (modePartage || !files.length) return;
  toast(`Ajout de ${files.length} photo${files.length>1?"s":""}…`, 8000);
  let n = 0, refus = 0;
  for (const f of files){
    try {
      const blob = await redim(f, 1600, .82);
      const thumb = await redim(blob, 320, .7, true);
      const p = {id:"p"+uid(), cabaneId:c.id, visiteId:visiteId||null, date: date || (f.lastModified ? new Date(f.lastModified).toISOString().slice(0,10) : auj()), legende:"", auteur:auteur||"", avisId:avisId||null, blob, thumb};
      await enregistrerPhoto(p); c.photos.push(p.id); n++;
    } catch(e){ refus++; }
  }
  if (n){ sauver(); rendre(); try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch(e){} }
  toast(n ? `${n} photo${n>1?"s":""} ajoutée${n>1?"s":""}${refus?` · ${refus} illisible${refus>1?"s":""} (format HEIC ?)`:""}` : "Ces fichiers n'ont pas pu être lus (format HEIC ? exporte-les en JPEG).", 4500);
}
async function supprimerPhoto(c, id){
  photosDB.delete(id); if (urlCache.has(id)){ URL.revokeObjectURL(urlCache.get(id)); urlCache.delete(id); }
  c.photos = c.photos.filter(x => x !== id);
  try { await idb.del("photos", id); } catch(e){}
}
async function supprimerPhotosCabane(c){ for (const id of [...c.photos]) await supprimerPhoto(c, id); }

let lbCab = null, lbIdx = 0;
const lbIds = () => lbCab ? idsPhotos(lbCab) : [];
function ouvrirLightbox(c, id){ lbCab = c; lbIdx = Math.max(0, lbIds().indexOf(id)); $("#lb").hidden = false; majLightbox(); $("#lbClose").focus(); }
function majLightbox(){
  const ids = lbIds();
  if (!ids.length){ fermerLightbox(); return; }
  lbIdx = (lbIdx + ids.length) % ids.length;
  const p = photosDB.get(ids[lbIdx]);
  $("#lbImg").src = urlPhoto(p);
  $("#lbInfo").textContent = `${lbCab.nom} · ${lbIdx+1} / ${ids.length}${p.date?" · "+fmtDate(p.date):""}`;
  $("#lbLeg").value = p.legende || ""; $("#lbLegTxt").textContent = p.legende || ""; $("#lbLegTxt").hidden = !(modePartage && p.legende);
  $("#lbPrev").hidden = $("#lbNext").hidden = ids.length < 2;
  const d = $("#lbDel"); d.classList.remove("arm"); d.textContent = "Supprimer";
  const pr = lbIdx === 0; $("#lbMain").textContent = pr ? "★ Photo principale" : "Choisir comme photo principale"; $("#lbMain").disabled = pr;
}
function fermerLightbox(){ $("#lb").hidden = true; lbCab = null; }
$("#lbClose").addEventListener("click", fermerLightbox);
$("#lbPrev").addEventListener("click", () => { lbIdx--; majLightbox(); });
$("#lbNext").addEventListener("click", () => { lbIdx++; majLightbox(); });
$("#lbLeg").addEventListener("change", async e => { const p = photosDB.get(lbIds()[lbIdx]); if (!p) return; p.legende = e.target.value.trim(); await enregistrerPhoto(p); sauver(); });
$("#lbMain").addEventListener("click", () => {
  const c = lbCab, id = lbIds()[lbIdx]; if (!c || !id) return;
  c.photoPrincipale = id; c.modifie = Date.now(); sauver(); carIdx = 0; lbIdx = 0; majLightbox(); rendreCarrousel(); rendre(); toast("Photo principale choisie");
});
$("#lbDel").addEventListener("click", async e => {
  const b = e.currentTarget; if (!b.classList.contains("arm")){ b.classList.add("arm"); b.textContent = "Confirmer ?"; return; }
  const c = lbCab; await supprimerPhoto(c, lbIds()[lbIdx]); sauver(); rendre(); majLightbox(); toast("Photo supprimée");
});

/* ================= Itinéraire depuis un point de départ ================= */
const itin = {cid:null, depart:null, marker:null, ligne:null, res:null, req:0, calcul:false, erreur:""};
function ouvrirItin(cid){
  const c = cabanes.find(x=>x.id===cid); if (!c) return;
  map.closePopup();
  montrerVue("itin");
  itin.cid = cid; itin.res = null; itin.erreur = ""; itin.depart = null; itin.calcul = false;
  if (c.departLat != null){
    poserDepart(c.departLat, c.departLng, false);
    if (c.trace && c.trace.length){ itin.res = {pts:c.trace, dist:(c.dist||0)*1000, up:c.dplus||0, down:denivele(c.trace.map(p=>p[2])).down, minutes:minutes(c.duree), source:"Itinéraire enregistré dans la fiche", enregistre:true}; dessinerItin(true); }
    else calculerItin();
  } else setBanniere("Clique sur la carte pour poser ton point de départ");
  rendreItin();
}
function setBanniere(txt, annulable){
  const b = $("#placing");
  b.innerHTML = txt ? `<span>${esc(txt)}</span>${annulable ? '<button type="button" id="placingAnnuler">Annuler</button>' : ""}` : "";
  b.hidden = !txt; $("#mapWrap").classList.toggle("placing", !!txt);
  if (txt && innerWidth<=760) $("#panel").classList.add("closed");
  const a = $("#placingAnnuler"); if (a) a.onclick = () => { if (placementProp) finPlacementProp(null); };
}
function quitterItin(){
  if (itin.marker){ map.removeLayer(itin.marker); itin.marker = null; }
  if (itin.ligne){ map.removeLayer(itin.ligne); itin.ligne = null; }
  itin.req++; itin.cid = null; setBanniere("");
}
function poserDepart(lat, lng, calc=true){
  itin.depart = [lat, lng];
  if (!itin.marker){
    itin.marker = L.marker([lat,lng], {icon:iconeDepart, draggable:true, zIndexOffset:900, title:"Point de départ"}).addTo(map);
    itin.marker.on("dragend", () => { const p = itin.marker.getLatLng(); itin.depart = [p.lat, p.lng]; calculerItin(); });
  } else itin.marker.setLatLng([lat,lng]);
  setBanniere("");
  if (innerWidth<=760) $("#panel").classList.remove("closed");
  if (calc) calculerItin();
}
function denivele(eles){ let up = 0, down = 0, ref = null; for (const e of eles){ if (e == null) continue; if (ref == null){ ref = e; continue; } const d = e - ref; if (d >= 5){ up += d; ref = e; } else if (d <= -5){ down -= d; ref = e; } } return {up, down}; }
function reechantillonner(pts, n){
  if (pts.length < 2) return pts.map(p=>[p[0],p[1]]);
  const cum = [0]; for (let i=1;i<pts.length;i++) cum[i] = cum[i-1] + hav(pts[i-1], pts[i]);
  const tot = cum[cum.length-1]; if (!tot) return [[pts[0][0],pts[0][1]]];
  const out = []; let j = 0;
  for (let k=0;k<n;k++){ const t = tot*k/(n-1); while (j < cum.length-2 && cum[j+1] < t) j++;
    const seg = (cum[j+1]-cum[j]) || 1, f = Math.min(1, Math.max(0, (t-cum[j])/seg));
    out.push([pts[j][0] + (pts[j+1][0]-pts[j][0])*f, pts[j][1] + (pts[j+1][1]-pts[j][1])*f]); }
  return out;
}
const longueur = pts => { let d = 0; for (let i=1;i<pts.length;i++) d += hav(pts[i-1], pts[i]); return d; };
async function altitudes(pts){
  try {
    const out = [];
    for (let i=0;i<pts.length;i+=150){
      const ch = pts.slice(i, i+150);
      const u = `https://data.geopf.fr/altimetrie/1.0/calcul/alti/rest/elevation.json?lon=${ch.map(p=>p[1].toFixed(6)).join("%7C")}&lat=${ch.map(p=>p[0].toFixed(6)).join("%7C")}&resource=ign_rge_alti_wld&zonly=true`;
      const r = await fetch(u); if (!r.ok) throw 0; const d = await r.json();
      if (!d.elevations || d.elevations.length !== ch.length || d.elevations.some(z => typeof z !== "number" || z < -1000)) throw 0;
      out.push(...d.elevations);
    }
    return out;
  } catch(e){
    const out = [];
    for (let i=0;i<pts.length;i+=100){
      const ch = pts.slice(i, i+100);
      const r = await fetch(`https://api.open-meteo.com/v1/elevation?latitude=${ch.map(p=>p[0].toFixed(5)).join(",")}&longitude=${ch.map(p=>p[1].toFixed(5)).join(",")}`);
      if (!r.ok) throw new Error("alti"); const d = await r.json(); out.push(...d.elevation);
    }
    return out;
  }
}
async function avecAltitudes(pts){
  const n = Math.min(220, Math.max(20, Math.round(longueur(pts)/25)));
  const s = reechantillonner(pts, n); const z = await altitudes(s);
  return s.map((p,i) => [p[0], p[1], z[i] ?? null]);
}
async function routeBRouter(a, b){
  const u = `https://brouter.de/brouter?lonlats=${a[1].toFixed(6)},${a[0].toFixed(6)}%7C${b[1].toFixed(6)},${b[0].toFixed(6)}&profile=hiking-mountain&alternativeidx=0&format=geojson`;
  const r = await fetch(u); if (!r.ok) throw new Error("brouter " + r.status);
  const gj = JSON.parse(await r.text());
  const f = gj.features && gj.features[0]; if (!f) throw new Error("brouter vide");
  let pts = f.geometry.coordinates.map(c => [c[1], c[0], c.length > 2 ? c[2] : null]);
  if (pts.some(p => p[2] == null)) pts = await avecAltitudes(pts);
  const pr = f.properties || {}, dist = +pr["track-length"] || longueur(pts);
  const dn = denivele(pts.map(p=>p[2])), fa = parseFloat(pr["filtered ascend"]);
  return {pts, dist, up: isFinite(fa) ? fa : dn.up, down:dn.down, source:"Sentiers de montagne (BRouter, données OpenStreetMap)"};
}
async function routeOSRM(a, b){
  const u = `https://routing.openstreetmap.de/routed-foot/route/v1/foot/${a[1].toFixed(6)},${a[0].toFixed(6)};${b[1].toFixed(6)},${b[0].toFixed(6)}?overview=full&geometries=geojson`;
  const r = await fetch(u); if (!r.ok) throw new Error("osrm"); const d = await r.json();
  const rt = d.routes && d.routes[0]; if (!rt) throw new Error("osrm vide");
  const pts = await avecAltitudes(rt.geometry.coordinates.map(c => [c[1], c[0]]));
  const dn = denivele(pts.map(p=>p[2]));
  return {pts, dist:rt.distance || longueur(pts), up:dn.up, down:dn.down, source:"Chemins piétons (OSRM, données OpenStreetMap)"};
}
async function volOiseau(a, b){
  const pts = await avecAltitudes([a, b]); const dn = denivele(pts.map(p=>p[2]));
  return {pts, dist:hav(a,b), up:dn.up, down:dn.down, source:"À vol d'oiseau : aucun sentier trouvé, chiffres indicatifs", vol:true};
}
async function calculerItin(){
  const c = cabanes.find(x=>x.id===itin.cid); if (!c || !itin.depart) return;
  const id = ++itin.req; itin.calcul = true; itin.erreur = ""; rendreItin();
  const a = itin.depart, b = [c.lat, c.lng];
  let res = null;
  for (const f of [routeBRouter, routeOSRM, volOiseau]){ try { res = await f(a, b); break; } catch(e){ if (id !== itin.req) return; } }
  if (id !== itin.req) return;
  itin.calcul = false;
  if (!res){ itin.erreur = "Le calcul a échoué : vérifie ta connexion internet."; rendreItin(); return; }
  const fin = res.pts[res.pts.length-1]; res.ecartFin = fin ? hav([fin[0],fin[1]], b) : 0;
  const h = res.dist/1000/4, v = res.up/300 + (res.down||0)/500; res.minutes = (Math.max(h,v) + Math.min(h,v)/2) * 60;
  itin.res = res; dessinerItin(true); rendreItin();
}
function dessinerItin(cadrer){
  if (itin.ligne){ map.removeLayer(itin.ligne); itin.ligne = null; }
  if (!itin.res) return;
  itin.ligne = L.polyline(itin.res.pts.map(p=>[p[0],p[1]]), {color:"#B8461F", weight:5, opacity:.85, dashArray: itin.res.vol ? "8 8" : null}).addTo(map);
  if (cadrer) map.fitBounds(itin.ligne.getBounds(), {padding:[60,60], maxZoom:15});
}
function profilSvg(pts){
  const W = 360, H = 130, pl = 40, pr = 10, pt = 10, pb = 22;
  const xy = []; let d = 0;
  pts.forEach((p,i) => { if (i) d += hav(pts[i-1], p); if (p[2] != null) xy.push([d, p[2]]); });
  if (xy.length < 2) return "";
  const maxD = xy[xy.length-1][0] || 1, es = xy.map(x=>x[1]);
  let lo = Math.floor((Math.min(...es)-10)/50)*50, hi = Math.ceil((Math.max(...es)+10)/50)*50; if (hi - lo < 100) hi = lo + 100;
  const X = v => pl + v/maxD*(W-pl-pr), Y = v => pt + (1-(v-lo)/(hi-lo))*(H-pt-pb);
  const line = xy.map(([x,y],i) => `${i?"L":"M"}${X(x).toFixed(1)},${Y(y).toFixed(1)}`).join("");
  const area = `${line}L${X(maxD).toFixed(1)},${Y(lo)}L${X(0)},${Y(lo)}Z`;
  const mid = Math.round((lo+hi)/2/50)*50;
  return `<svg class="profil" viewBox="0 0 ${W} ${H}" role="img" aria-label="Profil altimétrique de ${fmtAlt(Math.min(...es))} à ${fmtAlt(Math.max(...es))}">
    <line class="grid" x1="${pl}" x2="${W-pr}" y1="${Y(hi)}" y2="${Y(hi)}"/><line class="grid" x1="${pl}" x2="${W-pr}" y1="${Y(mid)}" y2="${Y(mid)}"/><line class="grid" x1="${pl}" x2="${W-pr}" y1="${Y(lo)}" y2="${Y(lo)}"/>
    <path class="area" d="${area}"/><path class="line" d="${line}"/>
    <text x="${pl-5}" y="${Y(hi)+4}" text-anchor="end">${hi}</text><text x="${pl-5}" y="${Y(mid)+4}" text-anchor="end">${mid}</text><text x="${pl-5}" y="${Y(lo)+4}" text-anchor="end">${lo}</text>
    <text x="${pl}" y="${H-5}">0 km</text><text x="${W-pr}" y="${H-5}" text-anchor="end">${fmtKm(Math.round(maxD/100)/10)}</text></svg>`;
}
function rendreItin(){
  const c = cabanes.find(x=>x.id===itin.cid); if (!c) return;
  const r = itin.res;
  $("#itinFoot").hidden = !(itin.depart && !itin.calcul);
  $("#itinSave").hidden = !(r && !r.enregistre);
  let corps;
  if (!itin.depart) corps = `<p>Pose ton point de départ (parking, village, fin de piste) en cliquant sur la carte. Le trajet suit les sentiers jusqu'à la cabane.</p>
    <div class="det-actions"><button class="btn ghost" type="button" id="itMoi"><svg><use href="#i-loc"/></svg>Partir de ma position</button></div>`;
  else if (itin.calcul) corps = `<p class="hint">Calcul de l'itinéraire en cours…</p>`;
  else if (itin.erreur) corps = `<p class="hint warn">${esc(itin.erreur)}</p><div class="det-actions"><button class="btn ghost" type="button" id="itRetry">Réessayer</button></div>`;
  else if (r){
    const s = r.pts[0], e = r.pts[r.pts.length-1];
    corps = `<div class="istats">
        <div class="istat"><b>${fmtKm(Math.round(r.dist/100)/10)}</b><span>Distance</span></div>
        <div class="istat"><b>${Math.round(r.up)} m</b><span>D+</span></div>
        <div class="istat"><b>${r.minutes ? fmtDuree(r.minutes) : "–"}</b><span>Durée estimée</span></div>
      </div>
      <p class="hint">D− ${Math.round(r.down||0)} m${s && s[2]!=null && e && e[2]!=null ? ` · départ ${fmtAlt(s[2])} → arrivée ${fmtAlt(e[2])}` : ""}</p>
      ${profilSvg(r.pts)}
      <p class="hint">${esc(r.source)}.${r.ecartFin > 150 ? ` Le dernier tronçon (${Math.round(r.ecartFin)} m) n'est pas sur un sentier connu.` : ""} Durée sans les pauses, sur une base de 4 km/h et 300 m de montée par heure.</p>
      ${!modePartage && !r.enregistre ? `<div class="f"><label for="itNom">Nom du point de départ</label><input id="itNom" value="${esc(c.depart||"")}" placeholder="Parking du Pont…"></div>` : ""}
      <p class="hint">Déplace le drapeau vert sur la carte pour essayer un autre départ.</p>`;
  }
  $("#itin").innerHTML = `<div class="det-top"><h3>${esc(c.nom)}</h3><div class="det-sub">${c.alt!=null?fmtAlt(c.alt):""}</div></div>${corps}`;
  const moi = $("#itMoi"); if (moi) moi.onclick = () => geoloc(ll => poserDepart(ll[0], ll[1]));
  const rt = $("#itRetry"); if (rt) rt.onclick = calculerItin;
}
$("#itinBack").addEventListener("click", () => { montrerVue("detail"); rendreDetail(); });
$("#itinEffacer").addEventListener("click", () => { if (itin.marker){ map.removeLayer(itin.marker); itin.marker = null; } if (itin.ligne){ map.removeLayer(itin.ligne); itin.ligne = null; }
  itin.depart = null; itin.res = null; itin.req++; setBanniere("Clique sur la carte pour poser ton point de départ"); rendreItin(); });
$("#itinSave").addEventListener("click", () => {
  const c = cabanes.find(x=>x.id===itin.cid), r = itin.res; if (!c || !r) return;
  const nom = $("#itNom") ? $("#itNom").value.trim() : "";
  c.depart = nom || c.depart || "Point de départ";
  c.departLat = itin.depart[0]; c.departLng = itin.depart[1];
  c.dist = Math.round(r.dist/100)/10; c.dplus = Math.round(r.up); if (r.minutes) c.duree = fmtDuree(r.minutes);
  const step = Math.max(1, Math.ceil(r.pts.length/300));
  c.trace = r.pts.filter((p,i) => i % step === 0 || i === r.pts.length-1).map(p => [+p[0].toFixed(5), +p[1].toFixed(5), p[2]==null?null:Math.round(p[2])]);
  c.modifie = Date.now(); sauver();
  montrerVue("detail"); rendre(); toast("Itinéraire enregistré dans la fiche");
});

/* ---- Édition ---- */
["type","etat","chauffage","bois","eau","couchage","ouverture","reseau","difficulte","balisage"].forEach(k => selectOpts($("#f-"+k), OPTIONS[k]));
$("#f-equip").innerHTML = EQUIP.map(([k,l]) => `<label class="ck"><input type="checkbox" id="eq-${k}"> ${esc(l)}</label>`).join("");
$("#f-warn").innerHTML = WARN.map(([k,l]) => `<label class="ck"><input type="checkbox" id="wa-${k}"> ${esc(l)}</label>`).join("");
$("#f-saisons").innerHTML = SAISONS.map(([k,l]) => `<label class="ck"><input type="checkbox" id="sa-${k}"> ${l}</label>`).join("");
const envieW = rateWidget($("#f-envie"), "Envie sur 5");
const critF = {}, critR = {};
$("#f-crit").innerHTML = CRITERES.map(([k,l]) => `<div class="critrow"><span>${l}</span><span id="fc-${k}"></span></div>`).join("");
$("#r-crit").innerHTML = CRITERES.map(([k,l]) => `<div class="critrow"><span>${l}</span><span id="rc-${k}"></span></div>`).join("");
CRITERES.forEach(([k,l]) => { critF[k] = rateWidget($("#fc-"+k), l); critR[k] = rateWidget($("#rc-"+k), l); });
const ressF = rateWidget($("#f-ressenti"), "Ressenti sur 5"), ressR = rateWidget($("#r-ressenti"), "Ressenti sur 5");

const CHAMPS = ["nom","type","statut","lat","lng","alt","massif","depart","dist","dplus","duree","difficulte","balisage","etat","chauffage","bois","eau","couchage","places","ouverture","reseau","mot","notes","lien"];
const NUMS = new Set(["lat","lng","alt","dist","dplus","places"]);
let retourVue = "liste";
function majStatutForm(){ const af = $("#f-statut").value === "afaire"; $("#wrapEnvie").hidden = !af; $("#fsCrit").hidden = af; }
$("#f-statut").addEventListener("change", majStatutForm);

function ouvrirFiche(c){
  if (modePartage) return;
  map.closePopup();
  retourVue = c && c.id ? "detail" : vueCourante === "detail" ? "detail" : "liste";
  edition = c ? JSON.parse(JSON.stringify(c)) : migrer({id:null, type:"Cabane pastorale", statut:"faite"});
  CHAMPS.forEach(k => $("#f-"+k).value = edition[k] ?? "");
  if (!OPTIONS.type.includes(edition.type)) $("#f-type").value = "Autre";
  EQUIP.forEach(([k]) => $("#eq-"+k).checked = !!edition.equip[k]);
  WARN.forEach(([k]) => $("#wa-"+k).checked = !!edition.warn[k]);
  SAISONS.forEach(([k]) => $("#sa-"+k).checked = edition.saisons.includes(k));
  $("#f-coeur").checked = !!edition.coeur;
  envieW.set(edition.envie||0); ressF.set(edition.ressenti||0); $("#f-berger").checked = !!edition.berger;
  CRITERES.forEach(([k]) => critF[k].set(edition.crit[k]||0));
  majStatutForm();
  $("#ficheTitre").textContent = edition.id ? "Modifier" : "Nouvelle cabane";
  $("#btnDel").hidden = !edition.id; $("#btnDel").classList.remove("arm"); $("#btnDel").textContent = "Supprimer";
  $("#formErr").hidden = true;
  montrerVue("fiche"); $("#form").scrollTop = 0;
  placerTmp(edition.lat, edition.lng);
  setPlacement(edition.lat == null);
  rendre();
  if (edition.lat != null) map.flyTo([edition.lat, edition.lng], Math.max(map.getZoom(), 14), {duration:.5});
  if (!edition.id) setTimeout(() => $("#f-nom").focus(), 50);
}
function fermerFiche(vers){
  edition = null; setPlacement(false);
  if (tmpMarker){ map.removeLayer(tmpMarker); tmpMarker = null; }
  montrerVue(vers || retourVue); rendre();
}
function setPlacement(on){
  placement = on; setBanniere(on ? "Clique sur la carte pour placer la cabane" : "");
  $("#posHint").textContent = on ? "Clique sur la carte pour placer la cabane." : "Glisse le repère ou clique ailleurs sur la carte pour le déplacer.";
}
function placerTmp(lat, lng){
  if (lat==null || lng==null){ if (tmpMarker){ map.removeLayer(tmpMarker); tmpMarker=null; } return; }
  if (!tmpMarker){
    tmpMarker = L.marker([lat,lng], {icon:iconeTmp, draggable:true, zIndexOffset:1000}).addTo(map);
    tmpMarker.on("dragend", () => { const p = tmpMarker.getLatLng(); majCoords(p.lat, p.lng, true); });
  } else tmpMarker.setLatLng([lat,lng]);
}
function majCoords(lat, lng, chercherAlt){
  $("#f-lat").value = lat.toFixed(5); $("#f-lng").value = lng.toFixed(5);
  placerTmp(lat, lng);
  if (chercherAlt) altitudes([[lat,lng]]).then(z => { if (typeof z[0] === "number" && edition) $("#f-alt").value = Math.round(z[0]); }).catch(()=>{});
}
map.on("click", e => {
  if (placementProp){ finPlacementProp([e.latlng.lat, e.latlng.lng]); return; }
  if (edition){
    majCoords(e.latlng.lat, e.latlng.lng, true);
    if (placement){ setPlacement(false); if (innerWidth<=760) $("#panel").classList.remove("closed"); }
  } else if (vueCourante === "itin" && itin.cid) poserDepart(e.latlng.lat, e.latlng.lng);
});
["#f-lat","#f-lng"].forEach(s => $(s).addEventListener("change", () => {
  const la = num($("#f-lat").value), lo = num($("#f-lng").value);
  if (la!=null && lo!=null){ placerTmp(la, lo); map.panTo([la,lo]); setPlacement(false); }
}));

function enregistrer(){
  const d = {};
  CHAMPS.forEach(k => { const v = $("#f-"+k).value; d[k] = NUMS.has(k) ? num(v) : v.trim(); });
  d.equip = {}; EQUIP.forEach(([k]) => { if ($("#eq-"+k).checked) d.equip[k] = true; });
  d.warn = {}; WARN.forEach(([k]) => { if ($("#wa-"+k).checked) d.warn[k] = true; });
  d.saisons = SAISONS.filter(([k]) => $("#sa-"+k).checked).map(([k]) => k);
  d.coeur = $("#f-coeur").checked; d.envie = envieW.get(); d.ressenti = ressF.get(); d.berger = $("#f-berger").checked;
  d.crit = {}; CRITERES.forEach(([k]) => { const v = critF[k].get(); if (v) d.crit[k] = v; });
  const err = $("#formErr");
  if (!d.nom){ err.textContent = "Donne un nom à la cabane."; err.hidden = false; $("#f-nom").focus(); return; }
  if (d.lat==null || d.lng==null || Math.abs(d.lat)>90 || Math.abs(d.lng)>180){ err.textContent = "Place la cabane sur la carte (ou saisis latitude et longitude)."; err.hidden = false; return; }
  const ancien = edition.id ? cabanes.find(c=>c.id===edition.id) : null;
  if (ancien){
    if (ancien.lat !== d.lat || ancien.lng !== d.lng) delete ancien.trace;
    Object.assign(ancien, d, {modifie:Date.now()}); if (ancien.exemple && !ancien.nom.startsWith("Exemple")) delete ancien.exemple; selId = ancien.id;
  } else { const n = migrer({id:"c"+uid(), ...d, visites:[], photos:[], cree:Date.now()}); cabanes.push(n); selId = n.id; }
  sauver(); syncFiltresUI();
  fermerFiche("detail"); majSelection();
  toast(ancien ? "Cabane mise à jour" : "Cabane ajoutée à ton carnet");
}
$("#btnSave").addEventListener("click", enregistrer);
$("#form").addEventListener("submit", e => { e.preventDefault(); enregistrer(); });
$("#btnCancel").addEventListener("click", () => fermerFiche());
$("#ficheBack").addEventListener("click", () => fermerFiche());
let delT;
$("#btnDel").addEventListener("click", async e => {
  const b = e.currentTarget;
  if (!b.classList.contains("arm")){ b.classList.add("arm"); b.textContent = "Confirmer ?"; clearTimeout(delT);
    delT = setTimeout(()=>{ b.classList.remove("arm"); b.textContent="Supprimer"; }, 4000); return; }
  const c = cabanes.find(x=>x.id===edition.id); if (c) await supprimerPhotosCabane(c);
  cabanes = cabanes.filter(x=>x.id!==edition.id); sauver(); selId = null; syncFiltresUI(); fermerFiche("liste"); toast("Cabane supprimée");
});
$("#btnAdd").addEventListener("click", () => { allerPage("carte"); ouvrirFiche(null); });

/* ---- Retour de sortie ---- */
["meteo","monde"].forEach(k => selectOpts($("#r-"+k), OPTIONS[k]));
selectOpts($("#r-etat"), OPTIONS.etat); selectOpts($("#r-bois"), OPTIONS.bois); selectOpts($("#r-eau"), OPTIONS.eau);
["#r-etat","#r-bois","#r-eau"].forEach(s => { const o = $(s).options[0]; o.textContent = "Pas noté"; o.value = "Inconnu"; });
let retourEdit = null;
function ouvrirRetour(cid, vid){
  if (modePartage) return;
  map.closePopup();
  const c = cabanes.find(x=>x.id===cid); if (!c) return;
  selId = cid;
  const v = vid ? c.visites.find(x=>x.id===vid) : null;
  retourEdit = {cid, vid: v ? v.id : null};
  $("#retourTitre").textContent = v ? "Modifier mon avis" : "Mon avis";
  $("#retourCab").textContent = c.nom + (c.alt!=null ? " · " + fmtAlt(c.alt) : "");
  $("#r-date").value = v?.date || auj();
  $("#r-montee").value = v?.montee || "";
  $("#r-meteo").value = v?.meteo || "Non précisé";
  $("#r-monde").value = v?.monde || "Non précisé";
  $("#r-avec").value = v?.avec || "";
  $("#r-nuit").checked = !!v?.nuit;
  $("#r-etat").value = v?.etat || "Inconnu"; $("#r-bois").value = v?.bois || "Inconnu"; $("#r-eau").value = v?.eau || "Inconnu";
  CRITERES.forEach(([k]) => critR[k].set(v?.crit?.[k] || 0)); ressR.set(v?.ressenti || 0);
  $("#r-coeur").checked = !!v?.coeur;
  document.querySelectorAll("input[name=r-reco]").forEach(r => r.checked = r.value === (v?.reco === true ? "oui" : v?.reco === false ? "non" : ""));
  $("#r-com").value = v?.com || "";
  $("#r-photos").value = "";
  montrerVue("retour"); $("#formRetour").scrollTop = 0;
}
function recalcCrit(c){
  const res = {};
  CRITERES.forEach(([k]) => { const vals = c.visites.map(v=>v.crit?.[k]).filter(x=>x>0); if (vals.length) res[k] = Math.round(vals.reduce((a,b)=>a+b,0)/vals.length*10)/10; });
  if (Object.keys(res).length) c.crit = {...c.crit, ...res};
  const rs = c.visites.map(v=>v.ressenti).filter(x=>x>0);
  if (rs.length) c.ressenti = Math.round(rs.reduce((a,b)=>a+b,0)/rs.length*10)/10;
  c.date = derniere(c);
}
async function enregistrerRetour(){
  const c = cabanes.find(x=>x.id===retourEdit.cid); if (!c) return;
  const v = {id: retourEdit.vid || "v"+uid(), date:$("#r-date").value, montee:$("#r-montee").value.trim(), meteo:$("#r-meteo").value, monde:$("#r-monde").value,
    avec:$("#r-avec").value.trim(), nuit:$("#r-nuit").checked, etat:$("#r-etat").value, bois:$("#r-bois").value, eau:$("#r-eau").value,
    crit:{}, coeur:$("#r-coeur").checked, com:$("#r-com").value.trim()};
  { const rr = (document.querySelector("input[name=r-reco]:checked")||{}).value; if (rr === "oui") v.reco = true; else if (rr === "non") v.reco = false; }
  CRITERES.forEach(([k]) => { const x = critR[k].get(); if (x) v.crit[k] = x; });
  if (ressR.get()) v.ressenti = ressR.get();
  const i = c.visites.findIndex(x=>x.id===v.id);
  if (i >= 0) c.visites[i] = v; else c.visites.push(v);
  const premiere = c.statut === "afaire";
  c.statut = "faite";
  if (v.coeur) c.coeur = true;
  if (!v.date || v.date >= derniere(c)){
    if (v.etat !== "Inconnu") c.etat = v.etat;
    if (v.bois !== "Inconnu") c.bois = v.bois;
    if (v.eau !== "Inconnu") c.eau = v.eau;
  }
  recalcCrit(c); c.modifie = Date.now();
  const fichiers = [...$("#r-photos").files];
  sauver(); retourEdit = null;
  montrerVue("detail"); rendre(); majSelection();
  toast((premiere ? "Bravo, cabane testée ! " : "") + "Avis publié dans ton carnet : il apparaîtra sur le site à ta prochaine mise en ligne.", 5000);
  if (fichiers.length) await ajouterPhotos(c, fichiers, v.id, v.date);
}
$("#retourSave").addEventListener("click", enregistrerRetour);
$("#formRetour").addEventListener("submit", e => { e.preventDefault(); enregistrerRetour(); });
const annulerRetour = () => { retourEdit = null; montrerVue("detail"); rendreDetail(); };
$("#retourCancel").addEventListener("click", annulerRetour);
$("#retourBack").addEventListener("click", annulerRetour);

/* ================= Classement ================= */
let clStatut = "faite", clTri = "ressenti", clMassif = "", clTypes = [];
const CL_TRIS = modePartage
  ? [["ressenti","Note de l'auteur"],["note","Note détaillée"],...CRITERES.map(([k,l]) => [k,l]),["alt","Altitude"],["places","Places"]]
  : [["ressenti","Ressenti"],["note","Note critères"],...CRITERES.map(([k,l]) => [k,l]),["envie","Envie"],["visites","Nombre de visites"],["nuits","Nuits passées"],["alt","Altitude"],["dist","Distance d'accès"]];
$("#clTri").innerHTML = CL_TRIS.map(([k,l]) => `<option value="${k}">${l}</option>`).join("");
function cleTri(c, k){
  if (k === "ressenti") return modePartage ? noteAff(c) : ressenti(c);
  if (k === "note") return score(c);
  if (k === "envie") return c.envie || 0;
  if (k === "visites") return c.visites.length;
  if (k === "nuits") return nbNuits(c);
  if (k === "alt") return c.alt ?? -1;
  if (k === "places") return c.places ?? -1;
  if (k === "dist") return c.dist == null ? -1e9 : -c.dist;
  return c.crit[k] || 0;
}
const mini = v => v ? `<div class="mini"><span class="bar"><i style="width:${v*20}%"></i></span><b>${Number.isInteger(v)?v:fr1(v)}</b></div>` : `<div class="mini na"><span class="bar"></span><b>–</b></div>`;
const court = v => v && v !== "Inconnu" ? esc(v) : "–";
function rendreClassement(){
  const massifs = [...new Set(cabanes.map(c=>c.massif).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"fr"));
  if (clMassif && !massifs.includes(clMassif)) clMassif = "";
  $("#clMassif").innerHTML = `<option value="">Tous les massifs</option>` + massifs.map(m => `<option${m===clMassif?" selected":""}>${esc(m)}</option>`).join("");
  const types = OPTIONS.type.filter(t => cabanes.some(c => c.type === t));
  clTypes = clTypes.filter(t => types.includes(t));
  $("#clTypes").innerHTML = types.length > 1 ? `<button type="button" class="chip${clTypes.length?"":" on"}" data-clt="">Tous les types</button>` + types.map(t => `<button type="button" class="chip${clTypes.includes(t)?" on":""}" data-clt="${esc(t)}">${esc(t)}</button>`).join("") : "";
  $("#clTri").value = clTri;
  $("#clIntro").textContent = modePartage
    ? `Les cabanes les mieux notées du carnet. Pour l'instant, une seule voix compte : celle de ${AUTEUR || "l'auteur"}. Les notes des randonneurs s'ajouteront quand les comptes arriveront.`
    : "Ton classement personnel : tes cabanes faites selon ton ressenti, ou tes envies pour les cabanes à faire.";
  $("#clNote").textContent = modePartage ? "Seules les cabanes déjà notées apparaissent ici. Plus tard, il faudra quelques avis pour entrer au classement, pour qu'une seule note enthousiaste ne propulse pas une cabane en tête." : "";

  const afaire = !modePartage && clStatut === "afaire";
  let l = cabanes.filter(c => modePartage ? noteAff(c) > 0 : (clStatut === "tous" || c.statut === clStatut));
  if (!modePartage && $("#clFiltres").checked) l = l.filter(c => passe(c, {...filtre, statut:"tous"}));
  if (clMassif) l = l.filter(c => c.massif === clMassif);
  if (clTypes.length) l = l.filter(c => clTypes.includes(c.type));
  l.sort((a,b) => cleTri(b,clTri) - cleTri(a,clTri) || noteAff(b)-noteAff(a) || score(b)-score(a) || (b.envie||0)-(a.envie||0) || a.nom.localeCompare(b.nom,"fr"));

  if (!modePartage){
    const faites = cabanes.filter(c=>c.statut==="faite"), nuits = cabanes.reduce((a,c)=>a+nbNuits(c),0), sorties = cabanes.reduce((a,c)=>a+c.visites.length,0);
    const haute = faites.filter(c=>c.alt!=null).sort((a,b)=>b.alt-a.alt)[0];
    const notees = faites.filter(c=>ressenti(c)>0), moy = notees.length ? notees.reduce((a,c)=>a+ressenti(c),0)/notees.length : 0;
    $("#clSum").innerHTML = [
      [faites.length, "faites"], [cabanes.length - faites.length, "à faire"], [sorties, "sorties"], [nuits, "nuits en cabane"],
      [moy ? fr1(moy) : "–", "ressenti moyen"], [haute ? fmtAlt(haute.alt) : "–", haute ? "plus haute · " + esc(haute.nom) : "plus haute"]
    ].map(([v,lb]) => `<div><b>${v}</b><span>${lb}</span></div>`).join("");
  }

  const notePod = c => modePartage
    ? (noteAff(c) ? `<b>${fr1(noteAff(c))}</b><span>/ 5 · note de l'auteur</span>` : "")
    : (afaire ? (c.envie ? etoiles(c.envie) : "") : `${badgeRess(c)}${badgeCrit(c)}`);
  const podium = afaire ? [] : l.slice(0, 3);
  $("#clPodium").innerHTML = podium.map((c,i) => {
    const ph = idsPhotos(c)[0], p = ph ? photosDB.get(ph) : null;
    return `<button class="pod" type="button" data-id="${esc(c.id)}">
      <span class="pod-img">${p ? `<img src="${p.thumb}" alt="">` : `<svg aria-hidden="true"><use href="#i-toit"/></svg>`}<span class="pod-rang">${i+1}</span></span>
      <span class="pod-b"><span class="kicker">${esc(c.type)}${c.massif?" · "+esc(c.massif):""}</span><h3>${esc(c.nom)}</h3>
      <span class="n">${notePod(c)}<span class="grow"></span><span>${c.alt!=null?fmtAlt(c.alt):""}</span></span></span></button>`;
  }).join("");
  const reste = l.slice(podium.length), off = podium.length;

  const cols = modePartage
    ? [["","#"],["","Cabane"],["alt","Altitude"],["places","Places"],["","Chauffage"],["","Eau"],["ressenti","Note"]]
    : afaire
      ? [["","#"],["","Cabane"],["envie","Envie"],["alt","Altitude"],["dist","Accès"],["","Atouts"]]
      : [["","#"],["","Cabane"],["ressenti","Ressenti"],["note","Critères"],...CRITERES.map(([k])=>[k,CRIT_COURT[k]]),["visites","Visites"],["nuits","Nuits"],["","Dernière"]];
  const th = cols.map(([k,lb]) => `<th${k?` class="sort${k===clTri?" cur":""}" data-k="${k}" title="Classer par ${esc(lb)}" aria-sort="${k===clTri?"descending":"none"}"`:""}>${lb}${k===clTri?" ▾":""}</th>`).join("");
  let body;
  if (!l.length) body = `<tr><td colspan="${cols.length}" style="cursor:default"><div class="empty"><strong>Rien à classer ici</strong><span>${modePartage ? "Aucune cabane notée ne correspond à ces critères." : afaire ? "Ajoute des cabanes à faire depuis la carte." : "Fais un retour de sortie sur une cabane pour la voir apparaître."}</span></div></td></tr>`;
  else if (!reste.length) body = "";
  else body = reste.map((c,j) => {
    const i = j + off;
    const nom = `<td><div class="nom">${c.coeur?'<span class="coeur">♥</span> ':""}${esc(c.nom)}</div><div class="sub">${esc(c.type)}${c.massif?" · "+esc(c.massif):""}${!modePartage&&!afaire&&c.statut==="afaire"?" · à faire":""}</div></td>`;
    if (modePartage) return `<tr data-id="${esc(c.id)}" tabindex="0"><td class="rang">${i+1}</td>${nom}<td class="num">${fmtAlt(c.alt)||"–"}</td><td class="num">${c.places||"–"}</td>
      <td>${court(c.chauffage)}</td><td>${court(c.eau)}</td><td class="num"><b>${noteAff(c)?fr1(noteAff(c)):"–"}</b></td></tr>`;
    if (afaire) return `<tr data-id="${esc(c.id)}" tabindex="0"><td class="rang">${i+1}</td>${nom}<td>${c.envie?etoiles(c.envie):'<span class="hint">–</span>'}</td>
      <td class="num">${fmtAlt(c.alt)||"–"}</td><td class="num">${esc(acces(c))||"–"}</td><td><div style="display:flex;gap:8px;flex-wrap:wrap;font-size:12.5px">${feats(c)}</div></td></tr>`;
    return `<tr data-id="${esc(c.id)}" tabindex="0"><td class="rang">${i+1}</td>${nom}<td>${badgeRess(c)||'<span class="hint">–</span>'}</td><td>${badgeCrit(c)||'<span class="hint">–</span>'}</td>${CRITERES.map(([k])=>`<td>${mini(c.crit[k]||0)}</td>`).join("")}
      <td class="num">${c.visites.length||"–"}</td><td class="num">${nbNuits(c)||"–"}</td><td class="num">${fmtDateCourt(derniere(c))||"–"}</td></tr>`;
  }).join("");
  $("#clTable").innerHTML = body === "" ? "" : `<thead><tr>${th}</tr></thead><tbody>${body}</tbody>`;
  $("#clTable").closest(".tblwrap").hidden = body === "";
}
$("#clStatut").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; clStatut = b.dataset.v;
  document.querySelectorAll("#clStatut button").forEach(x=>x.classList.toggle("on", x===b));
  if (clStatut === "afaire" && !["envie","alt","dist"].includes(clTri)) clTri = "envie";
  if (clStatut !== "afaire" && clTri === "envie") clTri = "ressenti";
  rendreClassement(); });
$("#clTri").addEventListener("change", e => { clTri = e.target.value; rendreClassement(); });
$("#clMassif").addEventListener("change", e => { clMassif = e.target.value; rendreClassement(); });
$("#clTypes").addEventListener("click", e => { const b = e.target.closest("[data-clt]"); if (!b) return; const t = b.dataset.clt; clTypes = t ? toggleArr(clTypes, t) : []; rendreClassement(); });
$("#clFiltres").addEventListener("change", rendreClassement);
const ouvrirDepuisClassement = id => { allerPage("carte"); ouvrirDetail(id, true); };
$("#clPodium").addEventListener("click", e => { const b = e.target.closest("[data-id]"); if (b) ouvrirDepuisClassement(b.dataset.id); });
$("#clTable").addEventListener("click", e => {
  const th = e.target.closest("th[data-k]"); if (th){ clTri = th.dataset.k; rendreClassement(); return; }
  const tr = e.target.closest("tr[data-id]"); if (tr) ouvrirDepuisClassement(tr.dataset.id);
});
$("#clTable").addEventListener("keydown", e => { const tr = e.target.closest("tr[data-id]"); if (tr && e.key === "Enter") ouvrirDepuisClassement(tr.dataset.id); });

/* ================= Navigation entre les pages ================= */
let pageCourante = "carte";
const PAGES = {carte:"#pageCarte", classement:"#pageClassement", culture:"#pageCulture", guide:"#pageGuide", participer:"#pageParticiper", contrib:"#pageContrib", profil:"#pageProfil", apropos:"#pageApropos"};
function majHash(){
  let h = "";
  if (pageCourante !== "carte") h = "#" + pageCourante;
  else if ((vueCourante === "detail" || vueCourante === "itin") && selId && cabanes.some(c => c.id === selId)) h = "#c=" + encodeURIComponent(selId);
  if (location.hash !== h) try { history.replaceState(null, "", h || (location.pathname + location.search)); } catch(e){}
}
function allerPage(p){
  if (!PAGES[p]) p = "carte";
  const change = p !== pageCourante;
  pageCourante = p;
  if (p !== "carte" && en3D) quitter3D();
  document.querySelectorAll("#tabs .nav").forEach(b => { const on = b.dataset.page === p; b.classList.toggle("on", on); if (on) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current"); });
  for (const [k, sel] of Object.entries(PAGES)) $(sel).hidden = k !== p;
  if (p === "classement") rendreClassement();
  else if (p === "culture") rendreCulture();
  else if (p === "apropos") rendreApropos();
  else if (p === "participer") rendrePart();
  else if (p === "guide") rendreGuide();
  else if (p === "profil") rendreProfil();
  else if (p === "contrib"){ if (modePartage) return allerPage("carte"); rendreApercuContrib(); rendreCtCulture(); }
  else setTimeout(() => { map.invalidateSize(); placerIJ(); }, 0);
  if (change && p !== "carte") $(PAGES[p]).scrollTop = 0;
  $("#menuData").open = false;
  majHash();
}
document.addEventListener("click", e => { const b = e.target.closest("[data-page]"); if (b){ e.preventDefault(); allerPage(b.dataset.page); } });
function routerHash(){
  const h = decodeURIComponent(location.hash.slice(1));
  if (h.startsWith("c=")){ const id = h.slice(2); if (cabanes.some(c => c.id === id)){ allerPage("carte"); ouvrirDetail(id, true); return true; } }
  else if (PAGES[h]){ allerPage(h); return true; }
  return false;
}
window.addEventListener("hashchange", routerHash);

/* ================= Relief en 3D (MapLibre, hébergé sur le site, chargé seulement à la demande) =================
   La carte 2D (Leaflet) sert à chercher. Quand on ouvre une cabane, la carte se soulève en 3D au-dessus d'elle :
   on part de l'endroit affiché, on vole jusqu'à la cabane (environ 1 s), on incline. On revient en 2D en fermant la fiche
   ou avec « Revenir en 2D ». Les variables d'état sont en « var » : rendre() peut les lire avant que cette partie s'exécute. */
const ML_VER = "5.24.1";
const lienGoogleMaps = c => `https://www.google.com/maps/search/?api=1&query=${c.lat.toFixed(5)},${c.lng.toFixed(5)}`;
const lienGoogleEarth = c => `https://earth.google.com/web/@${c.lat.toFixed(5)},${c.lng.toFixed(5)},${Math.round(c.alt||1500)}a,1800d,35y,0h,65t,0r`;
var KEY_ANIM = "le-bon-toit-animations", KEY_AUTO3D = "le-bon-toit-3d-auto", KEY_FOND3D = "le-bon-toit-fond-3d";
var peutFaire3D = "WebGL2RenderingContext" in window;
var m3 = null, en3D = false, jeton3D = 0, pin3 = null, bulle3 = null;
let mlPromesse = null, fond3d = lsGet(KEY_FOND3D) === "carte" ? "carte" : "photo";
function animationsReduites(){ return lsGet(KEY_ANIM) === "reduites" || matchMedia("(prefers-reduced-motion: reduce)").matches; }
function auto3D(){ return peutFaire3D && lsGet(KEY_AUTO3D) !== "non" && !(navigator.connection && navigator.connection.saveData); }
const pause = ms => new Promise(r => setTimeout(r, ms));

function chargerScript(src){
  return new Promise((res, rej) => { const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = () => { s.remove(); rej(new Error(src)); }; document.head.appendChild(s); });
}
function chargerMapLibre(){
  if (window.maplibregl) return Promise.resolve();
  return mlPromesse || (mlPromesse = (async () => {
    /* d'abord la copie du site ; unpkg en secours (carnet ouvert depuis un fichier) */
    for (const base of ["vendor/maplibre/", `https://unpkg.com/maplibre-gl@${ML_VER}/dist/`]){
      try {
        await chargerScript(base + "maplibre-gl.js");
        if (!window.maplibregl) continue;
        const l = document.createElement("link"); l.rel = "stylesheet"; l.href = base + "maplibre-gl.css"; document.head.appendChild(l);
        return;
      } catch(e){}
    }
    mlPromesse = null; throw new Error("maplibre");
  })());
}

/* Hauteur du soleil (en degrés) à un endroit et un instant : formule simplifiée, précise à un degré près, assez pour colorer le ciel */
function hauteurSoleil(lat, lng, d = new Date()){
  const r = Math.PI / 180, j = d / 864e5 - 10957.5;
  const M = (357.529 + .98560028 * j) * r, Ls = (280.459 + .98564736 * j + 1.915 * Math.sin(M) + .02 * Math.sin(2 * M)) * r;
  const e = 23.439 * r, dec = Math.asin(Math.sin(e) * Math.sin(Ls)), ra = Math.atan2(Math.cos(e) * Math.sin(Ls), Math.cos(Ls));
  const H = (280.46061837 + 360.98564736629 * j + lng) * r - ra;
  return Math.asin(Math.sin(lat * r) * Math.sin(dec) + Math.cos(lat * r) * Math.cos(dec) * Math.cos(H)) / r;
}
/* Le ciel suit l'heure réelle, la même pour tout le monde : jour, heure dorée, nuit */
function ciel3D(lat, lng){
  const h = hauteurSoleil(lat, lng);
  const [ciel, horizon, brume] = h > 8 ? ["#8DB6D9", "#E4ECEE", "#E4ECEE"] : h > -4 ? ["#6E83A6", "#F1C38E", "#DDB896"] : h > -10 ? ["#2B3A5C", "#B9876A", "#55546A"] : ["#0B1424", "#26354F", "#1A2438"];
  return {"sky-color":ciel, "horizon-color":horizon, "fog-color":brume, "sky-horizon-blend":.6, "horizon-fog-blend":.5, "fog-ground-blend":.75, "atmosphere-blend":.8};
}
const DEM_URL = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png";
function style3d(){
  const raster = (tiles, maxzoom, attribution) => ({type:"raster", tiles, tileSize:256, maxzoom, attribution});
  return {version:8,
    sources:{
      pnoa: raster(["https://www.ign.es/wmts/pnoa-ma?request=GetTile&service=WMTS&VERSION=1.0.0&Layer=OI.OrthoimageCoverage&Style=default&Format=image/jpeg&TileMatrixSet=GoogleMapsCompatible&TileMatrix={z}&TileRow={y}&TileCol={x}"], 19, "© IGN España (PNOA)"),
      ortho: raster([ign("ORTHOIMAGERY.ORTHOPHOTOS","image/jpeg")], 19, "© IGN Géoplateforme"),
      topo: raster(["a","b","c"].map(sd => `https://${sd}.tile.opentopomap.org/{z}/{x}/{y}.png`), 17, "© contributeurs OpenStreetMap, SRTM · © OpenTopoMap (CC BY-SA)"),
      sentiers: raster(["https://tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png"], 18, "sentiers © Waymarked Trails"),
      dem: {type:"raster-dem", tiles:[DEM_URL], tileSize:256, maxzoom:15, encoding:"terrarium", attribution:"Relief : Terrain Tiles (AWS Open Data)"},
      demOmbre: {type:"raster-dem", tiles:[DEM_URL], tileSize:256, maxzoom:15, encoding:"terrarium"}
    },
    layers:[
      /* photo : l'Espagne dessous, la France (IGN) par-dessus */
      {id:"pnoa", type:"raster", source:"pnoa", layout:{visibility: fond3d === "photo" ? "visible" : "none"}},
      {id:"ortho", type:"raster", source:"ortho", layout:{visibility: fond3d === "photo" ? "visible" : "none"}},
      {id:"topo", type:"raster", source:"topo", layout:{visibility: fond3d === "carte" ? "visible" : "none"}},
      {id:"ombrage", type:"hillshade", source:"demOmbre", layout:{visibility: fond3d === "carte" ? "visible" : "none"}, paint:{"hillshade-exaggeration":.3}},
      {id:"sentiers", type:"raster", source:"sentiers", paint:{"raster-opacity":.85}}
    ],
    terrain:{source:"dem", exaggeration:1},   /* relief à l'échelle réelle, sans exagération */
    sky: ciel3D(42.8, 0.3)};
}
const valeurCss = v => v.startsWith("var(") ? getComputedStyle(document.documentElement).getPropertyValue(v.slice(4, -1)).trim() || "#B5751F" : v;
function geoCabanes3D(){
  return {type:"FeatureCollection", features:[...marqueurs.keys()].map(id => cabanes.find(c => c.id === id)).filter(c => c && c.lat != null)
    .map(c => ({type:"Feature", properties:{id:c.id, nom:c.nom, coul:valeurCss(couleur(c))}, geometry:{type:"Point", coordinates:[c.lng, c.lat]}}))};
}
function majCabanes3D(){ if (m3 && m3.getSource("cab")) m3.getSource("cab").setData(geoCabanes3D()); }
function creerCarte3D(){
  m3 = new maplibregl.Map({container:"carte3d", style:style3d(), center:[0.15, 42.85], zoom:8, maxPitch:75, attributionControl:{compact:true}, cooperativeGestures:false});
  m3.addControl(new maplibregl.NavigationControl({visualizePitch:true}), "top-right");
  m3.on("load", () => {
    m3.addSource("cab", {type:"geojson", data:geoCabanes3D()});
    m3.addLayer({id:"cab", type:"circle", source:"cab", paint:{"circle-radius":["interpolate",["linear"],["zoom"],8,4,13,7], "circle-color":["get","coul"], "circle-stroke-color":"#fff", "circle-stroke-width":2}});
  });
  m3.on("click", "cab", e => { const f = e.features && e.features[0]; if (f) ouvrirDetail(f.properties.id, true); });
  m3.on("mouseenter", "cab", e => { m3.getCanvas().style.cursor = "pointer"; const f = e.features[0];
    if (!bulle3) bulle3 = new maplibregl.Popup({closeButton:false, closeOnClick:false, offset:10});
    bulle3.setLngLat(f.geometry.coordinates).setText(f.properties.nom).addTo(m3); });
  m3.on("mouseleave", "cab", () => { m3.getCanvas().style.cursor = ""; if (bulle3) bulle3.remove(); });
  m3.on("error", () => {});   /* une tuile manquante (hors ligne, hors couverture) ne doit rien casser */
}
/* Attendre que les premières tuiles soient là, sans jamais bloquer plus de « max » ms */
const attendre3D = max => new Promise(r => { if (m3.loaded() && m3.areTilesLoaded()) return r(); const t = setTimeout(r, max); m3.once("idle", () => { clearTimeout(t); r(); }); });
const margeTiroir = () => innerWidth <= 760 && !$("#panel").classList.contains("closed")
  ? {top:40, left:0, right:0, bottom:Math.round($("#carte3d").clientHeight * .5)} : {top:40, left:0, right:0, bottom:0};
function capVers(c){
  const o = m3.getCenter(), dx = (c.lng - o.lng) * Math.cos(c.lat * Math.PI / 180), dy = c.lat - o.lat;
  return Math.hypot(dx, dy) < .02 ? (m3.getBearing() || -20) : Math.atan2(dx, dy) * 180 / Math.PI;
}
/* le ciel se règle sur l'heure et l'endroit ; si le style n'est pas encore prêt, on le fera à son chargement */
function majCiel3D(lat, lng){ if (m3.isStyleLoaded()) m3.setSky(ciel3D(lat, lng)); else m3.once("load", () => m3.setSky(ciel3D(lat, lng))); }
function survoler3D(c){
  const d = animationsReduites() ? 0 : 1000;
  majCiel3D(c.lat, c.lng);
  m3.flyTo({center:[c.lng, c.lat], zoom:13.6, pitch:innerWidth <= 760 ? 56 : 62, bearing:capVers(c), padding:margeTiroir(), duration:d, curve:1.3, essential:true});
  const el = document.createElement("div"); el.className = "pin3d"; el.innerHTML = `<span>${esc(c.nom)}</span><i></i><b></b>`;
  if (pin3) pin3.remove();
  pin3 = new maplibregl.Marker({element:el, anchor:"bottom", offset:[0, 6]}).setLngLat([c.lng, c.lat]).addTo(m3);
}
/* c : cabane à survoler ; sans cabane, on incline simplement la vue affichée. Renvoie false si la 3D n'a pas pu s'ouvrir. */
async function entrer3D(c){
  if (!peutFaire3D) return false;
  const j = ++jeton3D;
  try { await chargerMapLibre(); } catch(e){ toast("Le relief en 3D a besoin d'une connexion internet."); return false; }
  if (j !== jeton3D) return false;
  try { if (!m3) creerCarte3D(); } catch(e){ m3 = null; toast("Ton navigateur ne peut pas afficher le relief en 3D."); return false; }
  const box = $("#carte3d");
  if (!en3D){
    const ce = map.getCenter();
    box.hidden = false; m3.resize();
    m3.jumpTo({center:[ce.lng, ce.lat], zoom:map.getZoom() - 1, pitch:0, bearing:0, padding:{top:0, left:0, right:0, bottom:0}});
    majCiel3D(ce.lat, ce.lng);
    en3D = true; $("#mapWrap").classList.add("en3d"); $("#barre3d").hidden = false; majBoutons3D();
    await attendre3D(1500);
    if (j !== jeton3D) return false;
    box.classList.add("vu");
  }
  if (c) survoler3D(c);
  else m3.easeTo({pitch:55, bearing:-15, duration:animationsReduites() ? 0 : 900, essential:true});
  return true;
}
async function quitter3D(){
  if (!en3D || !m3) return;
  const j = ++jeton3D, d = animationsReduites() ? 0 : 450;
  m3.easeTo({pitch:0, bearing:0, duration:d, essential:true});
  await pause(d + 20);
  if (j !== jeton3D) return;
  const ce = m3.getCenter(), c = vueCourante === "detail" && cabanes.find(x => x.id === selId);
  map.setView([ce.lat, ce.lng], Math.round(m3.getZoom() + 1), {animate:false});
  if (c && c.lat != null) map.setView(cibleCentree(c, map.getZoom()), map.getZoom(), {animate:false});
  en3D = false; $("#mapWrap").classList.remove("en3d"); $("#barre3d").hidden = true; majBoutons3D();
  const box = $("#carte3d"); box.classList.remove("vu");
  setTimeout(() => { if (!en3D) box.hidden = true; }, d ? 260 : 0);
}
function majBoutons3D(){
  const b = $("#btn3D"); if (b) b.closest(".ctrl3d").hidden = en3D;
  document.querySelectorAll("#fond3d [data-f3]").forEach(x => x.classList.toggle("on", x.dataset.f3 === fond3d));
}
if (peutFaire3D){
  const Ctrl3D = L.Control.extend({options:{position:"topright"}, onAdd(){
    const d = L.DomUtil.create("div", "leaflet-bar ctrl3d");
    d.innerHTML = `<button type="button" id="btn3D" title="Voir le relief en 3D" aria-label="Voir le relief en 3D">3D</button>`;
    L.DomEvent.disableClickPropagation(d);
    d.firstChild.addEventListener("click", () => entrer3D(vueCourante === "detail" ? cabanes.find(x => x.id === selId) : null));
    return d; }});
  map.addControl(new Ctrl3D());
  /* une fois la page tranquille, on prépare MapLibre en cache (depuis le site) pour que la première fiche s'envole sans attendre */
  if (auto3D()) addEventListener("load", () => setTimeout(() => (window.requestIdleCallback || setTimeout)(() => chargerMapLibre().catch(() => {})), 4000));
}
$("#btn2D").addEventListener("click", quitter3D);
$("#fond3d").addEventListener("click", e => {
  const b = e.target.closest("[data-f3]"); if (!b) return;
  fond3d = b.dataset.f3; lsSet(KEY_FOND3D, fond3d); majBoutons3D();
  if (m3 && m3.getLayer("topo")){
    ["pnoa","ortho"].forEach(id => m3.setLayoutProperty(id, "visibility", fond3d === "photo" ? "visible" : "none"));
    ["topo","ombrage"].forEach(id => m3.setLayoutProperty(id, "visibility", fond3d === "carte" ? "visible" : "none"));
  }
});
majBoutons3D();

/* ================= refuges.info ================= */
const riCalque = L.layerGroup().addTo(map);
const riData = new Map();
let riOn = false, riTimer = null, riPrev = "";
function typeDepuisRI(t){
  t = String(t||"").toLowerCase();
  if (t.includes("non gard")) return "Cabane non gardée";
  if (t.includes("gard")) return "Refuge gardé";
  if (t.includes("gîte") || t.includes("gite")) return "Gîte d'étape";
  if (t.includes("abri") || t.includes("orri")) return "Orri / abri";
  return "Cabane non gardée";
}
const dejaDansCarnet = (lat, lng, id) => cabanes.some(c => (c.lien && id && c.lien.includes("/point/"+id)) ||
  (c.lat!=null && Math.abs(c.lat-lat) < 0.0004 && Math.abs(c.lng-lng) < 0.0005));
async function chargerRI(){
  if (!riOn) return;
  if (map.getZoom() < 10){ riCalque.clearLayers(); if (riPrev!=="zoom") toast("Zoome un peu plus pour voir les cabanes de refuges.info"); riPrev="zoom"; return; }
  const b = map.getBounds();
  const bbox = [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()].map(v=>v.toFixed(4)).join(",");
  if (bbox === riPrev) return; riPrev = bbox;
  try {
    const r = await fetch(`https://www.refuges.info/api/bbox?bbox=${bbox}&type_points=7,9,10&type_point=7,9,10&nb_points=250&format=geojson&detail=simple`);
    if (!r.ok) throw new Error(r.status);
    const gj = await r.json();
    if (!riOn) return;
    riCalque.clearLayers();
    (gj.features||[]).forEach(f => {
      const [lng, lat] = (f.geometry && f.geometry.coordinates) || [];
      if (lat==null) return;
      const p = f.properties || {}, id = String(p.id ?? "");
      if (dejaDansCarnet(lat, lng, id)) return;
      const type = (p.type && (p.type.valeur || p.type.nom)) || p.type || "";
      const alt = (p.coord && p.coord.alt) ?? p.altitude ?? null;
      const lien = (typeof p.lien === "string" && p.lien) || (id ? "https://www.refuges.info/point/"+id : "");
      const places = p.places && (p.places.valeur ?? p.places);
      riData.set(id, {nom:p.nom||"Sans nom", type:typeDepuisRI(type), lat, lng, alt:num(alt), lien, places:num(places)});
      L.circleMarker([lat,lng], {radius:6, color:"#56604F", weight:2, fillColor:"#ffffff", fillOpacity:.95})
        .bindTooltip(`${esc(p.nom||"Sans nom")} · autre abri, non vérifié`, {direction:"top", offset:[0,-6]})
        .bindPopup(`<div class="pop"><div class="kicker">Autre abri · pas dans la sélection</div><h4>${esc(p.nom||"Sans nom")}</h4><div class="sub">${esc(type)}${alt!=null?" · "+esc(alt)+" m":""} · source refuges.info</div>
          <p class="hint" style="margin:4px 0 0">Cet abri existe mais n'a pas encore été vérifié pour ${esc(SITE.nom)}.</p>
          <div class="act">${modePartage?"":`<button class="btn primary" type="button" data-ri-add="${esc(id)}">L'ajouter à mon carnet</button>`}
          ${lien?`<a class="btn ghost" href="${esc(lien)}" target="_blank" rel="noopener">Voir la fiche</a>`:""}</div></div>`)
        .addTo(riCalque);
    });
  } catch(e){
    riPrev = "";
    toast("refuges.info ne répond pas depuis ce fichier. Tu peux toujours ajouter tes cabanes à la main.", 5000);
    basculerRI(false);
  }
}
function basculerRI(on){
  riOn = on; const b = $("#btnRI"); b.classList.toggle("on", on); b.setAttribute("aria-pressed", on);
  if (!on){ riCalque.clearLayers(); riPrev = ""; } else { chargerRI(); if (map.getZoom() >= 10) toast("Ronds blancs : les autres abris connus de refuges.info, pas encore vérifiés pour " + SITE.nom + ".", 5000); }
  majLegende();
}
$("#btnRI").addEventListener("click", () => { allerPage("carte"); basculerRI(!riOn); });
map.on("moveend", () => { if (riOn){ clearTimeout(riTimer); riTimer = setTimeout(chargerRI, 400); }});
function ajouterDepuisRI(id){
  const d = riData.get(id); if (!d) return;
  ouvrirFiche(null);
  $("#f-nom").value = d.nom; $("#f-type").value = d.type; $("#f-lien").value = d.lien;
  if (d.places) $("#f-places").value = d.places;
  majCoords(d.lat, d.lng, d.alt==null);
  if (d.alt!=null) $("#f-alt").value = Math.round(d.alt);
  $("#f-statut").value = "afaire"; majStatutForm();
  setPlacement(false);
  toast("Complète la fiche puis enregistre");
}

/* ================= Géolocalisation ================= */
let moi = null;
function geoloc(cb){
  if (!navigator.geolocation){ toast("La localisation n'est pas disponible ici"); return; }
  navigator.geolocation.getCurrentPosition(p => cb([p.coords.latitude, p.coords.longitude]), () => toast("Localisation refusée ou indisponible"), {enableHighAccuracy:true, timeout:10000});
}
$("#btnLoc").addEventListener("click", () => {
  allerPage("carte");
  geoloc(ll => { if (moi) moi.setLatLng(ll); else moi = L.circleMarker(ll, {radius:8, color:"#fff", weight:3, fillColor:"#2a7fd4", fillOpacity:1}).addTo(map); map.flyTo(ll, 14); });
});

/* ================= Sauvegarde automatique (dossier) ================= */
const FS_OK = typeof window.showDirectoryPicker === "function";
const bk = {handle:null, ok:false, enCours:false, attente:false};
const photosMeta = () => [...photosDB.values()].map(p => ({id:p.id, cabaneId:p.cabaneId, visiteId:p.visiteId, date:p.date, legende:p.legende, auteur:p.auteur||""}));
async function ecrireSauvegarde(){
  if (modePartage || !bk.handle || !bk.ok) return;
  if (bk.enCours){ bk.attente = true; return; }
  bk.enCours = true;
  try {
    const fh = await bk.handle.getFileHandle("carnet-cabanes.json", {create:true});
    const w = await fh.createWritable();
    await w.write(JSON.stringify({version:3, sauvegarde:new Date().toISOString(), cabanes, photos: photosMeta()}, null, 1));
    await w.close();
    const dir = await bk.handle.getDirectoryHandle("photos", {create:true});
    const existants = new Set();
    for await (const nom of dir.keys()) existants.add(nom);
    for (const p of photosDB.values()){
      const nom = p.id + ".jpg"; if (existants.has(nom)) continue;
      const f = await dir.getFileHandle(nom, {create:true}); const w2 = await f.createWritable(); await w2.write(p.blob); await w2.close();
    }
    for (const nom of existants){ if (nom.endsWith(".jpg") && !photosDB.has(nom.slice(0,-4))) await dir.removeEntry(nom).catch(()=>{}); }
    lsSet(KEY_BK, String(Date.now()));
  } catch(e){
    bk.ok = false; toast("La sauvegarde automatique s'est interrompue. Ouvre « Données » pour la reprendre.", 5000);
  }
  bk.enCours = false; majBk();
  if (bk.attente){ bk.attente = false; ecrireSauvegarde(); }
}
async function lierDossier(){
  try {
    const h = await window.showDirectoryPicker({id:"carnet-cabanes", mode:"readwrite"});
    bk.handle = h; bk.ok = true; await idb.put("meta", h, "dossier");
    try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch(e){}
    await ecrireSauvegarde(); if (bk.ok) toast(`Sauvegarde automatique activée dans « ${h.name} »`);
  } catch(e){ if (e && e.name !== "AbortError") toast("Impossible d'utiliser ce dossier."); }
  majBk();
}
async function reprendreBk(){
  if (!bk.handle) return;
  try { const p = await bk.handle.requestPermission({mode:"readwrite"}); bk.ok = p === "granted"; } catch(e){ bk.ok = false; }
  if (bk.ok){ await ecrireSauvegarde(); toast("Sauvegarde automatique reprise"); } else toast("Accès au dossier refusé");
  majBk();
}
async function initBk(){
  if (!FS_OK || modePartage) return;
  try { const h = await idb.get("meta", "dossier"); if (h){ bk.handle = h; bk.ok = (await h.queryPermission({mode:"readwrite"})) === "granted"; } } catch(e){}
  majBk();
}
function majBk(){
  const dot = $("#bkDot"), st = $("#bkStat"), last = +lsGet(KEY_BK) || 0;
  dot.className = "bkdot no-partage" + (bk.ok ? " ok" : bk.handle ? " pause" : "");
  const quand = last ? new Date(last).toLocaleString("fr-FR", {day:"numeric", month:"short", hour:"2-digit", minute:"2-digit"}) : "jamais";
  if (!FS_OK) st.innerHTML = `Non disponible dans ce navigateur : utilise Chrome ou Edge sur ordinateur, ou télécharge des sauvegardes. Dernière : <b>${quand}</b>`;
  else if (bk.ok) st.innerHTML = `<b>Active</b> dans « ${esc(bk.handle.name)} ». Dernière : <b>${quand}</b>`;
  else if (bk.handle) st.innerHTML = `<b>En pause</b> : le navigateur redemande l'accès au dossier « ${esc(bk.handle.name)} » à chaque ouverture.`;
  else st.innerHTML = `Pas encore activée. Dernière sauvegarde : <b>${quand}</b>`;
  $("#bkLier").hidden = !FS_OK;
  $("#bkLierTxt").textContent = bk.handle ? "Changer de dossier de sauvegarde" : "Choisir un dossier de sauvegarde";
  $("#bkReprendre").hidden = !(bk.handle && !bk.ok);
  $("#impDossier").hidden = !FS_OK;
  rendreBandeau();
}
$("#bkLier").addEventListener("click", () => { $("#menuData").open = false; lierDossier(); });
$("#bkReprendre").addEventListener("click", () => { $("#menuData").open = false; reprendreBk(); });

/* ================= Bandeaux d'information ================= */
function rendreBandeau(){
  const box = $("#bandeau"); if (!box) return;
  const h = [];
  if (modePartage){
    /* site public : pas de bandeau, les options du carnet perso sont dans le menu « Données » */
  } else {
    if (PARTAGE && Array.isArray(PARTAGE.cabanes)) h.push(`<div class="bnd"><span>Tu es dans ton carnet personnel. Ce fichier contient aussi ${PARTAGE.par ? "les cabanes partagées par " + esc(PARTAGE.par) : "un carnet partagé"}.</span><button class="linkbtn" type="button" data-bnd="revoir">Y revenir</button></div>`);
    if (bk.handle && !bk.ok) h.push(`<div class="bnd warn"><span>Sauvegarde automatique en pause : le navigateur demande ton accord à chaque ouverture.</span><button class="btn ghost sm" type="button" data-bnd="reprendre">Reprendre</button></div>`);
    else if (!bk.ok){
      const last = +lsGet(KEY_BK) || 0, perso = cabanes.filter(c=>!c.exemple).length;
      if (perso >= 3 && Date.now() - last > 14*864e5)
        h.push(`<div class="bnd warn"><span>${last ? `Dernière sauvegarde il y a ${Math.floor((Date.now()-last)/864e5)} jours.` : "Tes cabanes ne sont pas encore sauvegardées en dehors du navigateur."}</span>
          ${FS_OK ? `<button class="btn ghost sm" type="button" data-bnd="lier">Activer la sauvegarde auto</button>` : `<button class="btn ghost sm" type="button" data-bnd="telecharger">Télécharger une sauvegarde</button>`}</div>`);
    }
  }
  box.innerHTML = h.join("");
}
$("#bandeau").addEventListener("click", e => {
  const b = e.target.closest("[data-bnd]"); if (!b) return;
  const a = b.dataset.bnd;
  if (a === "importer") importerPartage();
  else if (a === "mon"){ ssSet(SS_MON, "1"); location.reload(); }
  else if (a === "revoir"){ ssSet(SS_MON, null); location.reload(); }
  else if (a === "reprendre") reprendreBk();
  else if (a === "lier") lierDossier();
  else if (a === "telecharger") exporterJSON(false);
});

/* ================= Partage ================= */
let partageCible = null, partagePublier = false;
function ouvrirPartage(quoi, cid, publier){
  if (modePartage) return;
  $("#menuData").open = false;
  partagePublier = !!publier;
  $("#mpTitre").textContent = publier ? "Préparer la version en ligne" : "Partager";
  $("#mpAide").innerHTML = publier
    ? "Tu obtiens le fichier <b>index.html</b> de ton site public, avec tes cabanes dedans. Dépose-le chez ton hébergeur (GitHub Pages par exemple) à la place de l'ancien. Tes notes privées et le « avec qui » de tes sorties ne sont pas inclus."
    : "Tu obtiens un fichier .html à envoyer par WhatsApp, mail ou Drive. On l'ouvre dans un navigateur : la carte s'affiche avec tes cabanes. « Avec qui » n'est jamais partagé.";
  $("#mpCreer").textContent = publier ? "Créer index.html" : "Créer le fichier";
  $("#mpSite").hidden = !publier; $("#mpSiteWarn").hidden = true;
  $("#mpContact").value = SITE.contact || "";
  ["discord","instagram","youtube"].forEach(k => $("#mp-" + k).value = SITE.liens[k] || "");
  $("#mpPhotos").checked = true; $("#mpPerso").checked = true; $("#mpComs").checked = true; $("#mpPrive").checked = false;
  partageCible = cid ? cabanes.find(x=>x.id===cid) : null;
  $("#mpUneWrap").hidden = !partageCible;
  if (partageCible) $("#mpUneLbl").textContent = `Cette cabane : ${partageCible.nom}`;
  $("#mpNbF").textContent = filtrees().length; $("#mpNbT").textContent = cabanes.filter(c => !c.exemple).length || cabanes.length;
  (quoi === "une" && partageCible ? $("#mpUne") : $("#mpTout")).checked = true;
  $("#mpNom").value = lsGet(KEY_NOM) || SITE.auteur || "";
  majPartage();
  $("#modalPartage").hidden = false; setTimeout(() => $("#mpNom").focus(), 30);
}
function listePartage(){
  const q = document.querySelector("input[name=mpQuoi]:checked")?.value;
  return q === "une" && partageCible ? [partageCible] : q === "filtre" ? filtrees() : cabanes;
}
function majPartage(){
  const l = listePartage(), taille = l.reduce((a,c) => a + c.photos.reduce((s,id) => s + (photosDB.get(id)?.blob.size || 0), 0), 0);
  $("#mpTaille").textContent = taille ? `(fichier d'environ ${fmtTaille(taille*1.37 + 300e3)})` : "(aucune photo)";
  $("#mpTexte").hidden = document.querySelector("input[name=mpQuoi]:checked")?.value !== "une";
  $("#mpAfaireWrap").hidden = document.querySelector("input[name=mpQuoi]:checked")?.value === "une";
}
document.querySelectorAll("input[name=mpQuoi]").forEach(r => r.addEventListener("change", majPartage));
const fermerPartage = () => { $("#modalPartage").hidden = true; };
$("#mpAnnuler").addEventListener("click", fermerPartage);
$("#modalPartage").addEventListener("click", e => { if (e.target.id === "modalPartage") fermerPartage(); });
function ficheTexte(c){
  const s = score(c);
  return [
    `${c.nom} (${c.type}${c.alt!=null?", "+fmtAlt(c.alt):""})`,
    c.massif ? `Massif : ${c.massif}` : "",
    acces(c) ? `Accès : ${c.depart ? c.depart + " · " : ""}${acces(c)}` : "",
    [aFeu(c)?c.chauffage:"", c.bois!=="Inconnu"?"Bois : "+c.bois.toLowerCase():"", c.eau!=="Inconnu"?"Eau : "+c.eau.toLowerCase():"", c.places?c.places+" places":""].filter(Boolean).join(" · "),
    ressenti(c) ? `Ma note : ${fr1(ressenti(c))}/5` : "",
    s ? `Note par critères : ${fr1(s)}/5` : "",
    c.berger ? "Occupée l'été par un berger" : "",
    c.mot ? `Le mot : ${c.mot}` : "",
    `GPS : ${c.lat.toFixed(5)}, ${c.lng.toFixed(5)}`,
    `Carte : https://www.openstreetmap.org/?mlat=${c.lat.toFixed(5)}&mlon=${c.lng.toFixed(5)}#map=15/${c.lat.toFixed(5)}/${c.lng.toFixed(5)}`,
    c.lien ? `Fiche : ${c.lien}` : ""
  ].filter(Boolean).join("\n");
}
$("#mpTexte").addEventListener("click", async () => { if (!partageCible) return; toast(await copier(ficheTexte(partageCible)) ? "Fiche copiée : colle-la dans ton message" : "Copie impossible dans ce navigateur"); });
$("#mpCreer").addEventListener("click", async () => {
  let l = listePartage(); if (l.some(c => !c.exemple)) l = l.filter(c => !c.exemple);   /* les fiches d'exemple ne sont jamais partagées */
  if (!$("#mpAfaire").checked && l.length > 1) l = l.filter(c => c.statut !== "afaire");
  if (!l.length){ toast("Aucune cabane à partager"); return; }
  const nom = $("#mpNom").value.trim(); lsSet(KEY_NOM, nom);
  let site = null;
  if (partagePublier){
    const contact = $("#mpContact").value.trim(), telephone = SITE.hebergeur.telephone || "", w = $("#mpSiteWarn");
    if (contact && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)){ w.textContent = "Cette adresse e-mail ne semble pas valide."; w.hidden = false; $("#mpContact").focus(); return; }
    if (!contact && w.hidden){
      w.textContent = "Sans adresse de contact, le formulaire « Participer » ne pourra rien t'envoyer. Clique encore sur « Créer index.html » pour continuer quand même.";
      w.hidden = false; return;
    }
    const liens = {}; ["discord","instagram","youtube"].forEach(k => { const v = $("#mp-" + k).value.trim(); if (v) liens[k] = v; SITE.liens[k] = v || SITE.liens[k]; });
    site = {contact, telephone, auteur: nom, liens};
    lsSet(KEY_SITE, JSON.stringify({contact, liens}));
    if (contact) SITE.contact = contact;
  }
  const avecPh = $("#mpPhotos").checked, perso = $("#mpPerso").checked, coms = $("#mpComs").checked, prive = $("#mpPrive").checked;
  const btn = $("#mpCreer"); btn.disabled = true; btn.textContent = "Préparation…";
  try {
    const cabs = l.map(c => { const x = JSON.parse(JSON.stringify(c)); delete x.exemple; delete x.envie;
      x.visites = x.visites.map(v => { const w = {...v}; delete w.avec; if (!coms) delete w.com; return w; });   /* « avec qui » n'est jamais partagé */
      if (!prive) x.notes = "";
      if (!perso){ x.visites = []; x.crit = {}; x.coeur = false; delete x.ressenti; delete x.note; }
      if (!avecPh) x.photos = []; return x; });
    const photos = [];
    if (avecPh) for (const c of cabs){
      if (!perso) c.photos = c.photos.filter(id => !photosDB.get(id)?.visiteId);
      for (const id of c.photos){ const p = photosDB.get(id); if (p) photos.push({id, cabaneId:c.id, visiteId:perso?p.visiteId:null, date:p.date, legende:p.legende, auteur:p.auteur||"", data: await blobVersDataURL(p.blob)}); }
    }
    const json = JSON.stringify({version:3, par:nom, date:new Date().toISOString(), site, culture: culturesAjoutees(), cabanes:cabs, photos}).replace(/</g, "\\u003c");
    const html = SOURCE.replace(RE_DONNEES, (m, a, b) => a + json + b);
    const fichier = partagePublier ? "index.html" : l.length === 1 ? `cabane-${slug(l[0].nom)}.html` : `le-bon-toit${nom?"-"+slug(nom):""}.html`;
    telecharger(fichier, html, "text/html");
    fermerPartage(); toast(partagePublier ? "index.html créé : dépose-le chez ton hébergeur pour mettre le site à jour" : "Fichier créé : envoie-le à tes amis, ils l'ouvrent dans leur navigateur", 5500);
  } catch(e){ toast("La création du fichier a échoué."); }
  btn.disabled = false; btn.textContent = partagePublier ? "Créer index.html" : "Créer le fichier";
});
$("#btnPartagerTout").addEventListener("click", () => ouvrirPartage("tout"));
$("#btnPublier").addEventListener("click", () => ouvrirPartage("tout", null, true));
$("#btnImporterPartage").addEventListener("click", () => { $("#menuData").open = false; importerPartage(); });
$("#btnMonCarnet").addEventListener("click", () => { ssSet(SS_MON, "1"); location.reload(); });

async function importerPartage(){
  const local = chargerLocal() || [];
  const de = PARTAGE.par || "un ami";
  const ajout = new Set(); let doublons = 0;
  for (const s of PARTAGE.cabanes){
    const c = migrer(JSON.parse(JSON.stringify(s)));
    if (local.some(x => x.id === c.id || (Math.abs(x.lat-c.lat) < 0.0004 && Math.abs(x.lng-c.lng) < 0.0005))){ doublons++; continue; }
    const sc = ressenti(c) || score(c);
    c.notes = `Partagée par ${de}${sc ? ` (sa note : ${fr1(sc)}/5)` : ""}${c.notes ? "\n" + c.notes : ""}`;
    c.statut = "afaire"; c.visites = []; c.crit = {}; c.coeur = false; c.envie = 0; delete c.ressenti; delete c.note; c.partageePar = de; c.cree = Date.now();
    local.push(c); ajout.add(c.id);
  }
  try {
    for (const p of photosDB.values()) if (ajout.has(p.cabaneId)) await idb.put("photos", {...p, visiteId:null});
    localStorage.setItem(KEY, JSON.stringify(local));
  } catch(e){ toast("Import impossible : espace de stockage insuffisant ?"); return; }
  ssSet(SS_MON, "1");
  ssSet(SS_MSG, `${ajout.size} cabane${ajout.size>1?"s":""} ajoutée${ajout.size>1?"s":""} à ton carnet, en « à faire »${doublons?` · ${doublons} déjà présente${doublons>1?"s":""}`:""}`);
  location.reload();
}

/* ================= Export / import ================= */
async function exporterJSON(avecPhotos){
  $("#menuData").open = false;
  let photos = photosMeta();
  if (avecPhotos){ toast("Préparation de la sauvegarde…", 8000); photos = []; for (const p of photosDB.values()) photos.push({id:p.id, cabaneId:p.cabaneId, visiteId:p.visiteId, date:p.date, legende:p.legende, auteur:p.auteur||"", data: await blobVersDataURL(p.blob)}); }
  telecharger(`carnet-cabanes-${auj()}${avecPhotos?"-complet":""}.json`, JSON.stringify({version:3, exporte:new Date().toISOString(), cabanes, photos}, null, 1), "application/json");
  lsSet(KEY_BK, String(Date.now())); majBk();
  toast(avecPhotos ? "Sauvegarde complète téléchargée" : "Sauvegarde téléchargée (sans photos)");
}
$("#expJson").addEventListener("click", () => exporterJSON(false));
$("#expJsonFull").addEventListener("click", () => exporterJSON(true));
$("#expGpx").addEventListener("click", () => {
  const wpts = cabanes.filter(c=>c.lat!=null).map(c => {
    const s = noteAff(c);
    const desc = [c.type, P(c.statut==="afaire"?"À faire":"Faite", ""), s?fr1(s)+"/5":"", acces(c), c.chauffage!=="Inconnu"?c.chauffage:"", c.bois!=="Inconnu"?c.bois:"", c.eau!=="Inconnu"?c.eau:"", c.mot, P(c.notes,"")].filter(Boolean).join(" · ");
    return `  <wpt lat="${c.lat}" lon="${c.lng}">${c.alt!=null?`<ele>${c.alt}</ele>`:""}<name>${esc(c.nom)}</name><desc>${esc(desc)}</desc><sym>Lodge</sym></wpt>`;
  }).join("\n");
  const trks = cabanes.filter(c=>c.trace && c.trace.length > 1).map(c =>
    `  <trk><name>${esc("Accès " + c.nom)}</name><trkseg>${c.trace.map(p => `<trkpt lat="${p[0]}" lon="${p[1]}">${p[2]!=null?`<ele>${p[2]}</ele>`:""}</trkpt>`).join("")}</trkseg></trk>`).join("\n");
  telecharger(`${modePartage?"le-bon-toit":"carnet-cabanes"}-${auj()}.gpx`, `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="Le Bon Toit" xmlns="http://www.topografix.com/GPX/1/1">\n${wpts}\n${trks}\n</gpx>\n`, "application/gpx+xml");
  $("#menuData").open = false; toast("Fichier GPX téléchargé");
});
async function fusionner(liste, photos, lirePhoto){
  let n = 0, np = 0;
  for (let c of liste){ if (!c || !c.nom || c.lat == null) continue; c = migrer({...c, id:c.id || "c"+uid()});
    const i = cabanes.findIndex(x=>x.id===c.id); if (i>=0) cabanes[i] = c; else cabanes.push(c); n++; }
  for (const m of (photos||[])){
    if (photosDB.has(m.id)) continue;
    try { const blob = await lirePhoto(m); if (!blob) continue; const thumb = await redim(blob, 320, .7, true);
      await enregistrerPhoto({id:m.id, cabaneId:m.cabaneId, visiteId:m.visiteId||null, date:m.date||"", legende:m.legende||"", auteur:m.auteur||"", blob, thumb}); np++; } catch(e){}
  }
  sauver(); syncFiltresUI(); rendre();
  toast(`${n} cabane${n>1?"s":""} restaurée${n>1?"s":""}${np?` · ${np} photo${np>1?"s":""}`:""}`);
}
$("#impJson").addEventListener("change", async e => {
  const f = e.target.files[0]; e.target.value = ""; $("#menuData").open = false;
  if (!f) return;
  try {
    const d = JSON.parse(await f.text());
    const liste = Array.isArray(d) ? d : d.cabanes; if (!Array.isArray(liste)) throw 0;
    await fusionner(liste, d.photos, async m => m.data ? dataURLVersBlob(m.data) : null);
  } catch(err){ toast("Ce fichier n'est pas une sauvegarde du carnet"); }
});
$("#impDossier").addEventListener("click", async () => {
  $("#menuData").open = false;
  try {
    const h = await window.showDirectoryPicker({id:"carnet-cabanes", mode:"read"});
    const d = JSON.parse(await (await (await h.getFileHandle("carnet-cabanes.json")).getFile()).text());
    let dir = null; try { dir = await h.getDirectoryHandle("photos"); } catch(e){}
    await fusionner(d.cabanes || [], d.photos, async m => dir ? await (await dir.getFileHandle(m.id + ".jpg")).getFile() : null);
  } catch(e){ if (e && e.name !== "AbortError") toast("Ce dossier ne contient pas de sauvegarde du carnet (carnet-cabanes.json)."); }
});

/* ================= Divers ================= */
document.addEventListener("click", e => { const m = $("#menuData"); if (m.open && !m.contains(e.target)) m.open = false; });
document.addEventListener("keydown", e => {
  if (!$("#lb").hidden){ if (e.key === "Escape") fermerLightbox(); else if (e.key === "ArrowLeft"){ lbIdx--; majLightbox(); } else if (e.key === "ArrowRight"){ lbIdx++; majLightbox(); } return; }
  if (e.key !== "Escape") return;
  if (placementProp) finPlacementProp(null);
  else if (en3D && vueCourante !== "detail") quitter3D();
  else if (!$("#modalBienvenue").hidden){ lsSet(KEY_BV,"1"); $("#modalBienvenue").hidden = true; }
  else if (!$("#modalPartage").hidden) fermerPartage();
  else if (vueCourante === "fiche") fermerFiche(); else if (vueCourante === "retour") annulerRetour();
  else if (vueCourante === "itin"){ montrerVue("detail"); rendreDetail(); } else if (vueCourante === "detail") montrerVue("liste");
});
document.querySelector("label[for=impJson]").addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " "){ e.preventDefault(); $("#impJson").click(); } });

/* ================= Démarrage ================= */
/* ================= Coin culture et info du jour ================= */
const VERSION = "1.3 · novembre 2026";
const jourNum = () => { const d = new Date(); return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5); };
/* Un texte différent chaque jour, dans un ordre mélangé (pas tous les textes d'un même thème à la suite) */
const pgcd = (a, b) => b ? pgcd(b, a % b) : a;
const articleDuJour = () => { const n = CULTURE.length, pas = [37, 41, 43, 47, 53, 59].find(k => pgcd(k, n) === 1) || 1;
  return CULTURE[(((jourNum() * pas) % n) + n) % n]; };
const iconeTheme = t => (THEMES[t] || ["", "i-livre"])[1];
const nomTheme = t => (THEMES[t] || [t])[0];
/* « Le saviez-vous ? » : replié au départ, s'ouvre au clic, se déplace où on veut sur la carte */
let ijOuvert = false, ijGlisse = false;
const KEY_IJPOS = "le-bon-toit-info-position";
let posIJ = null; try { posIJ = JSON.parse(lsGet(KEY_IJPOS)); } catch(e){}
function placerIJ(){
  const el = $("#infoJourBox").firstElementChild, w = $("#mapWrap"); if (!el || !w.clientWidth) return;
  const def = innerWidth <= 760 ? {x:12, y:12} : {x:14, y:66};
  const p = posIJ || def, maxX = w.clientWidth - el.offsetWidth - 8, maxY = w.clientHeight - el.offsetHeight - 30;   /* garde libre la ligne des crédits de la carte */
  el.style.left = Math.max(8, Math.min(p.x, maxX)) + "px"; el.style.top = Math.max(8, Math.min(p.y, maxY)) + "px";
}
function deplacable(el){
  el.addEventListener("pointerdown", e => {
    if (e.button !== 0 || (e.target.closest("button, a") && !e.target.closest(".info-pill"))) return;
    const w = $("#mapWrap").getBoundingClientRect(), r = el.getBoundingClientRect(), x0 = e.clientX, y0 = e.clientY;
    let bouge = false;
    const move = ev => {
      if (!bouge && Math.hypot(ev.clientX - x0, ev.clientY - y0) < 6) return;
      if (!bouge){ bouge = true; el.classList.add("drag"); try { el.setPointerCapture(e.pointerId); } catch(_){} }
      posIJ = {x: r.left - w.left + ev.clientX - x0, y: r.top - w.top + ev.clientY - y0}; placerIJ();
    };
    const fin = () => { removeEventListener("pointermove", move); removeEventListener("pointerup", fin); removeEventListener("pointercancel", fin);
      el.classList.remove("drag");
      if (bouge){ ijGlisse = true; setTimeout(() => ijGlisse = false, 50); posIJ = {x: parseFloat(el.style.left), y: parseFloat(el.style.top)}; lsSet(KEY_IJPOS, JSON.stringify(posIJ)); } };
    addEventListener("pointermove", move); addEventListener("pointerup", fin); addEventListener("pointercancel", fin);
  });
}
function rendreInfoJour(){
  const a = articleDuJour(), box = $("#infoJourBox");
  box.innerHTML = !ijOuvert
    ? `<button class="info-pill" type="button" id="ijOuvrir" title="Info du jour · glisse pour déplacer"><svg width="16" height="16" aria-hidden="true"><use href="#i-livre"/></svg><b>Le saviez-vous ?</b></button>`
    : `<article class="info-jour" aria-labelledby="ijTitre" title="Glisse pour déplacer"><div class="k"><svg width="16" height="16" aria-hidden="true"><use href="#${iconeTheme(a.theme)}"/></svg>Le saviez-vous ?</div>
        <button class="x" type="button" id="ijFermer" aria-label="Replier l'info du jour"><svg aria-hidden="true"><use href="#i-x"/></svg></button>
        <h3 id="ijTitre">${esc(a.titre)}</h3><p>${esc(a.court)}</p><button class="linkbtn" type="button" id="ijLire">Lire la suite dans le coin culture</button></article>`;
  deplacable(box.firstElementChild); placerIJ();
  const f = $("#ijFermer"), o = $("#ijOuvrir"), l = $("#ijLire");
  if (f) f.onclick = () => { ijOuvert = false; rendreInfoJour(); $("#ijOuvrir").focus(); };
  if (o) o.onclick = () => { if (ijGlisse) return; ijOuvert = true; rendreInfoJour(); };
  if (l) l.onclick = () => { cuTheme = ""; allerPage("culture"); };
}
addEventListener("resize", () => placerIJ());
let cuTheme = "";
function rendreCulture(){
  const a = articleDuJour();
  const jour = new Date().toLocaleDateString("fr-FR", {weekday:"long", day:"numeric", month:"long"});
  $("#cuJour").innerHTML = `<div class="fig" aria-hidden="true"><svg><use href="#${iconeTheme(a.theme)}"/></svg></div>
    <div class="txt"><div class="k"><b>L'info du jour</b><span>${esc(nomTheme(a.theme))} · ${esc(jour)}</span></div><h3>${esc(a.titre)}</h3><p>${esc(a.texte)}</p></div>`;
  $("#cuThemes").innerHTML = `<button type="button" class="chip${cuTheme?"":" on"}" data-cut="" aria-pressed="${!cuTheme}">Tout</button>` +
    Object.entries(THEMES).map(([k,[l]]) => `<button type="button" class="chip${cuTheme===k?" on":""}" data-cut="${k}" aria-pressed="${cuTheme===k}">${esc(l)}</button>`).join("");
  $("#cuListe").innerHTML = CULTURE.filter(x => !cuTheme || x.theme === cuTheme).map(x => `
    <article class="art${x.id===a.id?" jour":""}"><span class="k"><svg aria-hidden="true"><use href="#${iconeTheme(x.theme)}"/></svg>${esc(nomTheme(x.theme))}${x.id===a.id?" · info du jour":""}${x.auteur?" · proposé par " + esc(x.auteur):""}</span>
      <h3>${esc(x.titre)}</h3><p>${esc(x.court)}</p>
      <details><summary>Lire la suite</summary><p>${esc(x.texte)}</p></details></article>`).join("");
}
$("#cuProposer").addEventListener("click", () => proposerTexte());
$("#cuThemes").addEventListener("click", e => { const b = e.target.closest("[data-cut]"); if (!b) return; cuTheme = b.dataset.cut; rendreCulture(); });

/* ================= Participer : 4 types de contribution ================= */
let partMode = "prop", propPos = null, placementProp = false;
const PART = {
  prop:    {envoi:"Envoyer la proposition", texte:"Pourquoi elle mérite sa place *", ph:"Ce qui rend cette cabane chouette : le cadre, la cheminée, la vue au réveil…", passage:"Ton passage", date:true, etat:true, photos:true},
  sig:     {envoi:"Envoyer le signalement", texte:"Un mot pour les suivants", ph:"Ex. Plus de bois sec à l'intérieur, en monter un peu. Neige à partir de 1 900 m.", passage:"Ton passage", date:true, etat:true, photos:true},
  avis:    {envoi:"Envoyer mon message", texte:"Ton avis *", ph:"Ce que tu as aimé ou moins aimé, ce qu'il faut savoir avant d'y aller…", passage:"Ton passage", date:true, etat:false, photos:true},
  culture: {envoi:"Proposer mon texte", texte:"Ton texte *", ph:"Une histoire, une légende, une bête ou une fleur de la montagne, une bonne pratique… Quelques phrases suffisent.", passage:"Le texte", date:false, etat:false, photos:false}
};
$("#c-theme").innerHTML = Object.entries(THEMES).map(([k,[l]]) => `<option value="${k}">${esc(l)}</option>`).join("");
const typeAvis = () => (document.querySelector("input[name=a-type]:checked")||{}).value || "avis";
function rendrePart(){
  const m = partMode, d = PART[m];
  document.querySelectorAll(".tabs2 [data-pm]").forEach(b => b.setAttribute("aria-selected", b.dataset.pm === m));
  $("#partProp").hidden = m !== "prop"; $("#partCab").hidden = !(m === "sig" || m === "avis");
  $("#partSig").hidden = m !== "sig"; $("#partAvis").hidden = m !== "avis"; $("#partCulture").hidden = m !== "culture";
  $("#x-dateWrap").hidden = !d.date; $("#x-etatWrap").hidden = !d.etat; $("#x-photosHint").hidden = !d.photos;
  $("#x-passage-lgd").textContent = d.passage;
  const corr = m === "avis" && typeAvis() === "correction";
  $("#a-noteWrap").hidden = corr; $("#a-recoWrap").hidden = corr; $("#a-quoiWrap").hidden = !corr;
  $("#x-texte-lbl").textContent = corr ? "La bonne information *" : d.texte;
  $("#x-texte").placeholder = corr ? "Ex. La source est tarie depuis 2025 ; il y a en fait 8 places ; le départ se fait plutôt depuis…" : d.ph;
  $("#partEnvoyer").textContent = d.envoi;
  $("#p-pos").textContent = propPos ? `${propPos[0].toFixed(5)}, ${propPos[1].toFixed(5)}` : "Pas encore placé";
  $("#p-placer").textContent = propPos ? "Déplacer sur la carte" : "Placer sur la carte";
  $("#nomsCabanes").innerHTML = cabanes.filter(c => !c.exemple).map(c => `<option value="${esc(c.nom)}">`).join("");
  if (!$("#x-pseudo").value) $("#x-pseudo").value = profil.pseudo || lsGet(KEY_PSEUDO) || "";
  const mo = $("#partMode");
  if (SITE.formulaire) mo.textContent = "Ton message part directement, sans ouvrir ta messagerie.";
  else if (SITE.contact) mo.textContent = "Ta messagerie va s'ouvrir avec le message prêt : il ne restera qu'à l'envoyer.";
  else mo.textContent = modePartage ? "L'envoi n'est pas encore disponible : le site n'a pas d'adresse de contact." : "Pour recevoir les messages, indique ton adresse de contact dans « Données », puis « Préparer la version en ligne ».";
  mo.classList.toggle("warn", !SITE.formulaire && !SITE.contact);
  $("#partCommu").innerHTML = `<h3>La communauté</h3><p class="hint" style="margin-bottom:10px">Pour discuter, poser une question ou organiser une sortie.</p>${contactsHtml()}`;
}
function changerPart(mode){ partMode = PART[mode] ? mode : "prop"; $("#partErr").hidden = true; $("#partOk").hidden = true; rendrePart(); }
$(".tabs2").addEventListener("click", e => { const b = e.target.closest("[data-pm]"); if (b) changerPart(b.dataset.pm); });
$(".tabs2").addEventListener("keydown", e => {
  if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
  e.preventDefault(); const ks = Object.keys(PART), i = ks.indexOf(partMode), n = ks[(i + (e.key === "ArrowRight" ? 1 : ks.length - 1)) % ks.length];
  changerPart(n); $(`.tabs2 [data-pm="${n}"]`).focus();
});
document.querySelectorAll("input[name=a-type]").forEach(r => r.addEventListener("change", rendrePart));
function signalerEtat(c){ allerPage("participer"); changerPart("sig"); $("#s-cab").value = c.nom; $("#x-date").focus(); }
function donnerAvis(c){ allerPage("participer"); changerPart("avis"); $("#s-cab").value = c.nom; $("#x-texte").focus(); }
function proposerTexte(){ allerPage("participer"); changerPart("culture"); $("#c-titre").focus(); }
$("#p-placer").addEventListener("click", () => {
  allerPage("carte"); placementProp = true;
  setBanniere("Clique sur la carte à l'emplacement de la cabane", true);
  if (propPos) map.panTo(propPos);
});
function finPlacementProp(ll){
  placementProp = false; setBanniere("");
  if (ll) propPos = ll;
  allerPage("participer"); rendrePart();
  if (ll) toast("Emplacement enregistré");
}
const valeurs = sel => [...document.querySelectorAll(sel)].filter(i => i.checked).map(i => i.value);
async function envoyerPart(e){
  e.preventDefault();
  const m = partMode, err = $("#partErr"), val = id => $(id).value.trim();
  const pseudo = val("#x-pseudo"), texte = val("#x-texte"), date = PART[m].date ? val("#x-date") : "";
  const etat = PART[m].etat ? ((document.querySelector("input[name=x-etat]:checked")||{}).value || "") : "";
  const corr = m === "avis" && typeAvis() === "correction", note = (document.querySelector("input[name=a-note]:checked")||{}).value || "";
  const reco = (document.querySelector("input[name=a-reco]:checked")||{}).value || "";
  const manque = t => { err.textContent = t; err.hidden = false; err.scrollIntoView({block:"nearest"}); };
  if (m === "prop" && !val("#p-nom")) return manque("Indique le nom de la cabane.");
  if (m === "prop" && !propPos && !val("#p-lien")) return manque("Place la cabane sur la carte, ou colle un lien ou des coordonnées.");
  if ((m === "sig" || m === "avis") && !val("#s-cab")) return manque("Indique de quelle cabane il s'agit.");
  if (m === "sig" && !etat && !texte && !valeurs("#s-pb input").length) return manque("Indique au moins l'état constaté, un problème ou un mot.");
  if (m === "culture" && !val("#c-titre")) return manque("Donne un titre à ton texte.");
  if ((m === "prop" || m === "avis" || m === "culture") && !texte) return manque(corr ? "Indique la bonne information." : m === "prop" ? "Dis en quelques mots pourquoi elle mérite sa place." : "Écris ton texte.");
  if (!pseudo) return manque("Indique ton prénom ou un pseudo.");
  if (!$("#x-ok").checked) return manque("Coche la case d'accord pour envoyer.");
  err.hidden = true; lsSet(KEY_PSEUDO, pseudo);
  const fmtPos = q => `${q[0].toFixed(5)}, ${q[1].toFixed(5)} (https://www.openstreetmap.org/?mlat=${q[0].toFixed(5)}&mlon=${q[1].toFixed(5)}#map=16/${q[0].toFixed(5)}/${q[1].toFixed(5)})`;
  const L_ = {
    prop: [`Proposition de cabane pour ${SITE.nom}`, "", `Nom : ${val("#p-nom")}`, val("#p-massif") ? `Massif : ${val("#p-massif")}` : "", val("#p-alt") ? `Altitude : ${val("#p-alt")} m` : "",
      propPos ? `Position : ${fmtPos(propPos)}` : "", val("#p-lien") ? `Lien ou coordonnées : ${val("#p-lien")}` : "",
      `Type : ${(document.querySelector("input[name=p-type]:checked")||{}).value || ""}`,
      valeurs("#p-equip input").length ? `Sur place : ${valeurs("#p-equip input").join(", ")}` : "", val("#p-places") ? `Places : ${val("#p-places")}` : ""],
    sig: [`Signalement d'état pour ${SITE.nom}`, "", `Cabane : ${val("#s-cab")}`, valeurs("#s-pb input").length ? `Remarqué : ${valeurs("#s-pb input").join(", ")}` : ""],
    avis: corr ? [`Correction de fiche pour ${SITE.nom}`, "", `Cabane : ${val("#s-cab")}`, valeurs("#a-quoi input").length ? `À corriger : ${valeurs("#a-quoi input").join(", ")}` : ""]
               : [`Avis sur une cabane pour ${SITE.nom}`, "", `Cabane : ${val("#s-cab")}`, note ? `Note : ${note}/5` : "", reco ? `Je recommande : ${reco}` : ""],
    culture: [`Texte proposé pour le coin culture de ${SITE.nom}`, "", `Thème : ${nomTheme(val("#c-theme"))}`, `Titre : ${val("#c-titre")}`, val("#c-source") ? `Source : ${val("#c-source")}` : ""]
  };
  const lignes = L_[m];
  const titreTexte = {prop:"Pourquoi elle mérite sa place", sig:"Un mot pour les suivants", avis: corr ? "La bonne information" : "Avis", culture:"Texte"}[m];
  lignes.push(date ? `Date de passage : ${date.split("-").reverse().join("/")}` : "", etat ? `État constaté : ${etat}` : "", texte ? `\n${titreTexte} :\n${texte}` : "",
    "", `De : ${pseudo}${val("#x-mail") ? " <" + val("#x-mail") + ">" : ""}`, "Accord de publication après relecture : oui",
    PART[m].photos ? "Photos : jointes à ce message, le cas échéant (photos personnelles)." : "");
  let message = lignes.filter(x => x !== "").join("\n").replace(/\n{3,}/g, "\n\n");
  const objet = {prop:"Proposition", sig:"Signalement", avis: corr ? "Correction" : "Avis", culture:"Coin culture"}[m];
  const sur = m === "prop" ? val("#p-nom") : m === "culture" ? val("#c-titre") : val("#s-cab");
  const sujet = `[${SITE.nom}] ${objet} : ${sur}`;
  /* code de lecture : permet à l'auteur de vérifier puis publier la contribution en un clic (page « À relire ») */
  const cabSel = cabanes.find(x => x.nom === val("#s-cab"));
  const payload = {v:1, t: corr ? "corr" : m, pseudo, date, etat, texte, envoye: new Date().toISOString()};
  if (m === "sig" || m === "avis"){ payload.cab = val("#s-cab"); payload.cabId = cabSel ? cabSel.id : ""; }
  if (m === "sig") payload.pb = valeurs("#s-pb input");
  if (m === "avis"){ if (corr) payload.quoi = valeurs("#a-quoi input"); else { payload.note = +note || 0; payload.reco = reco === "oui" ? true : reco === "non" ? false : null; } }
  if (m === "prop") payload.prop = {nom: val("#p-nom"), massif: val("#p-massif"), alt: +val("#p-alt") || null, lat: propPos ? propPos[0] : null, lng: propPos ? propPos[1] : null,
    lien: val("#p-lien"), type: (document.querySelector("input[name=p-type]:checked")||{}).value || "", equip: valeurs("#p-equip input"), places: +val("#p-places") || null};
  if (m === "culture") payload.culture = {theme: val("#c-theme"), titre: val("#c-titre"), source: val("#c-source")};
  message += `\n\n— Code de lecture pour ${SITE.nom} (ne pas modifier) —\nLBT1:${btoa(unescape(encodeURIComponent(JSON.stringify(payload))))}:LBT`;
  const hist = () => ajouterHist({t: payload.t, sur, date: auj()});
  const ok = t => { $("#partOk").textContent = t; $("#partOk").hidden = false; $("#partOk").scrollIntoView({block:"nearest"}); };
  if (SITE.formulaire){
    const b = $("#partEnvoyer"); b.disabled = true;
    try {
      const r = await fetch(SITE.formulaire, {method:"POST", headers:{"Content-Type":"application/json", "Accept":"application/json"},
        body: JSON.stringify({_subject:sujet, sujet, message, pseudo, email:val("#x-mail")})});
      if (!r.ok) throw new Error(r.status);
      ok("Merci ! Ta contribution est bien arrivée. Elle sera relue avant d'apparaître sur le site."); hist();
      $("#formPart").reset(); propPos = null; $("#x-pseudo").value = pseudo; rendrePart();
    } catch(_){ manque("L'envoi a échoué. Vérifie ta connexion et réessaie."); }
    b.disabled = false; return;
  }
  if (!SITE.contact) return manque(modePartage ? "L'envoi n'est pas encore disponible sur ce site." : "Indique ton adresse de contact dans « Données », puis « Préparer la version en ligne ».");
  location.href = `mailto:${encodeURIComponent(SITE.contact).replace(/%40/g,"@")}?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(message)}`;
  ok(`Ta messagerie s'est ouverte avec le message prêt. Il ne reste qu'à l'envoyer${PART[m].photos ? ", en y joignant tes photos si tu en as" : ""}. Merci !`); hist();
  const mail = val("#x-mail"); $("#formPart").reset(); propPos = null; $("#x-pseudo").value = pseudo; $("#x-mail").value = mail; $("#x-ok").checked = true; rendrePart(); $("#partOk").hidden = false;
}
$("#formPart").addEventListener("submit", envoyerPart);

/* ================= À relire : contributions reçues par e-mail ================= */
const KEY_TRAITE = "le-bon-toit-contrib-traitees";
let traitees = new Set(); try { traitees = new Set(JSON.parse(lsGet(KEY_TRAITE)) || []); } catch(e){}
let ctCourant = null, ctFichiers = [];
const cleContrib = d => (d.envoye || "") + "|" + (d.pseudo || "");
function lireCode(txt){
  const m = String(txt).match(/LBT1:([\s\S]*?):LBT/); if (!m) return null;
  try { return JSON.parse(decodeURIComponent(escape(atob(m[1].replace(/[^A-Za-z0-9+/=]/g, ""))))); } catch(e){ return null; }
}
const ETAT_VERS_FICHE = {"Très bon":"Très bon", "Bon":"Bon", "Moyen":"Correct", "Dégradé":"Délabré"};
const TITRES_CT = {prop:"Proposition de cabane", sig:"Signalement d'état", avis:"Avis sur une cabane", corr:"Correction de fiche", culture:"Texte pour le coin culture"};
function trouverCabane(d){ return cabanes.find(c => c.id === d.cabId) || cabanes.find(c => c.nom.toLowerCase() === String(d.cab || "").toLowerCase()) || null; }
function rendreApercuContrib(){
  const d = ctCourant, box = $("#ctApercu");
  ctFichiers.forEach(f => URL.revokeObjectURL(f.url));
  if (!d){ box.innerHTML = ""; return; }
  const surCab = ["sig","avis","corr"].includes(d.t), cab = surCab ? trouverCabane(d) : null;
  const kv = [["De", d.pseudo], ["Envoyé le", d.envoye ? new Date(d.envoye).toLocaleDateString("fr-FR", {day:"numeric", month:"long", year:"numeric"}) : ""],
    ["Passage", d.date ? d.date.split("-").reverse().join("/") : ""], ["État constaté", d.etat], ["Note", d.note ? d.note + " / 5" : ""],
    ["Recommande", d.reco === true ? "oui" : d.reco === false ? "non" : ""], ["Remarqué", (d.pb || []).join(", ")], ["À corriger", (d.quoi || []).join(", ")]];
  if (d.t === "prop" && d.prop) kv.push(["Nom", d.prop.nom], ["Massif", d.prop.massif], ["Altitude", d.prop.alt ? d.prop.alt + " m" : ""], ["Type", d.prop.type],
    ["Position", d.prop.lat != null ? `${(+d.prop.lat).toFixed(5)}, ${(+d.prop.lng).toFixed(5)}` : ""], ["Lien", d.prop.lien], ["Sur place", (d.prop.equip || []).join(", ")], ["Places", d.prop.places]);
  const photosOk = ["sig","avis"].includes(d.t);
  const premiere = (d.texte || "").split(/(?<=[.!?])\s/)[0] || "";
  box.innerHTML = `<section class="carte-box ct-ap">
    <div class="kicker">${esc(TITRES_CT[d.t] || "Contribution")}</div>
    ${traitees.has(cleContrib(d)) ? `<p class="hint warn">Cette contribution a déjà été traitée.</p>` : ""}
    ${surCab ? `<div class="f"><label for="ctCab">Cabane concernée</label><select id="ctCab"><option value="">Choisir…</option>${[...cabanes].filter(c => !c.exemple).sort((a,b) => a.nom.localeCompare(b.nom, "fr")).map(c => `<option value="${esc(c.id)}"${cab && cab.id === c.id ? " selected" : ""}>${esc(c.nom)}</option>`).join("")}</select>${!cab ? `<span class="hint">Cabane indiquée : « ${esc(d.cab || "")} », introuvable dans ton carnet.</span>` : ""}</div>` : ""}
    <dl class="kv">${kv.filter(([,v]) => v).map(([k,v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join("")}</dl>
    ${d.t !== "culture" && d.texte ? `<blockquote class="ct-txt">${esc(d.texte)}</blockquote>` : ""}
    ${d.t === "culture" ? `<div class="row"><div class="f"><label for="ctcTheme">Thème</label><select id="ctcTheme">${Object.entries(THEMES).map(([k,[l]]) => `<option value="${k}"${(d.culture||{}).theme === k ? " selected" : ""}>${esc(l)}</option>`).join("")}</select></div>
        <div class="f"><label for="ctcTitre">Titre</label><input id="ctcTitre" value="${esc((d.culture||{}).titre || "")}"></div></div>
      <div class="f"><label for="ctcCourt">Phrase d'accroche (affichée sur la carte)</label><input id="ctcCourt" value="${esc(premiere)}"></div>
      <div class="f"><label for="ctcTexte">Texte complet <small>(tu peux le corriger avant de publier)</small></label><textarea id="ctcTexte" rows="6">${esc(d.texte || "")}</textarea></div>
      ${(d.culture||{}).source ? `<p class="hint">Source indiquée : ${esc(d.culture.source)}. Vérifie-la avant de publier.</p>` : `<p class="hint warn">Aucune source indiquée : vérifie les faits avant de publier.</p>`}` : ""}
    ${photosOk ? `<div class="f"><label for="ctPhotos">Photos jointes à l'e-mail <small>(enregistre-les depuis ta messagerie, puis ajoute-les ici pour les vérifier)</small></label><input type="file" id="ctPhotos" accept="image/*" multiple></div><div class="ct-vig" id="ctVig"></div>` : ""}
    ${d.t === "prop" ? `<p class="hint">Les photos de la proposition pourront être ajoutées dans la fiche une fois créée.</p>` : ""}
    <div class="envoi">
      ${{avis:`<button class="btn primary" type="button" data-ct="avis">Publier l'avis sur la fiche</button>`,
         sig:`<button class="btn primary" type="button" data-ct="sig">Publier le signalement</button>`,
         corr:`<button class="btn primary" type="button" data-ct="corr">Ouvrir la fiche pour la corriger</button>`,
         prop:`<button class="btn primary" type="button" data-ct="prop">Créer la fiche à partir de la proposition</button>`,
         culture:`<button class="btn primary" type="button" data-ct="culture">Ajouter au coin culture</button>`}[d.t] || ""}
      <button class="btn ghost" type="button" data-ct="refus">${d.t === "corr" ? "Marquer comme traitée" : "Refuser"}</button>
    </div></section>`;
  const inp = $("#ctPhotos");
  if (inp) inp.onchange = () => { ctFichiers = [...inp.files].map(f => ({f, url:URL.createObjectURL(f), ok:true})); rendreVigCt(); };
}
function rendreVigCt(){
  const v = $("#ctVig"); if (!v) return;
  v.innerHTML = ctFichiers.map((x,i) => `<label class="ct-ph"><img src="${x.url}" alt="Photo ${i+1}"><span><input type="checkbox" data-cti="${i}"${x.ok ? " checked" : ""}> Publier</span></label>`).join("");
  v.querySelectorAll("[data-cti]").forEach(c => c.onchange = () => { ctFichiers[+c.dataset.cti].ok = c.checked; });
}
function marquerTraitee(d){ traitees.add(cleContrib(d)); lsSet(KEY_TRAITE, JSON.stringify([...traitees])); }
function finContrib(msg){ marquerTraitee(ctCourant); ctCourant = null; ctFichiers = []; $("#ctTexte").value = ""; rendreApercuContrib(); if (msg) toast(msg, 4500); }
$("#ctLire").addEventListener("click", () => {
  const d = lireCode($("#ctTexte").value);
  $("#ctErr").textContent = d ? "" : "Je ne trouve pas le code de lecture (la ligne qui commence par LBT1:). Copie bien tout le message, jusqu'en bas.";
  ctCourant = d; ctFichiers = []; rendreApercuContrib();
});
$("#ctApercu").addEventListener("click", async e => {
  const b = e.target.closest("[data-ct]"), d = ctCourant; if (!b || !d) return;
  const a = b.dataset.ct, cab = $("#ctCab") ? cabanes.find(c => c.id === $("#ctCab").value) : null;
  if (["avis","sig","corr"].includes(a) && !cab){ toast("Choisis d'abord la cabane concernée"); return; }
  const fichiers = ctFichiers.filter(x => x.ok).map(x => x.f);
  if (a === "refus") return finContrib(d.t === "corr" ? "Correction marquée comme traitée" : "Contribution refusée");
  if (a === "avis"){
    const av = {id:"a" + uid(), pseudo:d.pseudo, date:d.date || auj().slice(0,7), note:+d.note || 0, reco:d.reco ?? null, texte:d.texte || "", recu:Date.now()};
    cab.avisV.push(av); cab.modifie = Date.now(); sauver();
    if (fichiers.length) await ajouterPhotos(cab, fichiers, null, null, d.pseudo, av.id);
    rendre(); return finContrib(`Avis de ${d.pseudo} publié sur « ${cab.nom} » : il sera en ligne à ta prochaine mise en ligne.`);
  }
  if (a === "sig"){
    const sg = {id:"s" + uid(), pseudo:d.pseudo, date:d.date || auj().slice(0,7), etat:d.etat || "", pb:d.pb || [], texte:d.texte || ""};
    cab.sigV.push(sg);
    const dSig = (sg.date.length === 7 ? sg.date + "-15" : sg.date), dEtat = etatConstate(cab);
    if (d.etat && ETAT_VERS_FICHE[d.etat] && (!dEtat || dSig >= dEtat)) cab.etat = ETAT_VERS_FICHE[d.etat];
    cab.modifie = Date.now(); sauver();
    if (fichiers.length) await ajouterPhotos(cab, fichiers, null, null, d.pseudo, sg.id);
    rendre(); return finContrib(`Signalement publié sur « ${cab.nom} »${d.etat ? ", état mis à jour" : ""}.`);
  }
  if (a === "corr"){ finContrib(); allerPage("carte"); ouvrirDetail(cab.id, true); ouvrirFiche(cab); toast("Corrige la fiche puis enregistre", 4000); return; }
  if (a === "prop"){
    const pr = d.prop || {}; finContrib(); allerPage("carte"); ouvrirFiche(null);
    $("#f-nom").value = pr.nom || ""; $("#f-massif").value = pr.massif || ""; if (pr.alt) $("#f-alt").value = pr.alt;
    if (pr.type && OPTIONS.type.includes(pr.type)) $("#f-type").value = pr.type;
    if (pr.places) $("#f-places").value = pr.places; if (pr.lien && /^https?:/.test(pr.lien)) $("#f-lien").value = pr.lien;
    $("#f-statut").value = "afaire"; majStatutForm();
    $("#f-notes").value = `Proposée par ${d.pseudo}${d.envoye ? " le " + new Date(d.envoye).toLocaleDateString("fr-FR") : ""}.${(pr.equip||[]).length ? "\nSur place : " + pr.equip.join(", ") + "." : ""}${d.texte ? "\n" + d.texte : ""}`;
    if (pr.lat != null && pr.lng != null){ majCoords(+pr.lat, +pr.lng, !pr.alt); setPlacement(false); map.flyTo([+pr.lat, +pr.lng], 14); }
    toast("Fiche préremplie : vérifie-la, place-la si besoin, puis enregistre", 5000); return;
  }
  if (a === "culture"){
    const art = {id:"u" + uid(), theme:$("#ctcTheme").value, titre:$("#ctcTitre").value.trim(), court:$("#ctcCourt").value.trim(), texte:$("#ctcTexte").value.trim(), auteur:d.pseudo};
    if (!art.titre || !art.texte){ toast("Il faut au moins un titre et un texte"); return; }
    if (!art.court) art.court = art.texte.slice(0, 140);
    const l = culturesAjoutees(); l.push(art); lsSet(KEY_CULT, JSON.stringify(l)); CULTURE.push(art);
    rendreCtCulture(); return finContrib(`« ${art.titre} » ajouté au coin culture.`);
  }
});
function rendreCtCulture(){
  const l = culturesAjoutees();
  $("#ctCulture").innerHTML = l.length ? `<section class="carte-box ct-ap"><div class="kicker">Textes ajoutés au coin culture</div>
    ${l.map(a => `<div class="ct-row"><span><b>${esc(a.titre)}</b> · proposé par ${esc(a.auteur || "?")}</span><button class="linkbtn" type="button" data-ctdel="${esc(a.id)}">Retirer</button></div>`).join("")}</section>` : "";
}
$("#ctCulture").addEventListener("click", e => { const b = e.target.closest("[data-ctdel]"); if (!b) return;
  const l = culturesAjoutees().filter(a => a.id !== b.dataset.ctdel); lsSet(KEY_CULT, JSON.stringify(l));
  const i = CULTURE.findIndex(a => a.id === b.dataset.ctdel); if (i >= 0) CULTURE.splice(i, 1); rendreCtCulture(); toast("Texte retiré"); });

function avisVHtml(c){
  const av = [...(c.avisV || [])].sort((a,b) => (b.date||"").localeCompare(a.date||"")), sg = [...(c.sigV || [])].sort((a,b) => (b.date||"").localeCompare(a.date||""));
  if (!av.length && !sg.length) return "";
  const avecReco = av.filter(a => a.reco === true || a.reco === false), recos = avecReco.filter(a => a.reco === true).length;
  const notes = av.filter(a => a.note), moy = notes.length ? notes.reduce((s,a) => s + (+a.note), 0) / notes.length : 0;
  const ph = id => c.photos.filter(p => photosDB.get(p)?.avisId === id);
  const mois = d => d ? moisAnnee(d.length === 7 ? d + "-15" : d) : "";
  return `<div class="blk"><h4>Avis des randonneurs <span class="lc">${av.length ? `${av.length} avis${moy ? ` · ${fr1(moy)} / 5` : ""}${avecReco.length ? ` · ${recos} sur ${avecReco.length} recommandent` : ""}` : ""}</span></h4>
    ${av.map(a => `<div class="visite"><div class="visite-h"><strong>${esc(a.pseudo || "Un randonneur")}</strong><span>${recoHtml(a.reco)}${a.note ? `<span class="ress">★ ${a.note}</span>` : ""}</span></div>
      ${a.date ? `<div class="m">Passage en ${mois(a.date)}</div>` : ""}${a.texte ? `<p>${esc(a.texte)}</p>` : ""}
      ${ph(a.id).length ? `<div class="galerie">${vignettes(ph(a.id))}</div>` : ""}
      <div class="act no-partage"><button class="linkbtn" type="button" data-avdel="${esc(a.id)}">Retirer cet avis</button></div></div>`).join("")}
    ${sg.length ? `<div class="sig-v"><div><b>Dernier signalement</b> · ${esc(sg[0].pseudo || "un randonneur")}${sg[0].date ? ", " + mois(sg[0].date) : ""}${sg[0].etat ? " · état " + esc(sg[0].etat.toLowerCase()) : ""}${(sg[0].pb||[]).length ? " · " + esc(sg[0].pb.join(", ").toLowerCase()) : ""}</div>${sg[0].texte ? `<p>${esc(sg[0].texte)}</p>` : ""}
      ${ph(sg[0].id).length ? `<div class="galerie">${vignettes(ph(sg[0].id))}</div>` : ""}<button class="linkbtn no-partage" type="button" data-sigdel="${esc(sg[0].id)}">Retirer ce signalement</button></div>` : ""}
  </div>`;
}
async function retirerContribFiche(c, champ, id){
  for (const p of c.photos.filter(p => photosDB.get(p)?.avisId === id)) await supprimerPhoto(c, p);
  c[champ] = c[champ].filter(x => x.id !== id); c.modifie = Date.now(); sauver(); rendre();
}

/* ================= Mon profil et médailles ================= */
const KEY_PROFIL = "le-bon-toit-profil", KEY_HIST = "le-bon-toit-historique";
const TITRES = ["Randonneur du dimanche","Randonneur du week-end","Randonneur solitaire","À la recherche de compagnons de route","Débutant motivé","Montagnard confirmé","Amoureux des cabanes","Contemplatif","Photographe des sommets","Coureur de crêtes","Berger dans l'âme"];
let profil = {}; try { profil = JSON.parse(lsGet(KEY_PROFIL)) || {}; } catch(e){}
profil = {pseudo:"", titre:"", medailles:{}, ...profil};
if (!profil.pseudo) profil.pseudo = lsGet(KEY_PSEUDO) || (modePartage ? "" : AUTEUR) || "";
let historique = []; try { historique = JSON.parse(lsGet(KEY_HIST)) || []; } catch(e){}
function majAvatar(){ const a = $("#railAvatar"); if (a) a.textContent = (profil.pseudo || "?").trim().charAt(0).toUpperCase() || "?"; }
function sauverProfil(){ lsSet(KEY_PROFIL, JSON.stringify(profil)); if (profil.pseudo) lsSet(KEY_PSEUDO, profil.pseudo); majAvatar(); }
function ajouterHist(x){ historique.unshift(x); historique = historique.slice(0, 300); lsSet(KEY_HIST, JSON.stringify(historique)); }
const CAT_MED = {s:["Saisons et fêtes","i-neige"], a:["Altitude et itinérance","i-sommet"], m:["Coups de main","i-main"], d:["Découvertes et sagesse","i-boussole"]};
const MEDAILLES = [
  {id:"hiver", cat:"s", nom:"Nuit d'hiver", desc:"Une nuit en cabane entre décembre et mars.", auto:x => x.nuits.some(n => [12,1,2,3].includes(n.mois)), alerte:"En hiver, la montagne demande de l'expérience : lis le bulletin d'avalanche et ne pars pas seul si tu débutes."},
  {id:"noel", cat:"s", nom:"Réveillon en cabane", desc:"Passer la nuit du 24 ou du 25 décembre là-haut.", auto:x => x.nuits.some(n => n.md === "12-24" || n.md === "12-25")},
  {id:"nouvelan", cat:"s", nom:"Nuit du Nouvel An", desc:"Passer la nuit du 31 décembre en cabane.", auto:x => x.nuits.some(n => n.md === "12-31" || n.md === "01-01")},
  {id:"lever", cat:"s", nom:"Lever de soleil", desc:"Voir le jour se lever depuis une cabane."},
  {id:"packe", cat:"s", nom:"Packe pour Pâques", desc:"Rejoindre le refuge Packe, dans le Néouvielle, le week-end de Pâques.", alerte:"Le refuge est à 2 495 m : à Pâques, c'est encore la montagne d'hiver, avec neige et risque d'avalanche."},
  {id:"alt2000", cat:"a", nom:"Au-dessus de 2 000 m", desc:"Une nuit dans une cabane au-dessus de 2 000 m.", auto:x => x.nuits.some(n => n.alt >= 2000)},
  {id:"alt2500", cat:"a", nom:"Au-dessus de 2 500 m", desc:"Une nuit dans une cabane au-dessus de 2 500 m.", auto:x => x.nuits.some(n => n.alt >= 2500)},
  {id:"affilee", cat:"a", nom:"Deux cabanes d'affilée", desc:"Deux nuits de suite, dans deux cabanes différentes.", auto:x => x.nuits.some(a => x.nuits.some(b => b.cid !== a.cid && Math.round((b.t - a.t) / 864e5) === 1))},
  {id:"massifs", cat:"a", nom:"Cinq massifs", desc:"Dormir dans cinq massifs différents.", auto:x => x.massifs >= 5, prog:x => `${Math.min(x.massifs,5)} sur 5`},
  {id:"reserve", cat:"m", nom:"Refaire la réserve", desc:"Ramasser du bois mort pour les suivants."},
  {id:"reparation", cat:"m", nom:"Petite réparation", desc:"Réparer un élément de la cabane : une charnière, un volet, une planche."},
  {id:"don", cat:"m", nom:"Un don utile", desc:"Laisser un objet qui servira : bougies, casserole, balai…"},
  {id:"sentinelle", cat:"m", nom:"Sentinelle", desc:"Signaler l'état de 10 cabanes sur le site.", contrib:true, auto:x => x.nb.sig >= 10, prog:x => `${Math.min(x.nb.sig,10)} sur 10`},
  {id:"eclaireur", cat:"m", nom:"Éclaireur", desc:"Proposer une cabane pour le carnet.", contrib:true, auto:x => x.nb.prop >= 1},
  {id:"conteur", cat:"m", nom:"Conteur", desc:"Proposer un texte pour le coin culture.", contrib:true, auto:x => x.nb.culture >= 1},
  {id:"flambee", cat:"d", nom:"Une flambée", desc:"Un feu dans une cabane équipée d'une cheminée, avec du bois mort."},
  {id:"sage", cat:"d", nom:"Le sage", desc:"Avoir attendu à l'abri que le mauvais temps passe, ou su renoncer à temps."},
  {id:"orri", cat:"d", nom:"Découvrir un orri", desc:"Visiter un orri, sans y dormir et sans déplacer une pierre."}
];
function contexteMed(){
  const nuits = [];
  if (!modePartage) cabanes.forEach(c => c.visites.forEach(v => { if (v.nuit && v.date){ const d = new Date(v.date + "T12:00:00"); nuits.push({cid:c.id, alt:c.alt||0, massif:c.massif||"", mois:d.getMonth()+1, md:v.date.slice(5), t:d.getTime()}); } }));
  const nb = {sig:0, prop:0, culture:0, avis:0, corr:0}; historique.forEach(h => { if (nb[h.t] != null) nb[h.t]++; });
  return {nuits, massifs: new Set(nuits.map(n => n.massif).filter(Boolean)).size, nb};
}
function etatMedaille(m, x){
  if (m.auto && m.auto(x)) return {ok:true, src:m.contrib ? "D'après tes contributions" : "D'après ton carnet"};
  const dcl = profil.medailles[m.id]; if (dcl && !m.contrib) return {ok:true, src:`Vécue${dcl.date ? " en " + moisAnnee(dcl.date + "-15") : ""}`, declaree:true};
  return {ok:false, src: m.prog ? m.prog(x) : "À vivre"};
}
let medSel = null;
function rendreProfil(){
  const x = contexteMed(), etats = MEDAILLES.map(m => [m, etatMedaille(m, x)]), nOk = etats.filter(([,e]) => e.ok).length;
  const favs = cabanes.filter(c => favoris.has(c.id));
  const init = (profil.pseudo || "?").trim().charAt(0).toUpperCase() || "?";
  if (!medSel) medSel = MEDAILLES[0].id;
  const [ms, es] = etats.find(([m]) => m.id === medSel);
  const TYPES_H = {prop:"Proposition", sig:"Signalement", avis:"Avis", corr:"Correction", culture:"Texte"};
  $("#profilCorps").innerHTML = `
    <section class="prof-h carte-box">
      <span class="avatar-big" aria-hidden="true">${esc(init)}</span>
      <div class="prof-id">
        <div class="f"><label for="pfPseudo">Pseudo</label><input id="pfPseudo" value="${esc(profil.pseudo)}" placeholder="Ton pseudo" maxlength="40"></div>
        <div class="f"><label for="pfTitre">Titre affiché</label><select id="pfTitre"><option value="">Choisir un titre…</option>${TITRES.map(t => `<option${t === profil.titre ? " selected" : ""}>${esc(t)}</option>`).join("")}</select></div>
      </div>
      <dl class="prof-stats">
        <div><dt>Médailles</dt><dd>${nOk} <small>sur ${MEDAILLES.length}</small></dd></div>
        <div><dt>Favoris</dt><dd>${favs.length}</dd></div>
        <div><dt>Contributions</dt><dd>${historique.length}</dd></div>
        ${!modePartage ? `<div><dt>Nuits en cabane</dt><dd>${x.nuits.length}</dd></div>` : ""}
      </dl>
    </section>
    <p class="note-compte"><svg aria-hidden="true"><use href="#i-info"/></svg><span>Ton profil est enregistré dans ce navigateur. Les comptes en ligne, pour retrouver ton profil sur tous tes appareils, suivre d'autres randonneurs et publier des sorties partagées, arriveront dans une prochaine version.</span></p>
    <div class="ph"><div><h2 style="font-size:32px">Mes médailles</h2><p class="med-intro">Les médailles racontent des souvenirs, pas des exploits. La montagne comporte des risques : chacun reste seul juge de ses choix.</p></div></div>
    <div class="med-zone">
      <div class="med-cats">${Object.entries(CAT_MED).map(([k,[l,ic]]) => `<section><h3>${esc(l)}</h3><div class="meds">${etats.filter(([m]) => m.cat === k).map(([m,e]) => `
        <button type="button" class="med${e.ok ? " ok" : ""}${m.id === medSel ? " sel" : ""}" data-med="${m.id}" aria-pressed="${m.id === medSel}">
          <span class="med-ic"><svg aria-hidden="true"><use href="#${ic}"/></svg></span><span class="med-t"><b>${esc(m.nom)}</b><small>${esc(e.src)}</small></span></button>`).join("")}</div></section>`).join("")}</div>
      <aside class="med-det carte-box">
        <span class="med-ic big${es.ok ? " ok" : ""}"><svg aria-hidden="true"><use href="#${CAT_MED[ms.cat][1]}"/></svg></span>
        <span class="kicker">${esc(CAT_MED[ms.cat][0])}</span>
        <h3>${esc(ms.nom)}</h3><p>${esc(ms.desc)}</p>
        ${ms.alerte ? `<p class="alerte">${esc(ms.alerte)} <button class="linkbtn" type="button" data-page="guide">Lire le guide</button></p>` : ""}
        <p class="hint">${esc(es.src)}</p>
        ${ms.contrib ? `<p class="hint">Elle se débloque toute seule avec tes contributions depuis la page Participer.</p>`
          : es.declaree ? `<button class="btn ghost" type="button" id="medRetirer">Retirer cette médaille</button>`
          : es.ok ? "" : `<div class="row"><div class="f"><label for="medDate">Quand ?</label><input id="medDate" type="month" placeholder="AAAA-MM"></div></div><button class="btn primary" type="button" id="medVecue">Je l'ai vécue</button><span class="hint">Déclarée sur l'honneur.</span>`}
      </aside>
    </div>
    <section class="prof-sec"><h2>Mes favoris</h2>${favs.length ? `<div class="fav-l">${favs.map(c => `<button type="button" class="fav" data-fav="${esc(c.id)}"><b>${esc(c.nom)}</b><small>${esc(c.type)}${c.alt != null ? " · " + fmtAlt(c.alt) : ""}${c.massif ? " · " + esc(c.massif) : ""}</small></button>`).join("")}</div>`
      : `<p class="hint">Pas encore de favori. Ouvre la fiche d'une cabane et clique sur « Garder ».</p>`}</section>
    <section class="prof-sec"><h2>Mes contributions</h2>${historique.length ? `<ul class="hist">${historique.slice(0, 30).map(h => `<li><b>${TYPES_H[h.t] || "Contribution"}</b> · ${esc(h.sur || "")} <small>${h.date ? fmtDate(h.date) : ""}</small></li>`).join("")}</ul>`
      : `<p class="hint">Rien d'envoyé pour l'instant. <button class="linkbtn" type="button" data-page="participer">Participer au carnet</button></p>`}</section>
    <section class="prof-sec"><h2>Réglages de la carte</h2><p class="hint">Gardés sur cet appareil.</p>
      ${peutFaire3D ? `<label class="ck"><input type="checkbox" id="pfAuto3d"${lsGet(KEY_AUTO3D) !== "non" ? " checked" : ""}> Ouvrir le relief en 3D avec chaque fiche de cabane</label>` : ""}
      <label class="ck"><input type="checkbox" id="pfAnim"${lsGet(KEY_ANIM) === "reduites" ? " checked" : ""}> Réduire les animations : la carte va directement à la cabane, sans voler</label></section>
    <section class="prof-sec"><h2>Sauvegarder mon profil</h2><p class="hint">Pour le retrouver sur un autre appareil ou après avoir vidé ton navigateur.</p>
      <div class="envoi"><button class="btn ghost" type="button" id="pfExport">Télécharger mon profil</button><label class="btn ghost" for="pfImport" tabindex="0">Restaurer un profil</label><input type="file" id="pfImport" accept=".json,application/json" hidden></div></section>`;
  $("#pfPseudo").onchange = e => { profil.pseudo = e.target.value.trim(); sauverProfil(); rendreProfil(); };
  $("#pfTitre").onchange = e => { profil.titre = e.target.value; sauverProfil(); toast("Titre enregistré"); };
  const v = $("#medVecue"), r = $("#medRetirer");
  if (v) v.onclick = () => { profil.medailles[ms.id] = {date: $("#medDate").value || ""}; sauverProfil(); rendreProfil(); toast(`Médaille « ${ms.nom} » ajoutée`); };
  if (r) r.onclick = () => { delete profil.medailles[ms.id]; sauverProfil(); rendreProfil(); };
  if ($("#pfAuto3d")) $("#pfAuto3d").onchange = e => { lsSet(KEY_AUTO3D, e.target.checked ? "oui" : "non"); toast(e.target.checked ? "Le relief s'ouvrira avec chaque fiche" : "Les fiches s'ouvriront sur la carte 2D (bouton 3D sur la carte)"); };
  $("#pfAnim").onchange = e => { lsSet(KEY_ANIM, e.target.checked ? "reduites" : "normales"); toast(e.target.checked ? "Animations réduites" : "Animations normales"); };
  $("#pfExport").onclick = () => telecharger(`profil-${slug(profil.pseudo || "randonneur")}.json`, JSON.stringify({profil, historique, favoris:[...favoris]}, null, 1), "application/json");
  $("#pfImport").onchange = async e => { const f = e.target.files[0]; e.target.value = ""; if (!f) return;
    try { const d = JSON.parse(await f.text()); if (!d.profil) throw 0; profil = {pseudo:"", titre:"", medailles:{}, ...d.profil}; historique = d.historique || []; favoris = new Set(d.favoris || []);
      sauverProfil(); lsSet(KEY_HIST, JSON.stringify(historique)); sauverFavoris(); rendreProfil(); toast("Profil restauré"); }
    catch(_){ toast("Ce fichier n'est pas un profil Le Bon Toit"); } };
}
$("#profilCorps").addEventListener("click", e => {
  const m = e.target.closest("[data-med]"); if (m){ medSel = m.dataset.med; rendreProfil(); return; }
  const f = e.target.closest("[data-fav]"); if (f){ allerPage("carte"); ouvrirDetail(f.dataset.fav, true); }
});
$("#profilCorps").addEventListener("keydown", e => { const l = e.target.closest("label[for=pfImport]"); if (l && (e.key === "Enter" || e.key === " ")){ e.preventDefault(); $("#pfImport").click(); } });

/* ================= Guide du bon randonneur ================= */
const KEY_SAC = "le-bon-toit-sac";
const SAC = [["Dormir","Duvet adapté à la saison (regarde sa température de confort)","Matelas : beaucoup de cabanes n'ont qu'un bat-flanc ou une dalle","Frontale et piles de rechange","Bouchons d'oreilles (on partage parfois la cabane)"],
  ["Se couvrir","Veste imperméable","Polaire ou doudoune, même en été","Bonnet et gants","Vêtements de rechange secs, dans un sac étanche","Lunettes de soleil et crème solaire"],
  ["Boire et manger","Gourdes : 1,5 à 2 litres","Filtre ou pastilles pour traiter l'eau","Réchaud, gaz et briquet","Repas du soir, petit-déjeuner et en-cas, plus une marge"],
  ["Sécurité","Carte, téléphone chargé et batterie externe","Trousse de secours (pansements, ampoules, désinfectant)","Couverture de survie","Sifflet"],
  ["Respecter les lieux","Sac pour redescendre tous tes déchets","Papier toilette et sachet pour le redescendre","Un peu de bois sec si la cabane en manque (en hiver surtout)"]];
let sacOk = {}; try { sacOk = JSON.parse(lsGet(KEY_SAC)) || {}; } catch(e){}
function rendreGuide(){
  const box = $("#guideCorps"); if (box.dataset.ok){ majSac(); return; }
  const sec = (ic, t, body) => `<section class="g-sec carte-box"><h3><svg aria-hidden="true"><use href="#${ic}"/></svg>${t}</h3>${body}</section>`;
  const ul = l => `<ul>${l.map(x => `<li>${x}</li>`).join("")}</ul>`;
  box.innerHTML = `
    <nav class="g-nav" aria-label="Sommaire du guide">${["Avant de partir","Le sac","Sur le chemin","À la cabane","Les rencontres","En cas de problème","L'hiver"].map((t,i) => `<a href="#g${i}" data-g="g${i}">${t}</a>`).join("")}</nav>
    <div id="g0">${sec("i-route","1. Avant de partir", ul([
      "<b>Choisis une sortie à ton niveau.</b> Pour une première nuit en cabane, vise 2 à 3 heures de montée et un dénivelé modéré, sur un sentier balisé. Regarde la durée et le dénivelé sur la fiche ou avec le bouton « Itinéraire ».",
      "<b>Regarde la météo de montagne</b> la veille et le matin même. Un orage annoncé l'après-midi, c'est un départ très tôt, ou un report.",
      "<b>Pars tôt et calcule ton heure d'arrivée</b> : il faut être à la cabane bien avant la nuit, avec une marge pour les pauses et les imprévus.",
      "<b>Préviens un proche</b> de ton itinéraire, de la cabane visée et de ton heure de retour.",
      "<b>Vérifie l'état de la cabane</b> : date du dernier état constaté, signalements, présence d'un berger. Elle peut être pleine ou fermée : prévois toujours un plan B (tente, bivouac, ou redescendre).",
      "<b>Télécharge la carte</b> du secteur sur ton téléphone : le réseau est souvent absent en montagne."]))}</div>
    <div id="g1">${sec("i-lit","2. Le sac pour une nuit en cabane",
      `<p class="hint">Coche au fur et à mesure en préparant ton sac. Tes cases restent enregistrées dans ce navigateur.</p>
      <div class="sac">${SAC.map(([t, ...l], i) => `<fieldset><legend>${t}</legend>${l.map((x,j) => `<label class="ck"><input type="checkbox" data-sac="${i}-${j}"> ${x}</label>`).join("")}</fieldset>`).join("")}</div>
      <div class="envoi"><span class="hint" id="sacN"></span><button class="linkbtn" type="button" id="sacRaz">Tout décocher</button></div>`)}</div>
    <div id="g2">${sec("i-sommet","3. Sur le chemin", ul([
      "<b>Marche à un rythme régulier</b>, assez lent pour pouvoir parler. En montée, mieux vaut des petits pas que des arrêts fréquents.",
      "<b>Bois et mange souvent</b>, un peu à la fois, avant d'avoir soif ou faim.",
      "<b>Suis le balisage</b> : blanc et rouge pour les GR, jaune et rouge pour les GR de Pays, jaune pour les sentiers de promenade. Là où le sentier disparaît, les cairns (petits tas de pierres) guident le passage.",
      "<b>Fixe-toi une heure limite</b> : si tu n'es pas à tel endroit à telle heure, tu fais demi-tour. Renoncer fait partie de la montagne.",
      "<b>Reste sur le sentier</b>, même dans les lacets : les raccourcis abîment les pentes."]))}</div>
    <div id="g3">${sec("i-toit","4. À la cabane", ul([
      "<b>Change-toi en arrivant</b> : vêtements secs, bonnet, boisson chaude. Le corps se refroidit très vite une fois arrêté.",
      "<b>Le feu</b> se fait uniquement dans la cheminée ou le poêle, avec du bois mort, et jamais sans surveillance.",
      "<b>Garde une aération</b> : un poêle qui tire mal ou un réchaud à l'intérieur peuvent produire du monoxyde de carbone, invisible et sans odeur.",
      "<b>Traite l'eau</b> des torrents et des lacs, surtout près des troupeaux.",
      "<b>On partage</b> : une cabane libre ne se réserve pas. On se serre, on reste discret le soir, on range ses affaires.",
      "<b>En partant</b> : balayer, redescendre ses déchets, éteindre le feu, laisser un peu de bois sec, bien fermer porte et volets. Et un mot dans le cahier de la cabane."]))}</div>
    <div id="g4">${sec("i-berger","5. Les rencontres", ul([
      "<b>Les troupeaux</b> : contourne-les largement, sans courir ni crier, et referme les clôtures derrière toi.",
      "<b>Les patous</b> protègent le troupeau : arrête-toi ou ralentis, reste calme, ne les menace pas et ne cherche pas à les caresser.",
      "<b>La faune sauvage</b> s'observe de loin et ne se nourrit pas. En hiver, un dérangement peut coûter la vie à un animal.",
      "<b>Les autres randonneurs</b> : un bonjour, une info sur l'état du sentier ou de la source, c'est aussi ça la montagne."]))}</div>
    <div id="g5">${sec("i-flag","6. En cas de problème", ul([
      "<b>Appelle le 112</b> : il fonctionne partout en Europe, même parfois là où ton opérateur ne capte pas. Donne ta position (coordonnées GPS du téléphone), le nombre de personnes et ce qui s'est passé.",
      "<b>Garde le groupe ensemble</b>, protège la personne blessée du froid avec la couverture de survie, et ne la déplace pas sans raison.",
      "<b>Orage</b> : quitte les crêtes et les sommets, éloigne-toi des arbres isolés et des clôtures, accroupis-toi pieds joints si la foudre est proche.",
      "<b>Brouillard</b> : si tu ne vois plus le chemin, arrête-toi et attends une éclaircie plutôt que d'avancer au hasard.",
      "En France, les secours en montagne sont en principe gratuits, hors domaines skiables. N'hésite pas à appeler."]))}</div>
    <div id="g6">${sec("i-neige","7. L'hiver", ul([
      "<b>Ne commence pas par l'hiver.</b> Neige, froid, jours courts : une sortie facile l'été peut devenir sérieuse.",
      "<b>Lis le bulletin d'avalanche</b> (BERA) de Météo-France pour le massif, chaque jour avant de partir.",
      "<b>DVA, pelle et sonde</b> sont indispensables dès que l'itinéraire traverse des pentes enneigées, et ne servent que si l'on sait s'en servir. Les clubs alpins et les guides proposent des formations.",
      "<b>Pars accompagné</b> de quelqu'un d'expérimenté, ou avec un professionnel diplômé, pour tes premières sorties."]))}</div>
    <p class="hint">Ce guide donne des repères, il ne remplace ni l'expérience ni une formation. Tu restes seul juge de tes choix en montagne.</p>`;
  box.dataset.ok = "1";
  box.querySelectorAll("[data-sac]").forEach(c => { c.checked = !!sacOk[c.dataset.sac]; c.onchange = () => { sacOk[c.dataset.sac] = c.checked; lsSet(KEY_SAC, JSON.stringify(sacOk)); majSac(); }; });
  $("#sacRaz").onclick = () => { sacOk = {}; lsSet(KEY_SAC, "{}"); box.querySelectorAll("[data-sac]").forEach(c => c.checked = false); majSac(); };
  box.querySelector(".g-nav").addEventListener("click", e => { const a = e.target.closest("[data-g]"); if (!a) return; e.preventDefault(); $("#" + a.dataset.g).scrollIntoView({behavior:"smooth", block:"start"}); });
  majSac();
}
function majSac(){ const all = $("#guideCorps").querySelectorAll("[data-sac]"), n = [...all].filter(c => c.checked).length; const s = $("#sacN"); if (s) s.textContent = `${n} sur ${all.length} prêts`; }

/* ================= À propos / mentions légales ================= */
const RESEAUX = [["discord","Discord","i-bulle","Rejoindre la communauté"],["instagram","Instagram","i-insta","Les plus belles photos"],["youtube","YouTube","i-video","Vidéos de sorties"],
  ["facebook","Facebook","i-bulle","Actualités"],["strava","Strava","i-route","Les sorties"],["site","Site web","i-lien","En savoir plus"]];
function contactsHtml(){
  const L = SITE.liens || {}, rien = !SITE.contact && !Object.values(L).some(Boolean);
  const carte = (href, ic, t, sous) => href
    ? `<a class="ct-lien" href="${esc(href)}" target="_blank" rel="noopener"><svg aria-hidden="true"><use href="#${ic}"/></svg><span><b>${t}</b><small>${esc(sous)}</small></span></a>`
    : `<span class="ct-lien off"><svg aria-hidden="true"><use href="#${ic}"/></svg><span><b>${t}</b><small>Bientôt</small></span></span>`;
  return `<div class="ct-liens">${carte(SITE.contact ? "mailto:" + SITE.contact : "", "i-mail", "E-mail", SITE.contact || "")}${RESEAUX.filter(([k]) => L[k] || ["discord","instagram"].includes(k)).map(([k,t,ic,sous]) => carte(L[k], ic, t, sous)).join("")}</div>
    ${rien && !modePartage ? `<p class="hint">Tes coordonnées s'ajoutent dans « Données », puis « Préparer la version en ligne ».</p>` : ""}`;
}
const MENTION = "Ce site est dédié à la communauté des randonneurs, aux amoureux de la montagne et de ses merveilles. S'il venait à être fréquenté par beaucoup trop de monde, ou par des personnes malveillantes à l'égard de ces lieux et de ces montagnes, je me verrais obligé de le fermer.";
function rendreApropos(){
  const h = SITE.hebergeur || {}, manque = t => `<span class="manque">[${t} à compléter]</span>`, auteur = AUTEUR ? esc(AUTEUR) : "";
  $("#aproposCorps").innerHTML = `
    <section class="ap-hero">
      <div><span class="kicker">Notre engagement</span>
      <blockquote>${esc(MENTION)}</blockquote>
      <p class="sig">${auteur ? "— " + auteur + ", créateur du site" : "— Le créateur du site"}</p></div>
    </section>
    <div class="ap-grid">
      <section class="carte-box ap-c"><h3>Le principe</h3>
        <p>Les Pyrénées comptent des centaines de cabanes et de refuges, mais beaucoup sont délabrés, sales ou vides. ${esc(SITE.nom)} n'en garde que les bonnes, celles qui respectent la charte. C'est un projet personnel${auteur ? ` de ${auteur}` : ""}, gratuit et sans publicité, ouvert aux contributions de tous les randonneurs.</p></section>
      <section class="carte-box ap-c"><h3>La charte</h3>
        <p>Une cabane entre dans le carnet si elle offre au minimum :</p>
        <ul><li>un toit étanche et une porte qui ferme ;</li><li>un endroit pour dormir au sec ;</li><li>un intérieur propre et respecté ;</li><li>un accès libre, sans réservation.</li></ul></section>
      <section class="carte-box ap-c"><h3>Comment ça marche</h3>
        <ol class="ap-steps"><li><b>Filtre</b> la carte selon tes envies : cheminée, eau, hiver, altitude, durée d'accès.</li>
        <li><b>Ouvre une fiche</b> : photo, équipement, état constaté, avis, météo à l'altitude de la cabane, itinéraire, vue 3D.</li>
        <li><b>Participe</b> : propose une cabane, signale un état, donne ton avis ou envoie un texte pour le coin culture. Tout est relu avant publication.</li></ol></section>
      <section class="carte-box ap-c"><h3>Contact et communauté</h3>${contactsHtml()}</section>
      <section class="carte-box ap-c ap-guide"><h3>Tu débutes ?</h3>
        <p>Avant ta première nuit en cabane, prends cinq minutes pour lire le guide du bon randonneur : préparer sa sortie, son sac, et revenir en forme.</p>
        <button class="btn primary" type="button" data-page="guide">Lire le guide</button></section>
      <section class="carte-box ap-c"><h3>${modePartage ? "Ton propre carnet" : "Publier le site"}</h3>
        ${modePartage ? `<p>Tu peux tenir ton carnet personnel de cabanes dans ce navigateur : noter tes sorties, tes envies, tes photos. Ouvre le menu « Données », puis « Ouvrir mon carnet ».</p>`
        : `<ul><li>Écris le « mot de l'auteur » des cabanes avec tes propres mots.</li><li>Relis les contributions reçues dans « À relire ».</li><li>Menu « Données », puis « Préparer la version en ligne » : tu obtiens <b>index.html</b>, à déposer chez ton hébergeur à chaque mise à jour.</li></ul>`}</section>
    </div>
    <div class="ap-legal">
      <details class="carte-box"><summary>Avant de partir</summary>
        <p>Les informations sont indicatives et peuvent être anciennes ou erronées : une cabane peut être fermée, pleine, occupée par un berger, dégradée, sans bois ni eau. Emporte de quoi dormir dehors, vérifie la météo de montagne et, en hiver, le bulletin d'avalanche. Tu restes seul responsable de ta sortie et de tes choix en montagne.</p></details>
      <details class="carte-box"><summary>Tes données</summary>
        <p>Il n'y a ni compte, ni statistiques de visite, ni cookie de suivi. Ton profil, tes favoris et tes réglages restent dans ton navigateur. Quand tu participes, ton message part par e-mail${SITE.formulaire ? " ou par un service de formulaire" : ""} et ne sert qu'à mettre à jour le carnet. Pour afficher les cartes, la météo, l'altitude, les itinéraires et la vue 3D, ton navigateur contacte directement les services listés dans « Sources », qui reçoivent ton adresse IP comme pour n'importe quel site.</p></details>
      <details class="carte-box"><summary>Sources et licences</summary>
        <ul>
          <li>Fonds de carte : © contributeurs <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> (ODbL), tuiles OpenStreetMap France, CyclOSM et HOT ; <a href="https://opentopomap.org" target="_blank" rel="noopener">OpenTopoMap</a> (CC BY-SA) ; IGN Géoplateforme (Licence ouverte Etalab) ; IGN España (CC BY 4.0).</li>
          <li>Sentiers balisés : <a href="https://hiking.waymarkedtrails.org" target="_blank" rel="noopener">Waymarked Trails</a>, données OpenStreetMap.</li>
          <li>Météo et altitude : <a href="https://open-meteo.com" target="_blank" rel="noopener">Open-Meteo</a> (CC BY 4.0) ; altimétrie IGN.</li>
          <li>Itinéraires : <a href="https://brouter.de" target="_blank" rel="noopener">BRouter</a> et OSRM (FOSSGIS), données OpenStreetMap.</li>
          <li>Vue 3D : MapLibre GL (BSD-3), relief Terrain Tiles (AWS Open Data).</li>
          <li>Fiches de cabanes : informations vérifiées sur place ou recoupées avec <a href="https://www.refuges.info" target="_blank" rel="noopener">refuges.info</a> (CC BY-SA 2.0) ; chaque fiche renvoie vers sa source quand elle en a une.</li>
          <li>Carte : Leaflet (BSD-2). Polices : Fraunces et Nunito Sans (SIL Open Font License).</li>
        </ul></details>
      <details class="carte-box"><summary>Mentions légales</summary>
        <p>Éditeur : un particulier, à titre non professionnel. Conformément à la loi n° 2004-575 du 21 juin 2004 (LCEN), ses éléments d'identification ont été communiqués à l'hébergeur.${SITE.contact ? ` Contact : <a href="mailto:${esc(SITE.contact)}">${esc(SITE.contact)}</a>.` : ""}</p>
        <p>Hébergeur : ${h.nom?esc(h.nom):manque("nom")} — ${h.adresse?esc(h.adresse):manque("adresse")}${h.telephone?" — "+esc(h.telephone):""}.</p></details>
    </div>
    <p class="hint">${esc(SITE.nom)} · version ${VERSION}</p>`;
}

/* ================= Libellés selon le mode ================= */
function libellesMode(){
  if (!modePartage) return;
  $(".lblF").textContent = "Testées"; $(".lblA").textContent = "Non testées";
  $("#lRessMin").textContent = "Note de l'auteur minimale"; $("#lNoteMin").textContent = "Note détaillée minimale";
  $("#chipCoeur").textContent = "♥ Coups de cœur de l'auteur"; $("#chipNuit").textContent = "Nuit passée par l'auteur";
  $("#hNotes").textContent = "Notes, favoris et coups de cœur";
}

/* ================= Bienvenue (première visite) ================= */
const KEY_BV = modePartage ? "le-bon-toit-bienvenue" : "carnet-cabanes-bienvenue";
function bienvenue(){
  if (lsGet(KEY_BV)) return;
  const perso = cabanes.filter(c => !c.exemple).length;
  if (!modePartage && perso) { lsSet(KEY_BV, "1"); return; }
  const n = cabanes.length;
  $("#mbTitre").textContent = modePartage ? `Bienvenue sur ${SITE.nom}` : "Bienvenue dans ton carnet";
  $("#bienvenueCorps").innerHTML = `
    <p>${modePartage ? `Une sélection de <b>${n} cabane${n>1?"s":""} et refuges des Pyrénées</b> qui valent vraiment la montée${AUTEUR ? `, choisis par ${esc(AUTEUR)}` : ""}, et ouverte aux contributions de chacun.` : `${esc(SITE.nom)} t'aide à trouver la cabane qui te correspond et à garder la trace de tes sorties.`}</p>
    <ul class="etapes">
      <li><b class="n">1</b><span><b>Filtre</b> selon tes envies : cheminée, bois, eau, ouverte l'hiver, altitude, durée d'accès…</span></li>
      <li><b class="n">2</b><span><b>Ouvre une fiche</b> : ce qu'on trouve sur place, l'état constaté, la météo à l'altitude de la cabane, l'itinéraire depuis ton point de départ.</span></li>
      <li><b class="n">3</b><span>${modePartage ? "<b>Participe</b> : propose une cabane qui mérite sa place, ou signale l'état d'une cabane après ton passage." : "<b>Ajoute tes cabanes</b> : clique sur « Ajouter une cabane », ou pioche dans refuges.info, puis note tes sorties."}</span></li>
    </ul>
    <p class="hint">Les infos sont indicatives : vérifie toujours l'état de la cabane et les conditions avant de partir. Ces lieux sont fragiles, laisse-les comme tu aimerais les trouver.</p>`;
  const act = $("#bienvenueActions");
  act.innerHTML = `<button class="btn primary" type="button" data-bv="ok">${modePartage ? "Explorer les cabanes" : "C'est parti"}</button>`;
  act.onclick = e => { const b = e.target.closest("[data-bv]"); if (!b) return; lsSet(KEY_BV, "1"); $("#modalBienvenue").hidden = true; };
  $("#modalBienvenue").hidden = false; setTimeout(() => act.querySelector("button").focus(), 30);
}

async function demarrer(){
  document.title = modePartage ? SITE.nom : SITE.nom + " · mon carnet";
  if (innerWidth <= 760) $("#panel").classList.add("closed");
  libellesMode(); majLegende(); syncFiltresUI(); majBk(); rendre(); rendreInfoJour(); majAvatar();
  if (modePartage){
    /* photos intégrées (m.data, fichier partagé) ou servies à côté de la page (m.url, site en ligne), chargées en parallèle */
    await Promise.all((PARTAGE.photos || []).map(async m => { try {
      const blob = m.data ? dataURLVersBlob(m.data) : await (await fetch(m.url)).blob();
      photosDB.set(m.id, {id:m.id, cabaneId:m.cabaneId, visiteId:m.visiteId||null, date:m.date, legende:m.legende, auteur:m.auteur||"", blob, thumb: await redim(blob, 320, .7, true)});
    } catch(e){} }));
    for (const c of cabanes) c.photos = c.photos.filter(id => photosDB.has(id));   /* garde l'ordre d'origine, retire les photos introuvables */
    const pts = cabanes.filter(c=>c.lat!=null).map(c=>[c.lat,c.lng]);
    if (pts.length) map.fitBounds(L.latLngBounds(pts), {padding:[50,50], maxZoom:13});
  } else {
    try { (await idb.all("photos")).forEach(p => photosDB.set(p.id, p)); } catch(e){}
    await initBk();
  }
  rendre();
  routerHash();
  const msg = ssGet(SS_MSG); if (msg){ ssSet(SS_MSG, null); toast(msg, 5000); }
  bienvenue();
}
demarrer();
})();
