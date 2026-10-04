"""Package the runtime files for local unpacked installation."""
import argparse
import json
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

FILES = (
    "LICENSE",
    "manifest.json",
    "control.css",
    "src/settings.js",
    "src/youtube.js",
    "src/workflow.js",
    "src/content.js",
    "src/shortcut.js",
    "src/options.js",
    "options.html",
    "options.css",
    "popup.html",
    "popup.css",
    "material.css",
    "src/popup.js",
    "icons/icon16.png",
    "icons/icon32.png",
    "icons/icon48.png",
    "icons/icon128.png",
)


def main():
    root = Path(__file__).resolve().parent.parent
    extension = root / "extension"
    manifest = json.loads((extension / "manifest.json").read_text())
    declared = {"manifest.json"}
    declared.update(manifest.get("icons", {}).values())
    for entry in manifest["content_scripts"]:
        declared.update(entry.get("js", []))
        declared.update(entry.get("css", []))
    declared.add(manifest["options_page"])
    declared.add(manifest["action"]["default_popup"])
    declared.update({"popup.css", "src/popup.js", "material.css"})
    declared.update({"options.css", "src/options.js"})
    if declared != set(FILES) - {"LICENSE"}:
        raise ValueError("Manifest runtime files differ from the packaging allowlist")
    for name in FILES:
        path = extension / name
        if not path.is_file() or path.resolve() != path.absolute():
            raise ValueError(f"Missing or linked runtime file: {name}")
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path,
                        default=root / "dist" / f"youtube-shorts-avoid-{manifest['version']}.zip")
    output = parser.parse_args().output
    output.parent.mkdir(parents=True, exist_ok=True)
    with ZipFile(output, "w", ZIP_DEFLATED) as archive:
        for name in FILES:
            archive.write(extension / name, name)
    print(output.resolve())


if __name__ == "__main__":
    main()
