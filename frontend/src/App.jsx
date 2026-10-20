
import { useState } from 'react'
import './App.css'

const sampleBugs = [
  {
    id: 'BUG-101',
    title: 'Login button does not respond',
    project: 'Authentication',
    priority: 'High',
    status: 'Open',
    assignee: 'Sam',
  },
  {
    id: 'BUG-102',
    title: 'Dashboard loading takes too long',
    project: 'Dashboard',
    priority: 'Medium',
    status: 'In Progress',
    assignee: 'Alex',
  },
  {
    id: 'BUG-103',
    title: 'Incorrect date shown in reports',
    project: 'Reporting',
    priority: 'Low',
    status: 'Fixed',
    assignee: 'Sam',
  },
  {
    id: 'BUG-104',
    title: 'Password reset link expires early',
    project: 'Authentication',
    priority: 'High',
    status: 'Open',
    assignee: 'Jordan',
  },
]

function App() {
  const [bugs] = useState(sampleBugs)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')

  const filteredBugs = bugs.filter((bug) => {
    const matchesSearch =
      bug.title.toLowerCase().includes(search.toLowerCase()) ||
      bug.id.toLowerCase().includes(search.toLowerCase())

    const matchesStatus =
      statusFilter === 'All' || bug.status === statusFilter

    const matchesPriority =
      priorityFilter === 'All' || bug.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  const stats = [
    { label: 'Total bugs', value: bugs.length, icon: '◈', color: 'blue' },
    {
      label: 'Open bugs',
      value: bugs.filter((bug) => bug.status === 'Open').length,
      icon: '○',
      color: 'orange',
    },
    {
      label: 'In progress',
      value: bugs.filter((bug) => bug.status === 'In Progress').length,
      icon: '◷',
      color: 'purple',
    },
    {
      label: 'Fixed bugs',
      value: bugs.filter((bug) => bug.status === 'Fixed').length,
      icon: '✓',
      color: 'green',
    },
  ]

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">D</div>
          <div>
            <h2>DevTrack <span>AI</span></h2>
            <p>DEFECT MANAGEMENT</p>
          </div>
        </div>

        <p className="nav-label">WORKSPACE</p>
        <nav className="navigation">
          <button className="nav-item active">▦ <span>Dashboard</span></button>
          <button className="nav-item">▤ <span>All bug reports</span></button>
          <button className="nav-item">◷ <span>My assignments</span></button>
        </nav>

        <p className="nav-label">MANAGEMENT</p>
        <nav className="navigation">
          <button className="nav-item">◉ <span>Projects</span></button>
          <button className="nav-item">▥ <span>Reports & analytics</span></button>
          <button className="nav-item">⚙ <span>Settings</span></button>
        </nav>

        <div className="sidebar-bottom">
          <div className="avatar">S</div>
          <div>
            <strong>Sam</strong>
            <p>Project administrator</p>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> Dashboard</div>
          <div className="topbar-right">
            <span className="environment-label">● Development</span>
            <div className="avatar small">S</div>
          </div>
        </header>

        <section className="page-content">
          <div className="welcome-row">
            <div>
              <p className="eyebrow">OVERVIEW</p>
              <h1>Bug tracking dashboard</h1>
              <p className="page-subtitle">
                Monitor defects, track progress, and keep your projects healthy.
              </p>
            </div>
            <button className="primary-button" onClick={() => alert('Bug creation form coming next!')}>
              <span>＋</span> Report a bug
            </button>
          </div>

          <div className="stats-grid">
            {stats.map((stat) => (
              <article className="stat-card" key={stat.label}>
                <div className="stat-top">
                  <span>{stat.label}</span>
                  <span className={`stat-icon ${stat.color}`}>{stat.icon}</span>
                </div>
                <div className="stat-value">{stat.value}</div>
                <p className="stat-footnote">Across all bug reports</p>
              </article>
            ))}
          </div>

          <section className="bugs-panel">
            <div className="panel-heading">
              <div>
                <h2>Recent bug reports</h2>
                <p>Review and manage reported software defects.</p>
              </div>
              <span className="record-count">{filteredBugs.length} reports</span>
            </div>

            <div className="filters">
              <div className="search-box">
                <span>⌕</span>
                <input
                  aria-label="Search bug reports"
                  placeholder="Search by title or bug ID..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              <select
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="All">All statuses</option>
                <option value="Open">Open</option>
                <option value="In Progress">In progress</option>
                <option value="Fixed">Fixed</option>
                <option value="Closed">Closed</option>
              </select>

              <select
                aria-label="Filter by priority"
                value={priorityFilter}
                onChange={(event) => setPriorityFilter(event.target.value)}
              >
                <option value="All">All priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>BUG ID</th>
                    <th>BUG REPORT</th>
                    <th>PRIORITY</th>
                    <th>STATUS</th>
                    <th>ASSIGNEE</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBugs.map((bug) => (
                    <tr key={bug.id}>
                      <td className="bug-id">{bug.id}</td>
                      <td>
                        <strong className="bug-title">{bug.title}</strong>
                        <span className="bug-project">{bug.project}</span>
                      </td>
                      <td>
                        <span className={`priority-badge ${bug.priority.toLowerCase()}`}>
                          {bug.priority}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`status-badge ${bug.status.toLowerCase().replace(' ', '-')}`}
                        >
                          {bug.status}
                        </span>
                      </td>
                      <td>
                        <div className="assignee">
                          <span className="assignee-avatar">
                            {bug.assignee.charAt(0)}
                          </span>
                          {bug.assignee}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredBugs.length === 0 && (
                    <tr>
                      <td colSpan="5" className="empty-state">
                        No bug reports match your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="table-footer">
              Showing {filteredBugs.length} of {bugs.length} sample reports
            </div>
          </section>

          <footer className="page-footer">
            DevTrack AI <span>·</span> Software defect management
            <span className="footer-right">Development preview</span>
          </footer>
        </section>
      </main>
    </div>
  )
}

export default App
