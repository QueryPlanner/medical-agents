import { create } from 'zustand';

export type AgentId = 'MedicalRouter' | 'SOAPGenerator' | 'ICD10Agent' | 'ImageAnalyzer' | 'User' | 'System';

export interface LogEntry {
  id: string;
  agent: AgentId;
  message: string;
  timestamp: string;
  type: 'info' | 'alert' | 'success';
}

export interface SoapNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

interface DirectorState {
  // --- Stage State ---
  currentSpeaker: AgentId | null;
  dialogueText: string;
  visibleAgents: AgentId[];
  isProcessing: boolean;
  
  // --- Terminal State ---
  transcript: string;
  soapNote: SoapNote;
  logs: LogEntry[];
  
  // --- Overlay State ---
  xrayActive: boolean;
  impactScoreboardActive: boolean;

  // --- Actions ---
  setSpeaker: (agentId: AgentId, text: string) => void;
  setProcessing: (isProcessing: boolean) => void;
  enterStage: (agentId: AgentId) => void;
  exitStage: (agentId: AgentId) => void;
  
  updateTranscript: (text: string) => void;
  updateSoapSection: (section: keyof SoapNote, text: string) => void;
  addLog: (agent: AgentId, message: string, type?: 'info' | 'alert' | 'success') => void;
  setXRayActive: (active: boolean) => void;
  setImpactScoreboardActive: (active: boolean) => void;
  
  resetScene: () => void;
}

export const useDirectorStore = create<DirectorState>((set) => ({
  // Initial State
  currentSpeaker: null,
  dialogueText: "",
  visibleAgents: ['MedicalRouter'],
  isProcessing: false,
  
  transcript: "",
  soapNote: { subjective: "", objective: "", assessment: "", plan: "" },
  logs: [],
  xrayActive: false,
  impactScoreboardActive: false,

  // Actions
  setSpeaker: (agentId, text) => set({ 
    currentSpeaker: agentId, 
    dialogueText: text,
    isProcessing: false 
  }),
  
  setProcessing: (status) => set({ isProcessing: status }),
  
  enterStage: (agentId) => set((state) => ({ 
    visibleAgents: Array.from(new Set([...state.visibleAgents, agentId])) 
  })),
  
  exitStage: (agentId) => set((state) => ({ 
    visibleAgents: state.visibleAgents.filter(id => id !== agentId) 
  })),

  updateTranscript: (text) => set({ transcript: text }),
  
  updateSoapSection: (section, text) => set((state) => ({
    soapNote: { ...state.soapNote, [section]: text }
  })),

  addLog: (agent, message, type = 'info') => set((state) => ({
    logs: [...state.logs, { 
      id: Math.random().toString(36).substr(2, 9), 
      agent, 
      message, 
      timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      type 
    }].slice(-20) // Keep last 20 logs
  })),

  setXRayActive: (active) => set({ xrayActive: active }),
  setImpactScoreboardActive: (active) => set({ impactScoreboardActive: active }),

  resetScene: () => set({
    currentSpeaker: 'MedicalRouter',
    dialogueText: "System initialized. Ready for clinical encounter.",
    visibleAgents: ['MedicalRouter'],
    isProcessing: false,
    transcript: "",
    soapNote: { subjective: "", objective: "", assessment: "", plan: "" },
    logs: [],
    xrayActive: false,
    impactScoreboardActive: false
  })
}));