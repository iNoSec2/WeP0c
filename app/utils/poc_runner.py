# This file is a simple wrapper around the SimplePoCRunner
# to maintain backward compatibility
from app.utils.poc_runner_simple import SimplePoCRunner

# Create a singleton instance
poc_runner = SimplePoCRunner()
