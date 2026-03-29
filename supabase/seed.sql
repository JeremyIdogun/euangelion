-- Euangelion — Pillar seed data

INSERT INTO pillars (name, slug, description, icon, color) VALUES
  ('Holy Spirit',  'holy-spirit',   'Sermons on the person and work of the Holy Spirit',                  '🔥', '#4A90A4'),
  ('Discipleship', 'discipleship',  'Sermons on following Christ and growing in faith',                   '📖', '#8B6F47'),
  ('Family',       'family',        'Sermons on marriage, parenting, and household of faith',             '🏠', '#C9956B'),
  ('End Times',    'end-times',     'Sermons on eschatology and the return of Christ',                    '⏳', '#7A5C58'),
  ('Worship',      'worship',       'Sermons on praise, adoration, and the heart of worship',             '🎵', '#D4845A'),
  ('Prophecy',     'prophecy',      'Sermons on the prophetic gift and biblical prophecy',                '📜', '#C17B3F'),
  ('Grace',        'grace',         'Sermons on the unmerited favour and mercy of God',                   '🕊️', '#E8A87C'),
  ('Prayer',       'prayer',        'Sermons on the practice and power of prayer',                        '🙏', '#9B7DB5'),
  ('Supernatural', 'supernatural',  'Sermons on miracles, signs, and the power of God',                  '⚡', '#5B7FA6'),
  ('Healing',      'healing',       'Sermons on divine healing — physical, emotional, and spiritual',     '✨', '#6BAA75')
ON CONFLICT (slug) DO NOTHING;
