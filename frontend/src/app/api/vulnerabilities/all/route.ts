import { NextResponse } from 'next/server';
import axios from 'axios';
import { getBackendURL } from '@/lib/api';

export async function GET(request: Request) {
    try {
        // Get token from cookies
        const cookies = request.headers.get('cookie') || '';
        const tokenMatch = cookies.match(/token=([^;]+)/);
        const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;

        // Also check Authorization header as fallback
        const authHeader = request.headers.get('Authorization');
        const headerToken = authHeader?.split(' ')[1];

        // Use token from cookie or header
        const finalToken = token || headerToken;

        if (!finalToken) {
            console.error('No valid token found in cookies or Authorization header');
            // Return empty array instead of error for smooth UI rendering
            return NextResponse.json([], { status: 200 });
        }

        // Extract role from token for role-based permissions
        const base64Url = finalToken.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const payload = JSON.parse(jsonPayload);
        const userRole = payload.role;

        // Create headers with role override for super admins
        const headers: Record<string, string> = {
            'Authorization': `Bearer ${finalToken}`,
            'Content-Type': 'application/json'
        };

        // Add override headers for SUPER_ADMIN and ADMIN users
        if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') {
            console.log(`Adding override headers for ${userRole} user`);
            headers['X-Override-Role'] = 'true';
            headers['X-Admin-Access'] = 'true';
            headers['X-Admin-Override'] = 'true';
        }

        console.log('Fetching all vulnerabilities from backend');

        // Use the new /api/all endpoint
        const backendURL = getBackendURL();
        const vulnResponse = await axios.get(`${backendURL}/api/all`, { headers });
        const allVulnerabilities = vulnResponse.data;

        // Get all projects to add project names
        try {
            const projectsResponse = await axios.get(`${backendURL}/api/projects`, { headers });
            const projects = projectsResponse.data;

            // Create a map of project IDs to project names
            const projectMap = projects.reduce((map: any, project: any) => {
                map[project.id] = project.name;
                return map;
            }, {});

            // Add project names to vulnerabilities
            for (const vuln of allVulnerabilities) {
                if (projectMap[vuln.project_id]) {
                    vuln.project_name = projectMap[vuln.project_id];
                }
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
            // Continue even if projects can't be fetched
        }

        // Sort by created_at date (newest first)
        allVulnerabilities.sort((a: any, b: any) => {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

        console.log(`Fetched ${allVulnerabilities.length} vulnerabilities`);

        return NextResponse.json(allVulnerabilities);
    } catch (error: any) {
        console.error('Error fetching all vulnerabilities:', error);

        // Return empty array instead of error for smooth UI rendering
        return NextResponse.json([], { status: 200 });
    }
}
