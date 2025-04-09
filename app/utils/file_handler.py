import os
import shutil
from uuid import UUID
from fastapi import UploadFile
from pathlib import Path

class FileHandler:
    """Class to handle file uploads and storage for PoCs"""
    
    def __init__(self, base_upload_dir: str = "uploads"):
        """
        Initialize the FileHandler
        
        Args:
            base_upload_dir: Base directory for file uploads
        """
        self.base_upload_dir = Path(base_upload_dir)
        os.makedirs(self.base_upload_dir, exist_ok=True)
        self.poc_dir = self.base_upload_dir / "pocs"
        os.makedirs(self.poc_dir, exist_ok=True)
    
    async def save_poc_file(self, file: UploadFile, vulnerability_id: UUID) -> str:
        """
        Save a PoC file to the appropriate directory
        
        Args:
            file: The uploaded file
            vulnerability_id: UUID of the vulnerability
            
        Returns:
            Path to the saved file
        """
        # Create directory for this vulnerability if it doesn't exist
        vuln_dir = self.poc_dir / str(vulnerability_id)
        os.makedirs(vuln_dir, exist_ok=True)
        
        # Get file extension
        _, ext = os.path.splitext(file.filename)
        
        # Save the file
        file_path = vuln_dir / f"poc{ext}"
        with open(file_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
            
        # Close the file
        await file.close()
        
        return str(file_path)
    
    def delete_poc_files(self, vulnerability_id: UUID) -> bool:
        """
        Delete all files associated with a vulnerability
        
        Args:
            vulnerability_id: UUID of the vulnerability
            
        Returns:
            True if successful, False otherwise
        """
        vuln_dir = self.poc_dir / str(vulnerability_id)
        if os.path.exists(vuln_dir):
            shutil.rmtree(vuln_dir)
            return True
        return False

# Create a singleton instance
file_handler = FileHandler() 