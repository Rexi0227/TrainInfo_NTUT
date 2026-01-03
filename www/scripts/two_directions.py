import json

def process_stations(input_file, output_file):
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    direction_exceptions = {
        ("基隆", "縱貫線"): 1,
        ("八堵", "宜蘭/北迴線"): 0,
        ("竹南", "縱貫線"): 0,
        ("竹南", "海線"): 1,
        ("竹南", "縱貫/山線"): 1,
        ("成功", "成追線"): 0,
        ("追分", "成追線"): 1,
        ("彰化", "海線"): 0,
        ("屏東", "縱貫/山線"): 0,
        ("屏東", "屏東/南迴線"): 1,
        ("臺東", "屏東/南迴線"): 0,
        ("臺東", "臺東線"): 1,
        ("花蓮", "臺東線"): 0,
        ("花蓮", "宜蘭/北迴線"): 1,
        ("蘇澳新", "宜蘭線"): 0,
        ("蘇澳", "宜蘭線"): 1,
        ("新竹", "內灣/六家線"): 0,
        ("竹中", "內灣/六家線"): 1,
        ("竹中", "六家線"): 0,
        ("竹中", "內灣線"): 0,
        ("六家", "六家線"): 1,
        ("內灣", "內灣線"): 1,
        ("二水", "集集線"): 1,
        ("車程", "集集線"): 0,
        ("中洲", "沙崙線"): 1,
        ("沙崙", "沙崙線"): 0,
        ("八斗子", "平溪/深澳線"): 0,
        ("瑞芳", "平溪/深澳線"): 1,
        ("三貂嶺", "平溪/深澳線"): 0,
        ("菁桐", "平溪/深澳線"): 1,
    }
    
    for station in data["stations"]:
        new_lines = []
        for line in station["lines"]:
            key = (station["stationName"], line["lineName"])
            if key in direction_exceptions:
                line["direction"] = direction_exceptions[key]
                new_lines.append(line)
            else:
                line1 = line.copy()
                line2 = line.copy()
                line1["direction"] = 0
                line2["direction"] = 1
                new_lines.extend([line1, line2])
        
        station["lines"] = new_lines
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

# 使用範例
input_filename = "stations.json"  # 替換為你的輸入檔案名稱
output_filename = "stations_processed.json"  # 輸出檔案名稱
process_stations(input_filename, output_filename)