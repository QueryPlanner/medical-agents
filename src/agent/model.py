"""Model configuration for the agents."""

import logging
import os
from typing import Any

from src.agent.utils.config import initialize_environment, ServerEnv

logger = logging.getLogger(__name__)

# Initialize environment to get model configuration
# We set print_config=False because it might be printed by server.py as well
env = initialize_environment(ServerEnv, print_config=False)

def create_model(model_name: str, model_provider: str) -> Any:
    """Helper to create a model instance based on provider and name."""
    logger.info(f"Configuring model '{model_name}' with provider: {model_provider}")
    
    if model_provider == "LOCAL":
        try:
            from google.adk.models import LiteLlm
            
            if not env.local_model_base_url or not env.local_model_name:
                logger.error(
                    "LOCAL provider selected but LOCAL_MODEL_BASE_URL or LOCAL_MODEL_NAME is missing."
                )
                return model_name
            
            api_base = env.local_model_base_url
            if not api_base.endswith("/v1"):
                api_base = f"{api_base}/v1"

            return LiteLlm(
                model=f"openai/{env.local_model_name}",
                api_base=api_base,
                api_key="sk-no-key-required",
            )
        except ImportError:
            logger.error("LiteLlm not available, cannot use LOCAL provider.")
            return model_name

    elif model_provider == "OPENROUTER" or model_name.lower().startswith("openrouter/") or "/" in model_name:
        try:
            from google.adk.models import LiteLlm
            return LiteLlm(model=model_name)
        except ImportError:
            logger.warning("LiteLlm not available, falling back to string model name.")
            return model_name
    
    else:
        # GOOGLE or default
        return model_name

# Define models for different agent types
router_model_name = os.getenv("ROUTER_MODEL", os.getenv("ROOT_AGENT_MODEL", "gemini-2.5-flash"))
sub_agent_model_name = os.getenv("SUB_AGENT_MODEL", "gemini-2.5-flash")

router_model = create_model(router_model_name, "OPENROUTER")
sub_agent_model = create_model(sub_agent_model_name, "LOCAL")

# Export 'model' for backward compatibility (defaults to router_model)
model = router_model