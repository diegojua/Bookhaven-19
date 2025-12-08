-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users Table
create table users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  username text unique not null,
  password_hash text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Books Table
create table books (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  author text not null,
  description text,
  cover_url text,
  file_url text not null,
  file_format text not null,
  file_size bigint not null,
  language text default 'pt',
  category text default 'fiction',
  total_pages integer default 0,
  total_chapters integer default 0,
  rating float default 0.0,
  reviews integer default 0,
  trending boolean default false,
  is_public boolean default true,
  uploaded_by uuid references users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Reading Progress Table
create table reading_progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade not null,
  book_id uuid references books(id) on delete cascade not null,
  current_page integer default 1,
  current_chapter integer default 1,
  percentage_complete float default 0.0,
  last_position text default '',
  total_reading_time integer default 0,
  is_finished boolean default false,
  last_read_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, book_id)
);

-- Bookmarks Table
create table bookmarks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade not null,
  book_id uuid references books(id) on delete cascade not null,
  position text not null,
  chapter integer,
  page_number integer,
  note text,
  color text default '#FFEB3B',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Annotations Table
create table annotations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade not null,
  book_id uuid references books(id) on delete cascade not null,
  highlighted_text text not null,
  position_start text,
  position_end text,
  note text,
  color text default '#FFEB3B',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Reading Preferences Table
create table reading_preferences (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade not null,
  theme text default 'soft-beige',
  font_family text default 'Merriweather',
  font_size integer default 16,
  line_spacing float default 1.5,
  margin_size text default 'medium',
  brightness integer default 100,
  auto_night_mode boolean default true,
  page_turn_animation boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);

-- RLS Policies (Optional but recommended - enabling basic access for now)
alter table users enable row level security;
alter table books enable row level security;
alter table reading_progress enable row level security;
alter table bookmarks enable row level security;
alter table annotations enable row level security;
alter table reading_preferences enable row level security;

-- Create policies to allow service_role to do everything (our backend uses service key usually, or we can just disable RLS for simplicity if using direct connection)
-- For this implementation, we will disable RLS to avoid permission issues since the backend handles auth logic.
alter table users disable row level security;
alter table books disable row level security;
alter table reading_progress disable row level security;
alter table bookmarks disable row level security;
alter table annotations disable row level security;
alter table reading_preferences disable row level security;
