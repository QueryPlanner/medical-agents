import { useEffect, useState, useCallback } from 'react';
import { useDirectorStore } from '@/stores/useDirectorStore';

export function useMockScript() {
  const store = useDirectorStore();
  const [isPlaying, setIsPlaying] = useState(false);

  const runScript = useCallback(async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    store.resetScene();

    // --- 0:00 Intro ---
    store.addLog('System', 'Initializing Secure Enclave...', 'info');
    await new Promise(r => setTimeout(r, 500));
    store.addLog('System', 'Connected to EHR (Epic via FHIR)', 'success');
    await new Promise(r => setTimeout(r, 500));
    
    // --- 0:10 Ingestion ---
    store.setSpeaker('MedicalRouter', "Analyzing clinical encounter stream. Detecting key symptoms...");
    store.setProcessing(true);
    store.addLog('MedicalRouter', 'Ingesting audio stream...', 'info');

    // Simulate Transcript Streaming
    const transcriptText = "Patient is a 45-year-old male presenting with severe throbbing headache on the right side. Reports seeing flashing lights and zig-zag lines before the pain started. Nausea is present. No history of trauma. Current pain level 8/10. Light sensitivity noted.";
    const chunks = transcriptText.split(" ");
    let currentTranscript = "";
    
    for (const chunk of chunks) {
        currentTranscript += chunk + " ";
        store.updateTranscript(currentTranscript);
        await new Promise(r => setTimeout(r, 100)); // Fast typing
    }
    store.addLog('MedicalRouter', 'Transcription Complete. Confidence: 99.2%', 'success');
    
    await new Promise(r => setTimeout(r, 1000));

    // --- 0:25 Drafting ---
    store.setProcessing(false);
    store.enterStage('SOAPGenerator');
    store.setSpeaker('SOAPGenerator', "Drafting subjective notes based on transcript.");
    store.addLog('SOAPGenerator', 'Mapping entities to SNOMED-CT...', 'info');
    
    // Simulate SOAP Typing
    await new Promise(r => setTimeout(r, 500));
    store.updateSoapSection('subjective', "Patient reports severe right-sided throbbing headache (8/10).");
    await new Promise(r => setTimeout(r, 800));
    store.updateSoapSection('subjective', "Patient reports severe right-sided throbbing headache (8/10). Associated with visual aura (flashing lights) and nausea.");
    await new Promise(r => setTimeout(r, 800));
    store.updateSoapSection('subjective', "Patient reports severe right-sided throbbing headache (8/10). Associated with visual aura (flashing lights) and nausea. Photophobia present. No trauma.");
    
    store.addLog('SOAPGenerator', 'Draft saved to temp cache.', 'success');
    await new Promise(r => setTimeout(r, 1500));

    // --- 0:40 The Catch (Smart Interruption) ---
    store.enterStage('ICD10Agent');
    store.addLog('ICD10Agent', 'AUDIT ALERT: Specificity Mismatch', 'alert');
    store.setSpeaker('ICD10Agent', "Correction needed. Patient described 'flashing lights' and 'zig-zag lines'. This is Migraine with Aura, not generic Headache.");
    
    store.addLog('ICD10Agent', 'Re-evaluating R51.9 -> G43.109', 'info');
    await new Promise(r => setTimeout(r, 1000));
    store.updateSoapSection('assessment', "Primary: Migraine with Aura, intractable (G43.109).");
    store.addLog('ICD10Agent', 'Code validated against LCD policies.', 'success');
    
    await new Promise(r => setTimeout(r, 3000));

    // --- 0:55 Multimodal ---
    store.setSpeaker('MedicalRouter', "Processing supplemental data. X-Ray image detected.");
    store.addLog('MedicalRouter', 'Receiving DICOM stream...', 'info');
    
    await new Promise(r => setTimeout(r, 1000));
    store.setXRayActive(true); // Show Overlay
    store.addLog('ImageAnalyzer', 'Analyzing distal radius...', 'info');
    
    await new Promise(r => setTimeout(r, 1500));
    store.addLog('ImageAnalyzer', 'FRACTURE DETECTED (98%)', 'alert');
    store.updateSoapSection('objective', "X-Ray Left Hand: Distal radius fracture confirmed.");
    store.updateSoapSection('plan', "1. Splint application.\n2. Orthopedic referral.\n3. Pain management.");
    
    await new Promise(r => setTimeout(r, 4000));
    store.setXRayActive(false);

    // --- 1:15 Outro ---
    store.setSpeaker('MedicalRouter', "Encounter documentation complete. Ready for physician review.");
    store.addLog('System', 'Finalizing chart...', 'success');
    store.addLog('System', 'Pushing to EHR...', 'success');
    
    await new Promise(r => setTimeout(r, 2000));
    store.setImpactScoreboardActive(true);
    
    setIsPlaying(false);

  }, [isPlaying, store]);

  // Keyboard Shortcut
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