-- Besorah Phase 6 — Optional custom sermon display title

alter table if exists sermons
  add column if not exists custom_title text;
