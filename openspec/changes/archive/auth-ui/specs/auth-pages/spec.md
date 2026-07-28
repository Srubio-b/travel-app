# Auth Pages Specification

## Purpose

Login and register page forms — validation display, redirect flow, error handling. Uses existing Server Actions (`login`, `register`) and next-intl i18n.

## Requirements

### Requirement: Login form

The login page MUST render an email + password form. On success, the system SHALL redirect to the `?redirect=` query param if present, or home (`/${locale}`) otherwise. Field-level and general errors SHALL display inline.

#### Scenario: Happy path with redirect
- GIVEN valid credentials and `?redirect=/es/admin/destinos`
- WHEN the user submits the login form
- THEN `login()` Server Action succeeds and redirects to `/es/admin/destinos`

#### Scenario: Happy path without redirect
- GIVEN valid credentials and no `?redirect` param
- WHEN the user submits the login form
- THEN `login()` Server Action succeeds and redirects to `/es/`

#### Scenario: Invalid credentials
- GIVEN invalid email or password
- WHEN the user submits the login form
- THEN the form shows a general error message from `AuthResult.error` without revealing which field is wrong

#### Scenario: Missing fields
- GIVEN empty email or password
- WHEN the user submits the login form
- THEN client-side validation prevents submission and highlights the empty fields

#### Scenario: Already authenticated
- GIVEN an active session
- WHEN the user visits `/auth/login`
- THEN middleware redirects home (`/${locale}`)

### Requirement: Register form

The register page MUST render a full name + email + password form. On success with a session, redirect home. If email confirmation is required (`data.session` is null), show a confirmation message.

#### Scenario: Happy path — instant session
- GIVEN valid registration data and email confirmation disabled
- WHEN the user submits the register form
- THEN `register()` creates the user, `handle_new_user()` trigger fires atomically, and the user is redirected home

#### Scenario: Email confirmation required
- GIVEN valid registration data and email confirmation enabled
- WHEN the user submits the register form
- THEN `register()` returns `{ success: true, message }` and the page displays the confirmation message without redirecting

#### Scenario: Duplicate email
- GIVEN an email already registered
- WHEN the user submits the register form
- THEN the form shows a field-level error on the email input

#### Scenario: Weak password
- GIVEN a password under 6 characters
- WHEN the user submits the register form
- THEN the form shows a field-level error on the password input

#### Scenario: Short name
- GIVEN a full_name under 2 characters
- WHEN the user submits the register form
- THEN the form shows a field-level error on the full_name input

### Requirement: i18n for auth pages

The system MUST provide all auth page strings in es and en via next-intl under the `auth` namespace.

| Key | es | en |
|-----|----|----|
| `auth.login.title` | Iniciar sesión | Sign in |
| `auth.login.emailLabel` | Email | Email |
| `auth.login.passwordLabel` | Contraseña | Password |
| `auth.login.submit` | Iniciar sesión | Sign in |
| `auth.login.noAccount` | ¿No tenés cuenta? | Don't have an account? |
| `auth.login.registerLink` | Registrate | Register |
| `auth.register.title` | Crear cuenta | Create account |
| `auth.register.fullNameLabel` | Nombre completo | Full name |
| `auth.register.emailLabel` | Email | Email |
| `auth.register.passwordLabel` | Contraseña | Password |
| `auth.register.submit` | Registrarse | Sign up |
| `auth.register.hasAccount` | ¿Ya tenés cuenta? | Already have an account? |
| `auth.register.loginLink` | Iniciá sesión | Sign in |
| `auth.register.confirmationMessage` | Revisá tu email para confirmar la cuenta. | Check your email to confirm your account. |

## File Changes

| File | Action |
|------|--------|
| `app/[locale]/auth/login/page.tsx` | New — login page with form |
| `app/[locale]/auth/register/page.tsx` | New — register page with form |
| `messages/es.json` | Modified — add `auth` keys |
| `messages/en.json` | Modified — add `auth` keys |
