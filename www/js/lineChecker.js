async function lineChecker(train){
    let lines = [];
    //車次判斷(保持不變)
    if (train.TrainNo.length == 4){ 
        if (train.TrainNo[0] == "1"){ 
            if (train.TrainNo[1] == "7"){
                lines.push("六家線");
            }
            else if(train.TrainNo[1] == "8"){
                lines.push("內灣線");
            }
            else {
                lines.push("縱貫線");
            }
        }
        if (train.TrainNo[0] == "2"){
            if(train.TrainNo[1] == "5"){
                lines.push("海線");
            }
            if(train.TrainNo[1] == "6"){
                lines.push("成追線");
            }
            if(train.TrainNo[1] == "7"){
                lines.push("集集線");
            }
            else if(train.TrainNo[1] == "8"){
                lines.push("集集線");
            }
            else {
                lines.push("縱貫/山線");
            }
        }
        if (train.TrainNo[0] == "3"){
            if(train.TrainNo[1] == "7" || train.TrainNo[1] == "8"){
                lines.push("沙崙線");
            }
            else {
                lines.push("縱貫/山線");
                lines.push("屏東/南迴線");
            }
        }
        if (train.TrainNo[0] == "4"){
            if(train.TrainNo[1] == "5"){
                lines.push("臺東線");
            }
            if(train.TrainNo[1] == "7" || train.TrainNo[1] == "8"){
                lines.push("平溪線/深澳線");
            }
            else {
                lines.push("宜蘭/北迴線");
                //lines.push("宜蘭線");
            }
        }
    } else if(train.TrainNo.length == 3){
        if (train.TrainNo[0] == "2"){
            lines.push("宜蘭/北迴線");
        } else if (train.TrainNo[0] == "3"){
            lines.push("南迴線");
        } else if (train.TrainNo[0] == "4"){
            lines.push("臺東線");
        }
    }

    // 起點站終點站判斷
    const depSta = train.StartingStationName.Zh_tw;
    const arrSta = train.EndingStationName.Zh_tw;

    const response = await fetch("json/stations.json");
    const data = await response.json();
    const stationsData = data.stations;

    stationsData.forEach(station => {
        station.lines.forEach(line => {
            /*
            if(line.operator == "TR" && line.stationNameInLine == depSta){
                if (!lines.includes(line.lineName)) {
                    lines.push(line.lineName);
                }
            }
            */
            if(line.operator == "TR" && line.stationNameInLine == arrSta){
                if (!lines.includes(line.lineName)) {
                    lines.push(line.lineName);
                }
            }
        })
    });

    // tripline 判斷
    if(train.TripLine == 1){
        if (!lines.includes("縱貫/山線")) {
            lines.push("縱貫/山線");
        }
    }
    if(train.TripLine == 2){
        if (!lines.includes("海線")) {
            lines.push("海線");
        }
    }
    if(train.TripLine == 3){
        if (!lines.includes("成追線")) {
            lines.push("成追線");
        }
        if (!lines.includes("縱貫/山線")) {
            lines.push("縱貫/山線");
        }
        if (!lines.includes("海線")) {
            lines.push("海線");
        }
    }

    console.log(lines);
    return lines;  // 這裡一定要回傳結果給外層呼叫者
}

function lineCheckerSingle(trainNo){
    if (trainNo.length == 4){ 
        if (trainNo[0] == "1"){ 
            if (trainNo[1] == "7"){
                return ("六家線");
            }
            else if(trainNo[1] == "8"){
                return ("內灣線");
            }
            else {
                return ("縱貫線");
            }
        }
        if (trainNo[0] == "2"){
            if(trainNo[1] == "5"){
                return ("海線");
            }
            if(trainNo[1] == "6"){
                return ("成追線");
            }
            if(trainNo[1] == "7"){
                return ("集集線");
            }
            else if(trainNo[1] == "8"){
                return ("集集線");
            }
            else {
                return ("縱貫/山線");
            }
        }
        if (trainNo[0] == "3"){
            if(trainNo[1] == "7" || trainNo[1] == "8"){
                return ("沙崙線");
            }
            else {
                return ("縱貫/山線");
            }
        }
        if (trainNo[0] == "4"){
            if(trainNo[1] == "5"){
                return ("臺東線");
            }
            if(trainNo[1] == "7" || trainNo[1] == "8"){
                return ("平溪線/深澳線");
            }
            else {
                return ("宜蘭/北迴線");
                //lines.push("宜蘭線");
            }
        }
    }
}

function lineToColor(line){
    if(line == "縱貫線") return "#85dd00";
    else if(line == "宜蘭/北迴線") return "red";
    else if(line == "海線") return "#65fcf2";
    else if(line == "縱貫/山線") return "#2390fc";
    else if(line == "屏東/南迴線") return "#8f14f5";
    else if(line == "臺東線") return "#054d01";
    else return "white"
}