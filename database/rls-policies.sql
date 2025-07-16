-- Row Level Security Policies for FlowTracker
-- Ensures users can only access their own data

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE flow_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pomodoro_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE flow_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE flow_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE flow_tracking_settings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- User settings policies
CREATE POLICY "Users can view their own settings" ON user_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON user_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" ON user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Tasks policies
CREATE POLICY "Users can view their own tasks" ON tasks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tasks" ON tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" ON tasks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" ON tasks
    FOR DELETE USING (auth.uid() = user_id);

-- Flow sessions policies
CREATE POLICY "Users can view their own flow sessions" ON flow_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own flow sessions" ON flow_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own flow sessions" ON flow_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own flow sessions" ON flow_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Pomodoro sessions policies
CREATE POLICY "Users can view their own pomodoro sessions" ON pomodoro_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own pomodoro sessions" ON pomodoro_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pomodoro sessions" ON pomodoro_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pomodoro sessions" ON pomodoro_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Flow actions policies
CREATE POLICY "Users can view their own flow actions" ON flow_actions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own flow actions" ON flow_actions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own flow actions" ON flow_actions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own flow actions" ON flow_actions
    FOR DELETE USING (auth.uid() = user_id);

-- Achievements policies
CREATE POLICY "Users can view their own achievements" ON achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own achievements" ON achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements" ON achievements
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own achievements" ON achievements
    FOR DELETE USING (auth.uid() = user_id);

-- User streaks policies
CREATE POLICY "Users can view their own streaks" ON user_streaks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own streaks" ON user_streaks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streaks" ON user_streaks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own streaks" ON user_streaks
    FOR DELETE USING (auth.uid() = user_id);

-- Flow entries policies
CREATE POLICY "Users can view their own flow entries" ON flow_entries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own flow entries" ON flow_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own flow entries" ON flow_entries
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own flow entries" ON flow_entries
    FOR DELETE USING (auth.uid() = user_id);

-- Flow tracking settings policies
CREATE POLICY "Users can view their own flow tracking settings" ON flow_tracking_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own flow tracking settings" ON flow_tracking_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own flow tracking settings" ON flow_tracking_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own flow tracking settings" ON flow_tracking_settings
    FOR DELETE USING (auth.uid() = user_id);
