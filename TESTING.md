# Vitest Testing Setup for QuickBite Frontend

## Overview

This project is configured with **Vitest** for unit and component testing. Vitest is a blazing-fast unit test framework powered by Vite, providing excellent TypeScript support and Near-instant feedback in watch mode.

## Installation

Testing dependencies have been installed:

- **vitest**: ^4.1.5 - Fast unit test framework
- **@testing-library/react**: ^16.3.2 - React component testing utilities
- **@testing-library/jest-dom**: ^6.9.1 - Custom DOM matchers
- **@testing-library/user-event**: ^14.6.1 - User interaction simulation
- **jsdom**: ^29.1.1 - JavaScript implementation of web standards

## Running Tests

### Run all tests once:

```bash
npm test
```

### Run tests in watch mode (auto-rerun on file changes):

```bash
npm run test:watch
```

### Run tests with UI dashboard:

```bash
npm run test:ui
```

This opens an interactive browser dashboard at `http://localhost:51204/__vitest__/` to view and debug tests.

## Test Files

### Component Tests

- **`src/components/Brand.test.jsx`** - Tests the Brand logo component
- **`src/components/Toasts.test.jsx`** - Tests the Toast notification component
- **`src/components/AppNav.test.jsx`** - Tests the App navigation component
- **`src/components/AppLayout.test.jsx`** - Tests the AppLayout component structure

### Page Tests

- **`src/pages/Landing.test.jsx`** - Tests the Landing page
- **`src/pages/Login.test.jsx`** - Tests the Login page form

### Store Tests

- **`src/store/auth.test.js`** - Tests authentication store
- **`src/store/toast.test.js`** - Tests toast notification store
- **`src/store/cart.test.js`** - Tests shopping cart store

### API Tests

- **`src/api/client.test.js`** - Tests API client utilities

## Configuration

### Vite Config (`vite.config.js`)

Test configuration includes:

```javascript
test: {
  globals: true,              // Use global test functions (describe, it, etc.)
  environment: 'jsdom',       // Use jsdom for DOM testing
  setupFiles: 'src/setupTests.js',  // Global setup file
  include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],  // Test file patterns
  coverage: {
    provider: 'istanbul',
    reporter: ['text', 'lcov'],
  },
}
```

### Setup File (`src/setupTests.js`)

Initializes testing libraries:

```javascript
import "@testing-library/jest-dom";
```

## Writing Tests

### Component Test Example

```javascript
import { render, screen } from "@testing-library/react";
import { Brand } from "./Brand";

describe("Brand component", () => {
  it("renders the brand text", () => {
    render(<Brand />);
    expect(screen.getByText(/QuickBite/i)).toBeInTheDocument();
  });
});
```

### Store Test Example

```javascript
import { renderHook, act } from "@testing-library/react";
import { useCart } from "./cart";

describe("Cart Store", () => {
  it("adds items to cart", () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.add({ id: 1, price: 10 });
    });

    expect(result.current.items).toHaveLength(1);
  });
});
```

## Best Practices

1. **Test names should be descriptive**: `it('adds item to cart')`
2. **Use data-testid for complex queries**: `screen.getByTestId('submit-btn')`
3. **Mock external dependencies**: Use `vi.mock()` for stores and APIs
4. **Test behavior, not implementation**: Focus on what users see and do
5. **Keep tests focused**: One assertion or related group of assertions per test
6. **Use beforeEach for setup**: Initialize mocks and state before each test
7. **Clean up after tests**: Clear mocks in `afterEach` hook

## Testing React Components

### Rendering Components

```javascript
import { render } from "@testing-library/react";

render(<MyComponent />);
```

### Querying Elements

```javascript
// By text
screen.getByText("Login");

// By role
screen.getByRole("button", { name: /submit/i });

// By testid
screen.getByTestId("nav-menu");

// By placeholder
screen.getByPlaceholderText("Email address");
```

### User Interactions

```javascript
import { fireEvent } from "@testing-library/react";

const button = screen.getByRole("button");
fireEvent.click(button);
```

### Async Testing

```javascript
import { waitFor } from "@testing-library/react";

await waitFor(() => {
  expect(screen.getByText("Success")).toBeInTheDocument();
});
```

## Mocking

### Mock Zustand Stores

```javascript
vi.mock("../store/auth", () => ({
  useAuthStore: vi.fn(() => ({
    user: null,
    logout: vi.fn(),
  })),
}));
```

### Mock API Calls

```javascript
vi.mock("../api/client", () => ({
  API: {
    login: vi.fn().mockResolvedValue({ user: { id: 1 } }),
  },
}));
```

## Coverage Reports

To generate coverage reports:

```bash
npm test -- --coverage
```

Coverage reports will be available in:

- Terminal output
- `coverage/` directory (lcov format)

## Debugging Tests

### Run Single Test File

```bash
npm test src/components/Brand.test.jsx
```

### Run Tests Matching Pattern

```bash
npm test -- --grep "brand"
```

### Debug Mode

```bash
npm test -- --inspect-brk
```

Then open `chrome://inspect` in Chrome to debug.

## Common Testing Patterns

### Testing Form Submission

```javascript
it("submits form with valid data", async () => {
  render(<LoginForm />);

  fireEvent.change(screen.getByPlaceholderText("Email"), {
    target: { value: "test@example.com" },
  });
  fireEvent.change(screen.getByPlaceholderText("Password"), {
    target: { value: "password123" },
  });
  fireEvent.click(screen.getByRole("button", { name: /login/i }));

  await waitFor(() => {
    expect(mockLogin).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });
  });
});
```

### Testing Navigation

```javascript
import { BrowserRouter } from "react-router-dom";

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

it("navigates to dashboard on login", () => {
  renderWithRouter(<LoginPage />);
  // test navigation logic
});
```

## Troubleshooting

### "Cannot find module" errors

- Check that file paths are correct
- Ensure `.js` or `.jsx` extensions are included in imports
- Verify circular dependencies

### "Invalid hook call" warnings

- Don't call hooks directly in tests
- Use `renderHook` from @testing-library/react for hook testing

### Timeout errors in async tests

- Increase timeout: `it('test', async () => {...}, 10000)`
- Use `vi.useFakeTimers()` and `vi.advanceTimersByTime()`

### Element not found errors

- Use `screen.debug()` to see rendered HTML
- Check if element requires user interaction or async loading
- Ensure correct query selector (getBy, queryBy, findBy)

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)

## Next Steps

1. **Expand test coverage** - Add tests for remaining components and pages
2. **Add integration tests** - Test complete user workflows
3. **Set up CI/CD** - Run tests on pull requests
4. **Configure coverage thresholds** - Enforce minimum coverage requirements
5. **Add snapshot tests** - Capture component output for regression testing

---

**Last Updated**: May 11, 2026  
**Vitest Version**: 4.1.5  
**Test Files**: 10  
**Total Tests**: 20+
