# BookHaven

BookHaven is a modern, digital library application that allows users to upload, manage, and read books (PDF, EPUB, TXT) directly in the browser. It features a beautiful, responsive interface with dark mode support, reading progress tracking, bookmarks, and customizable reading preferences.

## Features

*   **Digital Library**: Upload and organize your book collection.
*   **Multi-format Support**: Read PDF, EPUB, and TXT files directly in the app.
*   **Reading Progress**: Automatically saves your reading position.
*   **Customizable Reader**: Adjust font size, font family, line spacing, and themes.
*   **Bookmarks & Annotations**: Save important pages and add notes.
*   **Favorites & Stats**: Track your reading habits and favorite books.
*   **Dark Mode**: Fully supported dark theme for comfortable reading at night.
*   **Responsive Design**: Works seamlessly on desktop and mobile.

## Tech Stack

*   **Frontend**: React, Vite, Tailwind CSS, Radix UI, Lucide Icons.
*   **Backend**: Python, FastAPI, Supabase (PostgreSQL + Storage).
*   **Authentication**: JWT (JSON Web Tokens).

## Prerequisites

*   **Node.js** (v18 or higher)
*   **Python** (v3.10 or higher)
*   **Supabase Account**: You need a Supabase project for the database and file storage.

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd Bookhaven-19
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create a virtual environment and activate it:

```bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file in the `backend` directory with your Supabase credentials:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
JWT_SECRET=your_jwt_secret_key
```

Run the database schema (if setting up for the first time):
Copy the contents of `backend/supabase_schema.sql` and run it in your Supabase SQL Editor.

Start the backend server:

```bash
python server.py
```
The server will start at `http://localhost:8000`.

### 3. Frontend Setup

Navigate to the frontend directory:

```bash
cd ../frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the `frontend` directory (optional, defaults to localhost:8000):

```env
VITE_BACKEND_URL=http://localhost:8000
```

Start the development server:

```bash
npm start
```
The application will open at `http://localhost:3000`.

## Running Tests

To run the backend tests:

```bash
# Ensure you are in the root directory and virtual environment is activated
python -m pytest tests/test_api.py
```

## Usage

1.  **Register**: Create a new account on the login page.
2.  **Upload**: Click "Adicionar Livro" to upload a PDF, EPUB, or TXT file.
3.  **Read**: Click on a book cover to start reading. Your progress is saved automatically.
4.  **Customize**: Use the settings menu in the reader to adjust fonts and themes.

## License

MIT
