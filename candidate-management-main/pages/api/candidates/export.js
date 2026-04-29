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

    const { format } = req.query

    if (!['csv', 'json', 'txt'].includes(format)) {
      return res.status(400).json({ error: 'Invalid format. Use csv, json, or txt' })
    }

    // Get shortlisted candidates (score > 70)
    const candidates = await prisma.candidate.findMany({
      where: {
        userId: userSession.userId,
        score: { gt: 70 }
      },
      orderBy: { score: 'desc' }
    })

    if (candidates.length === 0) {
      return res.status(404).json({ error: 'No shortlisted candidates found' })
    }

    let content = ''
    let contentType = 'text/plain'
    let filename = `shortlisted_candidates.${format}`

    if (format === 'csv') {
      contentType = 'text/csv'
      content = 'Name,Email,Primary Skill,Experience,Score,Created At\n'
      candidates.forEach(candidate => {
        content += `"${candidate.userName}","${candidate.email}","${candidate.primarySkill}","${candidate.experience}","${candidate.score}","${candidate.createdAt}"\n`
      })
    } else if (format === 'json') {
      contentType = 'application/json'
      content = JSON.stringify(candidates, null, 2)
    } else if (format === 'txt') {
      content = 'SHORTLISTED CANDIDATES (Score > 70)\n'
      content += '=' .repeat(50) + '\n\n'
      candidates.forEach((candidate, index) => {
        content += `${index + 1}. ${candidate.userName}\n`
        content += `   Email: ${candidate.email}\n`
        content += `   Primary Skill: ${candidate.primarySkill}\n`
        content += `   Experience: ${candidate.experience} years\n`
        content += `   Score: ${candidate.score}\n`
        content += `   Created: ${candidate.createdAt}\n`
        content += '-' .repeat(30) + '\n'
      })
    }

    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.status(200).send(content)
  } catch (error) {
    console.error('Export candidates error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
