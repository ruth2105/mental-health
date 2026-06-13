# Contributing Guide

Thank you for considering contributing to the Mental Health Platform!

## Development Setup

1. Fork the repository
2. Clone your fork
3. Follow [Setup Guide](docs/setup/SETUP.md)
4. Create a feature branch

## Code Standards

### Python (Backend)
- Follow PEP 8
- Use type hints
- Write docstrings
- Maximum line length: 100 characters

### TypeScript (Frontend)
- Use TypeScript strict mode
- Follow ESLint rules
- Use functional components
- Write prop types

## Testing

- Write tests for new features
- Maintain test coverage above 80%
- Run tests before committing

```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm test
```

## Commit Messages

Follow conventional commits:

```
feat: add user profile page
fix: resolve login redirect issue
docs: update API documentation
test: add appointment booking tests
```

## Pull Request Process

1. Update documentation
2. Add tests
3. Ensure CI passes
4. Request review
5. Address feedback

## Code Review

- Be respectful
- Provide constructive feedback
- Explain reasoning
- Suggest improvements

## Questions?

Open an issue or contact maintainers.
