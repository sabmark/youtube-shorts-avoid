const test = require('node:test');
const assert = require('node:assert/strict');
const { mkdtempSync, cpSync, mkdirSync, writeFileSync, readFileSync } = require('node:fs');
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
import json, sys, zipfile, struct
with zipfile.ZipFile(sys.argv[1]) as archive:
    expected = {'manifest.json', 'control.css', 'src/settings.js', 'src/youtube.js', 'src/workflow.js', 'src/content.js',
                'popup.html', 'popup.css', 'src/popup.js',
                'material.css',
                'src/shortcut.js', 'src/options.js', 'options.html', 'options.css',
                'icons/icon16.png', 'icons/icon32.png', 'icons/icon48.png', 'icons/icon128.png', 'LICENSE'}
    assert set(archive.namelist()) == expected, archive.namelist()
    license_text = archive.read('LICENSE').decode()
    assert license_text.splitlines()[0] == 'MIT License'
    assert 'Copyright (c) 2026 Mark Anthony Sabandal' in license_text
    manifest = json.loads(archive.read('manifest.json'))
    for entry in manifest['content_scripts']:
        for path in entry.get('js', []) + entry.get('css', []):
            assert path in archive.namelist(), path
    for size in (16, 32, 48, 128):
        path = manifest['icons'][str(size)]
        png = archive.read(path)
        assert png[:8] == bytes((137, 80, 78, 71, 13, 10, 26, 10)), path
        assert struct.unpack('>II', png[16:24]) == (size, size), path
    assert archive.testzip() is None
`, output], { encoding: 'utf8' });
  assert.equal(checked.status, 0, checked.stderr);
});

test('the installable extension retains the repository MIT license notice', () => {
  const source = resolve(__dirname, '..');
  assert.equal(readFileSync(join(source, 'extension', 'LICENSE'), 'utf8'), readFileSync(join(source, 'LICENSE'), 'utf8'));
});
