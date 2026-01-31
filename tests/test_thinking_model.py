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

from google.genai.types import Content, Part, Blob



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



    with patch("google.adk.models.lite_llm.LiteLlm.generate_content_async") as mock_super_gen:

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

    with patch("google.adk.models.lite_llm.LiteLlm.generate_content_async") as mock_super_gen:



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





@pytest.mark.asyncio

async def test_thinking_litellm_no_content_or_parts() -> None:

    """Test handling of responses with no content or parts."""

    with patch("google.adk.models.lite_llm.LiteLlm.generate_content_async") as mock_super_gen:

        empty_response = LlmResponse(content=None)

        no_parts_response = LlmResponse(content=Content(parts=[]))

        

        async def async_gen(*args: Any, **kwargs: Any) -> Any:

            yield empty_response

            yield no_parts_response



        mock_super_gen.side_effect = async_gen



        model = ThinkingLiteLlm(model="test")

        responses = []

        async for response in model.generate_content_async(MagicMock(), stream=True):

            responses.append(response)



        assert len(responses) == 2

        assert responses[0] == empty_response

        assert responses[1] == no_parts_response





@pytest.mark.asyncio

async def test_thinking_litellm_non_text_parts() -> None:

    """Test that parts without text (e.g. images) are preserved."""

    with patch("google.adk.models.lite_llm.LiteLlm.generate_content_async") as mock_super_gen:

        # Part with no text (e.g. image)

        image_part = Part(

            text=None, 

            inline_data=Blob(data=b"fakeimage", mime_type="image/png")

        )

        text_part = Part(text="Hello")

        

        async def async_gen(*args: Any, **kwargs: Any) -> Any:

            yield LlmResponse(content=Content(parts=[image_part, text_part]))



        mock_super_gen.side_effect = async_gen



        model = ThinkingLiteLlm(model="test")

        responses = []

        async for response in model.generate_content_async(MagicMock(), stream=True):

            responses.append(response)



        assert len(responses) == 1

        parts = responses[0].content.parts

        assert len(parts) == 2

        assert parts[0] == image_part

        assert parts[1].text == "Hello"


