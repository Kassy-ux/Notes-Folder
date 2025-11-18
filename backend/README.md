# Notes App Backend API

Backend server for the Notes App with Neon Serverless PostgreSQL database.

## 🚀 Features

- ✅ **User Authentication** - Register, Login with JWT
- ✅ **Notes CRUD** - Create, Read, Update, Delete notes
- ✅ **Cloud Sync** - Real-time synchronization
- ✅ **Categories & Tags** - Organize notes
- ✅ **Pin Notes** - Keep favorites on top
- ✅ **Soft Delete** - Trash and restore functionality
- ✅ **Search & Filter** - Find notes quickly
- ✅ **Attachments** - Upload files and images
- ✅ **Sharing** - Collaborate with others
- ✅ **Reminders** - Set note reminders
- ✅ **Security** - Rate limiting, helmet, CORS

## 📋 Prerequisites

- Node.js (v18 or higher)
- Neon Serverless PostgreSQL account
- npm or pnpm

## 🛠️ Setup Instructions

### 1. Create Neon Database

1. Go to [https://console.neon.tech/](https://console.neon.tech/)
2. Sign up or log in
3. Create a new project
4. Copy your connection string (it looks like this):
   ```
   postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### 2. Install Dependencies

```bash
cd backend
npm install
# or
pnpm install
```

### 3. Configure Environment Variables

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit `.env` and add your configuration:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Neon Database - PASTE YOUR CONNECTION STRING HERE
DATABASE_URL=postgresql://your-username:your-password@your-host.neon.tech/neondb?sslmode=require

# JWT Secret - Generate a random string
JWT_SECRET=your-super-secret-key-here-change-this
JWT_EXPIRES_IN=7d

# Optional: Cloudinary for image uploads
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 4. Run Database Migrations

```bash
npm run migrate
```

You should see output like:
```
✅ Users table created
✅ Notes table created
✅ Shared notes table created
✅ Attachments table created
✅ Tags table created
✅ Indexes created
🎉 All migrations completed successfully!
```

### 5. Start the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

You should see:
```
✅ Database connected successfully!
🚀 Server running on port 3000
📝 Environment: development
🌐 API Base URL: http://localhost:3000/api
```

## 📡 API Endpoints

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "JohnDoe",
  "password": "password123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "JohnDoe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Notes (All require Authorization header)

#### Get All Notes
```http
GET /api/notes
Authorization: Bearer <your-token>

# Optional query parameters:
?search=keyword
&category=work
&sortBy=date
&order=desc
```

#### Get Single Note
```http
GET /api/notes/:id
Authorization: Bearer <your-token>
```

#### Create Note
```http
POST /api/notes
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "title": "My Note",
  "content": "Note content here",
  "category": "work",
  "isPinned": false,
  "color": "#FF6B6B",
  "reminderDate": "2025-12-31T10:00:00Z"
}
```

#### Update Note
```http
PUT /api/notes/:id
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content",
  "category": "personal"
}
```

#### Toggle Pin
```http
PATCH /api/notes/:id/pin
Authorization: Bearer <your-token>
```

#### Delete Note (Soft Delete)
```http
DELETE /api/notes/:id
Authorization: Bearer <your-token>
```

#### Get Trash
```http
GET /api/notes/trash/all
Authorization: Bearer <your-token>
```

#### Restore Note
```http
PATCH /api/notes/:id/restore
Authorization: Bearer <your-token>
```

### User Profile

#### Get Profile
```http
GET /api/user/profile
Authorization: Bearer <your-token>
```

#### Update Profile
```http
PUT /api/user/profile
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "username": "NewUsername"
}
```

## 🗄️ Database Schema

### Users Table
- `id` - UUID (Primary Key)
- `email` - VARCHAR(255) UNIQUE
- `username` - VARCHAR(100)
- `password` - TEXT (hashed)
- `created_at` - TIMESTAMP
- `updated_at` - TIMESTAMP
- `last_login` - TIMESTAMP
- `is_active` - BOOLEAN

### Notes Table
- `id` - UUID (Primary Key)
- `user_id` - UUID (Foreign Key → users)
- `title` - VARCHAR(255)
- `content` - TEXT
- `category` - VARCHAR(50)
- `is_pinned` - BOOLEAN
- `color` - VARCHAR(50)
- `image_url` - TEXT
- `reminder_date` - TIMESTAMP
- `created_at` - TIMESTAMP
- `updated_at` - TIMESTAMP
- `deleted_at` - TIMESTAMP (Soft Delete)

### Additional Tables
- `shared_notes` - For collaboration
- `attachments` - For file uploads
- `tags` - Custom tags
- `note_tags` - Junction table

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt with salt rounds
- **Rate Limiting** - Prevents abuse
- **Helmet** - Security headers
- **CORS** - Controlled cross-origin requests
- **Input Validation** - express-validator
- **SQL Injection Protection** - Drizzle ORM

## 🚀 Deployment

### Deploy to Vercel, Railway, or Render

1. Push your code to GitHub
2. Connect your repository to your hosting platform
3. Set environment variables in the platform dashboard
4. Deploy!

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=your-neon-production-url
JWT_SECRET=your-production-secret
ALLOWED_ORIGINS=https://your-app-domain.com
```

## 📊 Testing the API

### Using curl:

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"test123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Get notes (replace TOKEN with your JWT)
curl -X GET http://localhost:3000/api/notes \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Postman or Insomnia:

Import the API collection and test all endpoints easily.

## 🐛 Troubleshooting

### Database Connection Issues
- Verify your `DATABASE_URL` is correct
- Check if your Neon database is active
- Ensure SSL mode is set to `require`

### Migration Errors
- Drop all tables and re-run migrations
- Check Neon console for database status

### JWT Errors
- Ensure `JWT_SECRET` is set in `.env`
- Check token expiration time

## 📝 License

MIT License

---

**Built with ❤️ using Node.js, Express, and Neon PostgreSQL**
