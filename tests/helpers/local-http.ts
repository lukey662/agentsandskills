export interface LocalServerHandleForTest {
  csrfToken: string;
}

export function localMutation(server: LocalServerHandleForTest, init: RequestInit): RequestInit {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  headers.set("X-Agent-Kit-CSRF", server.csrfToken);
  return { ...init, headers };
}
