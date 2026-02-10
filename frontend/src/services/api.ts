const API_URL = "http://localhost:8000";

export const api = {
    checkSetupComplete: async (): Promise<boolean> => {
        try {
            // TODO: Connect to backend
            const res = await fetch(`${API_URL}/health`);
            return res.ok;
        } catch (e) {
            console.error(e);
            return false;
        }
    },

    saveUser: async (data: any) => {
        const res = await fetch(`${API_URL}/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return res.json();
    },

    getUser: async () => {
        // Mock
        return { firstName: "Test", lastName: "User", email: "test@example.com" };
    },

    getSettings: async () => {
        // Mock
        return {};
    }
};
