# CareFi API Documentation

Welcome to the CareFi API documentation! This folder contains comprehensive guides for the API foundation and endpoints.

## Quick Links

- **[INSTALLATION.md](./INSTALLATION.md)** - Setup instructions and dependencies
- **[API_FOUNDATION.md](./API_FOUNDATION.md)** - Architecture and design patterns
- **[SIGNUP_ENDPOINT.md](./SIGNUP_ENDPOINT.md)** - Detailed signup implementation guide
- **[OpenAPI Spec](../openapi.yaml)** - Formal API specification

## Overview

The CareFi API provides a production-grade foundation for building secure, scalable API endpoints with:

- ✅ Type-safe environment management
- ✅ Centralized error handling
- ✅ Standardized response envelopes
- ✅ Request validation with Zod
- ✅ Password hashing with bcrypt
- ✅ Supabase integration
- ✅ Comprehensive documentation

## Getting Started

### 1. Installation

Follow [INSTALLATION.md](./INSTALLATION.md) to:
- Install dependencies
- Configure environment variables
- Set up the database
- Test the endpoint

### 2. Understand the Architecture

Read [API_FOUNDATION.md](./API_FOUNDATION.md) to learn:
- Folder structure and organization
- Error handling patterns
- Response envelope format
- How to add new endpoints

### 3. Study the Signup Endpoint

Review [SIGNUP_ENDPOINT.md](./SIGNUP_ENDPOINT.md) for:
- End-to-end flow diagrams
- Request/response specifications
- Implementation details
- Testing examples

## Project Structure

```
carefi/
├── app/api/                   # API routes
│   └── signup/
│       └── route.ts          # POST /api/signup
│
├── lib/                       # Shared utilities
│   ├── env.ts                # Environment variables
│   ├── http/                 # HTTP utilities
│   │   ├── errors.ts         # Error classes
│   │   ├── handler.ts        # Route builder
│   │   └── response.ts       # Response helpers
│   ├── security/             # Security utilities
│   │   └── passwords.ts      # Password hashing
│   ├── supabase/             # Supabase client
│   │   └── server.ts         # Admin client
│   ├── users/                # User service
│   │   └── service.ts        # User business logic
│   └── validation/           # Validation schemas
│       └── auth.ts           # Auth validation
│
├── docs/                      # Documentation
│   ├── README.md             # This file
│   ├── INSTALLATION.md       # Setup guide
│   ├── API_FOUNDATION.md     # Architecture
│   └── SIGNUP_ENDPOINT.md    # Signup guide
│
├── examples/                  # Usage examples
│   └── rest/
│       └── signup.http       # REST client examples
│
├── .env.example              # Environment template
└── openapi.yaml              # OpenAPI spec
```

## Current Endpoints

### POST /api/signup

Create a new user account with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "displayName": "John Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "displayName": "John Doe",
    "onboardingCompleted": false
  }
}
```

See [SIGNUP_ENDPOINT.md](./SIGNUP_ENDPOINT.md) for full documentation.

## Response Format

All API responses follow a standardized envelope:

**Success:**
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "error/code",
    "message": "Human-readable message",
    "details": { /* optional error context */ }
  }
}
```

## Error Codes

| Code Pattern | HTTP Status | Meaning |
|--------------|-------------|---------|
| `bad_request/*` | 400 | Invalid input or malformed request |
| `unauthorized/*` | 401 | Authentication required or invalid |
| `forbidden/*` | 403 | Insufficient permissions |
| `not_found/*` | 404 | Resource doesn't exist |
| `conflict/*` | 409 | Resource conflict (e.g., duplicate) |
| `internal/*` | 500 | Server error |

See [API_FOUNDATION.md](./API_FOUNDATION.md#error-handling) for complete list.

## Adding New Endpoints

Follow this workflow to add a new endpoint:

### 1. Define Schema

Create validation schema in `lib/validation/`:

```typescript
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type LoginInput = z.infer<typeof loginSchema>;
```

### 2. Create Service

Add business logic in `lib/[domain]/service.ts`:

```typescript
export async function authenticateUser(
  input: LoginInput
): Promise<UserProfile> {
  // Business logic here
}
```

### 3. Create Route

Add route in `app/api/[endpoint]/route.ts`:

```typescript
export const POST = createPostHandler(
  loginSchema,
  async (req, body) => {
    const user = await authenticateUser(body);
    return ok({ user });
  }
);
```

### 4. Document

- Update OpenAPI spec in `openapi.yaml`
- Create endpoint guide (e.g., `docs/LOGIN_ENDPOINT.md`)
- Add examples in `examples/rest/`

See [API_FOUNDATION.md](./API_FOUNDATION.md#adding-new-endpoints) for detailed steps.

## Testing

### Interactive Testing (VSCode)

1. Install VSCode REST Client extension
2. Open `examples/rest/signup.http`
3. Click "Send Request" above any example

### cURL Testing

```bash
curl -X POST http://localhost:3000/api/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123",
    "displayName": "Test User"
  }'
```

### Automated Testing

Create tests in `__tests__/` or `*.test.ts` files:

```typescript
import { createUser } from '@/lib/users/service';

test('creates user with valid input', async () => {
  const user = await createUser({
    email: 'test@example.com',
    password: 'TestPass123',
    displayName: 'Test User',
  });

  expect(user.email).toBe('test@example.com');
});
```

## Security

### Key Security Features

✅ **Password Security**
- bcrypt hashing (12 rounds)
- Never log or return passwords
- Only store hashes

✅ **Input Validation**
- Zod schema validation
- Request size limits (1MB)
- Type checking

✅ **Environment Security**
- Server-only environment variables
- Type-safe env loader
- Never expose service role key

✅ **Error Handling**
- No leaked stack traces
- Sanitized error messages
- Request ID tracing

### Production Checklist

Before deploying:

- [ ] Environment variables configured
- [ ] `.env` in `.gitignore`
- [ ] HTTPS enabled
- [ ] Rate limiting implemented
- [ ] CORS configured
- [ ] Logging sanitized
- [ ] Error monitoring set up
- [ ] Database backups enabled

## Future Enhancements

### Planned Features

1. **Authentication**
   - JWT token generation
   - Token refresh flow
   - Password reset

2. **User Management**
   - Profile updates
   - Email verification
   - Account deletion

3. **Infrastructure**
   - Rate limiting
   - Request logging (pino)
   - Error monitoring (Sentry)
   - API versioning

4. **Testing**
   - Unit tests (Vitest/Jest)
   - Integration tests
   - E2E tests

See [API_FOUNDATION.md](./API_FOUNDATION.md#next-steps) for full roadmap.

## Resources

### Documentation
- [Next.js App Router](https://nextjs.org/docs/app)
- [Zod Documentation](https://zod.dev)
- [Supabase Docs](https://supabase.com/docs)
- [bcrypt Guide](https://github.com/kelektiv/node.bcrypt.js)
- [OpenAPI Spec](https://swagger.io/specification/)

### Tools
- [VSCode REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)
- [Postman](https://www.postman.com)
- [Swagger Editor](https://editor.swagger.io)

### Related Files
- [package.json](../package.json) - Dependencies
- [tsconfig.json](../tsconfig.json) - TypeScript config
- [.env.example](../.env.example) - Environment template

## Troubleshooting

### Common Issues

**Missing dependencies:**
```bash
npm install @supabase/supabase-js bcryptjs zod
npm install -D @types/bcryptjs
```

**Environment variables not loaded:**
- Check `.env` file exists
- Verify variable names match `lib/env.ts`
- Restart dev server after changes

**Database errors:**
- Run setup SQL in Supabase
- Check foreign key constraints
- Verify RLS policies

See [INSTALLATION.md](./INSTALLATION.md#troubleshooting) for more.

## Contributing

When adding new features:

1. Follow existing patterns in `lib/`
2. Add Zod validation schemas
3. Use service layer for business logic
4. Document in `docs/`
5. Add examples in `examples/`
6. Update OpenAPI spec

## Support

For questions or issues:
1. Check the relevant documentation file
2. Review OpenAPI spec
3. Check example requests
4. Verify environment setup

---

**Last Updated:** 2024-11

**Version:** 1.0.0

**Maintainer:** CareFi Team
