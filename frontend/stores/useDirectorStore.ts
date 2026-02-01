import { create } from 'zustand';

export type AgentId = 'MedicalRouter' | 'SOAPGenerator' | 'ICD10Agent' | 'ImageAnalyzer' | 'User';

interface DirectorState {
  // Who is currently speaking? (Controls the active sprite highlight)
  currentSpeaker: AgentId | null;
  
  // The text being typed out in the dialogue box
  dialogueText: string;
  
  // Which sprites are visible on stage?
  visibleAgents: AgentId[];
  
  // Is the system "thinking"? (Triggers loading pulse on sprites)
  isProcessing: boolean;

  // Actions
  setSpeaker: (agentId: AgentId, text: string) => void;
  setProcessing: (isProcessing: boolean) => void;
  enterStage: (agentId: AgentId) => void;
  exitStage: (agentId: AgentId) => void;
  resetScene: () => void;
}

export const useDirectorStore = create<DirectorState>((set) => ({
  currentSpeaker: null,
  dialogueText: "",
  visibleAgents: ['MedicalRouter'], // Router is usually always there
  isProcessing: false,

  setSpeaker: (agentId, text) => set({ 
    currentSpeaker: agentId, 
    dialogueText: text,
    isProcessing: false // Speaking stops the processing animation
  }),
  
  setProcessing: (status) => set({ isProcessing: status }),
  
  enterStage: (agentId) => set((state) => ({ 
    visibleAgents: [...state.visibleAgents, agentId] 
  })),
  
  exitStage: (agentId) => set((state) => ({ 
    visibleAgents: state.visibleAgents.filter(id => id !== agentId) 
  })),

  resetScene: () => set({
    currentSpeaker: 'MedicalRouter',
    dialogueText: "System initialized. Ready for clinical encounter.",
    visibleAgents: ['MedicalRouter'],
    isProcessing: false
  })
}));
