import json
def load_json(filename):
    with open(filename, "r", encoding="utf-8") as file:
        return json.load(file)

def save_json(data, filename):
    with open(filename, "w", encoding="utf-8") as file:
        json.dump(data, file, ensure_ascii=False, indent=4)

A = load_json("json/stations.json")
B = load_json("json/oldStations/stationsTR.json")

station_id_map = {station["StationName"]["Zh_tw"]: station["StationID"] for station in B["Stations"]}

for station in A["stations"]:
    station_name = station["stationName"]
    station_id = station_id_map.get(station_name)

    for line in station["lines"]:
        if line["lineName"] != "台灣高鐵":
            line["statonID"] = station_id
            line["operator"] = "TR"

save_json(A, "stations(withTRID)")

