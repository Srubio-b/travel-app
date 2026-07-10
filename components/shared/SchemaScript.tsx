type SchemaScriptProps = {
  schema: Record<string, unknown>;
};

/**
 * Renders a JSON-LD structured data block as an inline <script> tag.
 * Safe for Server Components — no client JS required.
 */
export function SchemaScript({ schema }: SchemaScriptProps) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
