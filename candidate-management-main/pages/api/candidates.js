import prisma from '../../lib/prisma'
import { getSessionUser } from '../../lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const userSession = getSessionUser(req)

    if (!userSession) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (req.method === 'GET') {
      // Get all candidates for the authenticated user
      const candidates = await prisma.candidate.findMany({
        where: { userId: userSession.userId },
        orderBy: { createdAt: 'desc' }
      })

      res.status(200).json({ candidates })
    } else if (req.method === 'POST') {
      // Add a new candidate
      const { userName, email, primarySkill, experience, score } = req.body

      if (!userName || !email || !primarySkill || experience === undefined || score === undefined) {
        return res.status(400).json({ error: 'All fields are required' })
      }

      // Validate score range
      if (score < 0 || score > 100) {
        return res.status(400).json({ error: 'Score must be between 0 and 100' })
      }

      // Validate experience
      if (experience < 0) {
        return res.status(400).json({ error: 'Experience cannot be negative' })
      }

      const candidate = await prisma.candidate.create({
        data: {
          userName,
          email,
          primarySkill,
          experience: parseFloat(experience),
          score: parseInt(score),
          userId: userSession.userId
        }
      })

      res.status(201).json({ 
        message: 'Candidate added successfully',
        candidate 
      })
    }
  } catch (error) {
    console.error('Candidates API error:', error)
    
    // Handle unique constraint violation for email
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'A candidate with this email already exists' })
    }
    
    res.status(500).json({ error: 'Internal server error' })
  }
}
