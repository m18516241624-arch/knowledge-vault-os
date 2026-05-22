window.KNOWLEDGE_VAULT_SAMPLE_DATA = {
  generatedAt: "2026-05-22T00:00:00.000Z",
  vaultName: "SampleVault",
  noteCount: 4,
  distributions: {
    byFolder: {
      "20-projects": 1,
      "30-decisions": 1,
      "40-methods": 1,
      "80-agent-briefs": 1
    },
    byStatus: {
      active: 3,
      evidence: 1
    },
    bySensitivity: {
      private: 4
    },
    byType: {
      project: 1,
      decision: 1,
      method: 1,
      "agent-brief": 1
    }
  },
  recentNotes: [
    { title: "Knowledge Vault Entry", relativePath: "80-agent-briefs/knowledge-vault-entry.md", updated: "2026-05-22" }
  ],
  projects: [
    {
      title: "Example Project",
      path: "20-projects/example-project.md",
      stage: "draft",
      latestProgress: "Initialized the project page.",
      nextAction: "Review source packets.",
      blockers: "",
      updated: "2026-05-22"
    }
  ],
  evidenceQueue: [
    { title: "Daily Capture", path: "00-inbox/source-packets/2026-05-22-daily-capture.md", status: "evidence", sensitivity: "private", updated: "2026-05-22" }
  ],
  health: []
};
