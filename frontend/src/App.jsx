import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
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

const normalizeComplaint = (item) => ({
  id: Number(item.id ?? Date.now()),
  studentName: item.student_name || item.studentName || 'Student',
  title: item.title || 'Untitled complaint',
  category: item.category || 'Academic',
  priority: item.priority || 'Medium',
  status: item.status || 'Submitted',
  date: item.created_at
    ? new Date(item.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : item.date || 'Just now',
  note: item.description || item.note || '',
})

const fetchComplaints = async () => {
  try {
    const { data, error } = await supabase.from('complaints').select('*').order('id', { ascending: false })

    if (error) {
      console.warn('Supabase complaint fetch failed, using fallback data:', error.message)
      return initialComplaints
    }

    return (data ?? []).map(normalizeComplaint)
  } catch (error) {
    console.warn('Unexpected complaint fetch error, using fallback data:', error)
    return initialComplaints
  }
}

function App() {
  const [theme, setTheme] = useState('dark')
  const [complaints, setComplaints] = useState(initialComplaints)
  const [session, setSession] = useState(null)
  const [authModal, setAuthModal] = useState(null)
  const [signInForm, setSignInForm] = useState({ email: '', password: '' })
  const [signUpForm, setSignUpForm] = useState({
    firstName: '',
    lastName: '',
    mobileNumber: '',
    email: '',
    password: '',
  })
  const [authMessage, setAuthMessage] = useState('')
  const [authBanner, setAuthBanner] = useState(() => {
    const savedBanner = window.localStorage.getItem('student-auth-banner')
    return savedBanner ? JSON.parse(savedBanner) : null
  })

  const scrollToSection = (event, targetId) => {
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault()
    }

    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
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
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All')

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('student-complaints-theme')
    const savedComplaints = window.localStorage.getItem('student-complaints-list')

    if (savedTheme) setTheme(savedTheme)
    if (savedComplaints) setComplaints(JSON.parse(savedComplaints))

    const loadSession = async () => {
      const {
        data: { session: activeSession },
      } = await supabase.auth.getSession()
      setSession(activeSession)

      if (activeSession?.user?.user_metadata?.first_name) {
        const userName = `${activeSession.user.user_metadata.first_name || ''} ${activeSession.user.user_metadata.last_name || ''}`.trim()
        if (userName) {
          setComplaintForm((current) => ({ ...current, name: userName }))
        }
      }
    }

    loadSession()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession)

      if (currentSession?.user?.user_metadata?.first_name) {
        const userName = `${currentSession.user.user_metadata.first_name || ''} ${currentSession.user.user_metadata.last_name || ''}`.trim()
        if (userName) {
          setComplaintForm((current) => ({ ...current, name: userName }))
        }
      }
    })

    return () => {
      authListener?.subscription?.unsubscribe?.()
    }
  }, [])

  useEffect(() => {
    const loadComplaints = async () => {
      const data = await fetchComplaints()
      setComplaints(data)
    }

    loadComplaints()
  }, [])

  useEffect(() => {
    window.localStorage.setItem('student-complaints-theme', theme)
  }, [theme])

  useEffect(() => {
    window.localStorage.setItem('student-complaints-list', JSON.stringify(complaints))
  }, [complaints])

  useEffect(() => {
    if (authBanner) {
      window.localStorage.setItem('student-auth-banner', JSON.stringify(authBanner))
    } else {
      window.localStorage.removeItem('student-auth-banner')
    }
  }, [authBanner])

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

    const matchesStatus =
      selectedStatusFilter === 'All' ||
      (selectedStatusFilter === 'InProgress' && item.status !== 'Resolved') ||
      (selectedStatusFilter === 'Resolved' && item.status === 'Resolved') ||
      (selectedStatusFilter === 'Urgent' && item.priority === 'High')

    return matchesCategory && matchesStatus
  })

  const categorySummary = categories.map((category) => ({
    name: category,
    count: complaints.filter((item) => item.category === category).length,
  }))

  const handleStatusStatClick = (label) => {
    if (label === 'Total complaints') {
      setSelectedStatusFilter('All')
    } else if (label === 'In progress') {
      setSelectedStatusFilter('InProgress')
    } else if (label === 'Resolved') {
      setSelectedStatusFilter('Resolved')
    } else if (label === 'Urgent') {
      setSelectedStatusFilter('Urgent')
    }

    scrollToSection(null, 'complaint-board')
  }

  const handleComplaintChange = (event) => {
    const { name, value } = event.target
    setComplaintForm((current) => ({ ...current, [name]: value }))
  }

  const handleSignInChange = (event) => {
    const { name, value } = event.target
    setSignInForm((current) => ({ ...current, [name]: value }))
  }

  const handleSignUpChange = (event) => {
    const { name, value } = event.target
    setSignUpForm((current) => ({ ...current, [name]: value }))
  }

  const handleSignInSubmit = async (event) => {
    event.preventDefault()

    if (!signInForm.email.trim() || !signInForm.password.trim()) {
      setAuthMessage('Please enter your Gmail and password to continue.')
      return
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: signInForm.email.trim(),
      password: signInForm.password,
    })

    if (error) {
      setAuthMessage(error.message)
      return
    }

    setAuthMessage('')
    const userName = `${data?.user?.user_metadata?.first_name || ''} ${data?.user?.user_metadata?.last_name || ''}`.trim()

    setAuthBanner({
      type: 'success',
      title: 'Sign-in successful',
      detail: userName ? `Welcome back, ${userName}!` : 'Welcome back! Your sign-in details were captured.',
    })
    setAuthModal(null)
    setSignInForm({ email: '', password: '' })
  }

  const handleSignUpSubmit = async (event) => {
    event.preventDefault()

    const missingFields = Object.values(signUpForm).some((value) => !String(value).trim())

    if (missingFields) {
      setAuthMessage('Please fill in all sign-up details before continuing.')
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email: signUpForm.email.trim(),
      password: signUpForm.password,
      options: {
        data: {
          first_name: signUpForm.firstName.trim(),
          last_name: signUpForm.lastName.trim(),
          mobile_number: signUpForm.mobileNumber.trim(),
        },
      },
    })

    if (error) {
      setAuthMessage(error.message)
      return
    }

    setAuthMessage('')
    setAuthBanner({
      type: 'success',
      title: 'Sign-up successful',
      detail: data?.user ? 'Your account was created in Supabase successfully.' : 'Your account details were captured successfully.',
    })
    setAuthModal(null)
    setSignUpForm({
      firstName: '',
      lastName: '',
      mobileNumber: '',
      email: '',
      password: '',
    })
  }

  const handleComplaintSubmit = async (event) => {
    event.preventDefault()

    if (!complaintForm.name.trim() || !complaintForm.title.trim() || !complaintForm.description.trim()) {
      setFeedback('Please add your name, a title, and a clear description before submitting.')
      return
    }

    const payload = {
      student_name: complaintForm.name.trim(),
      title: complaintForm.title.trim(),
      category: complaintForm.category,
      priority: complaintForm.priority,
      description: complaintForm.description.trim(),
      status: 'Submitted',
    }

    try {
      const { data, error } = await supabase.from('complaints').insert([payload]).select().single()

      if (error) {
        throw error
      }

      const newComplaint = normalizeComplaint(data)
      setComplaints((current) => [newComplaint, ...current])
      setComplaintForm({ name: '', title: '', category: 'Academic', priority: 'Medium', description: '' })
      setFeedback('Complaint submitted successfully and saved in Supabase.')
      return
    } catch (error) {
      console.warn('Supabase insert failed, using local fallback:', error)
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
    setFeedback('Complaint submitted locally. Create the complaints table in Supabase to enable live storage.')
  }

  const checkStatus = async (event) => {
    event.preventDefault()

    const id = Number(statusQuery)

    if (!Number.isInteger(id) || id <= 0) {
      setStatusResult({ found: false, message: 'Please enter a valid complaint ID.' })
      return
    }

    try {
      const { data, error } = await supabase.from('complaints').select('*').eq('id', id).maybeSingle()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (!data) {
        const fallbackComplaint = complaints.find((item) => item.id === id)
        if (!fallbackComplaint) {
          setStatusResult({ found: false, message: 'No complaint found for that ID. Please try another number.' })
          return
        }

        setStatusResult({ found: true, complaint: fallbackComplaint })
        return
      }

      setStatusResult({ found: true, complaint: normalizeComplaint(data) })
    } catch (error) {
      console.warn('Supabase status lookup failed, using local fallback:', error)
      const fallbackComplaint = complaints.find((item) => item.id === id)

      if (!fallbackComplaint) {
        setStatusResult({ found: false, message: 'No complaint found for that ID. Please try another number.' })
        return
      }

      setStatusResult({ found: true, complaint: fallbackComplaint })
    }
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
          <a href="#about" onClick={(event) => scrollToSection(event, 'about')}>Home</a>
          <a href="#details" onClick={(event) => scrollToSection(event, 'details')}>Details</a>
          <a href="#contact" onClick={(event) => scrollToSection(event, 'contact')}>Contact Us</a>
          <button type="button" className="nav-btn" onClick={() => setAuthModal('sign-in')}>Sign in</button>
          <button type="button" className="nav-btn" onClick={() => setAuthModal('sign-up')}>Sign up</button>
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
          <button
            type="button"
            className={`stat-card ${item.tone}`}
            key={item.label}
            aria-label={`Show ${item.label.toLowerCase()} complaints`}
            onClick={() => handleStatusStatClick(item.label)}
          >
            <p>{item.label}</p>
            <strong>{item.value}</strong>
          </button>
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
                onClick={() => {
                  setSelectedCategory(item.name)
                  scrollToSection(null, 'complaint-board')
                }}
              >
                <span>{item.name}</span>
                <strong>{item.count}</strong>
              </button>
            ))}
            <button
              type="button"
              className={`category-pill ${selectedCategory === 'All' ? 'active' : ''}`}
              onClick={() => {
                setSelectedCategory('All')
                scrollToSection(null, 'complaint-board')
              }}
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

      <section className="panel complaint-board" id="complaint-board">
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

      <div className="back-to-top-wrap">
        <button type="button" className="back-to-top-btn" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          ↑ Back to top
        </button>
      </div>

      {authBanner ? (
        <div className="auth-success-banner">
          <div>
            <span className="banner-icon">✓</span>
            <div>
              <strong>{authBanner.title}</strong>
              <span>{authBanner.detail}</span>
            </div>
          </div>
          <button type="button" className="banner-close" aria-label="Dismiss success message" onClick={() => {
            setAuthBanner(null)
            window.localStorage.removeItem('student-auth-banner')
          }}>
            ×
          </button>
        </div>
      ) : null}

      {authMessage ? <div className="auth-status-message">{authMessage}</div> : null}

      {authModal ? (
        <div className="auth-modal-overlay">
          <div className="auth-modal">
            <div className="auth-modal-header">
              <div>
                <p className="eyebrow">Student Access</p>
                <h3>{authModal === 'sign-in' ? 'Sign In' : 'Create Account'}</h3>
              </div>
              <button type="button" className="icon-close" aria-label="Close authentication form" onClick={() => setAuthModal(null)}>
                ×
              </button>
            </div>

            {authModal === 'sign-in' ? (
              <form className="auth-form" onSubmit={handleSignInSubmit}>
                <label>
                  <span>Gmail</span>
                  <input type="email" name="email" placeholder="student@gmail.com" value={signInForm.email} onChange={handleSignInChange} />
                </label>
                <label>
                  <span>Password</span>
                  <input type="password" name="password" placeholder="Enter password" value={signInForm.password} onChange={handleSignInChange} />
                </label>
                <button type="submit" className="primary-btn full-width">Sign In</button>
              </form>
            ) : (
              <form className="auth-form" onSubmit={handleSignUpSubmit}>
                <div className="inline-fields auth-inline">
                  <label>
                    <span>First Name</span>
                    <input type="text" name="firstName" placeholder="First name" value={signUpForm.firstName} onChange={handleSignUpChange} />
                  </label>
                  <label>
                    <span>Last Name</span>
                    <input type="text" name="lastName" placeholder="Last name" value={signUpForm.lastName} onChange={handleSignUpChange} />
                  </label>
                </div>

                <label>
                  <span>Mobile Number</span>
                  <input type="tel" name="mobileNumber" placeholder="Enter mobile number" value={signUpForm.mobileNumber} onChange={handleSignUpChange} />
                </label>

                <label>
                  <span>Email ID</span>
                  <input type="email" name="email" placeholder="student@gmail.com" value={signUpForm.email} onChange={handleSignUpChange} />
                </label>

                <label>
                  <span>Password</span>
                  <input type="password" name="password" placeholder="Create password" value={signUpForm.password} onChange={handleSignUpChange} />
                </label>

                <button type="submit" className="primary-btn full-width">Sign Up</button>
              </form>
            )}
          </div>
        </div>
      ) : null}

      <footer className="site-footer" id="contact">
        <div className="footer-column">
          <h4>Get to Know Us</h4>
          <a href="#about" onClick={(event) => scrollToSection(event, 'about')}>About the platform</a>
          <a href="#details" onClick={(event) => scrollToSection(event, 'details')}>How it works</a>
          <a href="#contact" onClick={(event) => scrollToSection(event, 'contact')}>Contact support</a>
        </div>
        <div className="footer-column">
          <h4>Student Services</h4>
          <a href="#complaint-board" onClick={(event) => scrollToSection(event, 'complaint-board')}>Submit complaint</a>
          <a href="#complaint-board" onClick={(event) => scrollToSection(event, 'complaint-board')}>Track status</a>
          <a href="#complaint-board" onClick={(event) => scrollToSection(event, 'complaint-board')}>Category guide</a>
        </div>
        <div className="footer-column" id="footer-contact-us">
          <h4>Contact Us</h4>
          <a href="mailto:gandhamprakashtech@gmail.com">gandhamprakashtech@gmail.com</a>
          <a href="mailto:shivag1436@gmail.com">shivag1436@gmail.com</a>
          <span>Campus Help Desk • Mon-Fri 8AM-6PM</span>
        </div>
      </footer>
    </div>
  )
}

export default App
