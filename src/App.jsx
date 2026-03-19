import { useState, useEffect } from 'react'
import { useStore } from './store'
import ResourcesView from './views/ResourcesView'
import LearningView from './views/LearningView'
import { 
  Layout, List, Calendar, Plus, Search, MoreVertical, AlertCircle,
  CheckCircle2, Clock, PlayCircle, PauseCircle, XCircle,
  Lock, Eye, EyeOff, LogOut, GripVertical, BarChart2, BookOpen
} from 'lucide-react'

const APP_PASSWORD = 'madamefig86'

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

function simpleHash(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash.toString(16)
}

function LoginScreen({ onLogin }) {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  
  const handleSubmit = (e) => {
    e.preventDefault()
    if (password === APP_PASSWORD || simpleHash(password) === APP_PASSWORD) {
      localStorage.setItem('mc_auth', 'true')
      onLogin(true)
    } else {
      setError('Mot de passe incorrect')
      setPassword('')
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🎯</div>
          <h1 className="text-2xl font-bold text-white">Mission Control</h1>
          <p className="text-gray-400 mt-2">Accès sécurisé</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe..."
              className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 pl-10 pr-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300">
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button type="submit" className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 rounded-lg transition-colors">
            Connexion
          </button>
        </form>
        <p className="text-gray-500 text-xs text-center mt-6">Accès restreint - Propriétaire Only 🔒</p>
      </div>
    </div>
  )
}

function ProjectCard({ project, workspace, onMove }) {
  const [showMenu, setShowMenu] = useState(false)
  const ws = workspace || { icon: '📁', color: '#6366f1' }
  const priority = PRIORITY_CONFIG[project.priority]
  const isBlocked = project.status === 'blocked'
  
  return (
    <div draggable onDragStart={(e) => { e.dataTransfer.setData('projectId', project.id); e.dataTransfer.effectAllowed = 'move'; }} className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 mb-2 hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${isBlocked ? 'ring-2 ring-red-500/50' : ''}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <GripVertical size={14} className="text-gray-400 cursor-grab" />
          <span className="text-lg">{ws.icon}</span>
          <span className="font-medium text-sm">{project.name}</span>
        </div>
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <MoreVertical size={14} />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-6 bg-white dark:bg-gray-800 shadow-lg rounded border py-1 z-10 min-w-[120px]">
              <button onClick={() => { onMove(project.id, 'todo'); setShowMenu(false); }} className="block w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100">À faire</button>
              <button onClick={() => { onMove(project.id, 'in_progress'); setShowMenu(false); }} className="block w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100">En cours</button>
              <button onClick={() => { onMove(project.id, 'review'); setShowMenu(false); }} className="block w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100">Review</button>
              <button onClick={() => { onMove(project.id, 'done'); setShowMenu(false); }} className="block w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100">Terminé</button>
              <button onClick={() => { onMove(project.id, 'blocked'); setShowMenu(false); }} className="block w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 text-red-600">Bloqué</button>
            </div>
          )}
        </div>
      </div>
      {project.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {project.tags.map(tag => <span key={tag} className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">{tag}</span>)}
        </div>
      )}
      <div className="mb-2">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progression</span><span>{project.progress}%</span>
        </div>
        <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${project.progress}%`, backgroundColor: priority.color }} />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ backgroundColor: priority.color + '20', color: priority.color }}>{priority.label}</span>
        {project.blockers.length > 0 && <div className="flex items-center gap-1 text-red-500 text-xs"><AlertCircle size={12} /><span>{project.blockers.length}</span></div>}
      </div>
    </div>
  )
}

function KanbanView() {
  const { projects, workspaces, moveProject } = useStore()
  const activeWorkspace = useStore(s => s.activeWorkspace)
  const filteredProjects = activeWorkspace ? projects.filter(p => p.workspace === activeWorkspace) : projects
  const columns = ['backlog', 'todo', 'in_progress', 'review', 'done', 'blocked']
  const getWorkspace = (id) => workspaces.find(w => w.id === id)
  
  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {columns.map(status => {
        const config = STATUS_CONFIG[status]
        const columnProjects = filteredProjects.filter(p => p.status === status)
        return (
          <div key={status} className="flex-shrink-0 w-64">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
              {(() => { const Icon = config.icon; return <Icon size={16} style={{ color: config.color }} /> })()}
              <span className="font-medium text-sm">{config.label}</span>
              <span className="text-xs text-gray-400 ml-auto">{columnProjects.length}</span>
            </div>
            <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => moveProject(e.dataTransfer.getData('projectId'), status)} className="min-h-[200px]">
              {columnProjects.map(project => <ProjectCard key={project.id} project={project} workspace={getWorkspace(project.workspace)} onMove={moveProject} />)}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ListView() {
  const { projects, workspaces } = useStore()
  const activeWorkspace = useStore(s => s.activeWorkspace)
  const filteredProjects = activeWorkspace ? projects.filter(p => p.workspace === activeWorkspace) : projects
  const getWorkspace = (id) => workspaces.find(w => w.id === id)
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr><th className="text-left p-3 font-medium">Projet</th><th className="text-left p-3 font-medium">Workspace</th><th className="text-left p-3 font-medium">Statut</th><th className="text-left p-3 font-medium">Priorité</th><th className="text-left p-3 font-medium">Progression</th><th className="text-left p-3 font-medium">Tags</th></tr>
        </thead>
        <tbody>
          {filteredProjects.map(project => {
            const ws = getWorkspace(project.workspace)
            const status = STATUS_CONFIG[project.status]
            const priority = PRIORITY_CONFIG[project.priority]
            const StatusIcon = status.icon
            return (
              <tr key={project.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50">
                <td className="p-3 font-medium">{project.name}</td>
                <td className="p-3"><span className="flex items-center gap-1"><span>{ws?.icon}</span><span className="text-gray-600">{ws?.name}</span></span></td>
                <td className="p-3"><span className="flex items-center gap-1" style={{ color: status.color }}><StatusIcon size={14} /><span>{status.label}</span></span></td>
                <td className="p-3"><span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: priority.color + '20', color: priority.color }}>{priority.label}</span></td>
                <td className="p-3"><div className="flex items-center gap-2"><div className="w-16 h-1.5 bg-gray-200 rounded-full"><div className="h-full rounded-full" style={{ width: `${project.progress}%`, backgroundColor: priority.color }} /></div><span className="text-xs text-gray-500">{project.progress}%</span></div></td>
                <td className="p-3"><div className="flex flex-wrap gap-1">{project.tags.map(tag => <span key={tag} className="text-xs px-1.5 py-0.5 bg-gray-100 rounded">{tag}</span>)}</div></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function TimelineView() {
  const { projects, workspaces } = useStore()
  const activeWorkspace = useStore(s => s.activeWorkspace)
  const filteredProjects = activeWorkspace ? projects.filter(p => p.workspace === activeWorkspace) : projects
  const sorted = [...filteredProjects].sort((a, b) => new Date(b.last_activity) - new Date(a.last_activity))
  
  return (
    <div className="space-y-3">
      {sorted.map(project => {
        const ws = workspaces.find(w => w.id === project.workspace)
        const status = STATUS_CONFIG[project.status]
        return (
          <div key={project.id} className="flex items-center gap-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <span className="text-xl">{ws?.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate mb-1">{project.name}</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${project.progress}%`, backgroundColor: status.color }} />
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

function Header({ onLogout, activeTab, setActiveTab }) {
  const { workspaces, activeWorkspace, setActiveWorkspace, viewMode, setViewMode, getStats, addProject } = useStore()
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
  
  const tabs = [
    { id: 'projects', label: 'Projets', icon: Layout },
    { id: 'resources', label: 'Ressources', icon: BarChart2 },
    { id: 'learning', label: 'Apprentissage', icon: BookOpen },
  ]
  
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">🎯 Mission Control</h1>
          
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${activeTab === tab.id ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              )
            })}
          </div>
          
          {activeTab === 'projects' && (
            <select value={activeWorkspace || ''} onChange={(e) => setActiveWorkspace(e.target.value || null)} className="bg-gray-100 dark:bg-gray-800 border-0 rounded-lg px-3 py-1.5 text-sm">
              <option value="">🌐 Tous les workspaces</option>
              {workspaces.map(ws => <option key={ws.id} value={ws.id}>{ws.icon} {ws.name}</option>)}
            </select>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {activeTab === 'projects' && (
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button onClick={() => setViewMode('kanban')} className={`p-2 rounded ${viewMode === 'kanban' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}><Layout size={18} /></button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}><List size={18} /></button>
              <button onClick={() => setViewMode('timeline')} className={`p-2 rounded ${viewMode === 'timeline' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}><Calendar size={18} /></button>
            </div>
          )}
          <button onClick={onLogout} className="p-2 text-gray-500 hover:text-red-500" title="Déconnexion"><LogOut size={18} /></button>
        </div>
      </div>
      
      {/* Stats bar (only on projects tab) */}
      {activeTab === 'projects' && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm">
            <span className="text-gray-500"><strong className="text-gray-900 dark:text-gray-100">{stats.total}</strong> projets</span>
            <span className="text-orange-500"><strong>{stats.byStatus.in_progress}</strong> en cours</span>
            <span className="text-green-500"><strong>{stats.byStatus.done}</strong> terminés</span>
            {stats.byStatus.blocked > 0 && <span className="text-red-500 flex items-center gap-1"><AlertCircle size={14} /><strong>{stats.byStatus.blocked}</strong> bloqués</span>}
          </div>
          {activeWorkspace && (
            <div className="relative">
              {showNewProject ? (
                <div className="flex items-center gap-2">
                  <input type="text" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} placeholder="Nom du projet..." className="bg-gray-100 dark:bg-gray-800 border-0 rounded-lg px-3 py-1.5 text-sm w-48" onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()} autoFocus />
                  <button onClick={handleCreateProject} className="p-1.5 bg-indigo-500 text-white rounded-lg"><Plus size={16} /></button>
                  <button onClick={() => setShowNewProject(false)} className="p-1.5 text-gray-500"><XCircle size={16} /></button>
                </div>
              ) : (
                <button onClick={() => setShowNewProject(true)} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-500 text-white rounded-lg text-sm"><Plus size={16} />Nouveau projet</button>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  )
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null)
  const [activeTab, setActiveTab] = useState('projects')
  const viewMode = useStore(s => s.viewMode)
  
  useEffect(() => {
    const auth = localStorage.getItem('mc_auth')
    setIsAuthenticated(auth === 'true')
  }, [])
  
  const handleLogin = (success) => setIsAuthenticated(success)
  const handleLogout = () => { localStorage.removeItem('mc_auth'); setIsAuthenticated(false); }
  
  if (isAuthenticated === null) return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><div className="text-white">Chargement...</div></div>
  if (!isAuthenticated) return <LoginScreen onLogin={handleLogin} />
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header onLogout={handleLogout} activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="p-4">
        {activeTab === 'projects' && (
          <>
            {viewMode === 'kanban' && <KanbanView />}
            {viewMode === 'list' && <ListView />}
            {viewMode === 'timeline' && <TimelineView />}
          </>
        )}
        {activeTab === 'resources' && <ResourcesView />}
        {activeTab === 'learning' && <LearningView />}
      </main>
    </div>
  )
}

export default App