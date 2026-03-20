-- EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- USERS
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR NOT NULL UNIQUE,
  email VARCHAR NOT NULL UNIQUE,
  profile_pic VARCHAR,
  last_seen TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- CONVERSATIONS
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR,
  is_group BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- MESSAGES
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  content TEXT,
  message_type VARCHAR NOT NULL DEFAULT 'text'
    CHECK (message_type IN ('text', 'image', 'video', 'audio')),
  reply_to_message_id UUID,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_messages_conversation
    FOREIGN KEY (conversation_id)
    REFERENCES conversations(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_messages_sender
    FOREIGN KEY (sender_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_messages_reply
    FOREIGN KEY (reply_to_message_id)
    REFERENCES messages(id)
    ON DELETE SET NULL
);

-- PARTICIPANTS
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role VARCHAR NOT NULL DEFAULT 'member'
    CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_participants_conversation
    FOREIGN KEY (conversation_id)
    REFERENCES conversations(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_participants_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

  CONSTRAINT unique_participant UNIQUE (conversation_id, user_id)
);

-- ATTACHMENTS
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR,
  file_size INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT fk_attachments_message
    FOREIGN KEY (message_id)
    REFERENCES messages(id)
    ON DELETE CASCADE
);

-- MESSAGE READS
CREATE TABLE message_reads (
  message_id UUID NOT NULL,
  user_id UUID NOT NULL,
  read_at TIMESTAMP NOT NULL DEFAULT NOW(),

  PRIMARY KEY (message_id, user_id),

  CONSTRAINT fk_reads_message
    FOREIGN KEY (message_id)
    REFERENCES messages(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_reads_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

-- ROLES
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- USER ROLES
CREATE TABLE user_roles (
  user_id UUID NOT NULL,
  role_id UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  PRIMARY KEY (user_id, role_id),

  CONSTRAINT fk_user_roles_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_user_roles_role
    FOREIGN KEY (role_id)
    REFERENCES roles(id)
    ON DELETE CASCADE
);

-- INDEXES (PERFORMANCE 🔥)
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_participants_user ON participants(user_id);
CREATE INDEX idx_message_reads_user ON message_reads(user_id);
