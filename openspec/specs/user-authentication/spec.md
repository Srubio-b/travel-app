# User Authentication Specification

## Purpose

Authenticate via email/password, persist sessions with httpOnly cookies, refresh transparently, terminate on logout.

## Requirements

### Requirement: Login

The system MUST authenticate with email+password and persist sessions via httpOnly cookies.

#### Scenario: Success
- GIVEN valid credentials
- WHEN logging in
- THEN session created with httpOnly cookies

#### Scenario: Invalid credentials
- GIVEN wrong email or password
- WHEN submitted
- THEN invalid-credentials error returned

### Requirement: Logout

The system MUST terminate sessions and clear cookies.

#### Scenario: Logout
- GIVEN an authenticated user
- WHEN logging out
- THEN session ends, cookies cleared, redirects home

### Requirement: Session refresh

The system SHALL refresh tokens transparently via @supabase/ssr refresh cookie.

#### Scenario: Expired token
- GIVEN expired access token with valid refresh token
- WHEN a server request occurs
- THEN session refreshes transparently
