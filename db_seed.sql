-- Insert test users
INSERT INTO users (id, email, username, hashed_password, full_name, is_active, role, created_at, updated_at)
VALUES 
    ('c7f57d1a-94c2-4e35-9f1b-8e92791f76a2', 'admin@p0cit.com', 'admin', '$2b$12$fAAH3JIV0CQF.iK1jFrmwuzL8pS8.xYi89N1M7ghSXzAVm/O/XXNC', 'Admin User', true, 'super_admin', NOW(), NOW()),
    ('d9c17a4b-7a80-4f0e-a1f9-7b3e8e6c83d8', 'pentester@p0cit.com', 'pentester', '$2b$12$fAAH3JIV0CQF.iK1jFrmwuzL8pS8.xYi89N1M7ghSXzAVm/O/XXNC', 'Pentester User', true, 'pentester', NOW(), NOW()),
    ('e1c2f3d4-5a6b-7c8d-9e0f-1a2b3c4d5e6f', 'client@p0cit.com', 'client', '$2b$12$fAAH3JIV0CQF.iK1jFrmwuzL8pS8.xYi89N1M7ghSXzAVm/O/XXNC', 'Client User', true, 'client', NOW(), NOW());

-- Insert test projects
INSERT INTO projects (id, name, description, client_id, status, start_date, end_date, created_at, updated_at)
VALUES 
    ('a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', 'Web Application Assessment', 'Security assessment of the corporate web application', 'e1c2f3d4-5a6b-7c8d-9e0f-1a2b3c4d5e6f', 'active', NOW() - INTERVAL '30 days', NOW() + INTERVAL '60 days', NOW() - INTERVAL '30 days', NOW()),
    ('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'Network Penetration Test', 'External and internal network penetration testing', 'e1c2f3d4-5a6b-7c8d-9e0f-1a2b3c4d5e6f', 'planning', NOW() - INTERVAL '15 days', NOW() + INTERVAL '45 days', NOW() - INTERVAL '15 days', NOW()),
    ('c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 'Mobile App Security Review', 'Security assessment of the iOS and Android applications', 'e1c2f3d4-5a6b-7c8d-9e0f-1a2b3c4d5e6f', 'completed', NOW() - INTERVAL '90 days', NOW() - INTERVAL '30 days', NOW() - INTERVAL '90 days', NOW());

-- Add pentester to projects (many-to-many relationship)
INSERT INTO project_pentesters (project_id, pentester_id)
VALUES 
    ('a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', 'd9c17a4b-7a80-4f0e-a1f9-7b3e8e6c83d8'),
    ('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'd9c17a4b-7a80-4f0e-a1f9-7b3e8e6c83d8'),
    ('c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 'd9c17a4b-7a80-4f0e-a1f9-7b3e8e6c83d8');

-- Insert test missions (pentests)
INSERT INTO missions (id, name, description, project_id, status, start_date, end_date, created_at, updated_at)
VALUES 
    ('d4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a', 'Web App Pentesting Phase 1', 'First phase of web application penetration testing', 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', 'in_progress', NOW() - INTERVAL '20 days', NOW() + INTERVAL '10 days', NOW() - INTERVAL '20 days', NOW()),
    ('e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b', 'Network Pentesting Planning', 'Planning phase for network penetration test', 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'planning', NOW() - INTERVAL '10 days', NOW() + INTERVAL '5 days', NOW() - INTERVAL '10 days', NOW()),
    ('f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0c', 'Mobile App Assessment', 'Complete assessment of mobile applications', 'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 'completed', NOW() - INTERVAL '80 days', NOW() - INTERVAL '40 days', NOW() - INTERVAL '80 days', NOW());

-- Add pentester to missions (many-to-many relationship)
INSERT INTO mission_pentesters (mission_id, pentester_id)
VALUES 
    ('d4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a', 'd9c17a4b-7a80-4f0e-a1f9-7b3e8e6c83d8'),
    ('e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b', 'd9c17a4b-7a80-4f0e-a1f9-7b3e8e6c83d8'),
    ('f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0c', 'd9c17a4b-7a80-4f0e-a1f9-7b3e8e6c83d8');

-- Insert test vulnerabilities
INSERT INTO vulnerabilities (id, title, description, severity, status, cvss_score, project_id, discovered_by, poc_type, poc_code, created_at, updated_at)
VALUES 
    ('a7b8c9d0-e1f2-0a1b-4c5d-6e7f8a9b0c1d', 'SQL Injection in Login Form', 'The login form is vulnerable to SQL injection attacks allowing authentication bypass.', 'critical', 'open', 9.8, 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', 'd9c17a4b-7a80-4f0e-a1f9-7b3e8e6c83d8', 'python', 'import requests\n\nurl = "https://example.com/login"\npayload = {"username": "admin\' OR 1=1--", "password": "anything"}\n\nresponse = requests.post(url, data=payload)\nprint(response.text)', NOW() - INTERVAL '15 days', NOW()),
    
    ('b8c9d0e1-f2a3-1b2c-5d6e-7f8a9b0c1d2e', 'Cross-Site Scripting (XSS)', 'Reflected XSS vulnerability in the search functionality.', 'high', 'in_progress', 7.5, 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', 'd9c17a4b-7a80-4f0e-a1f9-7b3e8e6c83d8', 'bash', '#!/bin/bash\n\ncurl -X GET "https://example.com/search?q=<script>alert(document.cookie)</script>"\n', NOW() - INTERVAL '12 days', NOW()),
    
    ('c9d0e1f2-a3b4-2c3d-6e7f-8a9b0c1d2e3f', 'Insecure Direct Object References', 'Users can access other users\' data by manipulating ID parameters.', 'medium', 'fixed', 5.5, 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', 'd9c17a4b-7a80-4f0e-a1f9-7b3e8e6c83d8', 'python', 'import requests\n\nurl = "https://example.com/profile"\n\n# Try accessing another user\'s profile\nresponse = requests.get(f"{url}?id=12345")\nprint(response.text)', NOW() - INTERVAL '25 days', NOW() - INTERVAL '5 days'),
    
    ('d0e1f2a3-b4c5-3d4e-7f8a-9b0c1d2e3f4a', 'Default Credentials', 'Default administrative credentials are in use on the network device.', 'critical', 'open', 9.0, 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'd9c17a4b-7a80-4f0e-a1f9-7b3e8e6c83d8', 'bash', '#!/bin/bash\n\n# Access router with default credentials\nssh admin@192.168.1.1\n# Password: admin123\n', NOW() - INTERVAL '8 days', NOW()),
    
    ('e1f2a3b4-c5d6-4e5f-8a9b-0c1d2e3f4a5b', 'Unencrypted Data Transmission', 'Sensitive data is transmitted over HTTP instead of HTTPS.', 'high', 'open', 7.4, 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'd9c17a4b-7a80-4f0e-a1f9-7b3e8e6c83d8', 'python', 'import requests\n\n# Notice that HTTP is used, not HTTPS\nurl = "http://example.com/api/users"\nresponse = requests.get(url)\nprint(response.text)  # Contains sensitive user data', NOW() - INTERVAL '7 days', NOW()),
    
    ('f2a3b4c5-d6e7-5f6a-9b0c-1d2e3f4a5b6c', 'Hardcoded API Key', 'API key is hardcoded in the mobile application.', 'high', 'fixed', 8.0, 'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 'd9c17a4b-7a80-4f0e-a1f9-7b3e8e6c83d8', 'bash', '#!/bin/bash\n\n# Extract strings from APK file\nstrings app.apk | grep -i "api_key"\n', NOW() - INTERVAL '60 days', NOW() - INTERVAL '45 days'),
    
    ('a3b4c5d6-e7f8-6a7b-0c1d-2e3f4a5b6c7d', 'Insecure Authentication', 'The session management is vulnerable to session fixation attacks.', 'medium', 'fixed', 6.5, 'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 'd9c17a4b-7a80-4f0e-a1f9-7b3e8e6c83d8', 'python', 'import requests\n\n# Get session ID before authentication\nsession = requests.Session()\nresponse1 = session.get("https://example.com/")\n\n# Use same session ID after authentication\nlogin_data = {"username": "user", "password": "password"}\nresponse2 = session.post("https://example.com/login", data=login_data)\nprint("Same session ID is used after login")', NOW() - INTERVAL '55 days', NOW() - INTERVAL '40 days'); 