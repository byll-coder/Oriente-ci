var express = require("express");
var router = express.Router();
var fs = require("fs");
var path = require("path");

var DB_PATH = path.join(__dirname, "../data/db.json");

function lireDB() {
  var contenu = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(contenu);
}

// ── Libellés des séries ─────────────────────────────────────────────────────
var SERIES_LABELS = {
  A: "Lettres & Sciences Humaines",
  B: "Économie & Sciences Sociales",
  C: "Maths & Sciences Physiques",
  D: "Sciences de la Vie & Terre",
  E: "Sciences & Technologies",
  F1: "Construction Mécanique",
  F2: "Électronique",
  G1: "Secrétariat",
  G2: "Comptabilité",
  "BT-ELEC": "BT Électronique",
};

// ── Domaines compatibles par série ─────────────────────────────────────────
// Permet de trouver des formations même si la série technique
// n'est pas encore dans series_acceptees de la db
var SERIES_DOMAINES = {
  A: ["Lettres", "Sciences Humaines", "Communication", "Droit", "Tourisme"],
  B: [
    "Économie",
    "Gestion",
    "Commerce",
    "Management",
    "Comptabilité",
    "Logistique",
  ],
  C: ["Informatique", "Ingénierie", "Sciences", "Mines", "Architecture"],
  D: ["Santé", "Agriculture", "Environnement", "Sciences", "Ingénierie"],
  E: ["Ingénierie", "Informatique", "Sciences", "Mines", "Architecture"],
  F1: ["Ingénierie", "Mines", "Architecture", "BTP", "Mécanique"],
  F2: [
    "Informatique",
    "Ingénierie",
    "Électronique",
    "Télécommunications",
    "Sciences",
  ],
  G1: [
    "Gestion",
    "Management",
    "Communication",
    "Marketing",
    "Commerce",
    "Logistique",
  ],
  G2: [
    "Comptabilité",
    "Gestion",
    "Commerce",
    "Finance",
    "Management",
    "Économie",
  ],
  "BT-ELEC": [
    "Informatique",
    "Ingénierie",
    "Électronique",
    "Télécommunications",
  ],
};

// ── Séries générales équivalentes pour les séries techniques ───────────────
// Si une formation accepte C ou E, elle est probablement ok pour F1/F2
var SERIES_EQUIV = {
  F1: ["C", "E"],
  F2: ["C", "E"],
  G1: ["A", "B"],
  G2: ["B"],
  "BT-ELEC": ["C", "E"],
};

// POST /api/orientation
router.post("/", function (req, res) {
  var serie = (req.body.serie || "").toUpperCase();
  var moyenne = parseFloat(req.body.moyenne);
  var domaine_souhaite = req.body.domaine_souhaite;
  var ville = req.body.ville;
  var budget_max = req.body.budget_max;
  var matieres_fortes = req.body.matieres_fortes || [];

  if (!serie || isNaN(moyenne)) {
    return res.status(400).json({
      success: false,
      message: "La série et la moyenne sont obligatoires.",
    });
  }

  var db = lireDB();
  var resultats = [];

  // Domaines compatibles avec la série de l'étudiant
  var domainesCompatibles = SERIES_DOMAINES[serie] || [];
  // Séries équivalentes (ex: F2 peut utiliser les formations C/E)
  var seriesEquiv = SERIES_EQUIV[serie] || [];

  for (var i = 0; i < db.ecoles.length; i++) {
    var ecole = db.ecoles[i];

    for (var j = 0; j < ecole.formations.length; j++) {
      var formation = ecole.formations[j];
      var seriesAcceptees = formation.series_acceptees || [];
      var score = 0;
      var typeMatch = "";

      // 1. Match exact : la série est dans series_acceptees
      if (seriesAcceptees.indexOf(serie) !== -1) {
        score = 40;
        typeMatch = "exact";

        // 2. Match par équivalence : une série équivalente est acceptée
      } else if (
        seriesEquiv.some(function (s) {
          return seriesAcceptees.indexOf(s) !== -1;
        })
      ) {
        score = 30;
        typeMatch = "equiv";

        // 3. Match par domaine : le domaine de la formation est compatible
      } else if (
        domainesCompatibles.some(function (d) {
          return (
            formation.domaine &&
            formation.domaine.toLowerCase().includes(d.toLowerCase())
          );
        })
      ) {
        score = 20;
        typeMatch = "domaine";

        // 4. Aucune compatibilité → on passe
      } else {
        continue;
      }

      // +20 si moyenne suffisante
      if (moyenne >= (formation.moyenne_requise || 0)) {
        score += 20;
      } else {
        // Moyenne insuffisante : on baisse le score mais on garde le résultat
        score -= 10;
      }

      // +20 si domaine correspond au choix de l'utilisateur
      if (
        domaine_souhaite &&
        formation.domaine &&
        formation.domaine.toLowerCase() === domaine_souhaite.toLowerCase()
      ) {
        score += 20;
      }

      // +10 si ville correspond
      if (
        ville &&
        ecole.ville &&
        ecole.ville.toLowerCase() === ville.toLowerCase()
      ) {
        score += 10;
      }

      // +10 si budget ok
      if (budget_max && ecole.frais_min <= parseInt(budget_max)) {
        score += 10;
      }

      // +bonus matières fortes (max 10 pts)
      if (matieres_fortes.length > 0 && formation.matieres_recommandees) {
        var matchMatieres = matieres_fortes.filter(function (m) {
          return formation.matieres_recommandees.indexOf(m) !== -1;
        }).length;
        if (matchMatieres > 0) {
          score += Math.min(10, matchMatieres * 3);
        }
      }

      score = Math.max(0, Math.min(score, 100)); // entre 0 et 100

      var badge =
        score >= 80
          ? "Excellent match"
          : score >= 60
            ? "Bon match"
            : "Match possible";

      resultats.push({
        score: score,
        badge: badge,
        type_match: typeMatch, // "exact" | "equiv" | "domaine"
        ecole: {
          id: ecole.id,
          nom: ecole.nom,
          sigle: ecole.sigle,
          type: ecole.type,
          ville: ecole.ville,
          quartier: ecole.quartier,
          telephone: ecole.telephone,
          frais_min: ecole.frais_min,
          frais_max: ecole.frais_max,
        },
        formation: formation,
      });
    }
  }

  // Trier par score décroissant, puis par type de match
  resultats.sort(function (a, b) {
    if (b.score !== a.score) return b.score - a.score;
    var ordre = { exact: 0, equiv: 1, domaine: 2 };
    return (ordre[a.type_match] || 3) - (ordre[b.type_match] || 3);
  });

  res.json({
    success: true,
    total: resultats.length,
    data: resultats,
  });
});

// GET /api/orientation/domaines
router.get("/domaines", function (req, res) {
  var db = lireDB();
  var domaines = {};
  db.ecoles.forEach(function (e) {
    e.formations.forEach(function (f) {
      if (f.domaine) domaines[f.domaine] = true;
    });
  });
  res.json({ success: true, data: Object.keys(domaines).sort() });
});

// GET /api/orientation/villes
router.get("/villes", function (req, res) {
  var db = lireDB();
  var villes = {};
  db.ecoles.forEach(function (e) {
    if (e.ville) villes[e.ville] = true;
  });
  res.json({ success: true, data: Object.keys(villes).sort() });
});

// GET /api/orientation/series
router.get("/series", function (req, res) {
  res.json({ success: true, data: SERIES_LABELS });
});

module.exports = router;
