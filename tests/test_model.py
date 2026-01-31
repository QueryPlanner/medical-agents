"""Tests for model configuration."""

import sys
from unittest.mock import MagicMock, patch

import pytest
from agent.model import create_model
from agent.utils.config import ServerEnv


class TestCreateModel:
    """Tests for create_model function."""

    @patch("agent.model.env")
    @patch("agent.model.ThinkingLiteLlm")
    def test_create_model_local(self, mock_thinking: MagicMock, mock_env: MagicMock) -> None:
        """Test create_model with LOCAL provider."""
        mock_env.local_model_base_url = "http://localhost:11434"
        mock_env.local_model_name = "llama3"
        
        create_model("llama3", "LOCAL")
        
        mock_thinking.assert_called_once()
        call_kwargs = mock_thinking.call_args.kwargs
        assert call_kwargs["model"] == "openai/llama3"
        assert call_kwargs["api_base"] == "http://localhost:11434/v1"

    @patch("agent.model.env")
    @patch("agent.model.ThinkingLiteLlm")
    def test_create_model_local_with_v1(self, mock_thinking: MagicMock, mock_env: MagicMock) -> None:
        """Test create_model with LOCAL provider where base_url ends with /v1."""
        mock_env.local_model_base_url = "http://localhost:11434/v1"
        mock_env.local_model_name = "llama3"
        
        create_model("llama3", "LOCAL")
        
        mock_thinking.assert_called_once()
        call_kwargs = mock_thinking.call_args.kwargs
        assert call_kwargs["api_base"] == "http://localhost:11434/v1"

    @patch("agent.model.env")
    def test_create_model_local_missing_config(self, mock_env: MagicMock) -> None:
        """Test create_model with LOCAL provider but missing config."""
        mock_env.local_model_base_url = None
        
        result = create_model("llama3", "LOCAL")
        assert result == "llama3"

    @patch("agent.model.LiteLlm")
    def test_create_model_openrouter_provider(self, mock_litellm: MagicMock) -> None:
        """Test create_model with OPENROUTER provider."""
        create_model("gpt-4", "OPENROUTER")
        mock_litellm.assert_called_with(model="gpt-4")

    @patch("agent.model.LiteLlm")
    def test_create_model_openrouter_prefix(self, mock_litellm: MagicMock) -> None:
        """Test create_model with openrouter/ prefix."""
        create_model("openrouter/gpt-4", "GOOGLE")
        mock_litellm.assert_called_with(model="openrouter/gpt-4")

    @patch("agent.model.LiteLlm")
    def test_create_model_slash_in_name(self, mock_litellm: MagicMock) -> None:
        """Test create_model with slash in name."""
        create_model("anthropic/claude-3", "GOOGLE")
        mock_litellm.assert_called_with(model="anthropic/claude-3")

    def test_create_model_default(self) -> None:
        """Test create_model default (GOOGLE)."""
        result = create_model("gemini-1.5-pro", "GOOGLE")
        assert result == "gemini-1.5-pro"