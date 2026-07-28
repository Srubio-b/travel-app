# Client Profile Specification

## Purpose

Let authenticated users read and update their profile (name, phone, avatar). RLS restricts each user to their own `profiles` row.

## Requirements

### Requirement: Read profile

Users SHALL read own name, phone, avatar. RLS MUST prevent cross-user access.

#### Scenario: View own profile
- GIVEN an authenticated user
- WHEN requesting their profile
- THEN name, phone, avatar returned

#### Scenario: RLS blocks others
- GIVEN a user
- WHEN querying another's profile
- THEN RLS returns zero

### Requirement: Update profile

Users SHALL update their name and phone. Invalid formats SHOULD reject.

#### Scenario: Successful update
- GIVEN an authenticated user
- WHEN submitting new name and phone
- THEN profiles is updated

#### Scenario: Invalid phone
- GIVEN a malformed phone
- WHEN submitted
- THEN reject with validation error

### Requirement: Avatar

The system MAY support avatars. Store in Supabase Storage, URL in profiles.avatar.

#### Scenario: Avatar upload
- GIVEN an authenticated user
- WHEN uploading an avatar
- THEN image stored in Storage, URL in profile updated
