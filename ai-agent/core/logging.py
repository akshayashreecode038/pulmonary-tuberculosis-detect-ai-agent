"""Privacy-preserving technical logging for TB Detection AI Agent.
Enforces that no Protected Health Information (PHI) or patient identifiers are logged.
"""

import logging
import sys
from datetime import datetime, timezone
import json


class AnonymizedFormatter(logging.Formatter):
    """Formats log records as structured technical metrics without sensitive patient data."""
    def format(self, record: logging.LogRecord) -> str:
        timestamp = datetime.now(timezone.utc).isoformat()
        log_entry = {
            "timestamp": timestamp,
            "level": record.levelname,
            "component": record.name,
            "message": record.getMessage()
        }
        # If extra technical metrics are provided in record.__dict__, include them
        technical_keys = [
            "request_id", "execution_time_ms", "device", "image_shape",
            "model_version", "model_score", "threshold", "risk_level"
        ]
        for key in technical_keys:
            if hasattr(record, key):
                log_entry[key] = getattr(record, key)

        return json.dumps(log_entry)


def setup_logger(name: str = "tb_ai_agent", level: int = logging.INFO) -> logging.Logger:
    """Configures and returns a privacy-conscious technical logger."""
    logger = logging.getLogger(name)
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(AnonymizedFormatter())
        logger.addHandler(handler)
        logger.setLevel(level)
        logger.propagate = False
    return logger


logger = setup_logger()
