import { create } from 'zustand';
import { IMessage, IScenario } from '@/types';

interface ConversationState {
  conversationId: string | null;
  scenario: IScenario | null;
  messages: IMessage[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  isRecording: boolean;
  setConversation: (id: string, scenario: IScenario, messages: IMessage[]) => void;
  addMessage: (message: IMessage) => void;
  updateMessage: (id: string, updates: Partial<IMessage>) => void;
  setLoading: (loading: boolean) => void;
  setSending: (sending: boolean) => void;
  setError: (error: string | null) => void;
  setRecording: (recording: boolean) => void;
  reset: () => void;
}

const initialState = {
  conversationId: null,
  scenario: null,
  messages: [],
  isLoading: false,
  isSending: false,
  error: null,
  isRecording: false,
};

export const useConversationStore = create<ConversationState>((set) => ({
  ...initialState,
  
  setConversation: (id, scenario, messages) => set({
    conversationId: id,
    scenario,
    messages,
    error: null,
  }),
  
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message],
  })),
  
  updateMessage: (id, updates) => set((state) => ({
    messages: state.messages.map((m) =>
      m.id === id ? { ...m, ...updates } : m
    ),
  })),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setSending: (sending) => set({ isSending: sending }),
  
  setError: (error) => set({ error }),
  
  setRecording: (recording) => set({ isRecording: recording }),
  
  reset: () => set(initialState),
}));