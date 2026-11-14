/* Galerie Dédal des Couleurs — menu mobile et contrôle du formulaire.
   Aucune donnée n'est envoyée ni enregistrée. */
"use strict";

/* ==========================================================================
   Menu mobile
   ========================================================================== */
(function () {
  const boutonMenu = document.querySelector(".bouton-menu");
  const boutonFermer = document.querySelector(".bouton-fermer");
  const menu = document.getElementById("menu-principal");
  const voile = document.querySelector(".voile-menu");
  const desktop = window.matchMedia("(min-width: 900px)");

  if (!boutonMenu || !menu || !voile) {
    return;
  }

  function estOuvert() {
    return menu.classList.contains("est-ouvert");
  }

  function elementsFocusables() {
    return Array.from(menu.querySelectorAll("a[href], button"));
  }

  function ouvrir() {
    menu.classList.add("est-ouvert");
    voile.classList.add("est-visible");
    document.documentElement.classList.add("menu-ouvert");
    boutonMenu.setAttribute("aria-expanded", "true");
    boutonFermer.focus();
  }

  function fermer(rendreLeFocus) {
    if (!estOuvert()) {
      return;
    }
    menu.classList.remove("est-ouvert");
    voile.classList.remove("est-visible");
    document.documentElement.classList.remove("menu-ouvert");
    boutonMenu.setAttribute("aria-expanded", "false");
    if (rendreLeFocus) {
      boutonMenu.focus();
    }
  }

  boutonMenu.addEventListener("click", ouvrir);
  boutonFermer.addEventListener("click", function () {
    fermer(true);
  });
  voile.addEventListener("click", function () {
    fermer(true);
  });

  /* Un clic sur un lien ferme le menu (la page défile vers l'ancre) */
  menu.querySelectorAll(".menu__lien").forEach(function (lien) {
    lien.addEventListener("click", function () {
      fermer(false);
    });
  });

  document.addEventListener("keydown", function (evenement) {
    if (!estOuvert()) {
      return;
    }
    if (evenement.key === "Escape") {
      fermer(true);
      return;
    }
    /* Garde le focus dans le panneau tant qu'il est ouvert */
    if (evenement.key === "Tab") {
      const focusables = elementsFocusables();
      const premier = focusables[0];
      const dernier = focusables[focusables.length - 1];
      if (evenement.shiftKey && document.activeElement === premier) {
        evenement.preventDefault();
        dernier.focus();
      } else if (!evenement.shiftKey && document.activeElement === dernier) {
        evenement.preventDefault();
        premier.focus();
      }
    }
  });

  /* Si l'écran passe en desktop, le menu mobile est refermé */
  desktop.addEventListener("change", function (requete) {
    if (requete.matches) {
      fermer(false);
    }
  });
})();

/* ==========================================================================
   Formulaire d'inscription à la newsletter
   Contrôle du remplissage et du format de l'e-mail, puis message de
   confirmation. Rien n'est envoyé ni stocké.
   ========================================================================== */
(function () {
  const formulaire = document.querySelector(".formulaire");

  if (!formulaire) {
    return;
  }

  const confirmation = formulaire.querySelector(".formulaire__confirmation");
  const formatEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const champs = [
    {
      input: document.getElementById("nom"),
      erreur: document.getElementById("erreur-nom"),
      verifier: function (valeur) {
        return valeur === "" ? "Veuillez indiquer votre nom." : "";
      }
    },
    {
      input: document.getElementById("prenom"),
      erreur: document.getElementById("erreur-prenom"),
      verifier: function (valeur) {
        return valeur === "" ? "Veuillez indiquer votre prénom." : "";
      }
    },
    {
      input: document.getElementById("email"),
      erreur: document.getElementById("erreur-email"),
      verifier: function (valeur) {
        if (valeur === "") {
          return "Veuillez indiquer votre adresse e-mail.";
        }
        if (!formatEmail.test(valeur)) {
          return "Adresse e-mail invalide : vérifiez le format (exemple : nom@exemple.fr).";
        }
        return "";
      }
    }
  ];

  function afficherErreur(champ, message) {
    champ.erreur.textContent = message;
    if (message) {
      champ.input.setAttribute("aria-invalid", "true");
      champ.input.setAttribute("aria-describedby", champ.erreur.id);
    } else {
      champ.input.removeAttribute("aria-invalid");
      champ.input.removeAttribute("aria-describedby");
    }
  }

  function controler(champ) {
    const message = champ.verifier(champ.input.value.trim());
    afficherErreur(champ, message);
    return message === "";
  }

  formulaire.addEventListener("submit", function (evenement) {
    /* Aucune donnée n'est envoyée */
    evenement.preventDefault();
    confirmation.textContent = "";

    let premierInvalide = null;
    champs.forEach(function (champ) {
      if (!controler(champ) && !premierInvalide) {
        premierInvalide = champ.input;
      }
    });

    if (premierInvalide) {
      premierInvalide.focus();
      return;
    }

    formulaire.reset();
    confirmation.textContent = "Merci, votre inscription à la newsletter est bien prise en compte.";
  });

  /* Une fois signalée, l'erreur disparaît dès que le champ est corrigé */
  champs.forEach(function (champ) {
    champ.input.addEventListener("input", function () {
      if (champ.input.getAttribute("aria-invalid") === "true") {
        controler(champ);
      }
    });
  });
})();
