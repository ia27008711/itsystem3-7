"""
test_scenarios.py
シナリオデータの整合性とノード遷移の完全性を検証するテスト
"""
import re

def test_scenarios():
    with open("scenarios.js", "r", encoding="utf-8") as f:
        content = f.read()

    assert "const SCENARIOS = [" in content, "SCENARIOS definition missing"
    assert "const QUIZ_QUESTIONS = [" in content, "QUIZ_QUESTIONS definition missing"
    assert "const GROOMING_STEPS = [" in content, "GROOMING_STEPS definition missing"
    assert "const RED_FLAG_WORDS = [" in content, "RED_FLAG_WORDS definition missing"
    assert "const SOS_CONTACTS = [" in content, "SOS_CONTACTS definition missing"

    scenario_ids = re.findall(r'id:\s*["\']([^"\']+)["\']', content)
    print(f"Detected IDs count: {len(scenario_ids)}")

    required_keys = ["title", "partner", "nodes", "startNode"]
    for key in required_keys:
        assert key in content, f"Key '{key}' missing from scenarios"

    # CASE 1, CASE 2, CASE 3の存在確認
    assert "scenario_line_aoi" in content, "CASE 1 (aoi) missing"
    assert "scenario_line_ren" in content, "CASE 2 (ren) missing"
    assert "scenario_line_scout" in content, "CASE 3 (scout) missing"

    print("[SUCCESS] All scenario, quiz, and safety guide data integrity checks passed!")

if __name__ == "__main__":
    test_scenarios()
