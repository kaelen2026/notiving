import type {
	ApiResponse,
	PaginatedResult,
	User,
	Post,
	Comment,
	AuthResponse,
	RefreshResponse,
} from "@notiving/shared/types";
import type {
	RegisterInput,
	LoginInput,
	CreatePostInput,
	UpdatePostInput,
	CreateCommentInput,
	UpdateCommentInput,
	UpdateUserInput,
} from "@notiving/shared/schemas";

export class ApiClient {
	private baseUrl: string;
	private accessToken: string | null = null;

	constructor(baseUrl: string) {
		this.baseUrl = baseUrl;
	}

	setAccessToken(token: string) {
		this.accessToken = token;
	}

	clearAccessToken() {
		this.accessToken = null;
	}

	private async request<T>(
		path: string,
		options: RequestInit = {},
	): Promise<ApiResponse<T>> {
		const headers: Record<string, string> = {
			"Content-Type": "application/json",
			...(options.headers as Record<string, string>),
		};

		if (this.accessToken) {
			headers.Authorization = `Bearer ${this.accessToken}`;
		}

		const response = await fetch(`${this.baseUrl}${path}`, {
			...options,
			headers,
		});

		return response.json();
	}

	// Auth
	async register(input: RegisterInput): Promise<ApiResponse<AuthResponse>> {
		return this.request<AuthResponse>("/api/v1/auth/register", {
			method: "POST",
			body: JSON.stringify(input),
		});
	}

	async login(input: LoginInput): Promise<ApiResponse<AuthResponse>> {
		return this.request<AuthResponse>("/api/v1/auth/login", {
			method: "POST",
			body: JSON.stringify(input),
		});
	}

	async refresh(refreshToken: string): Promise<ApiResponse<RefreshResponse>> {
		return this.request<RefreshResponse>("/api/v1/auth/refresh", {
			method: "POST",
			body: JSON.stringify({ refreshToken }),
		});
	}

	async getMe(): Promise<ApiResponse<User>> {
		return this.request<User>("/api/v1/auth/me");
	}

	// Users
	async listUsers(params?: {
		cursor?: string;
		limit?: number;
	}): Promise<ApiResponse<PaginatedResult<User>>> {
		const query = new URLSearchParams();
		if (params?.cursor) query.set("cursor", params.cursor);
		if (params?.limit) query.set("limit", params.limit.toString());
		return this.request<PaginatedResult<User>>(
			`/api/v1/users?${query.toString()}`,
		);
	}

	async getUser(id: string): Promise<ApiResponse<User>> {
		return this.request<User>(`/api/v1/users/${id}`);
	}

	async updateUser(
		id: string,
		input: UpdateUserInput,
	): Promise<ApiResponse<User>> {
		return this.request<User>(`/api/v1/users/${id}`, {
			method: "PUT",
			body: JSON.stringify(input),
		});
	}

	async deleteUser(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
		return this.request<{ deleted: boolean }>(`/api/v1/users/${id}`, {
			method: "DELETE",
		});
	}

	// Posts
	async listPosts(params?: {
		cursor?: string;
		limit?: number;
		authorId?: string;
	}): Promise<ApiResponse<PaginatedResult<Post>>> {
		const query = new URLSearchParams();
		if (params?.cursor) query.set("cursor", params.cursor);
		if (params?.limit) query.set("limit", params.limit.toString());
		if (params?.authorId) query.set("authorId", params.authorId);
		return this.request<PaginatedResult<Post>>(
			`/api/v1/posts?${query.toString()}`,
		);
	}

	async getPost(id: string): Promise<ApiResponse<Post>> {
		return this.request<Post>(`/api/v1/posts/${id}`);
	}

	async createPost(input: CreatePostInput): Promise<ApiResponse<Post>> {
		return this.request<Post>("/api/v1/posts", {
			method: "POST",
			body: JSON.stringify(input),
		});
	}

	async updatePost(
		id: string,
		input: UpdatePostInput,
	): Promise<ApiResponse<Post>> {
		return this.request<Post>(`/api/v1/posts/${id}`, {
			method: "PUT",
			body: JSON.stringify(input),
		});
	}

	async deletePost(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
		return this.request<{ deleted: boolean }>(`/api/v1/posts/${id}`, {
			method: "DELETE",
		});
	}

	// Comments
	async listComments(params?: {
		cursor?: string;
		limit?: number;
		postId?: string;
		parentId?: string;
	}): Promise<ApiResponse<PaginatedResult<Comment>>> {
		const query = new URLSearchParams();
		if (params?.cursor) query.set("cursor", params.cursor);
		if (params?.limit) query.set("limit", params.limit.toString());
		if (params?.postId) query.set("postId", params.postId);
		if (params?.parentId) query.set("parentId", params.parentId);
		return this.request<PaginatedResult<Comment>>(
			`/api/v1/comments?${query.toString()}`,
		);
	}

	async getComment(id: string): Promise<ApiResponse<Comment>> {
		return this.request<Comment>(`/api/v1/comments/${id}`);
	}

	async createComment(
		input: CreateCommentInput,
	): Promise<ApiResponse<Comment>> {
		return this.request<Comment>("/api/v1/comments", {
			method: "POST",
			body: JSON.stringify(input),
		});
	}

	async updateComment(
		id: string,
		input: UpdateCommentInput,
	): Promise<ApiResponse<Comment>> {
		return this.request<Comment>(`/api/v1/comments/${id}`, {
			method: "PUT",
			body: JSON.stringify(input),
		});
	}

	async deleteComment(
		id: string,
	): Promise<ApiResponse<{ deleted: boolean }>> {
		return this.request<{ deleted: boolean }>(`/api/v1/comments/${id}`, {
			method: "DELETE",
		});
	}
}

export const apiClient = new ApiClient(
	import.meta.env.VITE_API_URL || "http://localhost:3001",
);
