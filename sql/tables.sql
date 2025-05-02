-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table (Auth handled separately by Supabase)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT CHECK (role IN ('student', 'faculty', 'admin')) NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- Students Table
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  department TEXT,
  year INT,
  skills JSONB, -- Example: {"python": 3, "aptitude": 4}
  category TEXT CHECK (category IN ('Explorer', 'Doer', 'Achiever')),
  created_at TIMESTAMP DEFAULT now()
);

-- Faculty Table
CREATE TABLE faculty (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  department TEXT,
  subjects TEXT[], -- List of subject codes or IDs
  created_at TIMESTAMP DEFAULT now()
);

-- Subjects Table
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  semester INT,
  department TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Feedback Table
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  faculty_id UUID REFERENCES faculty(id) ON DELETE SET NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  text TEXT,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMP DEFAULT now()
);

-- Trainings Table
CREATE TABLE trainings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('Explorer', 'Doer', 'Achiever')),
  content TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- AI Suggestions Table
CREATE TABLE ai_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  suggestion_text TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Placement Predictions Table
CREATE TABLE placement_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  score NUMERIC, -- 0 to 100
  company_match TEXT[], -- Example: ['TCS', 'Zoho']
  notes TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Time Management Tasks Table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  due_date DATE,
  status TEXT CHECK (status IN ('pending', 'completed')) DEFAULT 'pending',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMP DEFAULT now()
);
