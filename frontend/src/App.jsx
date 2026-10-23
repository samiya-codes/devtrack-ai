
import { useState, useEffect } from 'react'
import './App.css'

const workspaceRoles = [
  'Project Administrator',
  'Developer',
  'Tester',
]

function App() {
  const [bugs, setBugs] = useState([])
  const [activePage, setActivePage] = useState('Dashboard')
  const [selectedProject, setSelectedProject] = useState(null)
  const [displayName, setDisplayName] = useState(
    () => localStorage.getItem('devtrack.displayName') || 'Sam'
  )
  const [settingsName, setSettingsName] = useState(
    () => localStorage.getItem('devtrack.displayName') || 'Sam'
  )
  const [settingsRole, setSettingsRole] = useState(() => {
    const savedRole = localStorage.getItem('devtrack.workspaceRole')
    return workspaceRoles.includes(savedRole)
      ? savedRole
      : 'Project Administrator'
  })

useEffect(() => {
  fetch('http://localhost:8080/api/bugs')
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to load bugs')
      }
      return response.json()
    })
    .then((data) => setBugs(data))
    .catch((error) => console.error('Error loading bugs:', error))
}, [])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState({
  title: '',
  project: '',
  priority: 'Medium',
  assignee: '',
})



const handleSubmit = async (e) => {
  e.preventDefault()

  const newBug = {
    title: formData.title.trim(),
    project: formData.project.trim(),
    priority: formData.priority,
    assignee: formData.assignee.trim(),
  }

  try {
    const response = await fetch('http://localhost:8080/api/bugs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newBug),
    })

    if (!response.ok) {
      throw new Error('Failed to save bug')
    }

    const savedBug = await response.json()

    setBugs((previousBugs) => [savedBug, ...previousBugs])

    setFormData({
      title: '',
      project: '',
      priority: 'Medium',
      assignee: '',
    })

    setIsFormOpen(false)
  } catch (error) {
    console.error('Error saving bug:', error)
    alert('Could not save the bug. Please check that the backend is running.')
  }
}


  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')

  const filteredBugs = bugs.filter((bug) => {
    const normalizedSearch = search.trim().toLowerCase()
    const matchesSearch =
      String(bug.title ?? '').toLowerCase().includes(normalizedSearch) ||
      String(bug.id ?? '').toLowerCase().includes(normalizedSearch) ||
      String(bug.project ?? '').toLowerCase().includes(normalizedSearch) ||
      String(bug.assignee ?? '').trim().toLowerCase().includes(normalizedSearch)

    const matchesStatus =
      statusFilter === 'All' || bug.status === statusFilter

    const matchesPriority =
      priorityFilter === 'All' || bug.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  const displayedBugs = filteredBugs.filter((bug) => {
    const matchesAssignee =
      activePage !== 'My Assignments' ||
      bug.assignee?.toLowerCase() === displayName.trim().toLowerCase()
    const matchesProject =
      activePage !== 'Projects' || bug.project === selectedProject

    return matchesAssignee && matchesProject
  })

  const projects = [...new Set(bugs.map((bug) => bug.project).filter(Boolean))]
    .sort()
    .map((project) => {
      const projectBugs = bugs.filter((bug) => bug.project === project)

      return {
        name: project,
        total: projectBugs.length,
        open: projectBugs.filter((bug) => bug.status === 'Open').length,
        inProgress: projectBugs.filter((bug) => bug.status === 'In Progress').length,
        fixed: projectBugs.filter((bug) => bug.status === 'Fixed').length,
        closed: projectBugs.filter((bug) => bug.status === 'Closed').length,
      }
    })

  const statusSummary = ['Open', 'In Progress', 'Fixed', 'Closed'].map(
    (status) => ({
      label: status,
      count: bugs.filter((bug) => bug.status === status).length,
    })
  )

  const prioritySummary = ['High', 'Medium', 'Low'].map((priority) => ({
    label: priority,
    count: bugs.filter((bug) => bug.priority === priority).length,
  }))

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


  const updateBugStatus = async (bugId, newStatus) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/bugs/${bugId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to update bug status')
      }

      const updatedBug = await response.json()

      setBugs((previousBugs) =>
        previousBugs.map((bug) =>
          bug.id === updatedBug.id ? updatedBug : bug
        )
      )
    } catch (error) {
      console.error('Error updating bug status:', error)
      alert('Could not update status. Please check the backend.')
    }
  }

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
          <button
            className={`nav-item ${activePage === 'Dashboard' ? 'active' : ''}`}
            aria-current={activePage === 'Dashboard' ? 'page' : undefined}
            onClick={() => setActivePage('Dashboard')}
          >
            ▦ <span>Dashboard</span>
          </button>
          <button
            className={`nav-item ${activePage === 'All Bug Reports' ? 'active' : ''}`}
            aria-current={activePage === 'All Bug Reports' ? 'page' : undefined}
            onClick={() => setActivePage('All Bug Reports')}
          >
            ▤ <span>All Bug Reports</span>
          </button>
          <button
            className={`nav-item ${activePage === 'My Assignments' ? 'active' : ''}`}
            aria-current={activePage === 'My Assignments' ? 'page' : undefined}
            onClick={() => setActivePage('My Assignments')}
          >
            ◷ <span>My Assignments</span>
          </button>
        </nav>

        <p className="nav-label">MANAGEMENT</p>
        <nav className="navigation">
          <button
            className={`nav-item ${activePage === 'Projects' ? 'active' : ''}`}
            aria-current={activePage === 'Projects' ? 'page' : undefined}
            onClick={() => setActivePage('Projects')}
          >
            ◉ <span>Projects</span>
          </button>
          <button
            className={`nav-item ${activePage === 'Reports & Analytics' ? 'active' : ''}`}
            aria-current={activePage === 'Reports & Analytics' ? 'page' : undefined}
            onClick={() => setActivePage('Reports & Analytics')}
          >
            ▥ <span>Reports &amp; Analytics</span>
          </button>
          <button
            className={`nav-item ${activePage === 'Settings' ? 'active' : ''}`}
            aria-current={activePage === 'Settings' ? 'page' : undefined}
            onClick={() => setActivePage('Settings')}
          >
            ⚙ <span>Settings</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="avatar">S</div>
          <div>
            <strong>{displayName}</strong>
            <p>{settingsRole}</p>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> {activePage}</div>
          <div className="topbar-right">
            <span className="environment-label">● Development</span>
            <div className="avatar small">{displayName.charAt(0).toUpperCase()}</div>
          </div>
        </header>

        <section className="page-content">
          {activePage !== 'Dashboard' && (
            <div className="section-page-heading">
              <p className="eyebrow">WORKSPACE</p>
              <h1>{activePage}</h1>
              <p className="page-subtitle">
                {activePage === 'All Bug Reports' &&
                  'Search, filter, and manage every reported software defect.'}
                {activePage === 'My Assignments' &&
                  `Bug reports currently assigned to ${displayName}.`}
                {activePage === 'Projects' &&
                  'View project health and bug-fix progress across your workspace.'}
                {activePage === 'Reports & Analytics' &&
                  'Review bug trends by status and priority.'}
                {activePage === 'Settings' &&
                  'Manage your workspace profile and assignment preferences.'}
              </p>
            </div>
          )}

          {activePage === 'Dashboard' && (
            <>
          <div className="welcome-row">
            <div>
              <p className="eyebrow">OVERVIEW</p>
              <h1>Bug tracking dashboard</h1>
              <p className="page-subtitle">
                Monitor defects, track progress, and keep your projects healthy.
              </p>
            </div>
            <button className="primary-button" onClick={() => setIsFormOpen(true)}>
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
            </>
          )}

          {(activePage === 'Dashboard' ||
            activePage === 'All Bug Reports' ||
            activePage === 'My Assignments') && (
          <section className="bugs-panel">
            <div className="panel-heading">
              <div>
                <h2>
                  {activePage === 'Dashboard'
                    ? 'Recent bug reports'
                    : activePage === 'My Assignments'
                      ? 'My assignments'
                      : 'All bug reports'}
                </h2>
                <p>
                  {activePage === 'My Assignments'
                    ? `Reports assigned to ${displayName}.`
                    : 'Review and manage reported software defects.'}
                </p>
              </div>
              <span className="record-count">{displayedBugs.length} reports</span>
            </div>

            <div className="filters">
              <div className="search-box">
                <span>⌕</span>
                <input
                  aria-label="Search bug reports"
                  placeholder="Search by title, ID, project, or assignee..."
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
                  {displayedBugs.map((bug) => (
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
                        <select
  className={`status-badge ${bug.status.toLowerCase().replace(' ', '-')}`}
  value={bug.status}
  onChange={(e) => updateBugStatus(bug.id, e.target.value)}
>
  <option value="Open">Open</option>
  <option value="In Progress">In Progress</option>
  <option value="Fixed">Fixed</option>
  <option value="Closed">Closed</option>
</select>
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
                  {displayedBugs.length === 0 && (
                    <tr>
                      <td colSpan="5" className="empty-state">
                        {activePage === 'My Assignments'
                          ? 'No assigned bug reports match your filters.'
                          : 'No bug reports match your filters.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="table-footer">
              Showing {displayedBugs.length} of{' '}
              {activePage === 'My Assignments' ? bugs.filter(
                  (bug) =>
                    bug.assignee?.toLowerCase() ===
                    displayName.trim().toLowerCase()
                ).length : bugs.length}{' '}
              reports
            </div>
          </section>
          )}

          {activePage === 'Projects' &&
            (selectedProject ? (
              <section className="project-details">
                <button
                  className="project-back-button"
                  type="button"
                  onClick={() => setSelectedProject(null)}
                >
                  ← All projects
                </button>
                <section className="bugs-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>{selectedProject}</h2>
                      <p>Bugs reported for this project.</p>
                    </div>
                    <span className="record-count">
                      {displayedBugs.length} bugs
                    </span>
                  </div>

                  <div className="filters">
                    <div className="search-box">
                      <span>⌕</span>
                      <input
                        aria-label="Search project bugs"
                        placeholder="Search by title, ID, project, or assignee..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                      />
                    </div>
                    <select
                      aria-label="Filter project bugs by status"
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
                      aria-label="Filter project bugs by priority"
                      value={priorityFilter}
                      onChange={(event) =>
                        setPriorityFilter(event.target.value)
                      }
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
                        {displayedBugs.map((bug) => (
                          <tr key={bug.id}>
                            <td className="bug-id">{bug.id}</td>
                            <td><strong className="bug-title">{bug.title}</strong></td>
                            <td>
                              <span className={`priority-badge ${bug.priority.toLowerCase()}`}>
                                {bug.priority}
                              </span>
                            </td>
                            <td>
                              <select
                                className={`status-badge ${bug.status.toLowerCase().replace(' ', '-')}`}
                                value={bug.status}
                                onChange={(event) =>
                                  updateBugStatus(bug.id, event.target.value)
                                }
                              >
                                <option value="Open">Open</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Fixed">Fixed</option>
                                <option value="Closed">Closed</option>
                              </select>
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
                        {displayedBugs.length === 0 && (
                          <tr>
                            <td colSpan="5" className="empty-state">
                              No bugs in this project match your filters.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="table-footer">
                    Showing {displayedBugs.length} of{' '}
                    {bugs.filter((bug) => bug.project === selectedProject).length}{' '}
                    project bugs
                  </div>
                </section>
              </section>
            ) : (
              <section className="projects-grid" aria-label="Projects">
                {projects.map((project) => (
                  <button
                    className="project-card"
                    key={project.name}
                    type="button"
                    onClick={() => {
                      setSelectedProject(project.name)
                      setSearch('')
                      setStatusFilter('All')
                      setPriorityFilter('All')
                    }}
                  >
                    <div className="project-card-heading">
                      <span className="project-icon">◉</span>
                      <span className="record-count">{project.total} bugs</span>
                    </div>
                    <h2>{project.name}</h2>
                    <p>Bug reports tracked in this project.</p>
                    <div className="project-status-summary">
                      <span><strong>{project.open}</strong> Open</span>
                      <span><strong>{project.inProgress}</strong> In progress</span>
                      <span><strong>{project.fixed}</strong> Fixed</span>
                      <span><strong>{project.closed}</strong> Closed</span>
                    </div>
                  </button>
                ))}
                {projects.length === 0 && (
                  <div className="empty-state projects-empty">
                    No projects yet. Projects appear here when bug reports are added.
                  </div>
                )}
              </section>
            ))}

          {activePage === 'Reports & Analytics' && (
            <section className="analytics-grid" aria-label="Bug report analytics">
              <article className="analytics-card">
                <div className="panel-heading">
                  <div>
                    <h2>Reports by status</h2>
                    <p>Current status distribution across all reports.</p>
                  </div>
                  <span className="record-count">{bugs.length} total</span>
                </div>
                <div className="analytics-breakdown">
                  {statusSummary.map((item) => (
                    <div className="analytics-row" key={item.label}>
                      <span>{item.label}</span>
                      <div className="analytics-bar-track">
                        <span
                          className="analytics-bar status-bar"
                          style={{
                            width: `${bugs.length ? (item.count / bugs.length) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <strong>{item.count}</strong>
                    </div>
                  ))}
                </div>
              </article>
              <article className="analytics-card">
                <div className="panel-heading">
                  <div>
                    <h2>Reports by priority</h2>
                    <p>Priority distribution across all reports.</p>
                  </div>
                  <span className="record-count">{bugs.length} total</span>
                </div>
                <div className="analytics-breakdown">
                  {prioritySummary.map((item) => (
                    <div className="analytics-row" key={item.label}>
                      <span>{item.label}</span>
                      <div className="analytics-bar-track">
                        <span
                          className={`analytics-bar priority-bar ${item.label.toLowerCase()}`}
                          style={{
                            width: `${bugs.length ? (item.count / bugs.length) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <strong>{item.count}</strong>
                    </div>
                  ))}
                </div>
              </article>
            </section>
          )}

          {activePage === 'Settings' && (
            <section className="settings-panel">
              <div className="panel-heading">
                <div>
                  <h2>Profile settings</h2>
                  <p>Update the name used for your workspace profile and assignments.</p>
                </div>
              </div>
              <form
                className="settings-form"
                onSubmit={(event) => {
                  event.preventDefault()
                  const nextDisplayName = settingsName.trim()
                  if (nextDisplayName && workspaceRoles.includes(settingsRole)) {
                    localStorage.setItem('devtrack.displayName', nextDisplayName)
                    localStorage.setItem('devtrack.workspaceRole', settingsRole)
                    setSettingsName(nextDisplayName)
                    setDisplayName(nextDisplayName)
                  }
                }}
              >
                <label>
                  Display name
                  <input
                    type="text"
                    value={settingsName}
                    onChange={(event) => setSettingsName(event.target.value)}
                    required
                  />
                </label>
                <label>
                  Workspace role
                  <select
                    value={settingsRole}
                    onChange={(event) => setSettingsRole(event.target.value)}
                  >
                    {workspaceRoles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </label>
                <p className="settings-note">
                  This role is a display preference and does not control access
                  or permissions.
                </p>
                <div className="settings-actions">
                  <button className="primary-button" type="submit">
                    Save changes
                  </button>
                </div>
              </form>
            </section>
          )}

          <footer className="page-footer">
            DevTrack AI <span>·</span> Software defect management
            <span className="footer-right">Development preview</span>
          </footer>
</section>
</main>

{isFormOpen && (
  <div className="modal-overlay">
    <div className="bug-form">
      
<h2>Report a bug</h2>
<p>Tell us about the software defect.</p>

<form className="bug-report-form" onSubmit={handleSubmit}>
  <label>
    Bug title
    <input
      type="text"
      placeholder="e.g. Login button not working"
      value={formData.title}
      onChange={(e) =>
        setFormData({ ...formData, title: e.target.value })
      }
      required
    />
  </label>

  <label>
    Project
    <input
      type="text"
      placeholder="e.g. Authentication"
      value={formData.project}
      onChange={(e) =>
        setFormData({ ...formData, project: e.target.value })
      }
      required
    />
  </label>

  <label>
    Priority
    <select
      value={formData.priority}
      onChange={(e) =>
        setFormData({ ...formData, priority: e.target.value })
      }
    >
      <option value="Low">Low</option>
      <option value="Medium">Medium</option>
      <option value="High">High</option>
    </select>
  </label>

  <label>
    Assignee
    <input
      type="text"
      placeholder="Who will fix this bug?"
      value={formData.assignee}
      onChange={(e) =>
        setFormData({ ...formData, assignee: e.target.value })
      }
      required
    />
  </label>

  <div className="form-actions">
    <button
      type="button"
      onClick={() => setIsFormOpen(false)}
    >
      Cancel
    </button>

    <button type="submit" className="primary-button">
      Submit Bug
    </button>
  </div>
</form>

    </div>
  </div>
)}

</div>
)
}

export default App
