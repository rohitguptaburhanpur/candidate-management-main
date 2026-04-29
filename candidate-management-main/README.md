# Candidate Management System

A comprehensive candidate management application built with Next.js, Prisma, and SQL Server. Features include user authentication, candidate CRUD operations, search functionality, and export capabilities.

## Features

### Authentication
- User registration and login
- JWT-based authentication
- Secure password hashing with bcrypt

### Candidate Management
- **Add Candidate Record**: Add new candidates with name, email, primary skill, experience, and score
- **View All Candidates**: Display all candidates in a sortable table
- **Search by Skill**: Filter candidates by their primary skill
- **Show Highest Scoring Candidate**: Display the candidate with the highest score
- **Export Shortlisted Candidates**: Export candidates with scores > 70 to CSV, JSON, or Text format

### Technical Features
- Modern, responsive UI with Tailwind CSS
- Error handling and validation
- Clean, maintainable code structure
- RESTful API endpoints
- Database integration with Prisma ORM

## Database Schema

### User Model
- `id` (Primary Key)
- `username` (Unique)
- `password` (Hashed)
- `email` (Unique)
- `createdAt`, `updatedAt`

### Candidate Model
- `id` (Primary Key)
- `userName`
- `email`
- `primarySkill`
- `experience` (Years)
- `score` (0-100)
- `createdAt`, `updatedAt`
- `userId` (Foreign Key to User)

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Configuration
Create a `.env` file in the root directory with your SQL Server connection string:

```env
DATABASE_URL="sqlserver://username:password@localhost:1433/database_name"
JWT_SECRET="your-secret-key-change-in-production"
```

### 3. Generate Prisma Client
```bash
npx prisma generate
```

### 4. Create Database Tables
```bash
npx prisma db push
```

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/auth/me` - Get current user info

### Candidates
- `GET /api/candidates` - Get all candidates for authenticated user
- `POST /api/candidates` - Add new candidate
- `GET /api/candidates/search?skill=<skill>` - Search candidates by skill
- `GET /api/candidates/highest-scoring` - Get highest scoring candidate
- `GET /api/candidates/export?format=<csv|json|txt>` - Export shortlisted candidates

## Usage

1. **Sign Up**: Create a new account with username, email, and password
2. **Login**: Access your dashboard with your credentials
3. **Add Candidates**: Click "Add Candidate" to add new candidate records
4. **Search**: Use the search bar to filter candidates by skill
5. **View Statistics**: See total candidates, shortlisted count, and highest score
6. **Export Data**: Download shortlisted candidates (score > 70) in your preferred format

## Project Structure

```
candidate-management/
├── pages/
│   ├── api/
│   │   ├── auth/
│   │   └── candidates/
│   ├── login.js
│   ├── signup.js
│   ├── dashboard.js
│   └── index.js
├── lib/
│   ├── prisma.js
│   └── auth.js
├── styles/
│   ├── Auth.module.css
│   └── Dashboard.module.css
├── prisma/
│   ├── schema.prisma
│   └── prisma.config.ts
└── public/
```

## Technology Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQL Server with Prisma ORM
- **Authentication**: JWT tokens
- **Security**: bcryptjs for password hashing

## Development

### Prisma Commands
```bash
npx prisma generate    # Generate Prisma client
npx prisma db push     # Push schema to database
npx prisma studio      # Open Prisma Studio
```

### Environment Variables
- `DATABASE_URL`: SQL Server connection string
- `JWT_SECRET`: Secret key for JWT token generation

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Check out our [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for more details.
