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

    const user = await prisma.user.findUnique({
      where: { id: userSession.userId },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true
      }
    })

    if (!user) {
      return res.status(401).json({ error: 'User not found' })
    }

    res.status(200).json({ user })
  } catch (error) {
    console.error('Auth me error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
