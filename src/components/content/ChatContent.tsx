import { CortexConversation } from "@/types"
import StreamingChatInterface from "../chat/StreamingChatInterface"
import { useCortex } from "@/context/CortexContext"
import { useEffect, useState } from "react"

// Interface matching what StreamingChatInterface expects
interface Conversation {
    _id: any;
    messages: any[];
}

export const ChatContent = (props: { projectId: string, conversation?: CortexConversation }) => {
    const { refreshWorkspace, closeTab, openTab, tabState } = useCortex();
    const [isConverting, setIsConverting] = useState(false);
    
    // If we have a conversation, adapt it to the format expected by StreamingChatInterface
    let adaptedConversation: Conversation | undefined;
    
    if (props.conversation) {
        adaptedConversation = {
            _id: props.conversation.id, // Use id as _id
            messages: props.conversation.messages || []
        };
    }
     
    // Handle conversion from chat to conversation
    const handleConversationCreated = async (conversationId: string, projectId: string) => {
        if (isConverting) return; // Prevent multiple conversions
        setIsConverting(true);
        
        console.log('Converting chat to conversation:', conversationId, projectId);
        
        try {
            // First refresh the workspace to load the new conversation
            await refreshWorkspace();
            
            // Find the current chat tab ID
            const chatTabId = tabState.openTabs.find(tabId => 
                tabId.startsWith('chat-') && tabState.activeTab === tabId
            );
            
            if (chatTabId) {
                // Close the chat tab
                closeTab(chatTabId);
                
                // Create and open the conversation tab
                const convTabId = `conv-${conversationId}-${projectId}`;
                openTab(convTabId);
                
                console.log('Successfully converted chat tab to conversation tab:', convTabId);
            }
        } catch (error) {
            console.error('Failed to convert chat to conversation:', error);
        } finally {
            setIsConverting(false);
        }
    };
    
    return <StreamingChatInterface 
        projectId={props.projectId} 
        conversation={adaptedConversation} 
        onConversationCreated={handleConversationCreated}
    />
}