import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import styles from '../styles/Dashboard.module.css'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [searchSkill, setSearchSkill] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [highestScoringCandidate, setHighestScoringCandidate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  const [newCandidate, setNewCandidate] = useState({
    userName: '',
    email: '',
    primarySkill: '',
    experience: '',
    score: ''
  })

  useEffect(() => {
    checkAuth()
    fetchCandidates()
    fetchHighestScoringCandidate()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
      } else {
        router.push('/login')
      }
    } catch (err) {
      router.push('/login')
    }
  }

  const fetchCandidates = async () => {
    try {
      const response = await fetch('/api/candidates')
      if (response.ok) {
        const data = await response.json()
        setCandidates(data.candidates)
      }
    } catch (err) {
      setError('Failed to fetch candidates')
    } finally {
      setLoading(false)
    }
  }

  const fetchHighestScoringCandidate = async () => {
    try {
      const response = await fetch('/api/candidates/highest-scoring')
      if (response.ok) {
        const data = await response.json()
        setHighestScoringCandidate(data.candidate)
      }
    } catch (err) {
      console.error('Failed to fetch highest scoring candidate')
    }
  }

  const handleAddCandidate = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const response = await fetch('/api/candidates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newCandidate)
      })

      const data = await response.json()

      if (response.ok) {
        setNewCandidate({
          userName: '',
          email: '',
          primarySkill: '',
          experience: '',
          score: ''
        })
        setShowAddForm(false)
        fetchCandidates()
        fetchHighestScoringCandidate()
      } else {
        setError(data.error || 'Failed to add candidate')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    }
  }

  const handleSearchBySkill = async () => {
    if (!searchSkill.trim()) {
      fetchCandidates()
      return
    }

    try {
      const response = await fetch(`/api/candidates/search?skill=${encodeURIComponent(searchSkill)}`)
      if (response.ok) {
        const data = await response.json()
        setCandidates(data.candidates)
      }
    } catch (err) {
      setError('Failed to search candidates')
    }
  }

  const handleExport = async (format) => {
    try {
      const response = await fetch(`/api/candidates/export?format=${format}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `shortlisted_candidates.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (err) {
      setError(`Failed to export as ${format}`)
    }
  }

  const handleLogout = () => {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    router.push('/login')
  }

  const shortlistedCandidates = candidates.filter(candidate => candidate.score > 70)

  if (loading) {
    return <div className={styles.loading}>Loading...</div>
  }

  return (
    <>
      <Head>
        <title>Dashboard - Candidate Management</title>
        <meta name="description" content="Manage your candidates" />
      </Head>
      
      <div className={styles.dashboardContainer}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h1>Candidate Management System</h1>
            <div className={styles.userSection}>
              <span>Welcome, {user?.username}</span>
              <button onClick={handleLogout} className={styles.logoutButton}>
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className={styles.mainContent}>
          {error && <div className={styles.errorMessage}>{error}</div>}

          {/* Statistics Cards */}
          <div className={styles.statsContainer}>
            <div className={styles.statCard}>
              <h3>Total Candidates</h3>
              <p className={styles.statNumber}>{candidates.length}</p>
            </div>
            <div className={styles.statCard}>
              <h3>Shortlisted (Score &gt; 70)</h3>
              <p className={styles.statNumber}>{shortlistedCandidates.length}</p>
            </div>
            <div className={styles.statCard}>
              <h3>Highest Score</h3>
              <p className={styles.statNumber}>{highestScoringCandidate?.score || 0}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={styles.actionButtons}>
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className={styles.primaryButton}
            >
              {showAddForm ? 'Cancel' : 'Add Candidate'}
            </button>
            
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search by skill..."
                value={searchSkill}
                onChange={(e) => setSearchSkill(e.target.value)}
                className={styles.searchInput}
              />
              <button onClick={handleSearchBySkill} className={styles.searchButton}>
                Search
              </button>
            </div>

            <div className={styles.exportButtons}>
              <button onClick={() => handleExport('csv')} className={styles.exportButton}>
                Export CSV
              </button>
              <button onClick={() => handleExport('json')} className={styles.exportButton}>
                Export JSON
              </button>
              <button onClick={() => handleExport('txt')} className={styles.exportButton}>
                Export Text
              </button>
            </div>
          </div>

          {/* Add Candidate Form */}
          {showAddForm && (
            <div className={styles.formContainer}>
              <h2>Add New Candidate</h2>
              <form onSubmit={handleAddCandidate} className={styles.candidateForm}>
                <div className={styles.formRow}>
                  <input
                    type="text"
                    placeholder="Name"
                    value={newCandidate.userName}
                    onChange={(e) => setNewCandidate({...newCandidate, userName: e.target.value})}
                    required
                    className={styles.formInput}
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={newCandidate.email}
                    onChange={(e) => setNewCandidate({...newCandidate, email: e.target.value})}
                    required
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formRow}>
                  <input
                    type="text"
                    placeholder="Primary Skill"
                    value={newCandidate.primarySkill}
                    onChange={(e) => setNewCandidate({...newCandidate, primarySkill: e.target.value})}
                    required
                    className={styles.formInput}
                  />
                  <input
                    type="number"
                    placeholder="Experience (years)"
                    value={newCandidate.experience}
                    onChange={(e) => setNewCandidate({...newCandidate, experience: e.target.value})}
                    required
                    step="0.1"
                    min="0"
                    className={styles.formInput}
                  />
                  <input
                    type="number"
                    placeholder="Score (0-100)"
                    value={newCandidate.score}
                    onChange={(e) => setNewCandidate({...newCandidate, score: e.target.value})}
                    required
                    min="0"
                    max="100"
                    className={styles.formInput}
                  />
                </div>
                <button type="submit" className={styles.submitButton}>
                  Add Candidate
                </button>
              </form>
            </div>
          )}

          {/* Highest Scoring Candidate */}
          {highestScoringCandidate && (
            <div className={styles.highestScoringCard}>
              <h2>🏆 Highest Scoring Candidate</h2>
              <div className={styles.candidateInfo}>
                <p><strong>Name:</strong> {highestScoringCandidate.userName}</p>
                <p><strong>Email:</strong> {highestScoringCandidate.email}</p>
                <p><strong>Skill:</strong> {highestScoringCandidate.primarySkill}</p>
                <p><strong>Experience:</strong> {highestScoringCandidate.experience} years</p>
                <p><strong>Score:</strong> <span className={styles.scoreHighlight}>{highestScoringCandidate.score}</span></p>
              </div>
            </div>
          )}

          {/* Candidates Table */}
          <div className={styles.tableContainer}>
            <h2>All Candidates</h2>
            <table className={styles.candidatesTable}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Primary Skill</th>
                  <th>Experience</th>
                  <th>Score</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((candidate) => (
                  <tr key={candidate.id}>
                    <td>{candidate.userName}</td>
                    <td>{candidate.email}</td>
                    <td>{candidate.primarySkill}</td>
                    <td>{candidate.experience} years</td>
                    <td>
                      <span className={`${styles.score} ${candidate.score > 70 ? styles.highScore : styles.normalScore}`}>
                        {candidate.score}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.status} ${candidate.score > 70 ? styles.shortlisted : styles.notShortlisted}`}>
                        {candidate.score > 70 ? 'Shortlisted' : 'Not Shortlisted'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {candidates.length === 0 && (
              <p className={styles.noCandidates}>No candidates found. Add your first candidate!</p>
            )}
          </div>
        </main>
      </div>
    </>
  )
}
