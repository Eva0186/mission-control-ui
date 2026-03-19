import { useState } from 'react'
import { useStore } from './store'
import { 
  Layout, List, Calendar, Plus, Filter, 
  ChevronDown, Search, MoreVertical, AlertCircle,
  CheckCircle2, Clock, PlayCircle, PauseCircle, XCircle
} from 'lucide-react'

const STATUS_CONFIG = {
  backlog: { label: 'Backlog', color: '#6b7280', icon: PauseCircle },
  todo: { label: 'À faire', color: '#3b82f6', icon: Clock },
  in_progress: { label: 'En cours', color: '#f59e0b', icon: PlayCircle },
  review: { label: 'Review', color: '#8b5cf6', icon: Search },
  done: { label: 'Terminé', color: '#10b981', icon: CheckCircle2 },
  blocked: { label: 'Bloqué', color: '#ef4444', icon: XCircle },
}

const PRIORITY_CONFIG = {
  critical: { label: 'Critique', color: '#dc2626' },
  high: { label: 'Haute', color: '#f59e0b' },
  medium: { label: 'Moyenne', color: '#3b82f6' },
  low: { label: 'Basse', color: '#6b7280' },
}

// Project Card Component
function ProjectCard({ project, workspace, onMove }) {
  const [showMenu, setShowMenu] = useState(false)
  const ws = workspace || { icon: '📁', color: '#6366f1' }
  const priority = PRIORITY_CONFIG[project.priority]
  const isBlocked = project.status === 'blocked'
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 mb-2 hover:shadow-md transition-shadow ${isBlocked ? 'ring-2 ring-red-500/50' : ''}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{ws.icon}</span>
          <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">{project.name}</span>
        </div>
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <MoreVertical size={14} />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-6 bg-white dark:bg-gray-800 shadow-lg rounded border border-gray-200 dark:border-gray-700 py-1 z-10 min-w-[120px]">
              <button onClick={() => onMove(project.id, 'todo')} className="block w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">À faire</button>
              <button onClick={() => onMove(project.id, 'in_progress')} className="block w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">En cours</button>
              <button onClick={() => onMove(project.id, 'review')} className="block w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">Review</button>
              <button onClick={() => onMove(project.id, 'done')} className="block w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">Terminé</button>
              <button onClick={() => onMove(project.id, 'blocked')} className="block w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600">Bloqué</button>
            </div>
          )}
        </div>
      </div>
      
      {/* Tags */}
      {project.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {project.tags.map(tag => (
            <span key={tag} className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-400">
              {tag}
            </span>
          ))}
        </div>
      )}
      
      {/* Progress bar */}
      <div className="mb-2">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progression</span>
          <span>{project.progress}%</span>
        </div>
        <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all"
            style={{ 
              width: `${project.progress}%`,
              backgroundColor: priority.color
            }}
          />
        </div>
      </div>
      
      {/* Priority badge */}
      <div className="flex items-center justify-between">
        <span 
          className="text-xs px-2 py-0.5 rounded font-medium"
          style={{ 
            backgroundColor: priority.color + '20',
            color: priority.color
          }}
        >
          {priority.label}
        </span>
        
        {project.blockers.length > 0 && (
          <div className="flex items-center gap-1 text-red-500 text-xs">
            <AlertCircle size={12} />
            <span>{project.blockers.length}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// Kanban View
function KanbanView() {
  const { projects, workspaces, moveProject } = useStore()
  const activeWorkspace = useStore(s => s.activeWorkspace)
  
  const filteredProjects = activeWorkspace 
    ? projects.filter(p => p.workspace === activeWorkspace)
    : projects
  
  const columns = ['backlog', 'todo', 'in_progress', 'review', 'done', 'blocked']
  
  const getWorkspace = (id) => workspaces.find(w => w.id === id)
  
  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {columns.map(status => {
        const config = STATUS_CONFIG[status]
        const columnProjects = filteredProjects.filter(p => p.status === status)
        const Icon = config.icon
        
        return (
          <div key={status} className="flex-shrink-0 w-64">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
              <Icon size={16} style={{ color: config.color }} />
              <span className="font-medium text-sm">{config.label}</span>
              <span className="text-xs text-gray-400 ml-auto">{columnProjects.length}</span>
            </div>
            <div className="min-h-[200px]">
              {columnProjects.map(project => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  workspace={getWorkspace(project.workspace)}
                  onMove={moveProject}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// List View
function ListView() {
  const { projects, workspaces } = useStore()
  const activeWorkspace = useStore(s => s.activeWorkspace)
  
  const filteredProjects = activeWorkspace 
    ? projects.filter(p => p.workspace === activeWorkspace)
    : projects
  
  const getWorkspace = (id) => workspaces.find(w => w.id === id)
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="text-left p-3 font-medium">Projet</th>
            <th className="text-left p-3 font-medium">Workspace</th>
            <th className="text-left p-3 font-medium">Statut</th>
            <th className="text-left p-3 font-medium">Priorité</th>
            <th className="text-left p-3 font-medium">Progression</th>
            <th className="text-left p-3 font-medium">Tags</th>
          </tr>
        </thead>
        <tbody>
          {filteredProjects.map(project => {
            const ws = getWorkspace(project.workspace)
            const status = STATUS_CONFIG[project.status]
            const priority = PRIORITY_CONFIG[project.priority]
            const StatusIcon = status.icon
            
            return (
              <tr key={project.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="p-3 font-medium">{project.name}</td>
                <td className="p-3">
                  <span className="flex items-center gap-1">
                    <span>{ws?.icon}</span>
                    <span className="text-gray-600 dark:text-gray-400">{ws?.name}</span>
                  </span>
                </td>
                <td className="p-3">
                  <span className="flex items-center gap-1" style={{ color: status.color }}>
                    <StatusIcon size={14} />
                    <span>{status.label}</span>
                  </span>
                </td>
                <td className="p-3">
                  <span 
                    className="px-2 py-0.5 rounded text-xs font-medium"
                    style={{ 
                      backgroundColor: priority.color + '20',
                      color: priority.color
                    }}
                  >
                    {priority.label}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                      <div 
                        className="h-full rounded-full"
                        style={{ width: `${project.progress}%`, backgroundColor: priority.color }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{project.progress}%</span>
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {project.tags.map(tag => (
                      <span key={tag} className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// Timeline View
function TimelineView() {
  const { projects, workspaces } = useStore()
  const activeWorkspace = useStore(s => s.activeWorkspace)
  
  const filteredProjects = activeWorkspace 
    ? projects.filter(p => p.workspace === activeWorkspace)
    : projects
  
  // Sort by last activity
  const sorted = [...filteredProjects].sort((a, b) => 
    new Date(b.last_activity) - new Date(a.last_activity)
  )
  
  return (
    <div className="space-y-3">
      {sorted.map(project => {
        const ws = workspaces.find(w => w.id === project.workspace)
        const status = STATUS_CONFIG[project.status]
        
        return (
          <div key={project.id} className="flex items-center gap-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <span className="text-xl">{ws?.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium truncate">{project.name}</span>
                <StatusIcon status={project.status} size={14} />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all"
                    style={{ 
                      width: `${project.progress}%`,
                      backgroundColor: status.color
                    }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-12">{project.progress}%</span>
              </div>
            </div>
            <div className="text-right text-xs text-gray-500">
              <div>{new Date(project.last_activity).toLocaleDateString('fr-FR')}</div>
              <div>{ws?.name}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function StatusIcon({ status, size }) {
  const config = STATUS_CONFIG[status]
  const Icon = config.icon
  return <Icon size={size} style={{ color: config.color }} />
}

// Main Header
function Header() {
  const { 
    workspaces, activeWorkspace, setActiveWorkspace, 
    viewMode, setViewMode, getStats, addProject 
  } = useStore()
  const [showNewProject, setShowNewProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  
  const stats = getStats()
  
  const handleCreateProject = () => {
    if (newProjectName.trim() && activeWorkspace) {
      addProject(newProjectName.trim(), activeWorkspace)
      setNewProjectName('')
      setShowNewProject(false)
    }
  }
  
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">🎯 Mission Control</h1>
          
          {/* Workspace Selector */}
          <div className="flex items-center gap-2">
            <select 
              value={activeWorkspace || ''}
              onChange={(e) => setActiveWorkspace(e.target.value || null)}
              className="bg-gray-100 dark:bg-gray-800 border-0 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">🌐 Tous les workspaces</option>
              {workspaces.map(ws => (
                <option key={ws.id} value={ws.id}>{ws.icon} {ws.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* View Mode */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button 
            onClick={() => setViewMode('kanban')}
            className={`p-2 rounded ${viewMode === 'kanban' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}
            title="Kanban"
          >
            <Layout size={18} />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}
            title="Liste"
          >
            <List size={18} />
          </button>
          <button 
            onClick={() => setViewMode('timeline')}
            className={`p-2 rounded ${viewMode === 'timeline' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}
            title="Timeline"
          >
            <Calendar size={18} />
          </button>
        </div>
      </div>
      
      {/* Stats Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6 text-sm">
          <span className="text-gray-500">
            <strong className="text-gray-900 dark:text-gray-100">{stats.total}</strong> projets
          </span>
          <span className="text-orange-500">
            <strong className="text-orange-600 dark:text-orange-400">{stats.byStatus.in_progress}</strong> en cours
          </span>
          <span className="text-green-500">
            <strong className="text-green-600 dark:text-green-400">{stats.byStatus.done}</strong> terminés
          </span>
          {stats.byStatus.blocked > 0 && (
            <span className="text-red-500 flex items-center gap-1">
              <AlertCircle size={14} />
              <strong>{stats.byStatus.blocked}</strong> bloqués
            </span>
          )}
        </div>
        
        {/* Add Project Button */}
        {activeWorkspace && (
          <div className="relative">
            {showNewProject ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Nom du projet..."
                  className="bg-gray-100 dark:bg-gray-800 border-0 rounded-lg px-3 py-1.5 text-sm w-48"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                  autoFocus
                />
                <button 
                  onClick={handleCreateProject}
                  className="p-1.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
                >
                  <Plus size={16} />
                </button>
                <button 
                  onClick={() => setShowNewProject(false)}
                  className="p-1.5 text-gray-500 hover:text-gray-700"
                >
                  <XCircle size={16} />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowNewProject(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 text-sm"
              >
                <Plus size={16} />
                Nouveau projet
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  )
}

// Main App
function App() {
  const viewMode = useStore(s => s.viewMode)
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header />
      <main className="p-4">
        {viewMode === 'kanban' && <KanbanView />}
        {viewMode === 'list' && <ListView />}
        {viewMode === 'timeline' && <TimelineView />}
      </main>
    </div>
  )
}

export default App