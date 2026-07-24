import { API_BASE } from './config';

const API_URL = `${API_BASE}/api`;

export const checkInstallStatus = async (): Promise<{ installed: boolean }> => {
    const res = await fetch(`${API_URL}/install/status`);
    if (!res.ok) throw new Error('Failed to check install status');
    return res.json();
};

export const testDbConnection = async (mongoUri: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    const res = await fetch(`${API_URL}/install/test-db`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mongoUri }),
    });
    return res.json();
};

export interface InstallPayload {
    mongoUri: string;
    jwtSecret?: string;
    username: string;
    password: string;
    siteTitle?: string;
    siteSubtitle?: string;
}

export const runInstall = async (payload: InstallPayload): Promise<{ success: boolean; message?: string; error?: string }> => {
    const res = await fetch(`${API_URL}/install/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    return res.json();
};
