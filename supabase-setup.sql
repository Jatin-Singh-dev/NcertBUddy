-- ============================================================
-- NCERT Buddy — Complete Supabase Setup
-- Run this entire file in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================

-- 1. Enable pgvector extension (for RAG embeddings)
create extension if not exists vector;

-- ============================================================
-- 2. TABLES
-- ============================================================

-- Profiles (extends Supabase auth.users)
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  class integer check (class in (9,10,11,12)),
  subjects text[],
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, class, subjects)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    (new.raw_user_meta_data->>'class')::integer,
    array(select jsonb_array_elements_text(new.raw_user_meta_data->'subjects'))
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if it exists, then create
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- NCERT document chunks (for RAG chatbot)
create table if not exists documents (
  id uuid default gen_random_uuid() primary key,
  class integer,
  subject text,
  chapter integer,
  chapter_name text,
  content text,
  embedding vector(384),
  source_file text,
  created_at timestamptz default now()
);

-- Quiz questions
create table if not exists quiz_questions (
  id uuid default gen_random_uuid() primary key,
  class integer,
  subject text,
  chapter integer,
  chapter_name text,
  question text,
  option_a text,
  option_b text,
  option_c text,
  option_d text,
  correct_answer text check (correct_answer in ('a','b','c','d')),
  explanation text,
  created_at timestamptz default now()
);

-- Quiz attempts
create table if not exists quiz_attempts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  class integer,
  subject text,
  chapter integer,
  chapter_name text,
  score integer,
  total integer,
  answers_json jsonb,
  attempted_at timestamptz default now()
);

-- Chat history
create table if not exists chat_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  role text check (role in ('user','assistant')),
  content text,
  subject text,
  chapter text,
  created_at timestamptz default now()
);

-- Papers metadata
create table if not exists papers (
  id uuid default gen_random_uuid() primary key,
  class integer check (class in (10,12)),
  subject text,
  year integer,
  type text check (type in ('sample','pyq')),
  filename text,
  file_size_kb integer,
  created_at timestamptz default now()
);

-- ============================================================
-- 3. VECTOR SEARCH FUNCTION (used by /api/chat for RAG)
-- ============================================================

create or replace function match_documents(
  query_embedding vector(384),
  match_count int default 5,
  filter_class int default null,
  filter_subject text default null,
  filter_chapter int default null
)
returns table (
  id uuid,
  content text,
  chapter_name text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    documents.id,
    documents.content,
    documents.chapter_name,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where
    (filter_class is null or documents.class = filter_class) and
    (filter_subject is null or documents.subject = filter_subject) and
    (filter_chapter is null or documents.chapter = filter_chapter)
  order by documents.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- ============================================================
-- 4. INDEXES
-- ============================================================

-- Vector similarity search index (create after inserting some data)
-- Note: IVFFlat requires at least some rows to build the index.
-- If this fails on empty table, run it after inserting data via process-pdf.js
-- create index on documents using ivfflat (embedding vector_cosine_ops) with (lists = 10);

-- For now, use a simpler index that works on empty tables:
create index if not exists documents_class_subject_chapter_idx on documents (class, subject, chapter);
create index if not exists quiz_questions_class_subject_chapter_idx on quiz_questions (class, subject, chapter);
create index if not exists quiz_attempts_user_id_idx on quiz_attempts (user_id);
create index if not exists chat_history_user_id_idx on chat_history (user_id);

-- ============================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table profiles enable row level security;
create policy "Users can read own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

alter table documents enable row level security;
create policy "Anyone can read documents" on documents for select using (true);

alter table quiz_questions enable row level security;
create policy "Anyone can read questions" on quiz_questions for select using (true);

alter table quiz_attempts enable row level security;
create policy "Users can read own attempts" on quiz_attempts for select using (auth.uid() = user_id);
create policy "Users can insert own attempts" on quiz_attempts for insert with check (auth.uid() = user_id);

alter table chat_history enable row level security;
create policy "Users can read own chat" on chat_history for select using (auth.uid() = user_id);
create policy "Users can insert own chat" on chat_history for insert with check (auth.uid() = user_id);

alter table papers enable row level security;
create policy "Anyone can read papers" on papers for select using (true);

-- ============================================================
-- 5. STORAGE BUCKETS
-- ============================================================
-- Run these in Supabase Dashboard → Storage → Create Bucket:
--
-- Bucket 1: ncert-pdfs
--   - Private bucket (not public)
--   - Used by the PDF processing script only
--
-- Bucket 2: papers  
--   - Private bucket (not public)
--   - PYQ and sample paper PDFs, served via signed URLs
--
-- OR run in SQL:
insert into storage.buckets (id, name, public) values ('ncert-pdfs', 'ncert-pdfs', false) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('papers', 'papers', false) on conflict (id) do nothing;

-- Storage policies: allow authenticated users to download from papers bucket
create policy "Authenticated users can download papers"
on storage.objects for select
using (bucket_id = 'papers' and auth.role() = 'authenticated');

-- Allow service role to upload to ncert-pdfs (handled by service key, no policy needed)
-- Allow service role to upload to papers (handled by service key, no policy needed)
