/*
  # Add Performance Indexes and Update Triggers

  1. Indexes
    - Add index on chat_threads.api_key_hash for faster user data lookup
    - Add index on chat_messages.thread_id for faster message queries
    - Add index on chat_messages.timestamp for ordered retrieval

  2. Triggers
    - Add automatic updated_at trigger for chat_threads table
    
  3. Notes
    - RLS is enabled but needs policies configured separately if required
    - All tables already have proper UUID primary keys with gen_random_uuid() defaults
*/

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_threads_api_key_hash 
  ON chat_threads(api_key_hash);

CREATE INDEX IF NOT EXISTS idx_chat_messages_thread_id 
  ON chat_messages(thread_id);

CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp 
  ON chat_messages(timestamp);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to chat_threads table
DROP TRIGGER IF EXISTS update_chat_threads_updated_at ON chat_threads;
CREATE TRIGGER update_chat_threads_updated_at
  BEFORE UPDATE ON chat_threads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();