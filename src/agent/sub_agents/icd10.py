from google.adk.agents import LlmAgent

from ..model import sub_agent_model
from ..prompt import return_icd10_instruction

icd10_agent = LlmAgent(
    name="ICD10Agent",
    description=(
        "Extracts ICD-10 codes from clinical notes. Use this for processing "
        "clinical notes to find diagnosis codes."
    ),
    instruction=return_icd10_instruction(),
    model=sub_agent_model,
)
