"""Tests for model configuration."""

import importlib
import os
import sys
from collections.abc import Generator
from unittest.mock import MagicMock, patch

import pytest

from agent.utils.config import ServerEnv


@pytest.fixture
def mock_env() -> Generator[MagicMock]:
    """Fixture to mock initialize_environment and load_dotenv."""

    with (
        patch("agent.model.initialize_environment") as mock_init,
        patch("agent.utils.config.load_dotenv"),
    ):
        env = MagicMock(spec=ServerEnv)

        env.model_provider = "GOOGLE"

        env.local_model_base_url = None

        env.local_model_name = None

        mock_init.return_value = env

        yield env


def test_model_selection_default(mock_env: MagicMock) -> None:
    """Test default model selection."""

    with patch.dict(os.environ, {"AGENT_NAME": "test_agent"}, clear=True):
        if "agent.model" in sys.modules:
            module = importlib.reload(sys.modules["agent.model"])

        else:
            import agent.model

            module = agent.model

        assert module.router_model == "gemini-2.5-flash"

        assert module.sub_agent_model == "gemini-2.5-flash"


def test_model_selection_litellm(mock_env: MagicMock) -> None:
    """Test LiteLlm selection for openrouter models."""

    mock_litellm_class = MagicMock()

    mock_env.model_provider = "OPENROUTER"

    # We need to mock the module google.adk.models so it has LiteLlm

    mock_adk_models = MagicMock()

    mock_adk_models.LiteLlm = mock_litellm_class
    mock_adk_models.llm_request.LlmRequest = MagicMock()
    mock_adk_models.llm_response.LlmResponse = MagicMock()

    with (
        patch.dict(
            os.environ, {"ROUTER_MODEL": "openrouter/gpt-4", "AGENT_NAME": "test_agent"}
        ),
        patch.dict(sys.modules, {"google.adk.models": mock_adk_models}),
    ):
        if "agent.model" in sys.modules:
            module = importlib.reload(sys.modules["agent.model"])

        else:
            import agent.model

            module = agent.model

        mock_litellm_class.assert_any_call(model="openrouter/gpt-4")

        assert module.router_model == mock_litellm_class.return_value
