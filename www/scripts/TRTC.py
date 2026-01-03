import json
import uuid

# 顏色對照表（可自行補齊 TRTC 全部）
LINE_COLOR = {
    "BL": "blue",
    "R": "red",
    "G": "green",
    "O": "orange",
    "BR": "brown",
    "Y": "yellow"
}

# 中文路線名稱對照
LINE_NAME = {
    "BL": "板南線",
    "R": "淡水信義線",
    "G": "松山新店線",
    "O": "中和新蘆線",
    "BR": "文湖線",
    "Y": "環狀線"
}

# 方向描述工具函式
def get_line_description(route_name, direction):
    """
    route_name 會像 "頂埔－南港展覽館"
    如果 direction = 0 → 取後面 (往右邊)
    如果 direction = 1 → 取前面 (往左邊)
    """
    parts = route_name.split("－")
    if len(parts) == 2:
        return f"往{parts[1]}"
    return route_name

def main():
    # 讀取 input.json
    with open("input.json", "r", encoding="utf-8") as f:
        data = json.load(f)

    stations_dict = {}

    # 處理每一條路線
    for route in data:
        line_code = route["LineID"]
        line_name = LINE_NAME.get(line_code, route["LineID"])
        line_color = LINE_COLOR.get(line_code, "unknown")
        route_name = route["RouteName"]["Zh_tw"]
        direction = route["Direction"]

        for st in route["Stations"]:
            station_name = st["StationName"]["Zh_tw"]
            station_id = st["StationID"]

            # 如果車站還沒建立，先建立骨架
            if station_name not in stations_dict:
                stations_dict[station_name] = {
                    "stationNameTRTC": station_name,
                    "lines": [],
                    "uuid": str(uuid.uuid4())
                }

            # 新增一條 line 資料
            stations_dict[station_name]["lines"].append({
                "stationNameInLine": station_name,
                "lineName": line_name,
                "linecode": line_code,
                "lineColor": line_color,
                "lineDescription": get_line_description(route_name, direction),
                "direction": direction,
                "stationID": station_id,
                "operator": "TRTC"
            })

    # 轉成你要的結構
    result = {
        "stations": list(stations_dict.values())
    }

    # 寫出成 stationsTRTC.json
    with open("stationsTRTC.json", "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    main()
