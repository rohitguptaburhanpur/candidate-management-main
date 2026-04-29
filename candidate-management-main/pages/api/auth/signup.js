import prisma from '../../../lib/prisma'
import { hashPassword, generateToken } from '../../../lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    })

    if (existingUser) {
      return res.status(409).json({ 
        error: existingUser.username === username 
          ? 'Username already exists' 
          : 'Email already exists' 
      })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create new user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword
      }
    })

    // Generate JWT token
    const token = generateToken(user.id)

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    })
  } catch (error) {
    console.error('Signup error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
