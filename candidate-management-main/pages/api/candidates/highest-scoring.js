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

    // Get the highest scoring candidate for the user
    const candidate = await prisma.candidate.findFirst({
      where: { userId: userSession.userId },
      orderBy: { score: 'desc' }
    })

    res.status(200).json({ candidate })
  } catch (error) {
    console.error('Highest scoring candidate error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
