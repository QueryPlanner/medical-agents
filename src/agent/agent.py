"""ADK LlmAgent configuration."""

import logging

from google.adk.agents import LlmAgent
from google.adk.apps import App
from google.adk.plugins.global_instruction_plugin import GlobalInstructionPlugin
from google.adk.plugins.logging_plugin import LoggingPlugin
from google.adk.tools import AgentTool

from .callbacks import LoggingCallbacks, add_session_to_memory, save_image_to_artifact
from .model import router_model
from .prompt import (
    return_description_root,
    return_global_instruction,
    return_instruction_root,
)
from .sub_agents.icd10 import icd10_agent
from .sub_agents.image_analysis import image_agent
from .sub_agents.soap import soap_agent

logger = logging.getLogger(__name__)

logging_callbacks = LoggingCallbacks()

root_agent = LlmAgent(
    name="MedicalRouter",
    description=return_description_root(),
    before_agent_callback=[logging_callbacks.before_agent, save_image_to_artifact],
    after_agent_callback=[logging_callbacks.after_agent, add_session_to_memory],
    model=router_model,
    instruction=return_instruction_root(),
    tools=[
        # PreloadMemoryTool(),
        AgentTool(icd10_agent),
        AgentTool(soap_agent),
        AgentTool(image_agent),
    ],
    before_model_callback=logging_callbacks.before_model,
    after_model_callback=logging_callbacks.after_model,
    before_tool_callback=logging_callbacks.before_tool,
    after_tool_callback=logging_callbacks.after_tool,
)

# Optional App configs explicitly set to None for template documentation
app = App(
    name="agent",
    root_agent=root_agent,
    plugins=[
        GlobalInstructionPlugin(return_global_instruction),
        LoggingPlugin(),
    ],
    events_compaction_config=None,
    context_cache_config=None,
    resumability_config=None,
)
