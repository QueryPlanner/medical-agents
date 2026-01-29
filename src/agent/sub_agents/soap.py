from google.adk.agents import LlmAgent

from ..model import sub_agent_model
from ..prompt import return_soap_instruction

soap_agent = LlmAgent(
    name="SOAPGeneratorAgent",
    description=(
        "Generates SOAP notes from clinical transcripts. Use this when the "
        "input is a dialogue or transcript."
    ),
    instruction=return_soap_instruction(),
    model=sub_agent_model,
)
