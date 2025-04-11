import tempfile
import os
import subprocess
import shutil
import zipfile
from pathlib import Path
from app.models.vulnerability import PoCType


class SimplePoCRunner:
    """Class to handle execution of PoCs in a simple sandboxed environment"""

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
        
        # Debug output
        print(f"Created PoC file at: {poc_file}")
        print(
            f"PoC file content:\n{poc_code[:200]}{'...' if len(poc_code) > 200 else ''}"
        )
        
        # Verify the file exists
        if os.path.exists(poc_file):
            print(f"Verified file exists at: {poc_file}")
            print(f"File size: {os.path.getsize(poc_file)} bytes")
        else:
            print(f"ERROR: File does not exist at: {poc_file}")

        # Extract ZIP contents if provided
        if poc_zip_path and poc_zip_path != "N/A" and os.path.exists(poc_zip_path):
            try:
                with zipfile.ZipFile(poc_zip_path, "r") as zip_ref:
                    zip_ref.extractall(temp_dir)
                print(f"Extracted ZIP contents to {temp_dir}")
            except Exception as e:
                print(f"Error extracting ZIP: {str(e)}")

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
        Run a PoC in a simple sandboxed environment
        
        Args:
            poc_type: Type of PoC (python, go, bash)
            poc_code: The code to execute
            poc_zip_path: Optional path to a ZIP file with additional resources
            timeout: Maximum execution time in seconds
            
        Returns:
            Dictionary with execution results
        """
        temp_dir, poc_file = self._prepare_execution_directory(
            poc_type, poc_code, poc_zip_path
        )
        
        try:
            # Log the execution attempt
            print(f"Executing PoC of type {poc_type} in simple sandbox")
            
            # Prepare the command based on PoC type
            if poc_type == PoCType.python:
                command = ["python", poc_file]
            elif poc_type == PoCType.go:
                # For Go, we need to compile first
                compile_cmd = ["go", "build", "-o", f"{temp_dir}/pocapp", poc_file]
                try:
                    subprocess.run(
                        compile_cmd,
                        cwd=temp_dir,
                        timeout=timeout,
                        capture_output=True,
                        text=True,
                        check=True,
                    )
                    command = [f"{temp_dir}/pocapp"]
                except subprocess.SubprocessError as e:
                    return {
                        "success": False,
                        "exit_code": 1,
                        "output": f"Error compiling Go code: {str(e)}",
                    }
            else:  # bash
                command = ["bash", poc_file]
            
            print(f"Command to execute: {command}")
            
            # Execute the command with timeout
            result = subprocess.run(
                command,
                cwd=temp_dir,
                timeout=timeout,
                capture_output=True,
                text=True,
            )
            
            # Get the execution result
            exit_code = result.returncode
            output = result.stdout
            error = result.stderr
            
            if error:
                output = f"STDERR:\n{error}\n\nSTDOUT:\n{output}"
            
            print(f"Command execution result (exit code: {exit_code}):\n{output}")
            
            return {
                "success": exit_code == 0,
                "exit_code": exit_code,
                "output": output,
            }
            
        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "exit_code": 124,  # Standard timeout exit code
                "output": f"Execution timed out after {timeout} seconds",
            }
        except Exception as e:
            return {
                "success": False,
                "exit_code": 1,
                "output": f"Error executing PoC: {str(e)}",
            }
        finally:
            # Clean up
            try:
                shutil.rmtree(temp_dir)
            except Exception as e:
                print(f"Error cleaning up temporary directory: {str(e)}")
