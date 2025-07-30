-- Create content_events table for logging webhook events
CREATE TABLE public.content_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  show_id UUID REFERENCES public.shows(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on content_events
ALTER TABLE public.content_events ENABLE ROW LEVEL SECURITY;

-- Create policies for content_events
CREATE POLICY "Users can view events for their content" 
ON public.content_events 
FOR SELECT 
USING (
  auth.uid() IN (
    SELECT s.created_by 
    FROM public.shows s 
    WHERE s.id = content_events.show_id
  )
);

-- Create webhook_settings table for storing user webhook configurations
CREATE TABLE public.webhook_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  webhook_url TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  events TEXT[] DEFAULT ARRAY['created', 'updated', 'deleted'],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on webhook_settings
ALTER TABLE public.webhook_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for webhook_settings
CREATE POLICY "Users can manage their webhook settings" 
ON public.webhook_settings 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add trigger for webhook_settings updated_at
CREATE TRIGGER update_webhook_settings_updated_at
BEFORE UPDATE ON public.webhook_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();