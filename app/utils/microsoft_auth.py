import aiohttp
from app.core.config import settings
from typing import Optional, Dict, Any

async def get_microsoft_user_info(code: str) -> Optional[Dict[str, Any]]:
    """
    Get user information from Microsoft using the authorization code
    """
    if not all([settings.MICROSOFT_CLIENT_ID, settings.MICROSOFT_CLIENT_SECRET, settings.MICROSOFT_TENANT_ID]):
        raise ValueError("Microsoft OAuth settings are not configured")
    
    # Construct the token endpoint URL
    token_url = f"{settings.MICROSOFT_AUTHORITY}/{settings.MICROSOFT_TENANT_ID}/oauth2/v2.0/token"
    
    # Prepare the token request data
    token_data = {
        "client_id": settings.MICROSOFT_CLIENT_ID,
        "client_secret": settings.MICROSOFT_CLIENT_SECRET,
        "code": code,
        "grant_type": "authorization_code",
        "scope": " ".join(settings.MICROSOFT_SCOPE),
        "redirect_uri": "http://localhost:3000/auth/microsoft/callback"  # Update this with your frontend callback URL
    }
    
    async with aiohttp.ClientSession() as session:
        # Get the access token
        async with session.post(token_url, data=token_data) as response:
            if response.status != 200:
                return None
            
            token_response = await response.json()
            access_token = token_response.get("access_token")
            
            if not access_token:
                return None
            
            # Get user info using the access token
            user_info_url = "https://graph.microsoft.com/v1.0/me"
            headers = {"Authorization": f"Bearer {access_token}"}
            
            async with session.get(user_info_url, headers=headers) as user_response:
                if user_response.status != 200:
                    return None
                
                user_info = await user_response.json()
                return {
                    "id": user_info.get("id"),
                    "email": user_info.get("userPrincipalName"),
                    "name": user_info.get("displayName"),
                    "given_name": user_info.get("givenName"),
                    "family_name": user_info.get("surname"),
                    "picture": None  # Microsoft Graph API doesn't provide profile picture by default
                } 