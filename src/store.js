import { create } from 'zustand'

const generateId = () => Math.random().toString(36).substr(2, 9)

const createProject = (name, workspaceId) => ({
  id: generateId(),
  name,
  workspace: workspaceId,
  status: 'backlog',
  priority: 'medium',
  progress: 0,
  agents_assigned: [],
  tokens_consumed: 0,
  cost_usd: 0,
  tags: [],
  due_date: null,
  dependencies: [],
  last_activity: new Date().toISOString(),
  health_score: 100,
  blockers: [],
  milestones: [],
  weekly_tokens: [],
  weekly_costs: [],
})

const createWorkspace = (name, icon = '📁', color = '#6366f1') => ({
  id: generateId(),
  name,
  icon,
  color,
  description: '',
  agents_pool: [],
  budget: { token_limit: 500000, cost_cap: 10, spent_tokens: 0, spent_cost: 0 },
  rules: { max_concurrent_projects: 10, auto_archive_after_days: 30, default_priority: 'medium' },
  tags_vocabulary: [],
})

// Sample data with realistic metrics
const sampleWorkspaces = [
  { ...createWorkspace('Production', '🏭', '#ef4444'), budget: { token_limit: 1000000, cost_cap: 50, spent_tokens: 245000, spent_cost: 12.50 } },
  { ...createWorkspace('R&D', '🔬', '#8b5cf6'), budget: { token_limit: 500000, cost_cap: 25, spent_tokens: 180000, spent_cost: 9.20 } },
  { ...createWorkspace('DevOps', '⚙️', '#f59e0b'), budget: { token_limit: 300000, cost_cap: 15, spent_tokens: 95000, spent_cost: 4.75 } },
  { ...createWorkspace('Lab', '🧪', '#10b981'), budget: { token_limit: 200000, cost_cap: 10, spent_tokens: 45000, spent_cost: 2.25 } },
]

// Generate weekly data for charts
const generateWeeklyData = () => {
  const data = []
  const now = new Date()
  for (let i = 7; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i * 7)
    data.push({
      week: date.toISOString().slice(0, 10),
      tokens: Math.floor(Math.random() * 50000) + 10000,
      cost: Math.random() * 3 + 0.5,
    })
  }
  return data
}

const sampleProjects = [
  { ...createProject('API Gateway v3', sampleWorkspaces[0].id), status: 'in_progress', priority: 'critical', progress: 72, tokens_consumed: 145000, cost_usd: 7.25, tags: ['backend', 'api'], health_score: 85, weekly_tokens: generateWeeklyData() },
  { ...createProject('CI/CD Pipeline', sampleWorkspaces[2].id), status: 'done', priority: 'high', progress: 100, tokens_consumed: 85000, cost_usd: 4.25, tags: ['devops', 'automation'], health_score: 100, weekly_tokens: generateWeeklyData() },
  { ...createProject('Vector DB Migration', sampleWorkspaces[1].id), status: 'todo', priority: 'medium', progress: 15, tokens_consumed: 32000, cost_usd: 1.60, tags: ['database', 'migration'], health_score: 95, weekly_tokens: generateWeeklyData() },
  { ...createProject('Auth Service', sampleWorkspaces[0].id), status: 'review', priority: 'high', progress: 95, tokens_consumed: 178000, cost_usd: 8.90, tags: ['security', 'backend'], health_score: 90, weekly_tokens: generateWeeklyData() },
  { ...createProject('Dashboard Redesign', sampleWorkspaces[0].id), status: 'backlog', priority: 'low', progress: 0, tokens_consumed: 0, cost_usd: 0, tags: ['frontend', 'ui'], health_score: 100, weekly_tokens: generateWeeklyData() },
  { ...createProject('RAG Implementation', sampleWorkspaces[1].id), status: 'in_progress', priority: 'high', progress: 45, tokens_consumed: 95000, cost_usd: 4.75, tags: ['ai', 'rag'], health_score: 75, weekly_tokens: generateWeeklyData() },
  { ...createProject('Monitoring Setup', sampleWorkspaces[2].id), status: 'blocked', priority: 'medium', progress: 30, tokens_consumed: 42000, cost_usd: 2.10, blockers: ['En attente de credentials AWS'], tags: ['devops', 'monitoring'], health_score: 40, weekly_tokens: generateWeeklyData() },
  { ...createProject('Mobile App Prototype', sampleWorkspaces[3].id), status: 'todo', priority: 'low', progress: 5, tokens_consumed: 8000, cost_usd: 0.40, tags: ['mobile', 'react-native'], health_score: 98, weekly_tokens: generateWeeklyData() },
]

// Learning modules
const learningModules = [
  { id: generateId(), title: 'React Fundamentals', description: 'Apprenez les bases de React', progress: 75, total_lessons: 12, completed_lessons: 9, category: 'frontend', estimated_hours: 8 },
  { id: generateId(), title: 'Three.js Basics', description: 'Introduction à la 3D sur le web', progress: 30, total_lessons: 10, completed_lessons: 3, category: '3d', estimated_hours: 6 },
  { id: generateId(), title: 'API Design', description: 'Concevoir des APIs robustes', progress: 0, total_lessons: 8, completed_lessons: 0, category: 'backend', estimated_hours: 4 },
  { id: generateId(), title: 'Deployment CI/CD', description: 'Automatiser vos déploiements', progress: 100, total_lessons: 6, completed_lessons: 6, category: 'devops', estimated_hours: 3 },
]

// Resource usage stats
const resourceStats = {
  total_tokens_month: 565000,
  total_cost_month: 28.70,
  tokens_by_agent: [
    { agent: 'Claude', tokens: 285000, color: '#8b5cf6' },
    { agent: 'Codex', tokens: 165000, color: '#3b82f6' },
    { agent: 'OpenClaw', tokens: 95000, color: '#10b981' },
    { agent: 'Custom', tokens: 20000, color: '#f59e0b' },
  ],
  cost_trend: [
    { month: 'Oct', cost: 22.50 },
    { month: 'Nov', cost: 25.30 },
    { month: 'Dec', cost: 19.80 },
    { month: 'Jan', cost: 28.70 },
    { month: 'Feb', cost: 24.20 },
    { month: 'Mar', cost: 28.70 },
  ],
}

export const useStore = create((set, get) => ({
  // Projects
  projects: sampleProjects,
  addProject: (name, workspaceId) => set(state => ({
    projects: [...state.projects, createProject(name, workspaceId)]
  })),
  updateProject: (id, updates) => set(state => ({
    projects: state.projects.map(p => p.id === id ? { ...p, ...updates, last_activity: new Date().toISOString() } : p)
  })),
  moveProject: (id, newStatus) => set(state => ({
    projects: state.projects.map(p => p.id === id ? { ...p, status: newStatus, last_activity: new Date().toISOString() } : p)
  })),
  deleteProject: (id) => set(state => ({
    projects: state.projects.filter(p => p.id !== id)
  })),

  // Workspaces
  workspaces: sampleWorkspaces,
  activeWorkspace: null,
  setActiveWorkspace: (id) => set({ activeWorkspace: id }),
  addWorkspace: (name, icon, color) => set(state => ({
    workspaces: [...state.workspaces, createWorkspace(name, icon, color)]
  })),

  // View mode - expanded to include new views
  viewMode: 'kanban',
  setViewMode: (mode) => set({ viewMode: mode }),

  // Filters
  filters: { status: null, priority: null, tags: [], agents: [] },
  setFilter: (key, value) => set(state => ({
    filters: { ...state.filters, [key]: value }
  })),
  clearFilters: () => set({ filters: { status: null, priority: null, tags: [], agents: [] } }),

  // Learning modules
  learningModules,
  completeLesson: (moduleId) => set(state => ({
    learningModules: state.learningModules.map(m => 
      m.id === moduleId && m.completed_lessons < m.total_lessons
        ? { ...m, completed_lessons: m.completed_lessons + 1, progress: Math.round((m.completed_lessons + 1) / m.total_lessons * 100) }
        : m
    )
  })),

  // Resource stats
  resourceStats,

  // Computed
  getFilteredProjects: () => {
    const { projects, activeWorkspace, filters } = get()
    let filtered = activeWorkspace ? projects.filter(p => p.workspace === activeWorkspace) : projects
    if (filters.status) filtered = filtered.filter(p => p.status === filters.status)
    if (filters.priority) filtered = filtered.filter(p => p.priority === filters.priority)
    if (filters.tags.length) filtered = filtered.filter(p => filters.tags.some(t => p.tags.includes(t)))
    return filtered
  },

  getStats: () => {
    const { projects, workspaces } = get()
    const byStatus = {
      backlog: projects.filter(p => p.status === 'backlog').length,
      todo: projects.filter(p => p.status === 'todo').length,
      in_progress: projects.filter(p => p.status === 'in_progress').length,
      review: projects.filter(p => p.status === 'review').length,
      done: projects.filter(p => p.status === 'done').length,
      blocked: projects.filter(p => p.status === 'blocked').length,
    }
    const total = projects.length
    const inProgress = byStatus.in_progress + byStatus.review
    const healthAvg = projects.length ? Math.round(projects.reduce((acc, p) => acc + p.health_score, 0) / projects.length) : 0
    const totalTokens = projects.reduce((acc, p) => acc + p.tokens_consumed, 0)
    const totalCost = projects.reduce((acc, p) => acc + p.cost_usd, 0)
    
    return { byStatus, total, inProgress, healthAvg, totalTokens, totalCost }
  },

  getWorkspaceBudget: (workspaceId) => {
    const ws = get().workspaces.find(w => w.id === workspaceId)
    if (!ws) return null
    const projects = get().projects.filter(p => p.workspace === workspaceId)
    const spent = projects.reduce((acc, p) => acc + p.cost_usd, 0)
    return { ...ws.budget, spent, remaining: ws.budget.cost_cap - spent }
  },
}))