// =============================================================
// CONFIGURAÇÃO DO FIREBASE (Coloque suas chaves reais aqui)
// =============================================================
const firebaseConfig = {
  apiKey: "AIzaSy...", 
  authDomain: "pedro-santos-7b4ce.firebaseapp.com",
  projectId: "pedro-santos-7b4ce",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def"
};

// Inicialização do Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// Estado Global Inicial (Fallback)
let siteData = {
  adminPassword: "admin",
  name: "Pedro Santos",
  heroEyebrow: "Desenvolvedor Full Stack · AI-Driven Developer",
  heroTitle: "Construindo aplicações modernas com poder de IA.",
  heroSubtitle: "Desenvolvo sistemas completos do back-end ao front-end, acelerados por inteligência artificial para entregar resultados rápidos e eficientes.",
  aboutTitle: "Sobre mim",
  aboutText: "Sou desenvolvedor Full Stack com foco em criar aplicações de ponta a ponta, unindo arquiteturas sólidas no back-end com interfaces ágeis no front-end.",
  techList: ["JavaScript", "TypeScript", "React", "Node.js", "Express", "Firebase", "PostgreSQL", "Git"],
  projects: [
    {
      title: "Projeto Exemplo",
      description: "Descrição detalhada sobre as tecnologias, funcionalidades e resultados do projeto.",
      tags: ["React", "Node.js", "Express"],
      link: "https://github.com",
      featured: true
    }
  ],
  contactTitle: "Vamos conversar?",
  contactText: "Disponível para novos projetos e oportunidades.",
  contactLinks: [
    { label: "E-mail", url: "mailto:seuemail@gmail.com" },
    { label: "GitHub", url: "https://github.com" },
    { label: "LinkedIn", url: "https://linkedin.com" }
  ]
};

// =============================================================
// 1. ANIMAÇÃO CANVAS DE FUNDO
// =============================================================
const canvas = document.getElementById('bg-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;
let w, h, nodes = [];

if (canvas && ctx) {
  function resizeCanvas() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  for (let i = 0; i < 35; i++) {
    nodes.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 1
    });
  }

  function animateCanvas() {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#07060b";
    ctx.fillRect(0, 0, w, h);

    const grad = ctx.createRadialGradient(w * 0.8, h * 0.2, 0, w * 0.8, h * 0.2, Math.max(w, h) * 0.6);
    grad.addColorStop(0, "rgba(76,29,149,0.25)");
    grad.addColorStop(1, "rgba(7,6,11,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
    }

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          ctx.strokeStyle = `rgba(139,92,246,${(1 - dist / 130) * 0.18})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    ctx.fillStyle = "rgba(196,181,253,0.4)";
    for (const n of nodes) {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(animateCanvas);
  }
  animateCanvas();
}

// =============================================================
// 2. FIRESTORE (CARREGAR E SALVAR DADOS)
// =============================================================
async function loadDataFromFirestore() {
  try {
    const doc = await db.collection("portfolio").doc("main").get();
    if (doc.exists && doc.data().payload) {
      siteData = { ...siteData, ...doc.data().payload };
    }
  } catch (err) {
    console.warn("Usando dados padrão:", err.message);
  }
  renderPublicView();
}

async function saveDataToFirestore() {
  siteData.name = document.getElementById("adm-name").value;
  siteData.heroEyebrow = document.getElementById("adm-hero-eyebrow").value;
  siteData.heroTitle = document.getElementById("adm-hero-title").value;
  siteData.heroSubtitle = document.getElementById("adm-hero-subtitle").value;
  siteData.aboutTitle = document.getElementById("adm-about-title").value;
  siteData.aboutText = document.getElementById("adm-about-text").value;
  
  const techRaw = document.getElementById("adm-tech-list").value;
  siteData.techList = techRaw.split(',').map(t => t.trim()).filter(Boolean);

  siteData.contactTitle = document.getElementById("adm-contact-title").value;
  siteData.contactText = document.getElementById("adm-contact-text").value;

  // Guarda dados apenas em texto para os projetos
  const projCards = document.querySelectorAll(".adm-proj-card");
  siteData.projects = Array.from(projCards).map((card) => {
    return {
      title: card.querySelector(".proj-title").value,
      description: card.querySelector(".proj-desc").value,
      tags: card.querySelector(".proj-tags").value.split(',').map(t => t.trim()).filter(Boolean),
      link: card.querySelector(".proj-link").value,
      featured: card.querySelector(".proj-featured").checked
    };
  });

  const linkItems = document.querySelectorAll(".adm-link-item");
  siteData.contactLinks = Array.from(linkItems).map(item => ({
    label: item.querySelector(".link-label").value,
    url: item.querySelector(".link-url").value
  }));

  try {
    await db.collection("portfolio").doc("main").set({ payload: siteData });
    alert("Alterações salvas com sucesso!");
    renderPublicView();
    closeAdmin();
  } catch (err) {
    alert("Erro ao salvar no Firestore: " + err.message);
  }
}

// =============================================================
// 3. RENDERIZAÇÃO PÚBLICA (PORTFÓLIO)
// =============================================================
function renderPublicView() {
  const getEl = (id) => document.getElementById(id);
  
  if (getEl("view-name")) getEl("view-name").innerText = siteData.name;
  if (getEl("view-hero-eyebrow")) getEl("view-hero-eyebrow").innerText = siteData.heroEyebrow;
  if (getEl("view-hero-title")) getEl("view-hero-title").innerText = siteData.heroTitle;
  if (getEl("view-hero-subtitle")) getEl("view-hero-subtitle").innerText = siteData.heroSubtitle;
  if (getEl("view-about-title")) getEl("view-about-title").innerText = siteData.aboutTitle;
  if (getEl("view-about-text")) getEl("view-about-text").innerText = siteData.aboutText;
  if (getEl("view-contact-title")) getEl("view-contact-title").innerText = siteData.contactTitle;
  if (getEl("view-contact-text")) getEl("view-contact-text").innerText = siteData.contactText;
  if (getEl("view-footer-name")) getEl("view-footer-name").innerText = `© ${siteData.name}`;

  const techGrid = getEl("view-tech-grid");
  if (techGrid) {
    techGrid.innerHTML = siteData.techList.map(t => `<span class="tech-item">${t}</span>`).join('');
  }

  const projCount = getEl("view-projects-count");
  if (projCount) {
    projCount.innerText = `${siteData.projects.length} no total`;
  }

  const projGrid = getEl("view-projects-grid");
  if (projGrid) {
    projGrid.innerHTML = siteData.projects.map(p => {
      return `
        <div class="project-card ${p.featured ? 'featured' : ''}">
          <div class="project-body">
            <h3>${p.title}</h3>
            <p>${p.description}</p>
            <div class="tag-row">
              ${(p.tags || []).map(t => `<span class="tag">${t}</span>`).join('')}
            </div>
            ${p.link ? `<a href="${p.link}" target="_blank" class="project-link">Acessar projeto →</a>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  const linksContainer = getEl("view-contact-links");
  if (linksContainer) {
    linksContainer.innerHTML = siteData.contactLinks.map(l => `
      <a href="${l.url}" target="_blank" class="btn btn-ghost">${l.label}</a>
    `).join('');
  }
}

// =============================================================
// 4. PAINEL ADM
// =============================================================
function renderAdminFields() {
  document.getElementById("adm-name").value = siteData.name;
  document.getElementById("adm-hero-eyebrow").value = siteData.heroEyebrow;
  document.getElementById("adm-hero-title").value = siteData.heroTitle;
  document.getElementById("adm-hero-subtitle").value = siteData.heroSubtitle;
  document.getElementById("adm-about-title").value = siteData.aboutTitle;
  document.getElementById("adm-about-text").value = siteData.aboutText;
  document.getElementById("adm-tech-list").value = siteData.techList.join(', ');
  document.getElementById("adm-contact-title").value = siteData.contactTitle;
  document.getElementById("adm-contact-text").value = siteData.contactText;

  renderAdminProjects();
  renderAdminLinks();
}

function renderAdminProjects() {
  const container = document.getElementById("adm-projects-list");
  if (!container) return;
  container.innerHTML = "";

  siteData.projects.forEach((p, idx) => {
    const card = document.createElement("div");
    card.className = "adm-proj-card";
    card.style.cssText = "background: var(--bg); padding: 16px; border-radius: 8px; border: 1px solid var(--line); display: flex; flex-direction: column; gap: 12px;";

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <strong>Projeto #${idx + 1}</strong>
        <button type="button" class="btn btn-danger" style="padding: 4px 8px; font-size: 0.8rem;" onclick="removeProject(${idx})">Remover</button>
      </div>
      <div class="field"><label>Título</label><input type="text" class="proj-title" value="${p.title || ''}"></div>
      <div class="field"><label>Descrição</label><textarea class="proj-desc" rows="2">${p.description || ''}</textarea></div>
      <div class="field"><label>Tags (separadas por vírgula)</label><input type="text" class="proj-tags" value="${(p.tags || []).join(', ')}"></div>
      <div class="field"><label>Link do Projeto</label><input type="text" class="proj-link" value="${p.link || ''}"></div>

      <label style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; cursor: pointer;">
        <input type="checkbox" class="proj-featured" ${p.featured ? 'checked' : ''}> Em Destaque (Dobra a largura)
      </label>
    `;

    container.appendChild(card);
  });
}

function removeProject(idx) {
  siteData.projects.splice(idx, 1);
  renderAdminProjects();
}

function addProject() {
  siteData.projects.push({ title: "Novo Projeto", description: "", tags: [], link: "", featured: false });
  renderAdminProjects();
}

function renderAdminLinks() {
  const container = document.getElementById("adm-links-list");
  if (!container) return;
  container.innerHTML = "";

  siteData.contactLinks.forEach((l, idx) => {
    const item = document.createElement("div");
    item.className = "adm-link-item";
    item.style.cssText = "display: flex; gap: 8px; align-items: center;";
    item.innerHTML = `
      <input type="text" class="link-label" value="${l.label}" placeholder="Ex: GitHub" style="flex: 1;">
      <input type="text" class="link-url" value="${l.url}" placeholder="URL" style="flex: 2;">
      <button type="button" class="btn btn-danger" style="padding: 8px;" onclick="removeLink(${idx})">✕</button>
    `;
    container.appendChild(item);
  });
}

function removeLink(idx) {
  siteData.contactLinks.splice(idx, 1);
  renderAdminLinks();
}

function addLink() {
  siteData.contactLinks.push({ label: "Novo Link", url: "#" });
  renderAdminLinks();
}

// =============================================================
// 5. EVENTOS DA INTERFACE
// =============================================================
const fab = document.getElementById("admin-fab");
const loginModal = document.getElementById("login-modal");
const closeLoginBtn = document.getElementById("close-login-btn");
const loginBtn = document.getElementById("login-btn");
const adminPassInput = document.getElementById("admin-pass-input");
const publicView = document.getElementById("public-view");
const adminView = document.getElementById("admin-view");
const exitAdminBtn = document.getElementById("exit-admin-btn");
const saveAllBtn = document.getElementById("save-all-btn");

if (fab) fab.addEventListener("click", () => { loginModal.style.display = "flex"; });
if (closeLoginBtn) closeLoginBtn.addEventListener("click", () => { loginModal.style.display = "none"; });

if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    if (adminPassInput.value === siteData.adminPassword) {
      loginModal.style.display = "none";
      publicView.style.display = "none";
      adminView.style.display = "block";
      renderAdminFields();
    } else {
      alert("Senha incorreta!");
    }
  });
}

function closeAdmin() {
  adminView.style.display = "none";
  publicView.style.display = "block";
}

if (exitAdminBtn) exitAdminBtn.addEventListener("click", closeAdmin);
if (saveAllBtn) saveAllBtn.addEventListener("click", saveDataToFirestore);

const addProjBtn = document.getElementById("add-project-btn");
if (addProjBtn) addProjBtn.addEventListener("click", addProject);

const addLinkBtn = document.getElementById("add-link-btn");
if (addLinkBtn) addLinkBtn.addEventListener("click", addLink);

// Inicialização
loadDataFromFirestore();