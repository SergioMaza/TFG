CREATE TABLE exercises_catalog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  title TEXT NOT NULL,
  img TEXT,
  upper BOOLEAN NOT NULL,
  
  velocity_ideal_low INT NOT NULL,
  velocity_ideal_high INT NOT NULL,

  rom_ideal_low INT NOT NULL,
  rom_ideal_high INT NOT NULL,

  duration_ideal_low FLOAT NOT NULL,
  duration_ideal_high FLOAT NOT NULL
);

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises_catalog(id) ON DELETE CASCADE,

  video_url TEXT,
  uploaded_at TIMESTAMP,
  score INT,
  fatigue FLOAT,
  efficiency_avg FLOAT,

  total_reps INT,
  full_rom_reps INT,

  rom_avg_deg FLOAT,
  rom_min_deg FLOAT,
  rom_max_deg FLOAT,

  duration_avg FLOAT,
  velocity_avg FLOAT
);

CREATE TABLE reps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,

  rep_number INT,
  efficiency FLOAT,
  full_rom BOOLEAN,
  rom_deg FLOAT,
  duration FLOAT,
  velocity FLOAT
);