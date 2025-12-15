# AI Guardrails

1. **No Secrets**: Never output API keys, passwords, or secrets.
2. **Security**: Avoid XSS vulnerabilities. Sanitize inputs.
3. **Performance**: Avoid N+1 queries. Use pagination.
4. **Compliance**: Respect project structure and naming conventions.
5. **Validation**: Validate all inputs using Zod.
