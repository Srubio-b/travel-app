# Profile Page Specification

## Purpose

Authenticated profile page under `/mi-cuenta/perfil` — displays user info (full_name, email, phone, avatar), provides an edit form to update name and phone, and supports avatar upload with preview.

## Requirements

### Requirement: Profile display

The profile page SHALL display the authenticated user's full_name, email, phone, and avatar_url sourced from the `profiles` table and `auth.users`.

#### Scenario: View own profile
- GIVEN an authenticated user with a complete profile
- WHEN navigating to `/mi-cuenta/perfil`
- THEN the page shows the user's full_name, email, phone, and avatar (or placeholder if no avatar)

### Requirement: Edit profile form

The system SHALL provide a form to update `full_name` and `phone`. On success, the form SHALL show a success message and revalidate the profile data. Invalid formats SHALL display inline errors.

#### Scenario: Successful update
- GIVEN an authenticated user on the profile page
- WHEN the user submits a valid full_name and phone
- THEN `updateProfile()` returns `{ success: true }`, the form shows a success message, and the updated values are reflected

#### Scenario: Empty name
- GIVEN an authenticated user
- WHEN the user submits with an empty full_name
- THEN the form shows a field-level error on full_name

#### Scenario: Invalid phone format
- GIVEN an authenticated user
- WHEN the user submits with a malformed phone
- THEN the form shows a field-level error on phone

### Requirement: Avatar upload

The system SHALL provide an avatar upload UI with file picker (accept PNG, JPEG, WebP, GIF, max 2 MB), client-side preview before upload, and upload to the `avatars` Supabase storage bucket. Upload progress and error states SHALL be visible.

#### Scenario: Successful upload
- GIVEN an authenticated user on the profile page
- WHEN the user selects a valid image file
- THEN a preview thumbnail appears, the user confirms, `uploadAvatar()` uploads to the `avatars` bucket, and the profile avatar updates immediately

#### Scenario: Invalid file type
- GIVEN an authenticated user
- WHEN the user selects a non-image file
- THEN the form rejects it with a format error before upload

#### Scenario: File too large
- GIVEN an authenticated user
- WHEN the user selects an image over 2 MB
- THEN the form rejects it with a size error before upload

#### Scenario: Upload failure
- GIVEN an authenticated user
- WHEN the upload to Supabase Storage fails
- THEN the form shows an error message and the previous avatar remains unchanged

### Requirement: i18n for profile

The system MUST provide profile page strings in es and en under the `profile` namespace.

| Key | es | en |
|-----|----|----|
| `profile.title` | Mi Perfil | My Profile |
| `profile.fullNameLabel` | Nombre completo | Full name |
| `profile.emailLabel` | Email | Email |
| `profile.phoneLabel` | Teléfono | Phone |
| `profile.avatarLabel` | Avatar | Avatar |
| `profile.save` | Guardar cambios | Save changes |
| `profile.saved` | Perfil actualizado | Profile updated |
| `profile.avatarChange` | Cambiar foto | Change photo |
| `profile.avatarRemove` | Eliminar foto | Remove photo |

## File Changes

| File | Action |
|------|--------|
| `app/[locale]/mi-cuenta/perfil/page.tsx` | New — profile display + edit form container |
| `messages/es.json` | Modified — add `profile` keys |
| `messages/en.json` | Modified — add `profile` keys |
