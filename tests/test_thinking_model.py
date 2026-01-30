import sys
from pathlib import Path
from typing import Any
from unittest.mock import MagicMock, patch

import pytest

# Add src to path
sys.path.insert(0, str(Path("src").resolve()))

# Mock google.adk.models and its dependencies before importing agent.model
# We need to ensure ThinkingLiteLlm can be defined even if real ADK is not present
# or to control it. However, agent.model imports them.
# We will rely on the installed package but mock the generate_content_async of the
# parent.

from google.adk.models.llm_response import LlmResponse
from google.genai.types import Content, Part

from agent.model import ThinkingLiteLlm


@pytest.mark.asyncio
async def test_thinking_litellm_strips_tags() -> None:
    # Mock the parent generate_content_async
    # We can't easily mock super() calls, but we can rely on the fact that
    # ThinkingLiteLlm inherits from LiteLlm.
    # We will mock the LiteLlm.generate_content_async by patching the class method
    # on the PARENT?
    # No, we can just mock the 'super().generate_content_async' behavior?
    # Python's super() is bound at runtime.

    # Alternatively, we can subclass ThinkingLiteLlm for testing and override the
    # parent call, but that changes the class under test.

    # Better: Use patch on google.adk.models.LiteLlm.generate_content_async

    with patch("google.adk.models.LiteLlm.generate_content_async") as mock_super_gen:
        # Define what the parent yields
        async def async_gen(*args: Any, **kwargs: Any) -> Any:
            # 1. Thought start
            yield LlmResponse(
                content=Content(
                    parts=[Part(text="Here is <unused94>thought some thinking")]
                )
            )
            # 2. Thought continuation
            yield LlmResponse(content=Content(parts=[Part(text=" process... ")]))
            # 3. Thought end
            yield LlmResponse(
                content=Content(
                    parts=[Part(text="still thinking <unused95> and result.")]
                )
            )
            # 4. Clean text
            yield LlmResponse(content=Content(parts=[Part(text=" Final Answer.")]))

        mock_super_gen.side_effect = async_gen

        model = ThinkingLiteLlm(model="test")
        request = MagicMock()
        request = MagicMock()

        results = []
        async for response in model.generate_content_async(request, stream=True):
            if response.content and response.content.parts:
                for part in response.content.parts:
                    if part.text:
                        results.append(part.text)

        full_text = "".join(results)
        expected = "Here is  and result. Final Answer."
        assert full_text == expected


@pytest.mark.asyncio
async def test_thinking_litellm_full_block() -> None:
    with patch("google.adk.models.LiteLlm.generate_content_async") as mock_super_gen:

        async def async_gen(*args: Any, **kwargs: Any) -> Any:
            yield LlmResponse(
                content=Content(
                    parts=[Part(text="<unused94>thought think <unused95>Result")]
                )
            )

        mock_super_gen.side_effect = async_gen

        model = ThinkingLiteLlm(model="test")
        results = []
        async for response in model.generate_content_async(MagicMock(), stream=True):
            if response.content and response.content.parts:
                results.append(response.content.parts[0].text or "")

        assert "".join(results) == "Result"
