import { create } from 'zustand'

// Generate unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9)

// Default project schema
const createProject = (name, workspaceId) => ({
  id: generateId(),
  name,
  workspace: workspaceId,
  status: 'backlog', // backlog | todo | in_progress | review | done | blocked
  priority: 'medium', // critical | high | medium | low
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
})

// Default workspace schema
const createWorkspace = (name, icon = '📁', color = '#6366f1') => ({
  id: generateId(),
  name,
  icon,
  color,
  description: '',
  agents_pool: [],
  budget: { token_limit: 500000, cost_cap: 10 },
  rules: { max_concurrent_projects: 10, auto_archive_after_days: 30, default_priority: 'medium' },
  tags_vocabulary: [],
})

// Sample data
const sampleWorkspaces = [
  createWorkspace('Production', '🏭', '#ef4444'),
  createWorkspace('R&D', '🔬', '#8b5cf6'),
  createWorkspace('DevOps', '⚙️', '#f59e0b'),
  createWorkspace('Lab', '🧪', '#10b981'),
]

const sampleProjects = [
  { ...createProject('API Gateway v3', sampleWorkspaces[0].id), status: 'in_progress', priority: 'critical', progress: 72, tags: ['backend', 'api'] },
  { ...createProject('CI/CD Pipeline', sampleWorkspaces[2].id), status: 'done', priority: 'high', progress: 100, tags: ['devops', 'automation'] },
  { ...createProject('Vector DB Migration', sampleWorkspaces[1].id), status: 'todo', priority: 'medium', progress: 15, tags: ['database', 'migration'] },
  { ...createProject('Auth Service', sampleWorkspaces[0].id), status: 'review', priority: 'high', progress: 95, tags: ['security', 'backend'] },
  { ...createProject('Dashboard Redesign', sampleWorkspaces[0].id), status: 'backlog', priority: 'low', progress: 0, tags: ['frontend', 'ui'] },
  { ...createProject('RAG Implementation', sampleWorkspaces[1].id), status: 'in_progress', priority: 'high', progress: 45, tags: ['ai', 'rag'] },
  { ...createProject('Monitoring Setup', sampleWorkspaces[2].id), status: 'blocked', priority: 'medium', progress: 30, blockers: ['En attente de credentials AWS'], tags: ['devops', 'monitoring'] },
  { ...createProject('Mobile App Prototype', sampleWorkspaces[3].id), status: 'todo', priority: 'low', progress: 5, tags: ['mobile', 'react-native'] },
]

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
  activeWorkspace: null, // null = unified view
  
  setActiveWorkspace: (id) => set({ activeWorkspace: id }),
  
  addWorkspace: (name, icon, color) => set(state => ({
    workspaces: [...state.workspaces, createWorkspace(name, icon, color)]
  })),
  
  // Views
  viewMode: 'kanban', // kanban | list | timeline | unified
  
  setViewMode: (mode) => set({ viewMode: mode }),
  
  // Filters
  filters: {
    status: null,
    priority: null,
    tags: [],
    agents: [],
  },
  
  setFilter: (key, value) => set(state => ({
    filters: { ...state.filters, [key]: value }
  })),
  
  clearFilters: () => set({ filters: { status: null, priority: null, tags: [], agents: [] } }),
  
  // Computed getters
  getFilteredProjects: () => {
    const { projects, activeWorkspace, filters } = get()
    let filtered = activeWorkspace 
      ? projects.filter(p => p.workspace === activeWorkspace)
      : projects
    
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
    
    return { byStatus, total, inProgress, healthAvg }
  },
}))