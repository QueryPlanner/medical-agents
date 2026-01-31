"""Unit tests for image artifact callbacks."""

import logging
from typing import Any, cast
from unittest.mock import AsyncMock, MagicMock

import pytest
from google.adk.agents.callback_context import CallbackContext
from google.adk.models.llm_request import LlmRequest

from agent.callbacks import load_image_artifact, save_image_to_artifact


# Mocks for data structures
class MockInlineData:
    def __init__(self, mime_type: str | None = None, data: bytes = b"") -> None:
        self.mime_type = mime_type
        self.data = data


class MockPart:
    def __init__(self, inline_data: MockInlineData | None = None, text: str | None = None) -> None:
        self.inline_data = inline_data
        self.text = text


class MockContent:
    def __init__(self, parts: list[MockPart] | None = None) -> None:
        self.parts = parts


class MockCallbackContext:
    def __init__(self, user_content: MockContent | None = None) -> None:
        self.user_content = user_content
        self.save_artifact = AsyncMock()
        self.load_artifact = AsyncMock()


class MockLlmRequest:
    def __init__(self, contents: list[MockContent] | None = None) -> None:
        self.contents = contents


def as_callback_context(context: Any) -> CallbackContext:
    """Cast to CallbackContext for typing."""
    return cast(CallbackContext, context)


class TestSaveImageToArtifact:
    """Tests for save_image_to_artifact callback."""

    @pytest.mark.asyncio
    async def test_save_image_success(self, caplog: pytest.LogCaptureFixture) -> None:
        """Test saving an image when present in user content."""
        caplog.set_level(logging.INFO)
        
        # Setup mock with image part
        image_part = MockPart(inline_data=MockInlineData(mime_type="image/jpeg"))
        text_part = MockPart(text="analyze this")
        content = MockContent(parts=[text_part, image_part])
        context = MockCallbackContext(user_content=content)

        # Execute
        await save_image_to_artifact(as_callback_context(context))

        # Verify artifact saved
        context.save_artifact.assert_called_once()
        call_args = context.save_artifact.call_args
        assert call_args.kwargs["filename"] == "user:current_medical_image"
        assert call_args.kwargs["artifact"] == image_part
        
        # Verify logging
        assert "Found image in user content" in caplog.text
        assert "Successfully saved artifact" in caplog.text

    @pytest.mark.asyncio
    async def test_no_image_in_content(self, caplog: pytest.LogCaptureFixture) -> None:
        """Test doing nothing when no image is present."""
        caplog.set_level(logging.INFO)
        
        # Setup mock with only text
        text_part = MockPart(text="hello")
        content = MockContent(parts=[text_part])
        context = MockCallbackContext(user_content=content)

        # Execute
        await save_image_to_artifact(as_callback_context(context))

        # Verify no save
        context.save_artifact.assert_not_called()

    @pytest.mark.asyncio
    async def test_no_parts(self) -> None:
        """Test doing nothing when content has no parts."""
        content = MockContent(parts=[])
        context = MockCallbackContext(user_content=content)
        await save_image_to_artifact(as_callback_context(context))
        context.save_artifact.assert_not_called()

    @pytest.mark.asyncio
    async def test_no_content(self) -> None:
        """Test doing nothing when content is None."""
        context = MockCallbackContext(user_content=None)
        await save_image_to_artifact(as_callback_context(context))
        context.save_artifact.assert_not_called()

    @pytest.mark.asyncio
    async def test_save_error(self, caplog: pytest.LogCaptureFixture) -> None:
        """Test handling error during save."""
        caplog.set_level(logging.ERROR)
        
        # Setup mock to raise exception
        image_part = MockPart(inline_data=MockInlineData(mime_type="image/png"))
        content = MockContent(parts=[image_part])
        context = MockCallbackContext(user_content=content)
        context.save_artifact.side_effect = Exception("Storage full")

        # Execute
        await save_image_to_artifact(as_callback_context(context))

        # Verify error logged
        assert "Failed to save image artifact: Storage full" in caplog.text


class TestLoadImageArtifact:
    """Tests for load_image_artifact callback."""

    @pytest.mark.asyncio
    async def test_load_image_success(self, caplog: pytest.LogCaptureFixture) -> None:
        """Test loading artifact and appending to request."""
        caplog.set_level(logging.INFO)
        
        # Setup mocks
        context = MockCallbackContext()
        artifact_part = MockPart(inline_data=MockInlineData(mime_type="image/jpeg"))
        context.load_artifact.return_value = artifact_part
        
        request_content = MockContent(parts=[MockPart(text="query")])
        request = MockLlmRequest(contents=[request_content])

        # Execute
        await load_image_artifact(as_callback_context(context), cast(LlmRequest, request))

        # Verify artifact loaded
        context.load_artifact.assert_called_once_with("user:current_medical_image")
        
        # Verify appended to request
        assert len(request.contents[0].parts) == 2
        assert request.contents[0].parts[1] == artifact_part
        
        # Verify logging
        assert "Found artifact" in caplog.text

    @pytest.mark.asyncio
    async def test_load_image_not_found(self, caplog: pytest.LogCaptureFixture) -> None:
        """Test handling missing artifact."""
        caplog.set_level(logging.DEBUG)
        
        context = MockCallbackContext()
        context.load_artifact.return_value = None
        
        request = MockLlmRequest(contents=[MockContent(parts=[])])

        # Execute
        await load_image_artifact(as_callback_context(context), cast(LlmRequest, request))

        # Verify check but no append
        context.load_artifact.assert_called_once()
        assert len(request.contents[0].parts) == 0

    @pytest.mark.asyncio
    async def test_load_error(self, caplog: pytest.LogCaptureFixture) -> None:
        """Test handling error during load."""
        caplog.set_level(logging.DEBUG)
        
        context = MockCallbackContext()
        context.load_artifact.side_effect = Exception("DB error")
        
        request = MockLlmRequest(contents=[])

        # Execute
        await load_image_artifact(as_callback_context(context), cast(LlmRequest, request))

        # Verify error logged
        assert "Could not load image artifact" in caplog.text
        assert "DB error" in caplog.text

    @pytest.mark.asyncio
    async def test_append_to_empty_parts(self) -> None:
        """Test appending when last message parts is None."""
        context = MockCallbackContext()
        artifact_part = MockPart()
        context.load_artifact.return_value = artifact_part
        
        # Content with None parts
        msg = MockContent(parts=None)
        request = MockLlmRequest(contents=[msg])

        await load_image_artifact(as_callback_context(context), cast(LlmRequest, request))

        # Verify parts list created and appended
        assert msg.parts is not None
        assert len(msg.parts) == 1
        assert msg.parts[0] == artifact_part
