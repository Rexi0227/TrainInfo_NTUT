import json

def process_stations_with_transfers(station_data, line_data, transfer_data):
    stations_dict = {s["stationName"]: s for s in station_data["stations"]}
    
    for transfer in transfer_data["LineTransfers"]:
        from_station_name = transfer["FromStationName"]["Zh_tw"]
        to_line_name = transfer["ToLineName"]["Zh_tw"]
        to_line_id = transfer["ToLineID"]
        print(from_station_name, to_line_name, to_line_id)
        
        line_info = next((line for line in line_data["lines"] if line["name"] == to_line_name), None)
        print(line_info)
        if line_info and from_station_name in stations_dict:
            stations_dict[from_station_name]["lines"].append({
                "stationNameInLine": from_station_name,
                "lineName": to_line_name,
                "linecode": to_line_id,
                "lineColor": line_info["color"],
                "lineDescription": ""
            })
    
    return {"stations": list(stations_dict.values())}

# 讀取本機檔案
with open("stations.json", "r", encoding="utf-8") as f:
    tidy_stations = json.load(f)

with open("linelist.json", "r", encoding="utf-8") as f:
    taiwan_railway_lines = json.load(f)

with open("transfers.json", "r", encoding="utf-8") as f:
    taiwan_railway_transfers = json.load(f)

# 更新轉乘資訊
tidy_stations_with_transfers = process_stations_with_transfers(tidy_stations, taiwan_railway_lines, taiwan_railway_transfers)

# 寫入輸出檔案
with open("stations.json", "w", encoding="utf-8") as f:
    json.dump(tidy_stations_with_transfers, f, ensure_ascii=False, indent=2)
