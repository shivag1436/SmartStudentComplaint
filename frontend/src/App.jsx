import { useEffect, useState } from 'react'
import './App.css'

const categories = [
  'Academic',
  'Faculty',
  'College Management',
  'Library Management',
  'Facilities',
  'Hostel',
  'Transport',
  'Examination',
  'Administrative',
]

const initialComplaints = [
  {
    id: 101,
    studentName: 'Amina Yusuf',
    title: 'Library seating issue',
    category: 'Facilities',
    priority: 'Medium',
    status: 'In Review',
    date: 'Jul 20',
    note: 'Study rooms are overcrowded during exam week.',
  },
  {
    id: 102,
    studentName: 'Daniel Cole',
    title: 'Grade review request',
    category: 'Academic',
    priority: 'High',
    status: 'Resolved',
    date: 'Jul 18',
    note: 'The lecturer has shared updated feedback for the final project.',
  },
  {
    id: 103,
    studentName: 'Sara Khan',
    title: 'Wi-Fi outage in hostel',
    category: 'Hostel',
    priority: 'High',
    status: 'Submitted',
    date: 'Jul 16',
    note: 'Students in Block B have had no network access since morning.',
  },
]

function App() {
  const [theme, setTheme] = useState('dark')
  const [complaints, setComplaints] = useState(initialComplaints)
  const [complaintForm, setComplaintForm] = useState({
    name: '',
    title: '',
    category: 'Academic',
    priority: 'Medium',
    description: '',
  })
  const [feedback, setFeedback] = useState('')
  const [statusQuery, setStatusQuery] = useState('')
  const [statusResult, setStatusResult] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('All')

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('student-complaints-theme')
    const savedComplaints = window.localStorage.getItem('student-complaints-list')

    if (savedTheme) setTheme(savedTheme)
    if (savedComplaints) setComplaints(JSON.parse(savedComplaints))
  }, [])

  useEffect(() => {
    window.localStorage.setItem('student-complaints-theme', theme)
  }, [theme])

  useEffect(() => {
    window.localStorage.setItem('student-complaints-list', JSON.stringify(complaints))
  }, [complaints])

  const stats = [
    { label: 'Total complaints', value: complaints.length, tone: 'primary' },
    {
      label: 'In progress',
      value: complaints.filter((item) => item.status !== 'Resolved').length,
      tone: 'accent',
    },
    {
      label: 'Resolved',
      value: complaints.filter((item) => item.status === 'Resolved').length,
      tone: 'success',
    },
    {
      label: 'Urgent',
      value: complaints.filter((item) => item.priority === 'High').length,
      tone: 'warning',
    },
  ]

  const filteredComplaints = complaints.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory
    return matchesCategory
  })

  const categorySummary = categories.map((category) => ({
    name: category,
    count: complaints.filter((item) => item.category === category).length,
  }))

  const handleComplaintChange = (event) => {
    const { name, value } = event.target
    setComplaintForm((current) => ({ ...current, [name]: value }))
  }

  const handleComplaintSubmit = (event) => {
    event.preventDefault()

    if (!complaintForm.name.trim() || !complaintForm.title.trim() || !complaintForm.description.trim()) {
      setFeedback('Please add your name, a title, and a clear description before submitting.')
      return
    }

    const newComplaint = {
      id: Date.now(),
      studentName: complaintForm.name.trim(),
      title: complaintForm.title.trim(),
      category: complaintForm.category,
      priority: complaintForm.priority,
      status: 'Submitted',
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      note: complaintForm.description.trim(),
    }

    setComplaints((current) => [newComplaint, ...current])
    setComplaintForm({ name: '', title: '', category: 'Academic', priority: 'Medium', description: '' })
    setFeedback('Complaint submitted successfully. You can check its status anytime.')
  }

  const checkStatus = (event) => {
    event.preventDefault()

    const id = Number(statusQuery)
    const complaint = complaints.find((item) => item.id === id)

    if (!complaint) {
      setStatusResult({ found: false, message: 'No complaint found for that ID. Please try another number.' })
      return
    }

    setStatusResult({
      found: true,
      complaint,
    })
  }

  return (
    <div className={`app-shell ${theme}`}>
      <nav className="top-nav">
        <div className="brand-block">
          <span className="brand-mark">SC</span>
          <div>
            <strong>Student Complaint Hub</strong>
            <p>Fast, secure, student-first support</p>
          </div>
        </div>
        <div className="nav-links">
          <a href="#about">Home</a>
          <a href="#details">Details</a>
          <a href="#contact">Contact Us</a>
          <a href="#sign-in" className="nav-btn">Sign in</a>
          <a href="#sign-up" className="nav-btn">Sign up</a>
        </div>
      </nav>

      <header className="hero-panel" id="about">
        <div className="hero-copy">
          <p className="eyebrow">Smart Student Complaint System</p>
          <h1>Dark, secure, and easy for students to track every concern.</h1>
          <p>
            Students can submit complaints, choose categories, and monitor updates from a clean student dashboard.
          </p>
        </div>
        <div className="hero-card">
          <h2>Student portal</h2>
          <p>Fast submissions, clear categories, and real-time status visibility.</p>
          <div className="hero-actions">
            <button type="button" className="ghost-btn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? '☀️ Light mode' : '🌙 Dark mode'}
            </button>
          </div>
        </div>
      </header>

      <section className="overview-section">
        <div className="overview-card">
          <p className="eyebrow">About this website</p>
          <h2>Smart Student Complaint System helps students report issues with confidence.</h2>
          <p>
            From faculty concerns and library problems to hostel and college management issues, students can
            submit complaints, track progress, and stay updated in one secure portal.
          </p>
        </div>
        <div className="overview-card accent-card">
          <p className="eyebrow">How it works</p>
          <ul>
            <li>Enter your name, choose a complaint category, and describe the issue</li>
            <li>Select the correct department for faster resolution</li>
            <li>Track complaint progress instantly using the complaint ID</li>
          </ul>
        </div>
      </section>

      <section className="stats-grid" aria-label="System summary">
        {stats.map((item) => (
          <article className={`stat-card ${item.tone}`} key={item.label}>
            <p>{item.label}</p>
            <strong>{item.value}</strong>
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <div className="panel info-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Quick start</p>
              <h3>Submit your complaint in seconds</h3>
            </div>
            <span className="pill">Open access</span>
          </div>
          <p className="panel-note">
            Students can submit complaints directly from this page. Provide your name, issue category, and a clear description to get started.
          </p>
          {feedback ? <p className={`feedback ${feedback.includes('success') ? 'success' : 'error'}`}>{feedback}</p> : null}
        </div>

        <div className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Complaint categories</p>
              <h3>Organized by issue type</h3>
            </div>
            <span className="pill">Stored neatly</span>
          </div>

          <div className="category-list">
            {categorySummary.map((item) => (
              <button
                type="button"
                key={item.name}
                className={`category-pill ${selectedCategory === item.name ? 'active' : ''}`}
                onClick={() => setSelectedCategory(item.name)}
              >
                <span>{item.name}</span>
                <strong>{item.count}</strong>
              </button>
            ))}
            <button
              type="button"
              className={`category-pill ${selectedCategory === 'All' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('All')}
            >
              <span>All</span>
              <strong>{complaints.length}</strong>
            </button>
          </div>
        </div>
      </section>

      <section className="dashboard-grid lower-grid">
        <div className="panel form-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">New complaint</p>
              <h3>Submit a concern</h3>
            </div>
            <span className="pill">Fast & secure</span>
          </div>

          <form className="complaint-form" onSubmit={handleComplaintSubmit}>
            <label>
              <span>Title</span>
              <input type="text" name="title" placeholder="Example: Hostel Wi-Fi issue" value={complaintForm.title} onChange={handleComplaintChange} />
            </label>

            <div className="inline-fields">
              <label>
                <span>Category</span>
                <select name="category" value={complaintForm.category} onChange={handleComplaintChange}>
                  {categories.map((item) => (
                    <option value={item} key={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Priority</span>
                <select name="priority" value={complaintForm.priority} onChange={handleComplaintChange}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </label>
            </div>

            <label>
            <span>Student name</span>
            <input type="text" name="name" placeholder="Your full name" value={complaintForm.name} onChange={handleComplaintChange} />
          </label>
          <label>
              <textarea name="description" rows="4" placeholder="Describe the issue clearly so the team can respond faster." value={complaintForm.description} onChange={handleComplaintChange} />
            </label>

            <button type="submit" className="primary-btn full-width">
              Submit complaint
            </button>
          </form>
        </div>

        <div className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Status tracker</p>
              <h3>Check complaint progress</h3>
            </div>
            <span className="pill">By complaint ID</span>
          </div>

          <form className="status-form" onSubmit={checkStatus}>
            <input type="number" placeholder="Enter complaint ID" value={statusQuery} onChange={(event) => setStatusQuery(event.target.value)} />
            <button type="submit" className="primary-btn">Check status</button>
          </form>

          {statusResult ? (
            statusResult.found ? (
              <div className="status-card">
                <div className="card-top">
                  <h4>{statusResult.complaint.title}</h4>
                  <span className={`status-badge ${statusResult.complaint.status.toLowerCase().replace(/\s+/g, '-')}`}>{statusResult.complaint.status}</span>
                </div>
                <p className="meta">{statusResult.complaint.category} • {statusResult.complaint.priority} priority</p>
                <p>{statusResult.complaint.note}</p>
                <p className="meta">Filed by {statusResult.complaint.studentName} on {statusResult.complaint.date}</p>
              </div>
            ) : (
              <p className="feedback error">{statusResult.message}</p>
            )
          ) : null}
        </div>
      </section>

      <section className="details-section" id="details">
        <div className="panel">
          <p className="eyebrow">Details</p>
          <h3>Why students use this platform</h3>
          <p>
            The portal brings academic, faculty, hostel, library, transport, and college-management concerns into one place for faster support.
          </p>
        </div>
        <div className="panel">
          <p className="eyebrow">Easy access</p>
          <h3>Submit and track complaints naturally.</h3>
          <p>
            The form is designed to be quick and intuitive, so students can report issues with minimal steps.
          </p>
        </div>
      </section>

      <section className="panel complaint-board" id="contact">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Student complaints</p>
            <h3>Recent submissions</h3>
          </div>
          <span className="pill">Live board</span>
        </div>

        <div className="complaint-list">
          {filteredComplaints.map((item) => (
            <article className="complaint-card" key={item.id}>
              <div className="card-top">
                <h4>{item.title}</h4>
                <span className={`status-badge ${item.status.toLowerCase().replace(/\s+/g, '-')}`}>{item.status}</span>
              </div>
              <p className="meta">{item.category} • {item.priority} priority • #{item.id}</p>
              <p>{item.note}</p>
              <p className="meta">Submitted by {item.studentName} • {item.date}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="feedback-section">
        <div className="feedback-card">
          <p className="eyebrow">Students say</p>
          <h3>“The complaint portal helped me resolve my hostel issue in just two days.”</h3>
          <p>— Priya Sharma, second year student</p>
        </div>
        <div className="feedback-card">
          <p className="eyebrow">Student resolution</p>
          <h3>“I found the status tracker very useful for checking my exam center request.”</h3>
          <p>— Ahmed Ali, third year student</p>
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-column">
          <h4>Get to Know Us</h4>
          <a href="#about">About the platform</a>
          <a href="#details">How it works</a>
          <a href="#contact">Contact support</a>
        </div>
        <div className="footer-column">
          <h4>Student Services</h4>
          <a href="#about">Submit complaint</a>
          <a href="#about">Track status</a>
          <a href="#about">Category guide</a>
        </div>
        <div className="footer-column">
          <h4>Contact Us</h4>
          <a href="mailto:support@studentcomplainthub.com">support@studentcomplainthub.com</a>
          <a href="tel:+15551234567">+1 (555) 123-4567</a>
          <span>Campus Help Desk • Mon-Fri 8AM-6PM</span>
        </div>
      </footer>
    </div>
  )
}

export default App
