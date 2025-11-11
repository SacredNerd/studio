'use server';

import { refineSearch } from '@/ai/flows/ai-search-refinement';
import type { RefineSearchOutput } from '@/ai/flows/ai-search-refinement';
import { db } from '@/lib/db';
import type { User } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function getAiRefinement(
  keywords: string
): Promise<RefineSearchOutput | { error: string }> {
  if (!keywords) {
    return { error: 'Keywords are required.' };
  }
  try {
    const result = await refineSearch({ keywords });
    return result;
  } catch (e) {
    console.error(e);
    return { error: 'Failed to get AI refinement.' };
  }
}

export async function isSetupComplete(): Promise<boolean> {
  try {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM users');
    const result = stmt.get() as { count: number };
    return result.count > 0;
  } catch (error) {
    console.error("Failed to check setup status:", error);
    return false;
  }
}

export async function saveUser(user: Omit<User, 'id'>): Promise<{ success: boolean; error?: string }> {
    try {
        const stmt = db.prepare('INSERT INTO users (firstName, lastName, email, avatar) VALUES (?, ?, ?, ?)');
        stmt.run(user.firstName, user.lastName, user.email, user.avatar);
        revalidatePath('/');
        revalidatePath('/setup');
        revalidatePath('/settings');
        return { success: true };
    } catch (error: any) {
        console.error("Failed to save user:", error);
        return { success: false, error: error.message };
    }
}

export async function getUser(): Promise<User | null> {
    try {
        const stmt = db.prepare('SELECT * FROM users LIMIT 1');
        const user = stmt.get() as User | undefined;
        return user || null;
    } catch (error) {
        console.error("Failed to get user:", error);
        return null;
    }
}

export async function updateUser(user: Omit<User, 'id' | 'avatar'> & { avatar?: string }): Promise<{ success: boolean, error?: string }> {
    try {
        const currentUser = await getUser();
        if (!currentUser) {
            return { success: false, error: "No user found to update." };
        }

        const stmt = db.prepare('UPDATE users SET firstName = ?, lastName = ?, email = ?, avatar = ? WHERE id = ?');
        stmt.run(user.firstName, user.lastName, user.email, user.avatar, currentUser.id);

        revalidatePath('/settings');
        revalidatePath('/');
        return { success: true };
    } catch (error: any) {
        console.error("Failed to update user:", error);
        return { success: false, error: error.message };
    }
}

export async function getSettings(): Promise<any> {
    try {
        const stmt = db.prepare("SELECT * FROM settings WHERE key = 'sources'");
        const setting = stmt.get() as { id: number, key: string, value: string } | undefined;
        if (setting) {
            return JSON.parse(setting.value);
        }
        return {};
    } catch (error) {
        console.error("Failed to get settings:", error);
        return {};
    }
}


export async function saveSettings(settings: any): Promise<{ success: boolean, error?: string }> {
    try {
        const value = JSON.stringify(settings);
        const stmt = db.prepare("INSERT INTO settings (key, value) VALUES ('sources', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value");
        stmt.run(value);
        revalidatePath('/settings');
        return { success: true };
    } catch (error: any) {
        console.error("Failed to save settings:", error);
        return { success: false, error: error.message };
    }
}
