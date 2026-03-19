import { useStore } from '../store'
import { 
  BookOpen, PlayCircle, CheckCircle2, Clock, 
  ChevronRight, BarChart2, Target, Sparkles
} from 'lucide-react'

const CATEGORY_COLORS = {
  frontend: '#3b82f6',
  backend: '#10b981',
  devops: '#f59e0b',
  '3d': '#8b5cf6',
  ai: '#ec4899',
  security: '#ef4444',
}

function LearningCard({ module, onComplete }) {
  const color = CATEGORY_COLORS[module.category] || '#6b7280'
  const isComplete = module.progress === 100
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${isComplete ? 'ring-2 ring-green-500/30' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span 
            className="px-2 py-0.5 rounded text-xs font-medium"
            style={{ backgroundColor: color + '20', color }}
          >
            {module.category}
          </span>
          {isComplete && (
            <CheckCircle2 size={16} className="text-green-500" />
          )}
        </div>
        <span className="text-xs text-gray-500 flex items-center gap-1">
          <Clock size={12} />
          ~{module.estimated_hours}h
        </span>
      </div>
      
      <h3 className="font-semibold mb-1">{module.title}</h3>
      <p className="text-sm text-gray-500 mb-3">{module.description}</p>
      
      {/* Progress */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progression</span>
          <span>{module.completed_lessons}/{module.total_lessons} leçons</span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all"
            style={{ width: `${module.progress}%`, backgroundColor: isComplete ? '#10b981' : color }}
          />
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium" style={{ color }}>
          {module.progress}%
        </span>
        <button 
          onClick={() => onComplete(module.id)}
          disabled={isComplete}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm ${
            isComplete 
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-indigo-500 text-white hover:bg-indigo-600'
          }`}
        >
          <PlayCircle size={14} />
          {isComplete ? 'Terminé' : 'Continuer'}
        </button>
      </div>
    </div>
  )
}

function LearningProgress() {
  const modules = useStore(s => s.learningModules)
  
  const totalLessons = modules.reduce((acc, m) => acc + m.total_lessons, 0)
  const completedLessons = modules.reduce((acc, m) => acc + m.completed_lessons, 0)
  const overallProgress = Math.round((completedLessons / totalLessons) * 100)
  const completedModules = modules.filter(m => m.progress === 100).length
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <BarChart2 size={18} className="text-indigo-500" />
        Progression Globale
      </h3>
      
      <div className="grid grid-cols-3 gap-4 text-center mb-4">
        <div>
          <div className="text-2xl font-bold text-indigo-500">{overallProgress}%</div>
          <div className="text-xs text-gray-500">Complet</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{completedLessons}/{totalLessons}</div>
          <div className="text-xs text-gray-500">Leçons</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-500">{completedModules}/{modules.length}</div>
          <div className="text-xs text-gray-500">Modules</div>
        </div>
      </div>
      
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 to-green-500 rounded-full transition-all"
          style={{ width: `${overallProgress}%` }}
        />
      </div>
    </div>
  )
}

function SuggestedLearning() {
  const { projects } = useStore()
  const modules = useStore(s => s.learningModules)
  
  // Suggest modules based on project tags
  const projectTags = [...new Set(projects.flatMap(p => p.tags))]
  const inProgress = modules.find(m => m.progress > 0 && m.progress < 100)
  
  const suggestions = []
  
  if (inProgress) {
    suggestions.push({ type: 'continue', module: inProgress })
  }
  
  // Find related modules
  projectTags.forEach(tag => {
    const related = modules.find(m => 
      m.category === tag && m.progress === 0
    )
    if (related && !suggestions.find(s => s.module.id === related.id)) {
      suggestions.push({ type: 'related', module: related })
    }
  })
  
  // Add some random suggestions
  const notStarted = modules.filter(m => m.progress === 0)
  if (notStarted.length > 0 && suggestions.length < 3) {
    suggestions.push({ type: 'suggested', module: notStarted[0] })
  }
  
  if (suggestions.length === 0) return null
  
  return (
    <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/5 dark:to-purple-500/5 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <Sparkles size={18} className="text-indigo-500" />
        Recommandé pour toi
      </h3>
      <div className="space-y-2">
        {suggestions.map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-2 bg-white dark:bg-gray-800 rounded-lg">
            <div className={`p-2 rounded-lg ${
              s.type === 'continue' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' :
              s.type === 'related' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' :
              'bg-gray-100 dark:bg-gray-700 text-gray-600'
            }`}>
              {s.type === 'continue' ? <PlayCircle size={16} /> : <BookOpen size={16} />}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">{s.module.title}</div>
              <div className="text-xs text-gray-500">
                {s.type === 'continue' ? 'Reprendre' : s.type === 'related' ? 'Liés à tes projets' : 'Suggestion'}
              </div>
            </div>
            <ChevronRight size={16} className="text-gray-400" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function LearningView() {
  const { learningModules, completeLesson } = useStore()
  
  // Group by category
  const categories = [...new Set(learningModules.map(m => m.category))]
  
  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid md:grid-cols-2 gap-4">
        <LearningProgress />
        <SuggestedLearning />
      </div>
      
      {/* Category sections */}
      {categories.map(cat => (
        <div key={cat}>
          <h2 className="text-lg font-semibold mb-3 capitalize flex items-center gap-2">
            <BookOpen size={18} style={{ color: CATEGORY_COLORS[cat] }} />
            {cat}
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {learningModules
              .filter(m => m.category === cat)
              .map(module => (
                <LearningCard 
                  key={module.id} 
                  module={module}
                  onComplete={completeLesson}
                />
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}