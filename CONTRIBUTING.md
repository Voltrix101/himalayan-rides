# Contributing to Himalayan Rides

We love your input! We want to make contributing to Himalayan Rides as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## 🚀 Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

### Pull requests are the best way to propose changes to the codebase:

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

## 🔧 Development Setup

1. **Fork and clone the repo**
```bash
git clone https://github.com/YOUR_USERNAME/himalayan-rides.git
cd himalayan-rides
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Firebase** (see [Firebase Setup Guide](./FIREBASE_SETUP.md))

4. **Start development server**
```bash
npm run dev
```

5. **Create a feature branch**
```bash
git checkout -b feature/amazing-feature
```

## 📝 Coding Standards

### Code Style
- Use **TypeScript** for all new code
- Follow **ESLint** and **Prettier** configurations
- Use **functional components** with hooks
- Prefer **arrow functions** for event handlers
- Use **descriptive variable names**

### Component Structure
```typescript
// ✅ Good
interface ComponentProps {
  title: string;
  onAction: () => void;
}

export function Component({ title, onAction }: ComponentProps) {
  const [state, setState] = useState(false);
  
  return (
    <div className="component-container">
      {/* Component content */}
    </div>
  );
}
```

### File Organization
- **Components**: `src/components/category/ComponentName.tsx`
- **Hooks**: `src/hooks/useHookName.ts`
- **Utils**: `src/utils/utilityName.ts`
- **Types**: `src/types/index.ts` or component-specific

### Commit Messages
Use conventional commits:
```bash
feat: add new booking confirmation modal
fix: resolve payment gateway connection issue
docs: update README with deployment instructions
style: improve responsive design for mobile
refactor: optimize Firebase queries for performance
```

## 🐛 Bug Reports

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

Use our bug report template:

```markdown
**Bug Description**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment**
- OS: [e.g. Windows, macOS, Linux]
- Browser: [e.g. Chrome, Firefox, Safari]
- Version: [e.g. 22]

**Additional Context**
Add any other context about the problem here.
```

## 💡 Feature Requests

We track feature requests as GitHub issues. When you create a feature request, please include:

- **Clear title** and description
- **Use case** - why is this feature needed?
- **Proposed solution** - how should it work?
- **Alternatives considered** - what other approaches did you consider?
- **Implementation notes** - any technical considerations

## 🧪 Testing

### Running Tests
```bash
npm run test           # Run all tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Run tests with coverage
```

### Writing Tests
- Write tests for new features
- Update tests when changing existing functionality
- Aim for meaningful test coverage
- Use descriptive test names

Example:
```typescript
describe('BookingModal', () => {
  it('should display error when required fields are empty', () => {
    // Test implementation
  });
  
  it('should calculate total price correctly for multiple participants', () => {
    // Test implementation
  });
});
```

## 📁 Project Areas

### 🎯 Frontend Components
- **Authentication**: Login, signup, password reset
- **Booking Flow**: Multi-step booking process
- **UI Components**: Reusable interface elements
- **Responsive Design**: Mobile and desktop optimization

### 🔥 Firebase Integration
- **Authentication**: User management and security
- **Firestore**: Data storage and real-time updates
- **Functions**: Server-side logic (future)
- **Hosting**: Deployment and CDN

### 💳 Payment Integration
- **Razorpay**: Payment processing
- **Demo Mode**: Testing and development
- **Error Handling**: Payment failure scenarios

### 📄 PDF Generation
- **Trip Vouchers**: Professional document generation
- **Branding**: Company logo and styling
- **Print Optimization**: High-quality output

## 🏷️ Issue Labels

We use labels to organize issues:

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to docs
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `priority: high` - Should be addressed soon
- `priority: low` - Can be addressed later

## 🔒 Security

If you find a security vulnerability, please:

1. **DO NOT** open a public issue
2. Email us privately at security@himalayanrides.com
3. Provide as much detail as possible
4. Wait for confirmation before making public

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🤝 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- Special thanks in major version releases

## 📞 Getting Help

- **Documentation**: Check README and setup guides first
- **Discussions**: Use GitHub Discussions for questions
- **Discord**: Join our development community (link in README)
- **Issues**: Create an issue for bugs or feature requests

## 🎉 Thank You!

Your contributions, large and small, make Himalayan Rides better. Thank you for taking the time to contribute!

---

**Happy Coding! 🏔️**
