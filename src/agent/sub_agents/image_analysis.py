from google.adk.agents import LlmAgent

from ..model import sub_agent_model
from ..prompt import return_image_analysis_instruction

image_agent = LlmAgent(
    name="ImageAnalyzerAgent",
    description=(
        "Analyzes medical images and provides findings. Use this when the input "
        "contains a medical image (X-ray, MRI, etc.)."
    ),
    instruction=return_image_analysis_instruction(),
    model=sub_agent_model,
)
