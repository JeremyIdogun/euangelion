-- Ensure thematic pillars exist for homepage + admin classification workflows.
-- Safe to run multiple times.

alter table if exists pillars enable row level security;

drop policy if exists public_read_pillars on pillars;
create policy public_read_pillars
on pillars for select
to anon, authenticated
using (true);

insert into pillars (name, slug, description, icon, color)
values
  ('Faith',        'faith',        'Sermons on trust in God, belief, and spiritual confidence.',                     '✝️', '#356B8C'),
  ('Healing',      'healing',      'Sermons on physical, emotional, and spiritual restoration.',                     '✨', '#4D9B65'),
  ('Finance',      'finance',      'Sermons on stewardship, generosity, debt freedom, and financial wisdom.',       '💰', '#8B6F2A'),
  ('Prayer',       'prayer',       'Sermons on prayer, intercession, and communion with God.',                      '🙏', '#6C5BA7'),
  ('Family',       'family',       'Sermons on marriage, parenting, and Christ-centered homes.',                    '🏠', '#B1704C'),
  ('Grace',        'grace',        'Sermons on mercy, forgiveness, and the grace of God.',                          '🕊️', '#C47B7B'),
  ('Discipleship', 'discipleship', 'Sermons on following Jesus and growing in spiritual maturity.',                 '📖', '#5E6B7A'),
  ('Worship',      'worship',      'Sermons on praise, adoration, and the heart of worship.',                       '🎵', '#9A5C9A'),
  ('Holy Spirit',  'holy-spirit',  'Sermons on the person, gifts, and work of the Holy Spirit.',                    '🔥', '#A1533E'),
  ('Prophecy',     'prophecy',     'Sermons on prophetic ministry and biblical prophecy.',                           '📜', '#7C6B49'),
  ('End Times',    'end-times',    'Sermons on biblical eschatology, readiness, and the return of Christ.',         '⏳', '#6A5B5B'),
  ('Supernatural', 'supernatural', 'Sermons on miracles, signs, wonders, and the power of God.',                    '⚡', '#4B6FA3')
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  color = excluded.color;
