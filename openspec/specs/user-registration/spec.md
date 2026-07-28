# User Registration Specification

## Purpose

Register visitors with email+password, auto-create profile and role `cliente` (role_id=2) via trigger.

## Requirements

### Requirement: Registration

Users SHALL register with email+password (min 6 chars). The trigger MUST atomically insert profile + user_roles (role_id=2).

#### Scenario: Happy path
- GIVEN valid email and password
- WHEN registering
- THEN auth user, profile, role_id=2 created

#### Scenario: Duplicate email
- GIVEN an existing email
- WHEN registering
- THEN reject with duplicate-email error

#### Scenario: Weak password
- GIVEN password under 6 chars
- WHEN submitted
- THEN reject with weak-password error

#### Scenario: Trigger failure
- GIVEN a DB error during inserts
- WHEN the trigger runs
- THEN auth user creation rolls back
