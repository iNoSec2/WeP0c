import docker
import tempfile
import os
from pathlib import Path
import uuid
import zipfile
import shutil
from app.models.vulnerability import PoCType


class PoCRunner:
    """Class to handle execution of PoCs in sandboxed Docker containers"""

    def __init__(self):
        self.client = docker.from_env()

    def _get_image_for_poc_type(self, poc_type: PoCType) -> str:
        """Get the appropriate Docker image for the PoC type"""
        images = {
            PoCType.python: "python:3.9-slim",
            PoCType.go: "golang:1.19-alpine",
            PoCType.bash: "bash:5.1",
        }
        return images.get(poc_type, "python:3.9-slim")

    def _prepare_execution_directory(
        self, poc_type: PoCType, poc_code: str, poc_zip_path: str = None
    ) -> tuple:
        """Prepare a temporary directory with the PoC code and extracted ZIP contents if available"""
        temp_dir = tempfile.mkdtemp()

        # Write the PoC code to a file
        if poc_type == PoCType.python:
            poc_file = os.path.join(temp_dir, "poc.py")
        elif poc_type == PoCType.go:
            poc_file = os.path.join(temp_dir, "poc.go")
        else:  # bash
            poc_file = os.path.join(temp_dir, "poc.sh")

        # Ensure the file has proper permissions
        with open(poc_file, "w") as f:
            f.write(poc_code)

        # Make the file executable
        os.chmod(poc_file, 0o755)

        # If there's a ZIP file, extract it
        if poc_zip_path and os.path.exists(poc_zip_path):
            try:
                with zipfile.ZipFile(poc_zip_path, "r") as zip_ref:
                    zip_ref.extractall(temp_dir)
                print(f"Successfully extracted ZIP file to {temp_dir}")
            except Exception as e:
                print(f"Error extracting ZIP file: {str(e)}")

        # List directory contents for debugging
        print(f"Contents of {temp_dir}:")
        for root, dirs, files in os.walk(temp_dir):
            for file in files:
                print(f"  {os.path.join(root, file)}")

        return temp_dir, poc_file

    def run_poc(
        self,
        poc_type: PoCType,
        poc_code: str,
        poc_zip_path: str = None,
        timeout: int = 30,
    ) -> dict:
        """
        Run a PoC in a sandboxed Docker container

        Args:
            poc_type: Type of PoC (python, go, bash)
            poc_code: The code to execute
            poc_zip_path: Optional path to a ZIP file with additional resources
            timeout: Maximum execution time in seconds

        Returns:
            Dictionary with execution results
        """
        image = self._get_image_for_poc_type(poc_type)
        temp_dir, poc_file = self._prepare_execution_directory(
            poc_type, poc_code, poc_zip_path
        )

        try:
            # Log the execution attempt
            print(f"Executing PoC of type {poc_type} in Docker container")
            print(f"Using image: {image}")
            print(f"Mounting directory: {temp_dir} to /poc")

            # Prepare the command based on PoC type
            if poc_type == PoCType.python:
                command = ["python", "/poc/poc.py"]
            elif poc_type == PoCType.go:
                # For Go, we need to compile first
                command = [
                    "sh",
                    "-c",
                    "cd /poc && go build -o pocapp poc.go && ./pocapp",
                ]
            else:  # bash
                command = ["bash", "/poc/poc.sh"]

            print(f"Command to execute: {command}")

            # Run the container with tight restrictions but allow execution
            container = self.client.containers.run(
                image=image,
                command=command,
                volumes={
                    temp_dir: {"bind": "/poc", "mode": "rw"}
                },  # Changed to rw to allow execution
                working_dir="/poc",
                detach=True,
                mem_limit="100m",  # Limit memory
                cpu_quota=50000,  # Limit CPU (50% of one core)
                network_mode="none",  # No network access
                cap_drop=["ALL"],  # Drop all capabilities
                security_opt=["no-new-privileges:true"],
                read_only=False,  # Allow file system writes for execution
            )

            # Wait for completion with timeout
            print(f"Container started, waiting for completion (timeout: {timeout}s)")
            result = container.wait(timeout=timeout)
            logs = container.logs().decode("utf-8")

            print(
                f"Container execution completed with status code: {result['StatusCode']}"
            )
            print(f"Output: {logs[:200]}{'...' if len(logs) > 200 else ''}")

            # Clean up
            container.remove()

            return {
                "success": result["StatusCode"] == 0,
                "exit_code": result["StatusCode"],
                "output": logs,
            }

        except docker.errors.ContainerError as e:
            return {
                "success": False,
                "exit_code": e.exit_status,
                "output": e.stderr.decode("utf-8") if e.stderr else str(e),
            }
        except Exception as e:
            return {"success": False, "exit_code": -1, "output": str(e)}
        finally:
            # Clean up the temporary directory
            shutil.rmtree(temp_dir, ignore_errors=True)


# Create a singleton instance
poc_runner = PoCRunner()
