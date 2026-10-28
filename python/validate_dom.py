"""
validate_dom.py
DOM ID検証テスト（Windows環境対応）
"""
import re

def test_dom_ids():
    with open("app.js", "r", encoding="utf-8") as f:
        app_js = f.read()
    with open("index.html", "r", encoding="utf-8") as f:
        html = f.read()

    js_ids = set(re.findall(r'document\.getElementById\(["\']([^"\']+)["\']\)', app_js))
    html_ids = set(re.findall(r'id=["\']([^"\']+)["\']', html))

    missing = js_ids - html_ids
    print(f"Total JS referenced IDs: {len(js_ids)}")
    print(f"Total HTML declared IDs: {len(html_ids)}")

    if missing:
        print(f"[FAIL] Missing IDs in index.html: {missing}")
        assert False, f"Missing IDs: {missing}"
    else:
        print("[SUCCESS] All referenced DOM IDs exist in index.html!")

if __name__ == "__main__":
    test_dom_ids()
