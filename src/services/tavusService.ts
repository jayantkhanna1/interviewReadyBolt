const TAVUS_API_BASE = 'https://tavusapi.com/v2';
const API_KEY = import.meta.env.VITE_TAVUS_API_KEY;

interface CreatePersonaRequest {
  persona_name: string;
  system_prompt: string;
  context: string;
  pipeline_mode: 'full' | 'echo';
  default_replica_id?: string;
}

interface CreateConversationRequest {
  persona_id: string;
  replica_id?: string;
  conversation_name: string;
  conversational_context: string;
  custom_greeting: string;
  callback_url?: string;
  properties?: {
    enable_recording?: boolean;
    enable_closed_captions?: boolean;
    max_call_duration?: number;
    participant_left_timeout?: number;
    participant_absent_timeout?: number;
  };
}

interface PersonaResponse {
  persona_id: string;
  persona_name: string;
  created_at: string;
}

interface ConversationResponse {
  conversation_id: string;
  conversation_name: string;
  status: string;
  conversation_url: string;
  replica_id: string;
  persona_id: string;
  created_at: string;
}

export const createPersona = async (request: CreatePersonaRequest): Promise<PersonaResponse> => {
  try {
    const response = await fetch(`${TAVUS_API_BASE}/personas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify({
        ...request,
        default_replica_id: request.default_replica_id || import.meta.env.VITE_TAVUS_DEFAULT_REPLICA_ID,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to create persona: ${response.status} - ${errorData}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating persona:', error);
    throw error;
  }
};

export const createConversation = async (request: CreateConversationRequest): Promise<ConversationResponse> => {
  try {
    const response = await fetch(`${TAVUS_API_BASE}/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify({
        ...request,
        callback_url: request.callback_url || import.meta.env.VITE_TAVUS_CALLBACK_URL,
        replica_id: request.replica_id || import.meta.env.VITE_TAVUS_DEFAULT_REPLICA_ID,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to create conversation: ${response.status} - ${errorData}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
};

export const deletePersona = async (personaId: string): Promise<void> => {
  try {
    const response = await fetch(`${TAVUS_API_BASE}/personas/${personaId}`, {
      method: 'DELETE',
      headers: {
        'x-api-key': API_KEY,
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.warn(`Failed to delete persona: ${response.status} - ${errorData}`);
      // Don't throw error for cleanup operations
    }
  } catch (error) {
    console.error('Error deleting persona:', error);
    // Don't throw error for cleanup operations
  }
};

export const getConversation = async (conversationId: string) => {
  try {
    const response = await fetch(`${TAVUS_API_BASE}/conversations/${conversationId}`, {
      method: 'GET',
      headers: {
        'x-api-key': API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get conversation: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting conversation:', error);
    throw error;
  }
};

export const endConversation = async (conversationId: string) => {
  try {
    const response = await fetch(`${TAVUS_API_BASE}/conversations/${conversationId}/end`, {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to end conversation: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error ending conversation:', error);
    throw error;
  }
};