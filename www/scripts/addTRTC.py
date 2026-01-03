import json

# 特例對照
SPECIAL_CASES = {
    "台北車站": "臺北"  # stationsTRTC 的 "台北車站" 要對應到 stations.json 的 "臺北"
}

def main():
    # 讀檔
    with open("stationsTRTC.json", "r", encoding="utf-8") as f:
        stations_trtc = json.load(f)

    with open("stations.json", "r", encoding="utf-8") as f:
        stations_custom = json.load(f)

    # 先把 stations.json 做成 dict 方便查詢
    stations_dict = {st["stationName"]: st for st in stations_custom["stations"]}

    # 遍歷 TRTC 車站
    for st in stations_trtc["stations"]:
        st_name_trtc = st["stationNameTRTC"]

        # 判斷對應名稱
        if st_name_trtc in SPECIAL_CASES:
            mapped_name = SPECIAL_CASES[st_name_trtc]
        else:
            mapped_name = st_name_trtc

        if mapped_name in stations_dict:
            # 合併 lines
            stations_dict[mapped_name]["lines"].extend(st["lines"])
        else:
            # 不存在就新增
            stations_dict[mapped_name] = {
                "stationName": mapped_name,
                "lines": st["lines"],
                "uuid": st["uuid"]
            }

    # 輸出成 stations2.json
    result = {
        "stations": list(stations_dict.values())
    }

    with open("stations2.json", "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    main()
