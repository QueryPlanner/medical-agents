import { useEffect, useState, useCallback } from 'react';
import { useDirectorStore } from '@/stores/useDirectorStore';

// Input Data
const COUGH_TRANSCRIPT = `Physician: Good morning, Ms. Johnson. What brings you in today?
Patient: Morning, doctor. I’ve been having this persistent cough for the last two weeks. It started out dry, but now there’s some phlegm.
Physician: I see. Any fever or chills?
Patient: Yes, I had a mild fever three days ago, around 100.5°F, but it went away on its own.
Physician: Any shortness of breath or chest pain?
Patient: Not really chest pain, but my chest feels a bit tight, especially when I’m coughing a lot.
Physician: How about your energy levels or appetite?
Patient: I’ve been more tired than usual, and I haven’t had much of an appetite.
Physician: Any recent travel or contact with anyone who’s been sick?
Patient: No travel, but my son had a cold last week.
Physician: Okay. Let’s take a listen to your lungs.
[Stethoscope exam sounds]
Physician: I’m hearing some mild crackles in your lower lungs. No wheezing, which is good. I’ll check your oxygen level—98%, that’s normal.
Physician: I’d likeo rule out pneumonia, and we’ll also do a CBC and test for respiratory viruses. In the meantime, I’ll prescribe an inhaler to help with the chest tightness, and a cough suppressant so you can rest.
Patient: Sounds good. Should I stay home from work?
Physician: Yes, for at least a couple of days until the results come in and you’re feeling better. Stay hydrated, and rest as much as you can.
Patient: Will do. Thanks, doctor.
Physician: You’re welcome. We’ll follow up as soon as we have the test results.`;

const APPENDICITIS_NOTE = `Chief Complaint:
The patient presents with abdominal pain localized to the lower right quadrant, nausea, and low-grade fever for the past 24 hours.

History & Symptoms:
- Pain began near the umbilicus and migrated to the lower right abdomen
- Mild nausea, no vomiting
- Pain increases with movement or coughing
- Temperature: 38.1°C (100.6°F)

Physical Exam:
- Rebound tenderness in the right lower quadrant
- Positive Rovsing’s sign
- No palpable masses

Diagnosis:
- Acute uncomplicated appendicitis

Plan:
- Schedule for laparoscopic appendectomy
- Start IV fluids and antibiotics pre-op`;

// Absolute path for the backend to read
const SKULL_XRAY_PATH = "/Users/lordpatil-air/Projects/medical-agents/frontend/public/x-ray-skull-from-right-side.jpg";


export function useAgentWorkflow() {
  const store = useDirectorStore();
  const [isPlaying, setIsPlaying] = useState(false);

  const callAgent = async (prompt: string) => {
    try {
      const sessionId = `session-${new Date().getTime()}`;
      const userId = "demo-user";
      const appName = "agent";

      // 1. Create Session
      const createResponse = await fetch(`/api/agent/apps/${appName}/users/${userId}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });

      if (!createResponse.ok) {
        throw new Error(`Session Creation Failed: ${createResponse.statusText}`);
      }

      // 2. Run Agent
      const response = await fetch('/api/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appName,
          userId,
          sessionId,
          newMessage: {
            parts: [{ text: prompt }],
            role: "user"
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const events = await response.json();
      console.log("Agent Events:", events);

      // Find the last event with text content from the agent
      // The ADK returns a list of events. We want the final text response.
      // We look for events where author is NOT 'user' (though usually response only contains new events)
      // and has content.parts with text.
      
      let finalResponse = "";
      
      if (Array.isArray(events)) {
          for (const event of events) {
              if (event.content && event.content.parts) {
                  for (const part of event.content.parts) {
                      if (part.text) {
                          finalResponse = part.text; // Keep updating to get the last one
                      }
                  }
              }
          }
      }

      return finalResponse || "No response text found.";

    } catch (error) {
      console.error("Agent Call Failed:", error);
      store.addLog('System', `API Call Failed: ${error}`, 'alert');
      return null;
    }
  };

  const runWorkflow = useCallback(async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    store.resetScene();

    // --- 1. INTRO ---
    store.addLog('System', 'Connected to Medical Agent Network', 'success');
    await new Promise(r => setTimeout(r, 1000));
    
    // --- 2. CASE 1: RESPIRATORY (Transcript -> SOAP) ---
    store.setSpeaker('MedicalRouter', "Case #1042: Respiratory Consult. Ingesting transcript...");
    store.setProcessing(true);
    store.enterStage('SOAPGenerator');
    
    // Stream Transcript
    const chunks = COUGH_TRANSCRIPT.split(" ");
    let currentTranscript = "";
    for (let i = 0; i < chunks.length; i++) {
        currentTranscript += chunks[i] + " ";
        if (i % 3 === 0) { // Update every 3 words for speed
             store.updateTranscript(currentTranscript);
             await new Promise(r => setTimeout(r, 20)); 
        }
    }
    store.updateTranscript(COUGH_TRANSCRIPT);
    store.addLog('MedicalRouter', 'Transcript ingested.', 'info');

    // Call Agent
    store.setSpeaker('SOAPGenerator', "Analyzing dialogue. Constructing SOAP note...");
    store.addLog('SOAPGenerator', 'Generating SOAP components...', 'info');
    
    const soapResponse = await callAgent(`Create a SOAP note for this transcript:\n\n${COUGH_TRANSCRIPT}`);
    
    if (soapResponse) {
        // Simple parsing heuristics or just dump it if unstructured
        // Assuming the agent returns a formatted string.
        store.updateSoapSection('subjective', soapResponse); // Put it all in subjective/assessment for now or parse
        store.addLog('SOAPGenerator', 'SOAP Note Generated.', 'success');
        
        // Try to parse sections if labelled
        if (soapResponse.includes("Subjective:")) {
             // A rudimentary parse could go here, but for demo, putting it in one or splitting by newline is okay.
             // Let's just put the whole thing in Assessment to ensure visibility if parsing fails
             store.updateSoapSection('assessment', soapResponse);
        } else {
             store.updateSoapSection('assessment', soapResponse);
        }
    }

    await new Promise(r => setTimeout(r, 2000));
    store.exitStage('SOAPGenerator');

    // --- 3. CASE 2: ABDOMINAL (Note -> ICD10) ---
    store.setSpeaker('MedicalRouter', "Case #1043: Acute Abdomen. Processing referral note...");
    store.enterStage('ICD10Agent');
    store.updateTranscript(APPENDICITIS_NOTE); // Replace transcript with the note for visibility
    
    store.setSpeaker('ICD10Agent', "Extracting billing codes...");
    store.addLog('ICD10Agent', 'Scanning against ICD-10-CM...', 'info');

    const icdResponse = await callAgent(`Extract ICD-10 codes for this clinical note:\n\n${APPENDICITIS_NOTE}`);
    
    if (icdResponse) {
        store.addLog('ICD10Agent', `Codes Found: ${icdResponse.slice(0, 50)}...`, 'success');
        store.updateSoapSection('plan', `ICD-10 CODES:\n${icdResponse}`);
    }

    await new Promise(r => setTimeout(r, 2000));
    store.exitStage('ICD10Agent');

    // --- 4. CASE 3: TRAUMA (Image -> Analysis) ---
    store.setSpeaker('MedicalRouter', "Case #1044: Trauma Imaging. Analyzing Series...");
    store.enterStage('ImageAnalyzer');
    
    store.setXRayActive(true); // This activates the overlay which currently shows a hand. We might need to change the image source if possible.
    // NOTE: XRayOverlay might be hardcoded to the hand image in the component. 
    // I should check `XRayOverlay.tsx` later to see if I can pass a prop or store value.
    
    store.addLog('ImageAnalyzer', 'Reading DICOM data...', 'info');
    
    // We send the path to the agent
    const imageResponse = await callAgent(`Analyze this medical image: ${SKULL_XRAY_PATH}`);
    
    if (imageResponse) {
        store.addLog('ImageAnalyzer', 'Analysis Complete', 'success');
        store.setSpeaker('ImageAnalyzer', `Findings: ${imageResponse.slice(0, 100)}...`);
        store.updateSoapSection('objective', `IMAGING REPORT:\n${imageResponse}`);
    }

    await new Promise(r => setTimeout(r, 3000));
    store.setXRayActive(false);
    store.exitStage('ImageAnalyzer');

    // --- OUTRO ---
    store.setSpeaker('MedicalRouter', "All active cases processed. Standing by.");
    store.setProcessing(false);
    // store.setImpactScoreboardActive(true); // Disabled for now
    
    setIsPlaying(false);

  }, [isPlaying, store]);

  // Keyboard Shortcut 'R' or 'D' for Real Workflow
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'r' || e.key.toLowerCase() === 'd') {
        console.log("Real Workflow Triggered");
        runWorkflow();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [runWorkflow]);

  return { runWorkflow, isPlaying };
}
