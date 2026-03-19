import { useStore } from '../store'
import { 
  BarChart3, PieChart, TrendingUp, TrendingDown,
  Cpu, DollarSign, Zap, AlertTriangle,
  CheckCircle2, PlayCircle, BookOpen, Clock, Target
} from 'lucide-react'

function StatCard({ icon: Icon, label, value, subValue, color, trend }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <div className="p-2 rounded-lg" style={{ backgroundColor: color + '20' }}>
          <Icon size={20} style={{ color }} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
      {subValue && <div className="text-xs text-gray-400 mt-1">{subValue}</div>}
    </div>
  )
}

function ResourceChart() {
  const { resourceStats } = useStore()
  
  const maxCost = Math.max(...resourceStats.cost_trend.map(d => d.cost))
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <TrendingUp size={18} className="text-indigo-500" />
        Coût Mensuel (USD)
      </h3>
      <div className="flex items-end gap-2 h-32">
        {resourceStats.cost_trend.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center">
            <div 
              className="w-full bg-indigo-500 rounded-t transition-all hover:bg-indigo-600"
              style={{ height: `${(d.cost / maxCost) * 100}%` }}
              title={`${d.month}: $${d.cost.toFixed(2)}`}
            />
            <span className="text-xs text-gray-500 mt-1">{d.month}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function TokenBreakdown() {
  const { resourceStats } = useStore()
  const total = resourceStats.tokens_by_agent.reduce((acc, a) => acc + a.tokens, 0)
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <PieChart size={18} className="text-indigo-500" />
        Tokens par Agent
      </h3>
      <div className="space-y-3">
        {resourceStats.tokens_by_agent.map((agent, i) => (
          <div key={i}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: agent.color }} />
                {agent.agent}
              </span>
              <span className="font-medium">{agent.tokens.toLocaleString()}</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full"
                style={{ width: `${(agent.tokens / total) * 100}%`, backgroundColor: agent.color }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Total</span>
          <span className="font-semibold">{total.toLocaleString()} tokens</span>
        </div>
      </div>
    </div>
  )
}

function BudgetOverview() {
  const { workspaces, getWorkspaceBudget } = useStore()
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <DollarSign size={18} className="text-indigo-500" />
        Budget par Workspace
      </h3>
      <div className="space-y-4">
        {workspaces.map(ws => {
          const budget = getWorkspaceBudget(ws.id)
          if (!budget) return null
          const percent = (budget.spent / budget.cost_cap) * 100
          const isOver = percent > 100
          
          return (
            <div key={ws.id}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="flex items-center gap-2">
                  <span>{ws.icon}</span>
                  <span>{ws.name}</span>
                </span>
                <span className={isOver ? 'text-red-500' : 'text-gray-500'}>
                  ${budget.spent.toFixed(2)} / ${budget.cost_cap}
                </span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${isOver ? 'bg-red-500' : percent > 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min(percent, 100)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function AlertsPanel() {
  const { projects, workspaces } = useStore()
  
  const alerts = []
  
  // Check for blocked projects
  projects.filter(p => p.status === 'blocked').forEach(p => {
    const ws = workspaces.find(w => w.id === p.workspace)
    alerts.push({
      type: 'blocked',
      severity: 'high',
      message: `Projet "${p.name}" bloqué`,
      detail: p.blockers[0],
      workspace: ws?.name
    })
  })
  
  // Check for low health
  projects.filter(p => p.health_score < 60).forEach(p => {
    const ws = workspaces.find(w => w.id === p.workspace)
    alerts.push({
      type: 'health',
      severity: 'medium',
      message: `Santé du projet "${p.name}"`,
      detail: `${p.health_score}% de santé`,
      workspace: ws?.name
    })
  })
  
  // Check budget
  workspaces.forEach(ws => {
    const budget = useStore.getState().getWorkspaceBudget(ws.id)
    if (budget && budget.spent > budget.cost_cap * 0.9) {
      alerts.push({
        type: 'budget',
        severity: budget.spent > budget.cost_cap ? 'high' : 'medium',
        message: `Budget ${ws.name}`,
        detail: budget.spent > budget.cost_cap ? 'Dépassé!' : `${Math.round((budget.spent / budget.cost_cap) * 100)}% utilisé`,
        workspace: ws.name
      })
    }
  })
  
  if (alerts.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-green-500">
          <CheckCircle2 size={18} />
          <span className="font-medium">Tout va bien !</span>
        </div>
        <p className="text-sm text-gray-500 mt-1">Aucune alerte</p>
      </div>
    )
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <AlertTriangle size={18} className="text-yellow-500" />
        Alertes
      </h3>
      <div className="space-y-2">
        {alerts.map((alert, i) => (
          <div 
            key={i} 
            className={`p-2 rounded text-sm ${
              alert.severity === 'high' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
            }`}
          >
            <div className="font-medium">{alert.message}</div>
            <div className="text-xs opacity-75">{alert.detail}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ResourcesView() {
  const stats = useStore(s => s.getStats())
  const resourceStats = useStore(s => s.resourceStats)
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          icon={Cpu} 
          label="Tokens ce mois" 
          value={resourceStats.total_tokens_month.toLocaleString()}
          subValue="~565K tokens"
          color="#8b5cf6"
          trend={12}
        />
        <StatCard 
          icon={DollarSign} 
          label="Coût ce mois" 
          value={`$${resourceStats.total_cost_month.toFixed(2)}`}
          subValue="Limite: $110"
          color="#10b981"
          trend={-5}
        />
        <StatCard 
          icon={Zap} 
          label="Projets Actifs" 
          value={stats.inProgress}
          subValue={`sur ${stats.total} total`}
          color="#f59e0b"
        />
        <StatCard 
          icon={Target} 
          label="Santé Moyenne" 
          value={`${stats.healthAvg}%`}
          subValue="Score global"
          color="#3b82f6"
        />
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        <ResourceChart />
        <TokenBreakdown />
      </div>
      
      <div className="grid md:grid-cols-3 gap-4">
        <BudgetOverview />
        <AlertsPanel />
      </div>
    </div>
  )
}