-- Create users table for storing user profiles
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30)
);

-- Create shows table for storing TV show/movie metadata
CREATE TABLE public.shows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'TV Show',
  duration_minutes INTEGER,
  thumbnail_url TEXT,
  video_url TEXT,
  file_size_bytes BIGINT,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mesh_nodes table for tracking network participants
CREATE TABLE public.mesh_nodes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  node_name TEXT NOT NULL,
  device_fingerprint TEXT UNIQUE,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
  signal_strength INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT false,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT signal_strength_range CHECK (signal_strength >= 0 AND signal_strength <= 100)
);

-- Create broadcast_sessions table for tracking active broadcasts
CREATE TABLE public.broadcast_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  show_id UUID REFERENCES public.shows(id) ON DELETE CASCADE,
  broadcaster_node_id UUID REFERENCES public.mesh_nodes(id) ON DELETE CASCADE,
  session_name TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  viewer_count INTEGER DEFAULT 0,
  total_fragments INTEGER DEFAULT 0,
  fragments_sent INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create video_fragments table for tracking fragment distribution
CREATE TABLE public.video_fragments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id TEXT NOT NULL,
  sequence_number INTEGER NOT NULL,
  total_fragments INTEGER NOT NULL,
  fragment_size INTEGER NOT NULL,
  checksum TEXT NOT NULL,
  broadcast_session_id UUID REFERENCES public.broadcast_sessions(id) ON DELETE CASCADE,
  sender_node_id UUID REFERENCES public.mesh_nodes(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(video_id, sequence_number)
);

-- Create fragment_receipts table for tracking which nodes have which fragments
CREATE TABLE public.fragment_receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fragment_id UUID REFERENCES public.video_fragments(id) ON DELETE CASCADE,
  receiver_node_id UUID REFERENCES public.mesh_nodes(id) ON DELETE CASCADE,
  received_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  verified BOOLEAN DEFAULT false,
  UNIQUE(fragment_id, receiver_node_id)
);

-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mesh_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcast_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_fragments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fragment_receipts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view all profiles" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = auth_user_id);
CREATE POLICY "Users can insert their own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

-- RLS Policies for shows table  
CREATE POLICY "Anyone can view public shows" ON public.shows FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view their own shows" ON public.shows FOR SELECT USING (auth.uid() IN (SELECT auth_user_id FROM public.users WHERE id = created_by));
CREATE POLICY "Users can insert their own shows" ON public.shows FOR INSERT WITH CHECK (auth.uid() IN (SELECT auth_user_id FROM public.users WHERE id = created_by));
CREATE POLICY "Users can update their own shows" ON public.shows FOR UPDATE USING (auth.uid() IN (SELECT auth_user_id FROM public.users WHERE id = created_by));
CREATE POLICY "Users can delete their own shows" ON public.shows FOR DELETE USING (auth.uid() IN (SELECT auth_user_id FROM public.users WHERE id = created_by));

-- RLS Policies for mesh_nodes table
CREATE POLICY "Anyone can view active mesh nodes" ON public.mesh_nodes FOR SELECT USING (is_active = true);
CREATE POLICY "Users can manage their own nodes" ON public.mesh_nodes FOR ALL USING (auth.uid() IN (SELECT auth_user_id FROM public.users WHERE id = user_id));

-- RLS Policies for broadcast_sessions table
CREATE POLICY "Anyone can view active broadcast sessions" ON public.broadcast_sessions FOR SELECT USING (is_active = true);
CREATE POLICY "Users can manage broadcasts from their nodes" ON public.broadcast_sessions FOR ALL USING (
  auth.uid() IN (
    SELECT u.auth_user_id FROM public.users u 
    JOIN public.mesh_nodes mn ON u.id = mn.user_id 
    WHERE mn.id = broadcaster_node_id
  )
);

-- RLS Policies for video_fragments table
CREATE POLICY "Anyone can view fragments from active broadcasts" ON public.video_fragments FOR SELECT USING (
  broadcast_session_id IN (SELECT id FROM public.broadcast_sessions WHERE is_active = true)
);
CREATE POLICY "Node owners can insert fragments" ON public.video_fragments FOR INSERT WITH CHECK (
  auth.uid() IN (
    SELECT u.auth_user_id FROM public.users u 
    JOIN public.mesh_nodes mn ON u.id = mn.user_id 
    WHERE mn.id = sender_node_id
  )
);

-- RLS Policies for fragment_receipts table
CREATE POLICY "Anyone can view fragment receipts" ON public.fragment_receipts FOR SELECT USING (true);
CREATE POLICY "Node owners can insert receipts" ON public.fragment_receipts FOR INSERT WITH CHECK (
  auth.uid() IN (
    SELECT u.auth_user_id FROM public.users u 
    JOIN public.mesh_nodes mn ON u.id = mn.user_id 
    WHERE mn.id = receiver_node_id
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_shows_updated_at BEFORE UPDATE ON public.shows FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_mesh_nodes_updated_at BEFORE UPDATE ON public.mesh_nodes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_broadcast_sessions_updated_at BEFORE UPDATE ON public.broadcast_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_users_auth_user_id ON public.users(auth_user_id);
CREATE INDEX idx_users_username ON public.users(username);
CREATE INDEX idx_shows_created_by ON public.shows(created_by);
CREATE INDEX idx_shows_is_public ON public.shows(is_public);
CREATE INDEX idx_mesh_nodes_user_id ON public.mesh_nodes(user_id);
CREATE INDEX idx_mesh_nodes_is_active ON public.mesh_nodes(is_active);
CREATE INDEX idx_mesh_nodes_device_fingerprint ON public.mesh_nodes(device_fingerprint);
CREATE INDEX idx_broadcast_sessions_show_id ON public.broadcast_sessions(show_id);
CREATE INDEX idx_broadcast_sessions_is_active ON public.broadcast_sessions(is_active);
CREATE INDEX idx_video_fragments_video_id ON public.video_fragments(video_id);
CREATE INDEX idx_video_fragments_broadcast_session_id ON public.video_fragments(broadcast_session_id);
CREATE INDEX idx_fragment_receipts_fragment_id ON public.fragment_receipts(fragment_id);
CREATE INDEX idx_fragment_receipts_receiver_node_id ON public.fragment_receipts(receiver_node_id);