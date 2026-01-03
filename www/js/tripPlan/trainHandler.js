export class TrainHandler {
    constructor(trip) {
        this.trip = trip;
        this.operator = null;
        this.line = null;
        this.train = null;
        this.stations = [];

        fetch("json/stations.json")
        .then(response => response.json())
        .then(data => {
            this.stations = data.stations;
        })
        .catch(error => console.error("無法加載車站數據：", error));
    }

    searchStation(input){
        const keyword = input.value.trim();
        const filteredStations = this.stations.filter(station =>
            station.stationName.includes(keyword) ||
            (station.stationNameTHSR && station.stationNameTHSR.includes(keyword))
        );

        return filteredStations;
    }

    selectStation(station) {
        this.trip.startStation = station;
    }

    selectLine(line) {
        this.line = line;
        this.operator = line.operator;
    }

    async selectTrain(train) {
        this.train = train;
        this.trip.train = train;

        switch (this.operator) {
            case "TR":
                return this._handleTR(train);
            case "THSR":
                return this._handleTHSR(train);
            case "TRTC":
                return this._handleTRTC(train);
        }
    }

    selectEnd(stop) {
        this.trip.endStation = stop.station;
        this.trip.arrivalTime = stop.arrivalTime;
    }

    finish() {
        return this.trip;
    }
}