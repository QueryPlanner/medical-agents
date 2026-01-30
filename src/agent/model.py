"""Model configuration for the agents."""

import logging
import os
from collections.abc import AsyncGenerator
from typing import Any

from google.adk.models import LiteLlm
from google.adk.models.llm_request import LlmRequest
from google.adk.models.llm_response import LlmResponse

from agent.utils.config import ServerEnv, initialize_environment

logger = logging.getLogger(__name__)

# Initialize environment to get model configuration
# We set print_config=False because it might be printed by server.py as well
env = initialize_environment(ServerEnv, print_config=False)


class ThinkingLiteLlm(LiteLlm):
    """Custom LiteLlm that strips thinking tags from the response."""

    async def generate_content_async(
        self, llm_request: LlmRequest, stream: bool = False
    ) -> AsyncGenerator[LlmResponse]:
        in_thought_block = False

        async for response in super().generate_content_async(llm_request, stream):
            if not response.content or not response.content.parts:
                yield response
                continue

            new_parts = []
            for part in response.content.parts:
                if not part.text:
                    new_parts.append(part)
                    continue

                text = part.text

                # Check for start tag
                if "<unused94>thought" in text:
                    in_thought_block = True
                    # Keep everything before the tag
                    pre, post = text.split("<unused94>thought", 1)
                    text = pre
                    # If start and end are in same chunk:
                    if "<unused95>" in post:
                        _, after = post.split("<unused95>", 1)
                        text += after
                        in_thought_block = False

                elif in_thought_block:
                    if "<unused95>" in text:
                        _, after = text.split("<unused95>", 1)
                        text = after
                        in_thought_block = False
                    else:
                        text = ""  # Suppress content inside thought

                # Update part text
                if text:
                    part.text = text
                    new_parts.append(part)

            response.content.parts = new_parts
            if response.content.parts or not stream:
                yield response


def create_model(model_name: str, model_provider: str) -> Any:
    """Helper to create a model instance based on provider and name."""
    logger.info(f"Configuring model '{model_name}' with provider: {model_provider}")

    if model_provider == "LOCAL":
        if not env.local_model_base_url or not env.local_model_name:
            logger.error(
                "LOCAL provider selected but LOCAL_MODEL_BASE_URL or "
                "LOCAL_MODEL_NAME is missing."
            )
            return model_name

        api_base = env.local_model_base_url
        if not api_base.endswith("/v1"):
            api_base = f"{api_base}/v1"

        return ThinkingLiteLlm(
            model=f"openai/{env.local_model_name}",
            api_base=api_base,
            api_key="sk-no-key-required",
        )  # type: ignore

    elif (
        model_provider == "OPENROUTER"
        or model_name.lower().startswith("openrouter/")
        or "/" in model_name
    ):
        return LiteLlm(model=model_name)

    else:
        # GOOGLE or default
        return model_name


# Define models for different agent types
router_model_name = os.getenv(
    "ROUTER_MODEL", os.getenv("ROOT_AGENT_MODEL", "gemini-2.5-flash")
)
sub_agent_model_name = os.getenv("SUB_AGENT_MODEL", "gemini-2.5-flash")

router_model = create_model(router_model_name, env.model_provider)
sub_agent_model = create_model(sub_agent_model_name, "LOCAL")

# Export 'model' for backward compatibility (defaults to router_model)
model = router_model
