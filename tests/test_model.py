"""Tests for model configuration."""

import importlib
import os
import sys
from unittest.mock import MagicMock, patch

import pytest

from agent.utils.config import ServerEnv





@pytest.fixture





def mock_env():





    """Fixture to mock initialize_environment and load_dotenv."""





    with (





        patch("agent.model.initialize_environment") as mock_init,





        patch("agent.utils.config.load_dotenv") as mock_load,





    ):





        env = MagicMock(spec=ServerEnv)





        env.model_provider = "GOOGLE"





        env.local_model_base_url = None





        env.local_model_name = None





        mock_init.return_value = env





        yield env











def test_model_selection_default(mock_env) -> None:

    """Test default model selection."""

    with patch.dict(os.environ, {}, clear=True):

        if "agent.model" in sys.modules:

            module = importlib.reload(sys.modules["agent.model"])

        else:

            import agent.model

            module = agent.model



        assert module.router_model == "gemini-2.5-flash"

        assert module.sub_agent_model == "gemini-2.5-flash"





def test_model_selection_litellm(mock_env) -> None:

    """Test LiteLlm selection for openrouter models."""

    mock_litellm_class = MagicMock()

    mock_env.model_provider = "OPENROUTER"



    # We need to mock the module google.adk.models so it has LiteLlm

    mock_adk_models = MagicMock()

    mock_adk_models.LiteLlm = mock_litellm_class



    with (

        patch.dict(os.environ, {"ROUTER_MODEL": "openrouter/gpt-4"}),

        patch.dict(sys.modules, {"google.adk.models": mock_adk_models}),

    ):

        if "agent.model" in sys.modules:

            module = importlib.reload(sys.modules["agent.model"])

        else:

            import agent.model

            module = agent.model



        mock_litellm_class.assert_any_call(model="openrouter/gpt-4")

        assert module.router_model == mock_litellm_class.return_value





def test_model_selection_litellm_import_error(mock_env, caplog: pytest.LogCaptureFixture) -> None:

    """Test fallback when LiteLlm import fails."""

    mock_env.model_provider = "OPENROUTER"



    with patch.dict(

        os.environ, {"ROUTER_MODEL": "openrouter/gpt-4"}

    ), patch.dict(sys.modules):

        # Remove valid module if exists

        sys.modules.pop("google.adk.models", None)



        # Mock the module in sys.modules such that it does NOT have LiteLlm

        mock_models = MagicMock(spec=[])  # Empty spec



        with patch.dict(sys.modules, {"google.adk.models": mock_models}):

            if "agent.model" in sys.modules:

                module = importlib.reload(sys.modules["agent.model"])

            else:

                import agent.model

                module = agent.model



            # Check that we logged the warning

            assert "LiteLlm not available" in caplog.text

            # And model fell back to string

            assert module.router_model == "openrouter/gpt-4"
