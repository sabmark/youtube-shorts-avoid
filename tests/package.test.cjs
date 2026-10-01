const test = require('node:test');
const assert = require('node:assert/strict');
const { mkdtempSync, cpSync, mkdirSync, writeFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join, resolve } = require('node:path');
const { spawnSync } = require('node:child_process');

test('package contains declared runtime files only, excluding development and secret-like files', () => {
  const source = resolve(__dirname, '..');
  const fixture = mkdtempSync(join(tmpdir(), 'shorts-package-'));
  cpSync(join(source, 'extension'), join(fixture, 'extension'), { recursive: true });
  mkdirSync(join(fixture, 'scripts'));
  writeFileSync(join(fixture, 'extension', '.env'), 'FAKE_ACCOUNT_TOKEN=fixture-only');
  writeFileSync(join(fixture, 'extension', 'debug.log'), 'fixture account data');
  writeFileSync(join(fixture, 'extension', 'src', 'dev.test.js'), 'fixture test');
  cpSync(join(source, 'scripts', 'package.py'), join(fixture, 'scripts', 'package.py'));
  const output = join(fixture, 'output.zip');
  const packed = spawnSync('python3', [join(fixture, 'scripts', 'package.py'), '--output', output], { encoding: 'utf8' });
  assert.equal(packed.status, 0, packed.stderr);
  const checked = spawnSync('python3', ['-c', `
import json, sys, zipfile
with zipfile.ZipFile(sys.argv[1]) as archive:
    expected = {'manifest.json', 'control.css', 'src/youtube.js', 'src/workflow.js', 'src/content.js'}
    assert set(archive.namelist()) == expected, archive.namelist()
    manifest = json.loads(archive.read('manifest.json'))
    for entry in manifest['content_scripts']:
        for path in entry['js'] + entry['css']:
            assert path in archive.namelist(), path
    assert archive.testzip() is None
`, output], { encoding: 'utf8' });
  assert.equal(checked.status, 0, checked.stderr);
});
