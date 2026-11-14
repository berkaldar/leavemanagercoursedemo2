// Request/response types shared by apps/api and apps/web (docs/architecture.md).
export interface HealthResponse {
  status: 'ok';
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface MeResponse {
  fullName: string;
}

export interface ErrorResponse {
  error: { code: string; message: string };
}
