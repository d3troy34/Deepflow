import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'

const migrationsDir = join(process.cwd(), 'supabase', 'migrations')

function allMigrationSql(): string {
  return readdirSync(migrationsDir)
    .filter((name) => name.endsWith('.sql'))
    .sort()
    .map((name) => readFileSync(join(migrationsDir, name), 'utf8'))
    .join('\n')
}

test('Supabase migrations define the private admin helper referenced by RLS policies', () => {
  const sql = allMigrationSql()

  assert.match(sql, /create\s+or\s+replace\s+function\s+private\.is_admin\s*\(/i)
  assert.match(sql, /raw_app_meta_data/i)
  assert.doesNotMatch(sql, /auth\.jwt\s*\(\s*\).*raw_user_meta_data/i)
})

test('Supabase migrations harden open advisor findings', () => {
  const sql = allMigrationSql()

  assert.match(sql, /create\s+or\s+replace\s+function\s+public\.touch_research_deliverables_updated_at\s*\(\s*\)[\s\S]*set\s+search_path\s*=\s*''/i)
  assert.match(sql, /email_log_publication_id_idx/i)
  assert.match(sql, /positions_tesis_id_idx/i)
  assert.match(sql, /private\.is_admin\s*\(\s*\(\s*select\s+auth\.uid\s*\(\s*\)\s*\)\s*\)/i)
  assert.match(sql, /billing_customers_no_client_access/i)
  assert.match(sql, /credit_ledger_no_client_access/i)
})
