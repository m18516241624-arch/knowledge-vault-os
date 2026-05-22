let state = window.KNOWLEDGE_VAULT_SAMPLE_DATA || emptyData();

const els = {
  noteCount: document.querySelector("#noteCount"),
  projectCount: document.querySelector("#projectCount"),
  evidenceCount: document.querySelector("#evidenceCount"),
  healthCount: document.querySelector("#healthCount"),
  distribution: document.querySelector("#distribution"),
  distributionSelect: document.querySelector("#distributionSelect"),
  projects: document.querySelector("#projects"),
  evidence: document.querySelector("#evidence"),
  recent: document.querySelector("#recent"),
  health: document.querySelector("#health"),
  jsonFile: document.querySelector("#jsonFile")
};

loadGeneratedData();
render();

els.distributionSelect.addEventListener("change", renderDistribution);
els.jsonFile.addEventListener("change", async (event) => {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  state = JSON.parse(await file.text());
  render();
});

async function loadGeneratedData() {
  try {
    const response = await fetch("./vault-lite.json", { cache: "no-store" });
    if (!response.ok) return;
    state = await response.json();
    render();
  } catch {
    render();
  }
}

function emptyData() {
  return {
    noteCount: 0,
    distributions: {},
    recentNotes: [],
    projects: [],
    evidenceQueue: [],
    health: []
  };
}

function render() {
  els.noteCount.textContent = state.noteCount || 0;
  els.projectCount.textContent = (state.projects || []).length;
  els.evidenceCount.textContent = (state.evidenceQueue || []).length;
  els.healthCount.textContent = (state.health || []).length;
  renderDistribution();
  renderProjects();
  renderEvidence();
  renderRecent();
  renderHealth();
}

function renderDistribution() {
  const key = els.distributionSelect.value;
  const distribution = (state.distributions && state.distributions[key]) || {};
  const entries = Object.entries(distribution).sort((a, b) => b[1] - a[1]);
  const max = Math.max(...entries.map((entry) => entry[1]), 1);
  els.distribution.innerHTML = entries.length
    ? entries.map(([label, value]) => `
      <div class="bar-row">
        <span class="bar-label">${escapeHtml(label)}</span>
        <span class="track"><span class="fill" style="width:${Math.max(4, (value / max) * 100)}%"></span></span>
        <span class="meta">${value}</span>
      </div>
    `).join("")
    : `<p class="empty">No distribution data.</p>`;
}

function renderProjects() {
  const projects = state.projects || [];
  els.projects.innerHTML = projects.length
    ? projects.map((project) => `
      <div class="item">
        <strong>${escapeHtml(project.title || "Untitled")}</strong>
        <p class="meta">${escapeHtml(project.stage || "No stage")} · ${escapeHtml(project.updated || "")}</p>
        <p>${escapeHtml(project.latestProgress || project.nextAction || "No status card content.")}</p>
        <p class="path">${escapeHtml(project.path || "")}</p>
      </div>
    `).join("")
    : `<p class="empty">No project status cards.</p>`;
}

function renderEvidence() {
  const evidence = state.evidenceQueue || [];
  els.evidence.innerHTML = evidence.length
    ? evidence.map((item) => `
      <div class="item">
        <strong>${escapeHtml(item.title || "Untitled")}</strong>
        <p class="meta">${escapeHtml(item.status || "")} · ${escapeHtml(item.sensitivity || "")} · ${escapeHtml(item.updated || "")}</p>
        <p class="path">${escapeHtml(item.path || "")}</p>
      </div>
    `).join("")
    : `<p class="empty">No evidence queue items.</p>`;
}

function renderRecent() {
  const notes = state.recentNotes || [];
  els.recent.innerHTML = notes.length
    ? notes.map((note) => `
      <div class="table-row">
        <span>${escapeHtml(note.updated || "")}</span>
        <strong>${escapeHtml(note.title || "Untitled")}</strong>
        <span class="path">${escapeHtml(note.relativePath || note.path || "")}</span>
      </div>
    `).join("")
    : `<p class="empty">No recent notes.</p>`;
}

function renderHealth() {
  const health = state.health || [];
  els.health.innerHTML = health.length
    ? health.map((issue) => `
      <div class="item">
        <strong>${escapeHtml(issue.severity || "issue")}</strong>
        <p>${escapeHtml(issue.message || "")}</p>
        <p class="path">${escapeHtml(issue.path || "")}</p>
      </div>
    `).join("")
    : `<p class="empty">No health issues.</p>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
