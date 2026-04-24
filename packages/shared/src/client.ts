import type {
	ApiResponse,
	PaginatedResult,
	User,
	Post,
	Comment,
	AuthResponse,
	TokenProvider,
	ApiClientConfig,
} from "./types/api.js";
import { ApiError } from "./types/api.js";
import type {
	RegisterInput,
	LoginInput,
	SendEmailCodeInput,
	VerifyEmailCodeInput,
	CreatePostInput,
	UpdatePostInput,
	CreateCommentInput,
	UpdateCommentInput,
	UpdateUserInput,
} from "./schemas/index.js";

export { ApiError };

export class ApiClient {
	private readonly baseUrl: string;
	private readonly tokenProvider?: TokenProvider;
	private readonly deviceType?: string;
	private readonly credentials?: RequestCredentials;
	private refreshPromise: Promise<string | null> | null = null;

	constructor(config: ApiClientConfig) {
		this.baseUrl = config.baseUrl;
		this.tokenProvider = config.tokenProvider;
		this.deviceType = config.deviceType;
		this.credentials = config.credentials;
	}

	private async request<T>(
		path: string,
		options: RequestInit = {},
	): Promise<T> {
		const doFetch = (token: string | null): Promise<Response> => {
			const headers: Record<string, string> = {
				"Content-Type": "application/json",
				...(options.headers as Record<string, string>),
			};
			if (this.deviceType) {
				headers["X-Device-Type"] = this.deviceType;
			}
			if (token) {
				headers["Authorization"] = `Bearer ${token}`;
			}
			return fetch(`${this.baseUrl}${path}`, {
				...options,
				headers,
				...(this.credentials ? { credentials: this.credentials } : {}),
			});
		};

		const token = this.tokenProvider?.getAccessToken() ?? null;
		let res = await doFetch(token);

		if (res.status === 401 && this.tokenProvider && token) {
			if (!this.refreshPromise) {
				this.refreshPromise = this.tokenProvider.refresh().finally(() => {
					this.refreshPromise = null;
				});
			}
			const newToken = await this.refreshPromise;
			if (newToken) {
				res = await doFetch(newToken);
			} else {
				this.tokenProvider.onAuthFailure?.();
				throw new ApiError(401, "Session expired");
			}
		}

		const json: ApiResponse<T> = await res.json();

		if (!res.ok || !json.success) {
			throw new ApiError(res.status, json.error ?? json.message ?? "Unknown error");
		}

		return json.data as T;
	}

	async tryRestoreSession(): Promise<string | null> {
		if (!this.tokenProvider) return null;
		const existing = this.tokenProvider.getAccessToken();
		if (existing) return existing;
		return this.tokenProvider.refresh();
	}

	// Auth
	async register(input: RegisterInput): Promise<AuthResponse> {
		return this.request<AuthResponse>("/v1/auth/register", {
			method: "POST",
			body: JSON.stringify(input),
		});
	}

	async login(input: LoginInput): Promise<AuthResponse> {
		return this.request<AuthResponse>("/v1/auth/login", {
			method: "POST",
			body: JSON.stringify(input),
		});
	}

	async sendEmailCode(input: SendEmailCodeInput): Promise<{ message: string }> {
		return this.request<{ message: string }>("/v1/auth/email/send-code", {
			method: "POST",
			body: JSON.stringify(input),
		});
	}

	async verifyEmailCode(input: VerifyEmailCodeInput): Promise<AuthResponse> {
		return this.request<AuthResponse>("/v1/auth/email/verify-code", {
			method: "POST",
			body: JSON.stringify(input),
		});
	}

	async getMe(): Promise<User> {
		return this.request<User>("/v1/auth/me");
	}

	async logout(): Promise<void> {
		await this.request<{ message: string }>("/v1/auth/logout", {
			method: "POST",
		});
	}

	// Users
	async listUsers(params?: {
		cursor?: string;
		limit?: number;
	}): Promise<PaginatedResult<User>> {
		const query = new URLSearchParams();
		if (params?.cursor) query.set("cursor", params.cursor);
		if (params?.limit) query.set("limit", params.limit.toString());
		return this.request<PaginatedResult<User>>(
			`/v1/users?${query.toString()}`,
		);
	}

	async getUser(id: string): Promise<User> {
		return this.request<User>(`/v1/users/${id}`);
	}

	async updateUser(id: string, input: UpdateUserInput): Promise<User> {
		return this.request<User>(`/v1/users/${id}`, {
			method: "PUT",
			body: JSON.stringify(input),
		});
	}

	async deleteUser(id: string): Promise<{ deleted: boolean }> {
		return this.request<{ deleted: boolean }>(`/v1/users/${id}`, {
			method: "DELETE",
		});
	}

	// Posts
	async listPosts(params?: {
		cursor?: string;
		limit?: number;
		authorId?: string;
	}): Promise<PaginatedResult<Post>> {
		const query = new URLSearchParams();
		if (params?.cursor) query.set("cursor", params.cursor);
		if (params?.limit) query.set("limit", params.limit.toString());
		if (params?.authorId) query.set("authorId", params.authorId);
		return this.request<PaginatedResult<Post>>(
			`/v1/posts?${query.toString()}`,
		);
	}

	async getPost(id: string): Promise<Post> {
		return this.request<Post>(`/v1/posts/${id}`);
	}

	async createPost(input: CreatePostInput): Promise<Post> {
		return this.request<Post>("/v1/posts", {
			method: "POST",
			body: JSON.stringify(input),
		});
	}

	async updatePost(id: string, input: UpdatePostInput): Promise<Post> {
		return this.request<Post>(`/v1/posts/${id}`, {
			method: "PUT",
			body: JSON.stringify(input),
		});
	}

	async deletePost(id: string): Promise<{ deleted: boolean }> {
		return this.request<{ deleted: boolean }>(`/v1/posts/${id}`, {
			method: "DELETE",
		});
	}

	// Comments
	async listComments(params?: {
		cursor?: string;
		limit?: number;
		postId?: string;
		parentId?: string;
	}): Promise<PaginatedResult<Comment>> {
		const query = new URLSearchParams();
		if (params?.cursor) query.set("cursor", params.cursor);
		if (params?.limit) query.set("limit", params.limit.toString());
		if (params?.postId) query.set("postId", params.postId);
		if (params?.parentId) query.set("parentId", params.parentId);
		return this.request<PaginatedResult<Comment>>(
			`/v1/comments?${query.toString()}`,
		);
	}

	async getComment(id: string): Promise<Comment> {
		return this.request<Comment>(`/v1/comments/${id}`);
	}

	async createComment(input: CreateCommentInput): Promise<Comment> {
		return this.request<Comment>("/v1/comments", {
			method: "POST",
			body: JSON.stringify(input),
		});
	}

	async updateComment(id: string, input: UpdateCommentInput): Promise<Comment> {
		return this.request<Comment>(`/v1/comments/${id}`, {
			method: "PUT",
			body: JSON.stringify(input),
		});
	}

	async deleteComment(id: string): Promise<{ deleted: boolean }> {
		return this.request<{ deleted: boolean }>(`/v1/comments/${id}`, {
			method: "DELETE",
		});
	}
}
