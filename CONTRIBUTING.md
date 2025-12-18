# 🤝 Contributing to VaultGuard

Thank you for your interest in contributing to VaultGuard! This document provides guidelines and instructions for contributing to the project.

---

## 📑 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Project Structure](#project-structure)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)
- [Security Considerations](#security-considerations)
- [Documentation](#documentation)
- [Community](#community)

---

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of:
- Age, body size, disability, ethnicity, gender identity and expression
- Level of experience, education, socio-economic status
- Nationality, personal appearance, race, religion, or sexual identity and orientation

### Our Standards

**Positive behaviors** ✅:
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what's best for the community
- Showing empathy towards others

**Unacceptable behaviors** ❌:
- Trolling, insulting/derogatory comments, personal or political attacks
- Public or private harassment
- Publishing others' private information without permission
- Any conduct that could reasonably be considered inappropriate

### Enforcement

Violations can be reported to support@volcanion.vn. All complaints will be reviewed and investigated promptly and fairly.

---

## 🚀 Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Node.js** 18.x or higher
- **npm** or **yarn** package manager
- **Git** for version control
- **iOS Simulator** (macOS) or **Android Emulator**
- **Code editor** (VS Code recommended)

### Setting Up Development Environment

1. **Fork the repository**

```bash
# On GitHub, click "Fork" button
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/vault-guard-app.git
cd vault-guard-app
```

2. **Add upstream remote**

```bash
git remote add upstream https://github.com/volcanion-company/vault-guard-app.git
```

3. **Install dependencies**

```bash
npm install
# or
yarn install
```

4. **Configure environment**

Update `src/config/env.ts` with your development settings:

```typescript
export const ENV = {
  AUTH_BASE_URL: 'http://localhost:5001', // Local backend
  API_BASE_URL: 'http://localhost:5002',
  ENV: 'development',
};
```

5. **Start development server**

```bash
npm start
```

6. **Run on device/emulator**

```bash
npm run ios     # iOS
npm run android # Android
```

---

## 🔄 Development Workflow

### 1. Create a Feature Branch

```bash
# Update your main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

**Branch naming conventions**:
- `feature/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation updates
- `test/` - Test additions/updates
- `chore/` - Maintenance tasks

### 2. Make Your Changes

```bash
# Make changes to code
# Test thoroughly
# Commit with descriptive messages
```

### 3. Keep Branch Updated

```bash
# Regularly sync with upstream
git fetch upstream
git rebase upstream/main
```

### 4. Push Changes

```bash
git push origin feature/your-feature-name
```

### 5. Create Pull Request

- Go to GitHub and create PR from your fork
- Fill out the PR template
- Link related issues
- Request review

---

## 💻 Coding Standards

### TypeScript Guidelines

#### 1. **Use Strict Mode**

```typescript
// tsconfig.json already has strict: true
// Always follow strict type checking
```

#### 2. **Explicit Types**

```typescript
// ✅ Good
function getUserById(id: string): Promise<User> {
  return apiClient.get<User>(`/users/${id}`);
}

// ❌ Bad
function getUserById(id) {
  return apiClient.get(`/users/${id}`);
}
```

#### 3. **Interfaces over Types**

```typescript
// ✅ Good
interface User {
  id: string;
  email: string;
  name: string;
}

// ❌ Avoid (unless necessary)
type User = {
  id: string;
  email: string;
  name: string;
};
```

#### 4. **No Any Types**

```typescript
// ✅ Good
function processData(data: VaultItem[]): DecryptedItemData[] {
  // ...
}

// ❌ Bad
function processData(data: any): any {
  // ...
}
```

### React Native Guidelines

#### 1. **Functional Components**

```typescript
// ✅ Good
export default function LoginScreen() {
  const [email, setEmail] = useState('');
  return <View>...</View>;
}

// ❌ Avoid
class LoginScreen extends Component {
  // ...
}
```

#### 2. **Hooks Best Practices**

```typescript
// ✅ Good - Custom hooks
function useVaultData(vaultId: string) {
  const { fetchItems } = useVaultItemStore();
  
  useEffect(() => {
    fetchItems(vaultId);
  }, [vaultId]);
}

// ✅ Good - Dependency arrays
useEffect(() => {
  loadData();
}, [dependency1, dependency2]);

// ❌ Bad - Missing dependencies
useEffect(() => {
  loadData();
}, []); // Should include loadData dependencies
```

#### 3. **Component Structure**

```typescript
export default function ComponentName() {
  // 1. Hooks
  const { data } = useStore();
  const [state, setState] = useState();
  
  // 2. Effects
  useEffect(() => {
    // Side effects
  }, []);
  
  // 3. Handlers
  const handlePress = () => {
    // Logic
  };
  
  // 4. Render helpers
  const renderItem = () => {
    // JSX
  };
  
  // 5. Return JSX
  return (
    <View>
      {/* ... */}
    </View>
  );
}

// 6. Styles
const styles = StyleSheet.create({
  // ...
});
```

### Naming Conventions

```typescript
// Files
login.tsx              // Screens: lowercase
Button.tsx             // Components: PascalCase
auth.service.ts        // Services: lowercase.type.ts
auth.store.ts          // Stores: lowercase.store.ts
validation.ts          // Utils: lowercase.ts

// Variables
const userName = '';          // camelCase
const MAX_RETRIES = 3;        // UPPER_SNAKE_CASE for constants
const apiClient = axios.create(); // camelCase

// Functions
function getUserById() {}     // camelCase
async function fetchData() {} // camelCase

// Components
function LoginScreen() {}     // PascalCase
const Button = () => {};      // PascalCase

// Interfaces/Types
interface User {}             // PascalCase
type VaultIcon = 'key' | 'lock'; // PascalCase

// Enums
enum ItemType {               // PascalCase
  Password = 'password',
  Note = 'note',
}
```

### Code Formatting

**We use ESLint and Prettier** (configured in project):

```bash
# Check linting
npm run lint

# Auto-fix issues
npm run lint -- --fix

# Type checking
npm run type-check
```

**Key rules**:
- ✅ 2 spaces for indentation
- ✅ Single quotes for strings
- ✅ Semicolons required
- ✅ Trailing commas in objects/arrays
- ✅ Max line length: 100 characters

### Comments and Documentation

```typescript
/**
 * Encrypts data using AES-256-GCM
 * 
 * @param data - Plaintext string to encrypt
 * @param encryptionKey - Base64-encoded 256-bit key
 * @returns Encrypted data with IV and authentication tag
 * @throws {Error} If encryption fails or key is invalid
 * 
 * @example
 * const encrypted = await encryptData('password123', key);
 * // Returns: { encryptedData: '...', iv: '...', authTag: '...' }
 */
export async function encryptData(
  data: string,
  encryptionKey: string
): Promise<EncryptedData> {
  // Implementation
}
```

**When to comment**:
- ✅ Complex algorithms
- ✅ Security-critical code
- ✅ Non-obvious business logic
- ✅ Public API functions
- ❌ Self-explanatory code

---

## 📁 Project Structure

When adding new files, follow this structure:

```
src/
├── app/                     # Screens only
│   ├── (auth)/             # Auth screens
│   └── (app)/              # Main app screens
├── components/             # Reusable UI components
├── store/                  # Zustand stores
├── services/               # API services
├── crypto/                 # Cryptography
├── types/                  # Type definitions
├── utils/                  # Utilities
└── config/                 # Configuration
```

**Where to add new code**:

| Type | Location | Example |
|------|----------|---------|
| New screen | `src/app/` | `src/app/(app)/profile.tsx` |
| UI component | `src/components/` | `src/components/Modal.tsx` |
| Store | `src/store/` | `src/store/settings.store.ts` |
| API service | `src/services/` | `src/services/profile.service.ts` |
| Utility | `src/utils/` | `src/utils/date.ts` |
| Type | `src/types/` | Add to `src/types/index.ts` |

---

## 📝 Commit Guidelines

We follow **Conventional Commits** specification:

### Commit Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, semicolons, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Adding tests
- `chore`: Maintenance tasks

### Examples

```bash
# Feature
git commit -m "feat(auth): add biometric unlock support"

# Bug fix
git commit -m "fix(crypto): handle encryption errors gracefully"

# Documentation
git commit -m "docs(readme): update installation instructions"

# Refactoring
git commit -m "refactor(store): simplify vault state management"

# Performance
git commit -m "perf(crypto): cache decrypted items"

# With body
git commit -m "feat(vault): add vault sharing

Allow users to share vaults with other users.
Implements end-to-end encryption for shared vaults.

Closes #123"
```

### Commit Best Practices

- ✅ Use imperative mood ("add" not "added")
- ✅ Keep subject line under 50 characters
- ✅ Capitalize subject line
- ✅ No period at end of subject
- ✅ Separate subject from body with blank line
- ✅ Wrap body at 72 characters
- ✅ Explain *what* and *why*, not *how*

---

## 🔀 Pull Request Process

### Before Creating PR

1. ✅ Code follows style guidelines
2. ✅ No TypeScript errors (`npm run type-check`)
3. ✅ No linting errors (`npm run lint`)
4. ✅ Tested on iOS and Android
5. ✅ Added/updated documentation
6. ✅ Commits follow guidelines
7. ✅ Branch is up to date with main

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested on iOS
- [ ] Tested on Android
- [ ] Added tests (if applicable)

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] No new warnings
- [ ] Added tests
- [ ] All tests pass
```

### Review Process

1. **Automated Checks**: CI/CD runs linting and type checking
2. **Code Review**: Maintainers review code
3. **Testing**: Reviewers test functionality
4. **Approval**: At least 1 approval required
5. **Merge**: Squash and merge to main

### After PR is Merged

```bash
# Update your local repository
git checkout main
git pull upstream main

# Delete feature branch
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

---

## 🧪 Testing Guidelines

### Manual Testing Checklist

Before submitting PR, test:

#### Authentication
- [ ] User can register
- [ ] User can login
- [ ] User can logout
- [ ] Token refresh works
- [ ] App lock/unlock works
- [ ] Biometric unlock works

#### Vaults
- [ ] Create vault
- [ ] List vaults
- [ ] Update vault
- [ ] Delete vault
- [ ] Vault icons display correctly

#### Items
- [ ] Create password item
- [ ] View encrypted item
- [ ] Decrypt and display password
- [ ] Copy to clipboard
- [ ] Delete item
- [ ] Password generator works

#### Security
- [ ] Encryption key cleared on lock
- [ ] Clipboard clears after 60s
- [ ] No plaintext in network logs
- [ ] Token stored securely

### Future: Automated Tests

When test suite is implemented:

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- auth.service.test.ts
```

---

## 🔐 Security Considerations

### Critical Security Rules

#### 1. **Never Log Sensitive Data**

```typescript
// ❌ NEVER do this
console.log('Master password:', masterPassword);
console.log('Encryption key:', encryptionKey);
console.log('Decrypted data:', decryptedData);

// ✅ Safe logging
console.log('Encryption operation completed');
console.log('User authenticated:', userId);
```

#### 2. **Never Store Encryption Key**

```typescript
// ❌ NEVER do this
await SecureStore.setItemAsync('encryptionKey', key);
localStorage.setItem('encryptionKey', key);

// ✅ Correct - Memory only
const authStore = create((set) => ({
  encryptionKey: null, // Stored in Zustand (memory)
}));
```

#### 3. **Always Validate Input**

```typescript
// ✅ Good
function createVault(name: string) {
  if (!name || name.trim().length === 0) {
    throw new Error('Vault name is required');
  }
  if (name.length > 100) {
    throw new Error('Vault name too long');
  }
  // Proceed
}
```

#### 4. **Use Constant-Time Comparison**

```typescript
// For password verification, use crypto-safe comparison
// (Future implementation)
```

#### 5. **Clear Sensitive Data**

```typescript
// ✅ Good - Clear on logout
logout: () => {
  set({
    user: null,
    token: null,
    encryptionKey: null, // Clear encryption key
  });
  SecureStore.deleteItemAsync('authToken');
  SecureStore.deleteItemAsync('refreshToken');
}
```

### Security Review Checklist

Before submitting security-related code:

- [ ] No sensitive data logged
- [ ] No encryption key persisted
- [ ] Input validation implemented
- [ ] Error messages don't leak info
- [ ] HTTPS enforced
- [ ] Dependencies up to date
- [ ] No hardcoded secrets

---

## 📚 Documentation

### What to Document

1. **New Features**: Update README and ARCHITECTURE
2. **API Changes**: Update JSDoc comments
3. **Configuration**: Update env.ts and docs
4. **Breaking Changes**: Highlight in PR and CHANGELOG

### Documentation Style

```typescript
/**
 * Short description
 * 
 * Longer description if needed. Explain purpose,
 * important details, and edge cases.
 * 
 * @param paramName - Description
 * @returns Description
 * @throws {ErrorType} When error occurs
 * 
 * @example
 * const result = functionName(param);
 * 
 * @see {@link RelatedFunction}
 * @since 1.1.0
 */
```

---

## 👥 Community

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **Pull Requests**: Code contributions and discussions
- **Email**: support@volcanion.vn

### Getting Help

1. Check [README.md](README.md)
2. Check [ARCHITECTURE.md](ARCHITECTURE.md)
3. Search [existing issues](https://github.com/volcanion-company/vault-guard-app/issues)
4. Create new issue if needed

### Reporting Bugs

Use this template:

```markdown
**Description**
Clear description of the bug

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- OS: [iOS 17.0 / Android 14]
- Device: [iPhone 15 / Pixel 8]
- App Version: [1.0.0]

**Screenshots**
If applicable

**Additional Context**
Any other relevant info
```

### Feature Requests

Use this template:

```markdown
**Problem**
What problem does this solve?

**Proposed Solution**
How would you solve it?

**Alternatives**
Other solutions considered

**Additional Context**
Mockups, examples, etc.
```

---

## 🏆 Recognition

Contributors will be:
- Listed in README.md
- Mentioned in release notes
- Given credit in commit history

Thank you for contributing to VaultGuard! 🙏

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

<div align="center">

**Questions? Contact us at support@volcanion.vn**

[⬅️ Back to README](README.md) | [📖 Architecture](ARCHITECTURE.md) | [🔒 Security](SECURITY.md)

</div>
