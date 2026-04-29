import prisma from '../../../lib/prisma'
import { getSessionUser } from '../../../lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const userSession = getSessionUser(req)

    if (!userSession) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { skill } = req.query

    if (!skill) {
      return res.status(400).json({ error: 'Skill parameter is required' })
    }

    // Search candidates by primary skill (case-insensitive)
    const candidates = await prisma.candidate.findMany({
      where: {
        userId: userSession.userId,
        primarySkill: {
          contains: skill,
          mode: 'insensitive'
        }
      },
      orderBy: { score: 'desc' }
    })

    res.status(200).json({ candidates })
  } catch (error) {
    console.error('Search candidates error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
