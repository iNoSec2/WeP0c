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
            PoCType.bash: "bash:5.1"
        }
        return images.get(poc_type, "python:3.9-slim")
    
    def _prepare_execution_directory(self, poc_type: PoCType, poc_code: str, poc_zip_path: str = None) -> tuple:
        """Prepare a temporary directory with the PoC code and extracted ZIP contents if available"""
        temp_dir = tempfile.mkdtemp()
        
        # Write the PoC code to a file
        if poc_type == PoCType.python:
            poc_file = os.path.join(temp_dir, "poc.py")
        elif poc_type == PoCType.go:
            poc_file = os.path.join(temp_dir, "poc.go")
        else:  # bash
            poc_file = os.path.join(temp_dir, "poc.sh")
            
        with open(poc_file, 'w') as f:
            f.write(poc_code)
        
        # If there's a ZIP file, extract it
        if poc_zip_path and os.path.exists(poc_zip_path):
            with zipfile.ZipFile(poc_zip_path, 'r') as zip_ref:
                zip_ref.extractall(temp_dir)
        
        return temp_dir, poc_file
    
    def run_poc(self, poc_type: PoCType, poc_code: str, poc_zip_path: str = None, timeout: int = 30) -> dict:
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
        temp_dir, poc_file = self._prepare_execution_directory(poc_type, poc_code, poc_zip_path)
        
        try:
            # Prepare the command based on PoC type
            if poc_type == PoCType.python:
                command = ["python", "/poc/poc.py"]
            elif poc_type == PoCType.go:
                # For Go, we need to compile first
                command = ["sh", "-c", "cd /poc && go build -o pocapp poc.go && ./pocapp"]
            else:  # bash
                command = ["bash", "/poc/poc.sh"]
            
            # Run the container with tight restrictions
            container = self.client.containers.run(
                image=image,
                command=command,
                volumes={temp_dir: {'bind': '/poc', 'mode': 'ro'}},
                working_dir="/poc",
                detach=True,
                mem_limit="100m",  # Limit memory
                cpu_quota=50000,   # Limit CPU (50% of one core)
                network_mode="none",  # No network access
                cap_drop=["ALL"],  # Drop all capabilities
                security_opt=["no-new-privileges:true"],
                read_only=True     # Read-only file system
            )
            
            # Wait for completion with timeout
            result = container.wait(timeout=timeout)
            logs = container.logs().decode('utf-8')
            
            # Clean up
            container.remove()
            
            return {
                "success": result["StatusCode"] == 0,
                "exit_code": result["StatusCode"],
                "output": logs
            }
            
        except docker.errors.ContainerError as e:
            return {
                "success": False,
                "exit_code": e.exit_status,
                "output": e.stderr.decode('utf-8') if e.stderr else str(e)
            }
        except Exception as e:
            return {
                "success": False,
                "exit_code": -1,
                "output": str(e)
            }
        finally:
            # Clean up the temporary directory
            shutil.rmtree(temp_dir, ignore_errors=True)

# Create a singleton instance
poc_runner = PoCRunner() 