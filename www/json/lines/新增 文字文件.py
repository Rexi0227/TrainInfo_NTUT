import json

# 讀取原始 JSON 檔案
with open("宜蘭線.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# 顛倒 stations 順序
data["stations"].reverse()

# 儲存為新的 JSON 檔案
output_path = "宜蘭線_顛倒.json"
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=4)

output_path
