// @vitest-environment jsdom
// Use vitest globals
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import { beforeEach, describe, expect, test } from 'vitest';

describe('Permission checks', () => {
    beforeEach(() => {
        // reset settings to defaults
        useSettingsStore.getState().resetPermissions();
    });

    test('admin has access to everything', async () => {
        const state = useAuthStore.getState();
        // set user to admin
        await state.register(
            'Admin Test',
            'test-admin@x.com',
            'password',
            'admin',
        );

        expect(state.hasPermission('dashboard')).toBe(true);
        expect(state.hasPermission('epics')).toBe(true);
        expect(state.hasPermission('admin')).toBe(true);
    });

    test('manager respects settings toggles', async () => {
        const settings = useSettingsStore.getState();
        const auth = useAuthStore.getState();

        // create manager user
        await auth.register(
            'Manager Test',
            'test-manager@x.com',
            'password',
            'manager',
        );
        expect(auth.user!.role).toBe('manager');

        // by default manager has dashboard and reports
        expect(auth.hasPermission('dashboard')).toBe(true);
        expect(auth.hasPermission('reports')).toBe(true);

        // disable dashboard for manager
        settings.updateFeaturePermission('dashboardAccess', 'manager', false);
        expect(auth.hasPermission('dashboard')).toBe(false);

        // re-enable dashboard
        settings.updateFeaturePermission('dashboardAccess', 'manager', true);
        expect(auth.hasPermission('dashboard')).toBe(true);
    });

    test('team_member cannot access admin panel even if toggle enabled', async () => {
        const settings = useSettingsStore.getState();
        const auth = useAuthStore.getState();

        // enable adminAccess for all roles (simulating unsafe config)
        settings.updateFeaturePermission('adminAccess', 'manager', true);
        settings.updateFeaturePermission('adminAccess', 'team_member', true);

        // create team member
        await auth.register(
            'Dev Test',
            'test-dev@x.com',
            'password',
            'team_member',
        );

        // team_member shouldn't have '*' permissions
        expect(auth.hasPermission('admin')).toBe(false);
    });
});
