export type ToastType = 'success' | 'error';

export interface Toast {
	id: string;
	type: ToastType;
	message: string;
}

class ToastStore {
	items = $state<Toast[]>([]);

	private push(type: ToastType, message: string): void {
		const id = crypto.randomUUID();
		this.items = [...this.items, { id, type, message }];
		setTimeout(() => this.dismiss(id), 4000);
	}

	success(message: string): void {
		this.push('success', message);
	}

	error(message: string): void {
		this.push('error', message);
	}

	dismiss(id: string): void {
		this.items = this.items.filter((t) => t.id !== id);
	}
}

export const toast = new ToastStore();
