# Testing Guidelines

## Frameworks
- **Unit/Integration**: Jest + React Testing Library
- **E2E**: Playwright (if applicable)

## Principles
1. **Behavior Driven**: Test user interactions and behavior, not implementation details.
2. **Accessibility**: Ensure tests check for accessibility (aria-labels, roles).
3. **Mocking**: Mock external services and database calls. Use `jest.mock`.
4. **Coverage**: Aim for high test coverage on critical paths.

## Example
```typescript
import { render, screen } from '@testing-library/react'
import MyComponent from './MyComponent'

test('renders correctly', () => {
  render(<MyComponent />)
  expect(screen.getByText('Hello')).toBeInTheDocument()
})
```
