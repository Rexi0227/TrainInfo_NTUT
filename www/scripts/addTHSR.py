import json

# 讀取原本的車站列表
with open('stations.json', 'r', encoding='utf-8') as f:
    stations_data = json.load(f)

# 讀取高鐵車站列表
with open('stationsTHSR.json', 'r', encoding='utf-8') as f:
    thsr_stations = json.load(f)

# 高鐵站名對應表
thsr_name_map = {
    "台北": "臺北",
    "桃園": "高鐵桃園",
    "新竹": "高鐵新竹",
    "苗栗": "高鐵苗栗",
    "台中": "高鐵台中",
    "彰化": "高鐵彰化",
    "雲林": "高鐵雲林",
    "嘉義": "高鐵嘉義",
    "台南": "高鐵台南",
    "左營": "高鐵左營"
}

# 高鐵與台鐵共用車站對應表
shared_stations = {
    "高鐵新竹": "六家",
    "高鐵苗栗": "豐富",
    "高鐵台中": "新烏日",
    "高鐵台南": "沙崙",
    "高鐵左營": "新左營"
}

# 處理車站資料
stations_map = {station["stationName"]: station for station in stations_data["stations"]}

def add_thsr_line(station, original_name):
    if "lines" not in station:
        station["lines"] = []
    station["lines"].append({
        "stationNameInLine": original_name,
        "lineName": "台灣高鐵",
        "linecode": "THSR",
        "lineColor": "#d83632",
        "lineDescription": "",
        "direction": 0
    })
    station["lines"].append({
        "stationNameInLine": original_name,
        "lineName": "台灣高鐵",
        "linecode": "THSR",
        "lineColor": "#d83632",
        "lineDescription": "",
        "direction": 1
    })

for thsr_station in thsr_stations:
    original_name = thsr_station["StationName"]["Zh_tw"]
    mapped_name = thsr_name_map.get(original_name, original_name)
    
    # 確認是否為共享站
    if mapped_name in shared_stations:
        mapped_name = shared_stations[mapped_name]
    
    if mapped_name in stations_map:
        # 車站已存在，添加高鐵路線
        station = stations_map[mapped_name]
        add_thsr_line(station, original_name)
        station["stationNameTHSR"] = thsr_name_map.get(original_name, original_name)
    else:
        # 車站不存在，新增站點
        new_station = {
            "stationName": mapped_name,
            "stationNameTHSR": thsr_name_map.get(original_name, original_name),
            "lines": []
        }
        add_thsr_line(new_station, original_name)
        stations_data["stations"].append(new_station)

# 儲存處理後的資料
with open('stations_processed.json', 'w', encoding='utf-8') as f:
    json.dump(stations_data, f, ensure_ascii=False, indent=2)

print("高鐵路線已成功加入並存入 stations_processed.json")