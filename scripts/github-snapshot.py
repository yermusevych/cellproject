"""Emit the complete, git-visible project tree for connector-based GitHub sync."""
from pathlib import Path
import base64
import json
import subprocess

root = Path(__file__).resolve().parents[1]
names = subprocess.check_output(
    ["git", "ls-files", "--cached", "--others", "--exclude-standard", "-z"], cwd=root
).decode("utf-8").split("\0")
entries, binaries = [], []
for name in sorted(set(filter(None, names))):
    path = root / name
    if not path.is_file():
        continue
    data = path.read_bytes()
    try:
        content = data.decode("utf-8")
        if "\0" in content:
            raise UnicodeError("binary content")
        entries.append({"path": name, "mode": "100644", "type": "blob", "content": content})
    except UnicodeError:
        binaries.append({"path": name, "mode": "100644", "content": base64.b64encode(data).decode("ascii")})
print(json.dumps({"tree_elements": entries, "binary_blobs": binaries}, ensure_ascii=True))
