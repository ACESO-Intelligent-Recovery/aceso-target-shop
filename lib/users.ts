export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  isSynthetic: boolean;
}

// 20 deterministic synthetic test accounts as required by blueprint (line 902)
export const SYNTHETIC_USERS: User[] = Array.from({ length: 20 }, (_, i) => {
  const num = String(i + 1).padStart(2, "0");
  return {
    id: `user-syn-${num}`,
    username: `synthetic-${num}`,
    email: `synthetic-${num}@test.aceso.dev`,
    name: `Synthetic Test User ${num}`,
    isSynthetic: true,
  };
});

export function findUserByEmailOrUsername(identifier: string): User | undefined {
  const term = identifier.toLowerCase().trim();
  return SYNTHETIC_USERS.find(
    (u) => u.email.toLowerCase() === term || u.username.toLowerCase() === term
  );
}
