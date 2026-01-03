import json
import uuid

# 讀取 stations.json
with open("stations.json", "r", encoding="utf-8") as file:
    data = json.load(file)

# 為每個車站新增 uuid（若無則新增）
for station in data["stations"]:
    if "uuid" not in station:
        station["uuid"] = str(uuid.uuid4())

# 將結果寫入新文件
with open("stations_with_uuid.json", "w", encoding="utf-8") as file:
    json.dump(data, file, indent=4, ensure_ascii=False)

print("已成功為所有未分配 UUID 的車站添加 UUID，並存入 stations_with_uuid.json")