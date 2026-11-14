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
   Navigation vivante : section active et header compact
   ========================================================================== */
(function () {
  const entete = document.querySelector(".entete");
  const nav = document.getElementById("menu-principal");
  const liens = Array.from(document.querySelectorAll(".menu__lien"));

  if (!entete || !nav || !("IntersectionObserver" in window)) {
    return;
  }

  /* Header compact dès qu'on a quitté le haut de la page */
  function majEntete() {
    entete.classList.toggle("est-compacte", window.scrollY > 8);
  }
  window.addEventListener("scroll", majEntete, { passive: true });
  majEntete();

  /* Trait qui glisse sous le lien actif (desktop) */
  const indicateur = document.createElement("span");
  indicateur.className = "menu__indicateur";
  indicateur.setAttribute("aria-hidden", "true");
  nav.appendChild(indicateur);

  let lienActif = null;

  function placerIndicateur() {
    if (!lienActif || lienActif.classList.contains("menu__lien--inscription")) {
      indicateur.classList.remove("est-visible");
      return;
    }
    const boiteNav = nav.getBoundingClientRect();
    const boiteLien = lienActif.getBoundingClientRect();
    indicateur.style.setProperty("--position-indicateur", (boiteLien.left - boiteNav.left) + "px");
    indicateur.style.setProperty("--largeur-indicateur", boiteLien.width + "px");
    indicateur.classList.add("est-visible");
  }

  function activer(id) {
    const lien = liens.find(function (l) {
      return l.getAttribute("href") === "#" + id;
    });
    if (!lien || lien === lienActif) {
      return;
    }
    liens.forEach(function (l) {
      l.removeAttribute("aria-current");
    });
    lien.setAttribute("aria-current", "location");
    lienActif = lien;
    placerIndicateur();
  }

  /* Une section est « active » quand elle croise une ligne placée vers le
     milieu de l'écran */
  const observateur = new IntersectionObserver(function (entrees) {
    entrees.forEach(function (entree) {
      if (entree.isIntersecting) {
        activer(entree.target.id);
      }
    });
  }, { rootMargin: "-45% 0px -54% 0px" });

  document.querySelectorAll("main > section[id]").forEach(function (section) {
    observateur.observe(section);
  });

  window.addEventListener("resize", placerIndicateur);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(placerIndicateur);
  }
})();

/* ==========================================================================
   Accueil : parallaxe de la photo
   ========================================================================== */
(function () {
  const accueil = document.querySelector(".accueil");
  const fond = document.querySelector(".accueil__fond");

  if (!fond || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  /* Parallaxe : la photo descend à 30 % de la vitesse du défilement */
  let enAttente = false;

  function deplacerFond() {
    enAttente = false;
    const defilement = window.scrollY;
    if (defilement <= accueil.offsetTop + accueil.offsetHeight) {
      fond.style.transform = "translate3d(0, " + (defilement * 0.3).toFixed(1) + "px, 0)";
    }
  }

  window.addEventListener("scroll", function () {
    if (!enAttente) {
      enAttente = true;
      window.requestAnimationFrame(deplacerFond);
    }
  }, { passive: true });
})();

/* ==========================================================================
   Apparition des blocs au défilement
   Désactivée si l'utilisateur demande moins d'animations.
   ========================================================================== */
(function () {
  const moinsDeMouvement = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (moinsDeMouvement || !("IntersectionObserver" in window)) {
    return;
  }

  /* Blocs de texte : fondu et légère montée */
  const blocs = document.querySelectorAll(
    ".oeuvres .en-tete-section, .histoire__texte, .infos, .formulaire-carte"
  );
  /* Photos : effet rideau */
  const photos = document.querySelectorAll(".grille-oeuvres > li, .histoire__cadre");

  /* Cartes d'œuvres : léger décalage d'une colonne à l'autre */
  document.querySelectorAll(".grille-oeuvres > li").forEach(function (carte, index) {
    carte.style.setProperty("--delai", (index % 3) * 0.15 + "s");
  });
  document.querySelector(".histoire__texte").style.setProperty("--delai", "0.3s");
  document.querySelector(".formulaire-carte").style.setProperty("--delai", "0.15s");

  /* Une fois le rideau ouvert, on retire la classe pour rendre la main
     aux effets de survol (zoom de l'image) */
  function terminerRideau(element) {
    const delai = parseFloat(element.style.getPropertyValue("--delai")) || 0;
    window.setTimeout(function () {
      element.classList.remove("rideau", "est-visible");
    }, (delai + 1.7) * 1000);
  }

  const observateur = new IntersectionObserver(function (entrees) {
    entrees.forEach(function (entree) {
      if (entree.isIntersecting) {
        entree.target.classList.add("est-visible");
        observateur.unobserve(entree.target);
        if (entree.target.classList.contains("rideau")) {
          terminerRideau(entree.target);
        }
      }
    });
  }, { rootMargin: "0px 0px -10% 0px", threshold: 0.1 });

  blocs.forEach(function (bloc) {
    bloc.classList.add("revele");
    observateur.observe(bloc);
  });
  photos.forEach(function (photo) {
    photo.classList.add("rideau");
    observateur.observe(photo);
  });
  document.documentElement.classList.add("js-anim");
})();

/* ==========================================================================
   Visionneuse plein écran des œuvres
   Un clic sur une photo l'ouvre en grand ; elle « grandit » depuis sa carte
   grâce à l'API View Transitions quand le navigateur la propose.
   Navigation : flèches du clavier, boutons ou glissement du doigt.
   ========================================================================== */
(function () {
  const figures = Array.from(document.querySelectorAll(".grille-oeuvres .carte"));

  if (!figures.length || typeof HTMLDialogElement !== "function") {
    return;
  }

  const moinsDeMouvement = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const transitionsPossibles = typeof document.startViewTransition === "function" && !moinsDeMouvement;

  /* Données de chaque œuvre, lues directement dans les cartes */
  const oeuvres = figures.map(function (figure) {
    const image = figure.querySelector("img");
    return {
      vignette: image,
      grand: image.getAttribute("src").replace(".webp", "-grand.webp"),
      alt: image.getAttribute("alt"),
      auteur: figure.querySelector(".carte__auteur").textContent,
      date: figure.querySelector(".carte__date").textContent,
      declencheur: null
    };
  });

  /* Bouton d'agrandissement posé sur chaque photo */
  oeuvres.forEach(function (oeuvre, index) {
    const bouton = document.createElement("button");
    bouton.type = "button";
    bouton.className = "carte__agrandir";
    bouton.setAttribute("aria-label", "Agrandir l'œuvre de " + oeuvre.auteur);
    bouton.addEventListener("click", function () {
      ouvrir(index);
    });
    oeuvre.vignette.parentElement.appendChild(bouton);
    oeuvre.declencheur = bouton;
  });

  /* Styles de l'animation de transition : injectés ici car les pseudo-éléments
     ::view-transition ne sont pas encore reconnus par le validateur CSS du W3C */
  if (transitionsPossibles) {
    const style = document.createElement("style");
    style.textContent =
      "::view-transition-group(oeuvre){animation-duration:.6s;animation-timing-function:cubic-bezier(.2,.8,.2,1)}" +
      "::view-transition-old(oeuvre),::view-transition-new(oeuvre){width:100%;height:100%;object-fit:cover}" +
      "::view-transition-old(root),::view-transition-new(root){animation-duration:.4s}";
    document.head.appendChild(style);
  }

  let visionneuse = null;
  let image;
  let auteur;
  let date;
  let compteur;
  let courant = 0;
  let enCours = false;

  function creerBouton(classe, libelle, icone) {
    const bouton = document.createElement("button");
    bouton.type = "button";
    bouton.className = "bouton-icone " + classe;
    bouton.setAttribute("aria-label", libelle);
    const i = document.createElement("i");
    i.className = "fa-solid " + icone;
    i.setAttribute("aria-hidden", "true");
    bouton.appendChild(i);
    return bouton;
  }

  /* La visionneuse n'est construite qu'à la première ouverture */
  function construire() {
    visionneuse = document.createElement("dialog");
    visionneuse.className = "visionneuse";
    visionneuse.setAttribute("aria-label", "Visionneuse des œuvres");
    if (!transitionsPossibles) {
      visionneuse.classList.add("sans-transition");
    }

    const fermerBouton = creerBouton("visionneuse__fermer", "Fermer la visionneuse", "fa-xmark");
    const precedent = creerBouton("visionneuse__nav visionneuse__nav--precedent", "Œuvre précédente", "fa-chevron-left");
    const suivant = creerBouton("visionneuse__nav visionneuse__nav--suivant", "Œuvre suivante", "fa-chevron-right");

    const figure = document.createElement("figure");
    figure.className = "visionneuse__figure";
    image = document.createElement("img");
    image.className = "visionneuse__image";
    const legende = document.createElement("figcaption");
    legende.className = "visionneuse__legende";
    auteur = document.createElement("span");
    auteur.className = "visionneuse__auteur";
    date = document.createElement("span");
    compteur = document.createElement("span");
    compteur.className = "visionneuse__compteur";
    legende.append(auteur, date, compteur);
    figure.append(image, legende);
    visionneuse.append(fermerBouton, precedent, figure, suivant);
    document.body.appendChild(visionneuse);

    fermerBouton.addEventListener("click", fermer);
    precedent.addEventListener("click", function () {
      naviguer(-1);
    });
    suivant.addEventListener("click", function () {
      naviguer(1);
    });

    /* Échap : on remplace la fermeture native par la fermeture animée */
    visionneuse.addEventListener("cancel", function (evenement) {
      evenement.preventDefault();
      fermer();
    });

    /* Clic sur le fond sombre (en dehors de la photo et des boutons) */
    visionneuse.addEventListener("click", function (evenement) {
      if (evenement.target === visionneuse) {
        fermer();
      }
    });

    visionneuse.addEventListener("keydown", function (evenement) {
      if (evenement.key === "ArrowLeft") {
        naviguer(-1);
      } else if (evenement.key === "ArrowRight") {
        naviguer(1);
      }
    });

    /* Glissement du doigt sur mobile */
    let departX = null;
    visionneuse.addEventListener("touchstart", function (evenement) {
      departX = evenement.touches[0].clientX;
    }, { passive: true });
    visionneuse.addEventListener("touchend", function (evenement) {
      if (departX === null) {
        return;
      }
      const ecart = evenement.changedTouches[0].clientX - departX;
      departX = null;
      if (Math.abs(ecart) > 50) {
        naviguer(ecart < 0 ? 1 : -1);
      }
    });
  }

  /* Charge la grande image et attend qu'elle soit prête à s'afficher */
  function charger(index) {
    const oeuvre = oeuvres[index];
    image.src = oeuvre.grand;
    image.alt = oeuvre.alt;
    auteur.textContent = oeuvre.auteur;
    date.textContent = oeuvre.date;
    compteur.textContent = (index + 1) + " / " + oeuvres.length;
    const delai = new Promise(function (resoudre) {
      window.setTimeout(resoudre, 1500);
    });
    return Promise.race([image.decode().catch(function () {}), delai]);
  }

  function transition(changement) {
    if (!transitionsPossibles) {
      changement();
      return Promise.resolve();
    }
    return document.startViewTransition(changement).finished;
  }

  function ouvrir(index) {
    if (enCours) {
      return;
    }
    enCours = true;
    if (!visionneuse) {
      construire();
    }
    courant = index;
    const vignette = oeuvres[index].vignette;
    charger(index).then(function () {
      vignette.style.viewTransitionName = "oeuvre";
      return transition(function () {
        vignette.style.viewTransitionName = "";
        image.style.viewTransitionName = "oeuvre";
        visionneuse.showModal();
      });
    }).finally(function () {
      image.style.viewTransitionName = "";
      enCours = false;
    });
  }

  function fermer() {
    if (enCours || !visionneuse.open) {
      return;
    }
    enCours = true;
    const oeuvre = oeuvres[courant];
    /* La carte d'arrivée doit être à l'écran pour que la photo y retourne */
    oeuvre.vignette.scrollIntoView({ block: "nearest", behavior: "instant" });
    image.style.viewTransitionName = "oeuvre";
    transition(function () {
      image.style.viewTransitionName = "";
      oeuvre.vignette.style.viewTransitionName = "oeuvre";
      visionneuse.close();
    }).finally(function () {
      oeuvre.vignette.style.viewTransitionName = "";
      oeuvre.declencheur.focus({ preventScroll: true });
      enCours = false;
    });
  }

  function naviguer(sens) {
    if (enCours) {
      return;
    }
    enCours = true;
    courant = (courant + sens + oeuvres.length) % oeuvres.length;
    const cible = courant;
    /* Préchargement, puis fondu enchaîné vers l'œuvre suivante */
    const prechargement = new Image();
    prechargement.src = oeuvres[cible].grand;
    const pret = prechargement.decode ? prechargement.decode().catch(function () {}) : Promise.resolve();
    pret.then(function () {
      return transition(function () {
        return charger(cible);
      });
    }).finally(function () {
      enCours = false;
    });
  }
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

  /* Relance la secousse même si le champ était déjà en erreur */
  function secouer(input) {
    input.classList.remove("secoue");
    void input.offsetWidth;
    input.classList.add("secoue");
  }

  /* Message de confirmation précédé d'une coche animée (décorative) */
  function confirmer(texte) {
    const ns = "http://www.w3.org/2000/svg";
    const icone = document.createElementNS(ns, "svg");
    icone.setAttribute("class", "confirmation__icone");
    icone.setAttribute("viewBox", "0 0 24 24");
    icone.setAttribute("aria-hidden", "true");
    const cercle = document.createElementNS(ns, "circle");
    cercle.setAttribute("cx", "12");
    cercle.setAttribute("cy", "12");
    cercle.setAttribute("r", "12");
    const coche = document.createElementNS(ns, "path");
    coche.setAttribute("d", "M7 12.5l3.2 3.2L17 9");
    icone.append(cercle, coche);
    const message = document.createElement("span");
    message.className = "confirmation__texte";
    message.textContent = texte;
    confirmation.append(icone, message);
  }

  formulaire.addEventListener("submit", function (evenement) {
    /* Aucune donnée n'est envoyée */
    evenement.preventDefault();
    confirmation.textContent = "";

    let premierInvalide = null;
    champs.forEach(function (champ) {
      if (!controler(champ)) {
        secouer(champ.input);
        if (!premierInvalide) {
          premierInvalide = champ.input;
        }
      }
    });

    if (premierInvalide) {
      premierInvalide.focus();
      return;
    }

    formulaire.reset();
    confirmer("Merci, votre inscription à la newsletter est bien prise en compte.");
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
