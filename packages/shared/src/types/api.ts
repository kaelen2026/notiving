export interface ApiResponse<T = unknown> {
	success: boolean;
	data?: T;
	message?: string;
	error?: string;
}

export interface PaginatedResult<T> {
	items: T[];
	nextCursor: string | null;
	hasMore: boolean;
}

export interface User {
	id: string;
	username: string | null;
	displayName: string | null;
	bio: string | null;
	avatarUrl: string | null;
	isAnonymous: boolean;
	createdAt: string;
	updatedAt: string;
	hasPassword?: boolean;
	providers?: Array<{
		provider: string;
		email: string | null;
		linkedAt: string;
	}>;
}

export interface Post {
	id: string;
	title: string;
	content: string;
	slug: string;
	published: boolean;
	authorId: string;
	createdAt: string;
	updatedAt: string;
}

export interface Comment {
	id: string;
	content: string;
	postId: string;
	authorId: string;
	parentId: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface AuthResponse {
	user: User;
	accessToken: string;
	refreshToken: string;
}

export interface RefreshResponse {
	accessToken: string;
	refreshToken: string;
}
