const API_CONFIG_CHAT = {
  STREAM_URL: 'http://localhost:8080/api/chat/stream'
}

const API_CONFIG_CORTEX_SERVICE = {
  BASE_URL: 'http://localhost:8080/api'
}

import { USER_ID } from '@/config/user';
// Simple utility for generating a unique connection key
const getConnectionKey = (userId: string, projectId: string, conversationId: string | null): string => {
  return `${userId}:${projectId}:${conversationId || 'new'}`;
}

// SSE connection for streaming chat
export class ChatStreamingService {
  private eventSource: EventSource | null = null;
  private userId: string;
  private projectId: string;
  private conversationId: string | null;
  private connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error' = 'disconnected';
  private onStreamCallback: ((data: any) => void) | null = null;
  private onFinishedCallback: (() => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;
  private onStatusChangeCallback: ((status: string) => void) | null = null;
  private currentMessageRequest: AbortController | null = null;

  constructor(userId: string, projectId: string, conversationId: string | null) {
    this.userId = userId;
    this.projectId = projectId;
    this.conversationId = conversationId;
  }

  connect(): ChatStreamingService {
    // Note: For SSE, we don't actually connect until we send a message
    // This is different from WebSockets where we establish a connection first
    this.connectionStatus = 'disconnected';
    this.updateStatus('disconnected');
    return this;
  }

  onStream(callback: (data: any) => void): ChatStreamingService {
    this.onStreamCallback = callback;
    return this;
  }

  onFinished(callback: () => void): ChatStreamingService {
    this.onFinishedCallback = callback;
    return this;
  }

  onError(callback: (error: string) => void): ChatStreamingService {
    this.onErrorCallback = callback;
    return this;
  }

  onStatusChange(callback: (status: string) => void): ChatStreamingService {
    this.onStatusChangeCallback = callback;
    return this;
  }

  private updateStatus(status: string): void {
    if (this.onStatusChangeCallback) {
      this.onStatusChangeCallback(status);
    }
  }

  sendMessage(message: string): void {
    // Abort any existing request
    if (this.currentMessageRequest) {
      console.log('Aborting previous message request');
      this.currentMessageRequest.abort();
      this.currentMessageRequest = null;
    }

    try {
      this.connectionStatus = 'connecting';
      this.updateStatus('connecting');
      
      // Create a new AbortController for this request
      this.currentMessageRequest = new AbortController();
      const { signal } = this.currentMessageRequest;
      
      // Prepare the request body with all required parameters
      const requestBody = {
        user_id: this.userId,
        project_id: this.projectId,
        conversation_id: this.conversationId || '',
        message: message
      };
      
      // Create the SSE endpoint URL
      const url = API_CONFIG_CHAT.STREAM_URL;
      
      console.log(`Sending message to ${url}`, requestBody);
      
      // Make the fetch request with all parameters in the body
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal,
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Create a reader for the response body stream
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        
        this.connectionStatus = 'connected';
        this.updateStatus('connected');
        
        // Log connection information
        const connectionKey = getConnectionKey(
          this.userId,
          this.projectId,
          this.conversationId
        );
        console.log(`SSE connection established: ${connectionKey}`);
        
        // Process the stream
        const processStream = ({ done, value }: ReadableStreamReadResult<Uint8Array>): Promise<void> => {
          if (done) {
            console.log('Stream complete');
            if (this.onFinishedCallback) {
              this.onFinishedCallback();
            }
            return Promise.resolve();
          }
          
          // Decode the chunk and split by double newlines (SSE format)
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n\n');
          
          lines.forEach(line => {
            if (line.startsWith('data: ')) {
              try {
                const jsonData = JSON.parse(line.substring(6));
                console.log('Parsed SSE data:', jsonData);
                
                if (jsonData.type === 'error') {
                  console.error('Error from server:', jsonData.data);
                  if (this.onErrorCallback) {
                    this.onErrorCallback(jsonData.data || 'Unknown error from server');
                  }
                } else if (jsonData.type === 'finished') {
                  console.log('Stream finished');
                  if (this.onFinishedCallback) {
                    this.onFinishedCallback();
                  }
                } else if (jsonData.type === 'connected') {
                  console.log('SSE connection established, conversation ID:', jsonData.conversation_id);
                  if (jsonData.conversation_id && !this.conversationId) {
                    this.conversationId = jsonData.conversation_id;
                  }
                } else if (jsonData.type === 'stream') {
                  // For stream type, the actual data is in the 'data' field
                  console.log('Stream data received:', jsonData.data);
                  if (this.onStreamCallback && jsonData.data) {
                    this.onStreamCallback(jsonData.data);
                  }
                } else {
                  // For any other message type, pass the entire data object
                  console.log('Other message type received:', jsonData);
                  if (this.onStreamCallback) {
                    this.onStreamCallback(jsonData);
                  }
                }
              } catch (error) {
                console.error('Error parsing SSE data:', error, 'Raw line:', line);
                if (this.onErrorCallback) {
                  this.onErrorCallback('Failed to parse server message');
                }
              }
            }
          });
          
          // Continue reading
          return reader.read().then(processStream);
        };
        
        // Start reading the stream
        return reader.read().then(processStream);
      })
      .catch(error => {
        // Don't report errors if the request was deliberately aborted
        if (error.name === 'AbortError') {
          console.log('Request was aborted');
          return;
        }
        
        console.error('Error with fetch request:', error);
        this.connectionStatus = 'error';
        this.updateStatus('error');
        if (this.onErrorCallback) {
          this.onErrorCallback(`Failed to send message: ${error.message}`);
        }
      });
      
    } catch (error: any) {
      console.error('Error initiating chat request:', error);
      this.connectionStatus = 'error';
      this.updateStatus('error');
      if (this.onErrorCallback) {
        this.onErrorCallback(`Failed to send message: ${error.message}`);
      }
    }
  }

  disconnect(): void {
    // Abort any ongoing request - this is the only thing needed for SSE
    if (this.currentMessageRequest) {
      console.log('Aborting current request');
      this.currentMessageRequest.abort();
      this.currentMessageRequest = null;
    }
    
    // Update status
    this.connectionStatus = 'disconnected';
    this.updateStatus('disconnected');
    
    // Log disconnection
    const connectionKey = getConnectionKey(
      this.userId,
      this.projectId,
      this.conversationId
    );
    console.log(`SSE connection terminated: ${connectionKey}`);
  }

  getConnectionStatus(): string {
    return this.connectionStatus;
  }
  
  getConversationId(): string | null {
    return this.conversationId;
  }
}

// Function to stream chat messages using WebSocket
export const streamChatMessage = async (
  conversationId: string | null,
  userId: string,
  projectId: string,
  query: string,
  callbacks: {
    onStream: (data: any) => void;
    onFinished: () => void;
    onError: (error: string) => void;
    onStatusChange?: (status: string) => void;
  }
): Promise<{ disconnect: () => void }> => {
  // Create a promise that resolves when the connection is established
  let connectionResolve: () => void;
  const connectionPromise = new Promise<void>((resolve) => {
    connectionResolve = resolve;
  });

  // Create the SSE service
  const wsService = new ChatStreamingService(userId, projectId, conversationId)
    .connect()
    .onStream(callbacks.onStream)
    .onFinished(callbacks.onFinished)
    .onError(callbacks.onError);

  // Add status change callback if provided
  if (callbacks.onStatusChange) {
    wsService.onStatusChange((status: string) => {
      callbacks.onStatusChange!(status);

      // Resolve the connection promise when connected
      if (status === 'connected') {
        connectionResolve();
      }
    });
  } else {
    // If no status callback provided, still need to resolve the promise
    wsService.onStatusChange((status: string) => {
      if (status === 'connected') {
        connectionResolve();
      }
    });
  }

  try {
    // Wait for the connection to be established with a timeout
    const connectionTimeout = 5000; // 5 seconds
    await Promise.race([
      connectionPromise,
      new Promise<void>((_, reject) =>
        setTimeout(() => reject(new Error('Connection timeout')), connectionTimeout)
      )
    ]);

    // Add a small delay after connection is established before sending the message
    await new Promise(resolve => setTimeout(resolve, 500));

    // Send the message
    console.log('Connection established, sending message:', query);
    wsService.sendMessage(query);
  } catch (error) {
    console.error('Error in connection process:', error);
    callbacks.onError(error instanceof Error ? error.message : 'Failed to establish connection');
    wsService.disconnect();
  }

  return {
    disconnect: () => wsService.disconnect()
  };
};

export const getChatHistory = async (userName: string) => {
  const response = await fetch(`${API_CONFIG_CORTEX_SERVICE.BASE_URL}/get/conversation/all?user_id=${userName}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  return response.json();
}

export const deleteConversation = async (conversationId: string) => {
  const response = await fetch(`${API_CONFIG_CORTEX_SERVICE.BASE_URL}/conversation/${conversationId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' }
  });
  return response.json();
}

// Function to clean up SSE connections when a tab is closed
export const cleanupChatConnection = (userId: string, projectId: string, conversationId: string | null) => {
  const connectionKey = getConnectionKey(userId, projectId, conversationId);
  console.log(`Tab closed: ${connectionKey}. SSE connections are automatically cleaned up when the fetch request completes.`);
  return true;
}