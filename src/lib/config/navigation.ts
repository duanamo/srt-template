import { LayoutDashboard, Users, FolderKanban, ClipboardList } from '@lucide/svelte';
import type { Component } from 'svelte';

export interface NavItem {
	name: string;
	path: string;
	icon: Component;
}

export interface NavSection {
	title?: string;
	items: NavItem[];
}

export const navigationConfig: NavSection[] = [
	{
		items: [{ name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard }]
	},
	{
		title: 'Manage',
		items: [
			{ name: 'Users', path: '/users', icon: Users },
			{ name: 'Projects', path: '/projects', icon: FolderKanban },
			{ name: 'Status Reports', path: '/reports', icon: ClipboardList }
		]
	}
];
