-- Migration: Add SEO fields to destinations
--
-- What:
--   Add meta_title (max 70 chars) and meta_description (max 160 chars)
--   columns to the destinations table for search-engine optimisation.

alter table destinations
  add column meta_title       varchar(70),
  add column meta_description varchar(160);
