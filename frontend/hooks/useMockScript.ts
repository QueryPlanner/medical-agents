import { useEffect, useState, useCallback } from 'react';
import { useDirectorStore } from '@/stores/useDirectorStore';

export function useMockScript() {
  const { setSpeaker, enterStage, exitStage, setProcessing, resetScene } = useDirectorStore();
  const [isPlaying, setIsPlaying] = useState(false);

  const runScript = useCallback(async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    resetScene();

    // Step 1: User "Record" (Simulated)
    setProcessing(true);
    await new Promise(r => setTimeout(r, 800)); // Network delay simulation

    // Step 2: Router Appears
    // enterStage('MedicalRouter'); // Already there by default
    setSpeaker('MedicalRouter', "Listening to clinical encounter... Analysis protocol initiated.");
    setProcessing(true); // Keep processing for next step
    
    await new Promise(r => setTimeout(r, 2500));

    // Step 3: SOAP Agent Enters
    setProcessing(false); // Brief pause
    enterStage('SOAPGenerator');
    await new Promise(r => setTimeout(r, 500)); // Slide in time
    setSpeaker('SOAPGenerator', "I've drafted the subjective notes. The patient reports persistent headaches, photophobia, and nausea starting 2 days ago.");
    
    await new Promise(r => setTimeout(r, 5000)); // Read time

    // Step 4: ICD-10 Agent Interrupts
    enterStage('ICD10Agent');
    await new Promise(r => setTimeout(r, 500));
    setSpeaker('ICD10Agent', "Noted. Mapping symptoms to R51.9 (Headache, unspecified) and H53.14 (Photophobia). Cross-referencing history...");
    
    await new Promise(r => setTimeout(r, 4000));
    
    setSpeaker('MedicalRouter', "Awaiting physician confirmation. Please review the generated chart.");
    setIsPlaying(false);

  }, [isPlaying, setSpeaker, enterStage, setProcessing, resetScene]);

  // Keyboard Shortcut for Demo Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'd') {
        console.log("Demo Mode Triggered");
        runScript();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [runScript]);

  return { runScript, isPlaying };
}
