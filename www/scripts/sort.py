import json

def process_stations(station_data, line_data):
    stations_dict = {}
    
    for station in station_data["Stations"]:
        station_id = station["StationID"]
        station_name = station["StationName"]["Zh_tw"]
        station_key = station_id[0]  # 取 StationID 前一碼
        station_last_digit = station_id[3]  # 取 StationID 最後一碼
        
        lines_info = []
        for line in line_data["lines"]:
            if int(station_key) in line["stationNums"]:
                is_mainline = line["mainLine"] and station_last_digit == "0"
                if is_mainline :
                    lines_info.append({
                        "stationNameInLine": station_name,
                        "lineName": line["name"],
                        "linecode": "" if not line["mainLine"] else station_key,
                        "lineColor": line["color"],
                        "lineDescription": ""
                    })
                elif not line["mainLine"] and not station_last_digit == "0":
                    lines_info.append({
                        "stationNameInLine": station_name,
                        "lineName": line["name"],
                        "linecode": "" if not line["mainLine"] else station_key,
                        "lineColor": line["color"],
                        "lineDescription": ""
                    })
        
        stations_dict[station_name] = {
            "stationName": station_name,
            "lines": lines_info
        }
    
    return {"stations": list(stations_dict.values())}

# 讀取本機檔案
with open("stationsTR.json", "r", encoding="utf-8") as f:
    taiwan_railway_stations = json.load(f)

with open("linelist.json", "r", encoding="utf-8") as f:
    taiwan_railway_lines = json.load(f)

# 執行整理
tidy_stations = process_stations(taiwan_railway_stations, taiwan_railway_lines)

# 寫入輸出檔案
with open("stations.json", "w", encoding="utf-8") as f:
    json.dump(tidy_stations, f, ensure_ascii=False, indent=2)
