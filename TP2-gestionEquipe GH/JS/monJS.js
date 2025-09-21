// ====================================
// Gestion des événements et Initialisation
// ====================================

document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("fade-in");
  initForm();
  initRobotAnimation();
});

// ====================================
// Références des éléments du DOM
// ====================================

const form = document.getElementById("loginForm");
const loginBtn = document.getElementById("loginBtn");
const resetBtn = document.getElementById("resetBtn");
const nomInput = document.getElementById("nom");
const pwdInput = document.getElementById("pwd");
const welcomeMessage = document.getElementById("welcome-message");
const userNameSpan = welcomeMessage.querySelector(".user-name");

// ====================================
// Gestion de la réinitialisation du formulaire avec animation + fullscreen
// ====================================

const handleReset = () => {
  const fields = [nomInput, pwdInput];

  // Vide le localStorage
  localStorage.clear();

  // Animation d’effacement avec GSAP
  gsap.timeline().to(fields, {
    value: "",
    duration: 0.5,
    stagger: 0.1,
    onUpdate: function () {
      this.targets().forEach((input) => {
        if (input.value === "") {
          input.classList.remove("erasing");
        }
      });
    },
    onComplete: () => {
      // Désactive le bouton login
      loginBtn.disabled = true;

      // Cache le message de bienvenue
      welcomeMessage.style.display = "none";
    },
  });

  // Ajoute une classe CSS pendant l'effacement
  fields.forEach((input) => input.classList.add("erasing"));
};

// ====================================
// Logique du formulaire
// ====================================

const initForm = () => {
  // Pré-remplissage du formulaire et affichage du message de bienvenue
  const storedName = localStorage.getItem("name");
  if (storedName) {
    userNameSpan.textContent = storedName;
    welcomeMessage.style.display = "block";
    nomInput.value = storedName;
    const storedPassword = localStorage.getItem("password");
    if (storedPassword) {
      pwdInput.value = storedPassword;
    }
  } else {
    welcomeMessage.style.display = "none";
  }

  // Activation/désactivation du bouton de connexion
  const checkInputs = () => {
    loginBtn.disabled =
      nomInput.value.length === 0 || pwdInput.value.length === 0;
  };
  nomInput.addEventListener("input", checkInputs);
  pwdInput.addEventListener("input", checkInputs);
  checkInputs();

  form.addEventListener("submit", handleLogin);
  resetBtn.addEventListener("click", handleReset);
};

// Gestion de la connexion (validation et redirection)
const handleLogin = (e) => {
  e.preventDefault();

  const name = nomInput.value;
  const password = pwdInput.value;

  const btnText = document.getElementById("btnText");
  const loadingSpinner = document.getElementById("loadingSpinner");

  btnText.textContent = "Vérification...";
  loadingSpinner.classList.remove("d-none");
  loginBtn.disabled = true;

  setTimeout(() => {
    if (name === "admin" && password === "12345") {
      localStorage.setItem("name", name);
      localStorage.setItem("password", password);

      loginBtn.classList.add("btn-success");
      btnText.textContent = "Connecté !";
      loadingSpinner.classList.add("d-none");

      userNameSpan.textContent = name;
      welcomeMessage.style.display = "block";

      setTimeout(() => {
        window.location.href = "html/gestion-equipe.html";
      }, 500);
    } else {
      loadingSpinner.classList.add("d-none");
      btnText.textContent = "Erreur !";
      loginBtn.classList.add("btn-danger");

      setTimeout(() => {
        alert("Le nom ou le mot de passe est invalide, veuillez réessayer!");
        btnText.textContent = "Se connecter";
        loginBtn.classList.remove("btn-danger");
        loginBtn.disabled = false;
      }, 1000);
    }
  }, 2000);
};

// ====================================
// Animation du robot 3D
// ====================================

const canvas = document.getElementById("robotCanvas");
if (canvas) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    canvas.offsetWidth / canvas.offsetHeight,
    0.1,
    1000
  );
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
  renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  const robotGroup = new THREE.Group();
  const bodyGeometry = new THREE.BoxGeometry(0.5, 0.8, 0.5);
  const material = new THREE.MeshNormalMaterial();
  const body = new THREE.Mesh(bodyGeometry, material);
  const headGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
  const head = new THREE.Mesh(headGeometry, material);
  head.position.y = 0.6;
  robotGroup.add(body, head);
  scene.add(robotGroup);

  const ambientLight = new THREE.AmbientLight(0x404040, 5);
  scene.add(ambientLight);
  const pointLight = new THREE.PointLight(0xffffff, 5);
  pointLight.position.set(5, 5, 5);
  scene.add(pointLight);

  camera.position.z = 2;

  let mouseX = 0;
  let mouseY = 0;
  const windowHalfX = window.innerWidth / 2;
  const windowHalfY = window.innerHeight / 2;

  document.addEventListener("mousemove", (event) => {
    mouseX = (event.clientX - windowHalfX) * 0.005;
    mouseY = (event.clientY - windowHalfY) * 0.005;
  });

  const animate = () => {
    requestAnimationFrame(animate);
    robotGroup.rotation.y += (mouseX - robotGroup.rotation.y) * 0.05;
    robotGroup.rotation.x += (-mouseY - robotGroup.rotation.x) * 0.05;
    robotGroup.position.y = Math.sin(Date.now() * 0.001) * 0.1;
    renderer.render(scene, camera);
  };
  animate();

  window.addEventListener("resize", () => {
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  });
}

// ====================================
// Gestion de la page de gestion d'équipe
// ====================================

// Fonction pour initialiser la page
function initPage() {
  document.getElementById("maPhoto").src = "../photos/moi.jpg";

  // Afficher les coordonnées de la position actuelle
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        document.getElementById("latE").textContent = lat.toFixed(6);
        document.getElementById("longE").textContent = lng.toFixed(6);
      },
      (error) => {
        console.error("Erreur de géolocalisation :", error);
        alert(
          "Impossible de récupérer votre position. Vérifiez les autorisations."
        );
      }
    );
  } else {
    alert("La géolocalisation n'est pas supportée par votre navigateur.");
  }

  initMap();

  document
    .getElementById("creerEquipeBtn")
    .addEventListener("click", AfficherPersonnages);
  document
    .getElementById("supprimerEquipeBtn")
    .addEventListener("click", SuppEquipe);
  document
    .getElementById("determinerLieuBtn")
    .addEventListener("click", LieuReunion);
}

// Fonction pour initialiser la carte d'Honolulu
function initMap() {
  const mapContainer = document.getElementById("map");
  const iframe = document.createElement("iframe");
  iframe.id = "gta-map";
  iframe.src =
    "https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d62821.02131334645!2d-157.8515715!3d21.3073983!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sfr!2sfr!4v1726588800000";
  iframe.className = "gta-map";
  iframe.style.border = "0";
  iframe.style.width = "100%";
  iframe.style.height = "450px";
  iframe.allowFullscreen = true;
  iframe.loading = "lazy";
  iframe.referrerPolicy = "no-referrer-when-downgrade";
  mapContainer.appendChild(iframe);
}

// Fonction pour générer une carte de membre d'équipe
function creerCarteMembre(membre, index) {
  return `
    <div class="col-md-4 col-sm-6 fade-in-up" style="animation-delay:${
      index * 0.1
    }s;">
      <div class="card glass-card team-member-card">
        <img src="${
          membre.img
        }" class="card-img-top card-img-custom" alt="Photo de ${membre.nom}">
        <div class="card-body">
          <h5 class="card-title text-center">${membre.nom}</h5>
        </div>
        <ul class="list-group list-group-flush text-center">
          <li class="list-group-item glass-list-item">Latitude : <span>${membre.lat.toFixed(
            6
          )}</span></li>
          <li class="list-group-item glass-list-item">Longitude : <span>${membre.lng.toFixed(
            6
          )}</span></li>
        </ul>
      </div>
    </div>`;
}

// ====================================
// Gestion des événements et Fonctions de la page
// ====================================

// Fonction principale pour afficher les personnages
function AfficherPersonnages() {
  SuppEquipe();

  initialiserEquipe();

  var nombre = parseInt(document.getElementById("nombrePerso").value, 10);

  var conteneur = document.getElementById("team-members");

  for (var i = 0; i < nombre; i++) {
    if (typeof participant[i] !== "undefined") {
      var nom = participant[i];
      var lat = positionGPS[i][0];
      var long = positionGPS[i][1];

      var cardHtml = `
                <div class="col-md-4 col-sm-6 fade-in-up" style="animation-delay:${
                  i * 0.1
                }s;">
                    <div class="card glass-card team-member-card">
                        <img src="../photos/${
                          i + 1
                        }.png" class="card-img-top card-img-custom" alt="Photo de ${nom}">
                        <div class="card-body">
                            <h5 class="card-title text-center">${nom}</h5>
                        </div>
                        <ul class="list-group list-group-flush text-center">
                            <li class="list-group-item glass-list-item">Latitude : <span>${lat.toFixed(
                              6
                            )}</span></li>
                            <li class="list-group-item glass-list-item">Longitude : <span>${long.toFixed(
                              6
                            )}</span></li>
                        </ul>
                    </div>
                </div>`;

      conteneur.insertAdjacentHTML("beforeend", cardHtml);
    }
  }

  animateElements();
}

// Fonction pour supprimer un nombre précis de membres de l'équipe
function SuppEquipe() {
  var nombreASupprimer = parseInt(
    document.getElementById("nombrePerso").value,
    10
  );

  var conteneur = document.getElementById("team-members");

  var membresAffichés = conteneur.children.length;

  if (nombreASupprimer >= membresAffichés) {
    conteneur.innerHTML = "";
  } else {
    for (var i = 0; i < nombreASupprimer; i++) {
      conteneur.removeChild(conteneur.lastElementChild);
    }
  }
}

// Fonction pour déterminer aléatoirement le lieu de réunion
function LieuReunion() {
  const cartes = document.querySelectorAll("#team-members .card");
  if (cartes.length === 0) {
    alert("L'équipe est vide. Créez d'abord une équipe.");
    return;
  }

  // Sélection aléatoire d'un lieu parmi les membres
  const indexAleatoire = Math.floor(Math.random() * cartes.length);
  const carteAleatoire = cartes[indexAleatoire];
  const nom = carteAleatoire.querySelector(".card-title").textContent;
  const lat = parseFloat(
    carteAleatoire.querySelector("ul li:first-child span").textContent
  );
  const lng = parseFloat(
    carteAleatoire.querySelector("ul li:last-child span").textContent
  );

  alert(
    `Le lieu de réunion sera chez ${nom} (Lat: ${lat.toFixed(
      6
    )}, Lng: ${lng.toFixed(6)}) !`
  );
}

// Fonction pour animer les éléments
function animateElements() {
  gsap.utils.toArray(".fade-in-up").forEach((el, i) => {
    gsap.fromTo(
      el,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power2.out", delay: i * 0.1 }
    );
  });
}
