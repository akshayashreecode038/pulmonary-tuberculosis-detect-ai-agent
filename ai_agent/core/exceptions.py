"""Custom domain exceptions for TB detection AI Agent."""

class TBAgentError(Exception):
    """Base exception for all TB AI Agent errors."""
    pass


class ImageValidationError(TBAgentError):
    """Raised when an uploaded image fails integrity, resolution, or format validation."""
    def __init__(self, message: str, details: dict | None = None):
        super().__init__(message)
        self.message = message
        self.details = details or {}


class ModelLoadError(TBAgentError):
    """Raised when loading model weights, backbone architecture, or checkpoint fails."""
    pass


class InferenceError(TBAgentError):
    """Raised when forward pass or explainability hook generation fails."""
    pass


class DatasetError(TBAgentError):
    """Raised when dataset loading, parsing, or patient-level splitting encounters an error."""
    pass
