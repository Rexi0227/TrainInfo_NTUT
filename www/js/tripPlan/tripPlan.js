import { tripListModel , tripModel } from "./tripModel";
import { TrainHandler } from "./trainHandler";
import { tripUI } from "./tripUI";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

let tripList = new tripListModel(id);
let UI = new tripUI();

function addTrip(){
    let trainHandler = new TrainHandler(new tripModel())
    UI.openOverlay();
    /*----------輸入框事件監聽----------*/
    const input = document.getElementById("startStation");
    input.addEventListener("input", () => {
        let stations = trainHandler.searchStation(input);
        UI.showStationList(stations, input, (station) => {
            trainHandler.selectStation(station);
            showLineList(trainHandler, station);//前往下一步驟
        });
    })    
}
document.getElementById("searchBtn").addEventListener("click",()=> addTrip() )

function showLineList(trainHandler, station){
    UI.showLineList(station, (line) => {
        trainHandler.selectLine(line);
        showTrainList(trainHandler, line);
    })
}

function showTrainList(trainHandler, line){
    
}