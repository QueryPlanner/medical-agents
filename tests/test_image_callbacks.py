"""Unit tests for image artifact callbacks."""

import logging
from pathlib import Path
from typing import Any, cast
from unittest.mock import AsyncMock, patch

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
    def __init__(
        self, inline_data: MockInlineData | None = None, text: str | None = None
    ) -> None:
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


class TestLocalFileLoading:
    """Tests for local file loading logic in save_image_to_artifact."""

    @pytest.mark.asyncio
    async def test_local_file_load_success(
        self, caplog: pytest.LogCaptureFixture, tmp_path: Path
    ) -> None:
        """Test successfully loading a local image file."""
        caplog.set_level(logging.INFO)

        # Create a dummy image file in a temp directory
        # We need to trick the security check (is_relative_to Path.cwd())
        # So we patch Path.cwd() to return the tmp_path
        image_file = tmp_path / "test_image.jpg"
        image_file.write_bytes(b"fake image data")

        text_part = MockPart(text=f"Analyze this image: {image_file}")
        content = MockContent(parts=[text_part])
        context = MockCallbackContext(user_content=content)

        with patch("agent.callbacks.Path.cwd", return_value=tmp_path):
            await save_image_to_artifact(as_callback_context(context))

        # Verify artifact saved
        context.save_artifact.assert_called_once()
        call_args = context.save_artifact.call_args
        assert call_args.kwargs["filename"] == "user:current_medical_image"
        # Check artifact content
        saved_artifact = call_args.kwargs["artifact"]
        assert saved_artifact.inline_data.data == b"fake image data"
        assert saved_artifact.inline_data.mime_type == "image/jpeg"

        # Verify logging
        assert f"Found local image path in text: {image_file}" in caplog.text
        assert (
            f"Successfully loaded/saved artifact from path: {image_file}" in caplog.text
        )

    @pytest.mark.asyncio
    async def test_security_check_path_traversal(
        self, caplog: pytest.LogCaptureFixture
    ) -> None:
        """Test that paths outside the working directory are rejected."""
        caplog.set_level(logging.WARNING)

        # Simulate a path outside CWD (e.g. /etc/passwd or just a parent dir)
        # We'll use a path that is clearly absolute and not under CWD
        # Assuming test runs in a project dir, /tmp is usually outside
        unsafe_path = "/unsafe/secret.jpg"

        text_part = MockPart(text=f"Analyze {unsafe_path}")
        content = MockContent(parts=[text_part])
        context = MockCallbackContext(user_content=content)

        # We don't patch cwd here, so it uses real CWD.
        # Ensure /tmp is not in CWD (which is usually true)

        await save_image_to_artifact(as_callback_context(context))

        # Verify NOT saved
        context.save_artifact.assert_not_called()

        # Verify warning log
        assert "Access denied" in caplog.text
        assert "outside the working directory" in caplog.text

    @pytest.mark.asyncio
    async def test_local_file_not_found(
        self, caplog: pytest.LogCaptureFixture, tmp_path: Path
    ) -> None:
        """Test handling when file does not exist."""
        caplog.set_level(logging.INFO)

        # Path exists in theory (relative to cwd mock) but file doesn't exist
        # on disk
        missing_file = tmp_path / "ghost.png"
        text_part = MockPart(text=f"Check {missing_file}")
        content = MockContent(parts=[text_part])
        context = MockCallbackContext(user_content=content)

        with patch("agent.callbacks.Path.cwd", return_value=tmp_path):
            await save_image_to_artifact(as_callback_context(context))

        # Verify NOT saved
        context.save_artifact.assert_not_called()

        # Should not log success or found
        assert "Found local image path" not in caplog.text

    @pytest.mark.asyncio
    async def test_load_exception(
        self, caplog: pytest.LogCaptureFixture, tmp_path: Path
    ) -> None:
        """Test handling exceptions during file reading."""
        caplog.set_level(logging.ERROR)

        image_file = tmp_path / "corrupt.png"
        image_file.write_bytes(b"data")

        text_part = MockPart(text=f"Read {image_file}")
        content = MockContent(parts=[text_part])
        context = MockCallbackContext(user_content=content)

        # Patch open to raise exception
        with (
            patch("agent.callbacks.Path.cwd", return_value=tmp_path),
            patch("pathlib.Path.open", side_effect=Exception("Disk error")),
        ):
            await save_image_to_artifact(as_callback_context(context))

        # Verify error logged
        assert "Failed to load local image artifact: Disk error" in caplog.text

    @pytest.mark.asyncio
    async def test_regex_no_match(self, caplog: pytest.LogCaptureFixture) -> None:
        """Test case where extension matches but regex does not."""
        caplog.set_level(logging.INFO)

        # "image.jpg" ends with .jpg but lacks leading slash required by regex
        text_part = MockPart(text="image.jpg")
        content = MockContent(parts=[text_part])
        context = MockCallbackContext(user_content=content)

        await save_image_to_artifact(as_callback_context(context))

        # Verify nothing happened (no error, no save)
        context.save_artifact.assert_not_called()
        # Should not log "Found local image path"
        assert "Found local image path" not in caplog.text

    @pytest.mark.asyncio
    async def test_mime_type_fallback(
        self, caplog: pytest.LogCaptureFixture, tmp_path: Path
    ) -> None:
        """Test fallback to image/jpeg when mime type guessing fails."""
        caplog.set_level(logging.INFO)

        image_file = tmp_path / "unknown.jpg"
        image_file.write_bytes(b"data")

        text_part = MockPart(text=f"See {image_file}")
        content = MockContent(parts=[text_part])
        context = MockCallbackContext(user_content=content)

        # Patch cwd and mimetypes
        with (
            patch("agent.callbacks.Path.cwd", return_value=tmp_path),
            patch("mimetypes.guess_type", return_value=(None, None)),
        ):
            await save_image_to_artifact(as_callback_context(context))

        # Verify artifact saved with fallback mime type
        context.save_artifact.assert_called_once()
        call_args = context.save_artifact.call_args
        saved_artifact = call_args.kwargs["artifact"]
        assert saved_artifact.inline_data.mime_type == "image/jpeg"


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
        await load_image_artifact(
            as_callback_context(context), cast(LlmRequest, request)
        )

        # Verify artifact loaded
        context.load_artifact.assert_called_once_with("user:current_medical_image")

        # Verify appended to request
        assert request.contents is not None
        assert request.contents[0].parts is not None
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
        await load_image_artifact(
            as_callback_context(context), cast(LlmRequest, request)
        )

        # Verify check but no append
        context.load_artifact.assert_called_once()
        assert request.contents is not None
        assert request.contents[0].parts is not None
        assert len(request.contents[0].parts) == 0

    @pytest.mark.asyncio
    async def test_load_error(self, caplog: pytest.LogCaptureFixture) -> None:
        """Test handling error during load."""
        caplog.set_level(logging.DEBUG)

        context = MockCallbackContext()
        context.load_artifact.side_effect = Exception("DB error")

        request = MockLlmRequest(contents=[])

        # Execute
        await load_image_artifact(
            as_callback_context(context), cast(LlmRequest, request)
        )

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

        await load_image_artifact(
            as_callback_context(context), cast(LlmRequest, request)
        )

        # Verify parts list created and appended
        assert msg.parts is not None
        assert len(msg.parts) == 1
        assert msg.parts[0] == artifact_part
