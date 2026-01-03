function getTrainTypeClass(typeCode) {
    switch (typeCode) {
        case '1': return 'ltd-express';  
        case '2': return 'ltd-express';  
        case '3': return 'ltd-express';  
        case '4': return 'express';  
        case '5': return 'semi-express';
        case '6': return 'local';
        case '7': return 'local';
        case '10': return 'rapid';
        case '11' : return 'ltd-express';
        default: return '';
    }
}

function getTrainType(typeCode) {
    switch (typeCode) {
        case '1': return '太魯閣';  // 區間車
        case '2': return '普悠瑪';  // 區間快
        case '3': return '自強';  // 莒光號
        case '4': return '莒光';  // 自強/普悠瑪/太魯閣
        case '5': return '復興';
        case '6': return '區間';
        case '7': return '普快';
        case '10': return '區間快';
        case '11' : return '新自強';
        default: return '';
    }
}
async function fetchTRtrainSchedule(stationID,date,direction,line){
    const url = `https://rfeqserver.myqnapcloud.com/api/traininfo/TRA/DailyTimetable/Station?StationID=${stationID}&TrainDate=${date}`;
    const response = await fetch(url);
    const data = await response.json();
    let stationLineChecker = null;

    if (line && line.lineChecker) {
        stationLineChecker = line.lineChecker;
    }

    console.log(stationLineChecker)

    const groupedTrains = {};
            
    for (const train of data) {
        if (train.Direction == direction) {
            if (stationLineChecker != null) {
                const lines = await lineChecker(train);

                const hasAllMustHave = stationLineChecker.mustHave?.every(reqLine =>
                    lines.includes(reqLine)
                ) ?? true;

                const hasNoneMustDontHave = stationLineChecker.mustDontHave?.every(badLine =>
                    !lines.includes(badLine)
                ) ?? true;

                const hasAnyMustHaveOnce = stationLineChecker.mustHaveOnce?.some(optLine =>
                    lines.includes(optLine)
                ) ?? true;

                if (hasAllMustHave && hasNoneMustDontHave && hasAnyMustHaveOnce) {
                    const time = train.DepartureTime;
                    const hour = time.split(":")[0];
                    if (!groupedTrains[hour]) groupedTrains[hour] = [];
                    groupedTrains[hour].push(train);
                }
            } else {
                const time = train.DepartureTime;
                const hour = time.split(":")[0];
                if (!groupedTrains[hour]) groupedTrains[hour] = [];
                groupedTrains[hour].push(train);
            }
        }
    }
    return groupedTrains;
}

async function fetchTHSRtrainSchedule(stationID,date,direction,line){
    const url = `https://rfeqserver.myqnapcloud.com/api/traininfo/THSR/DailyTimetable/Station?StationID=${stationID}&TrainDate=${date}`;
    const response = await fetch(url);
    const data = await response.json();
    let stationLineChecker = null;

    if (line && line.lineChecker) {
        stationLineChecker = line.lineChecker;
    }

    console.log(stationLineChecker)

    const groupedTrains = {};
            
    for (const train of data) {
        if (train.Direction == direction) {
            if (stationLineChecker != null) {
                const lines = await lineChecker(train);

                const hasAllMustHave = stationLineChecker.mustHave?.every(reqLine =>
                    lines.includes(reqLine)
                ) ?? true;

                const hasNoneMustDontHave = stationLineChecker.mustDontHave?.every(badLine =>
                    !lines.includes(badLine)
                ) ?? true;

                const hasAnyMustHaveOnce = stationLineChecker.mustHaveOnce?.some(optLine =>
                    lines.includes(optLine)
                ) ?? true;

                if (hasAllMustHave && hasNoneMustDontHave && hasAnyMustHaveOnce) {
                    const time = train.DepartureTime;
                    const hour = time.split(":")[0];
                    if (!groupedTrains[hour]) groupedTrains[hour] = [];
                    groupedTrains[hour].push(train);
                }
            } else {
                const time = train.DepartureTime;
                const hour = time.split(":")[0];
                if (!groupedTrains[hour]) groupedTrains[hour] = [];
                groupedTrains[hour].push(train);
            }
        }
    }
    return groupedTrains;
}

async function fetchMRTtrainSchedule(stationID,date,direction,line){
    const url = `https://rfeqserver.myqnapcloud.com/api/traininfo/Metro/StationTimeTable/TRTC?StationID=${stationID}`
    const response = await fetch(url);
    const data = await response.json();
    let stationLineChecker = null;

    if (line && line.lineChecker) {
        stationLineChecker = line.lineChecker;
    }
    console.log(stationLineChecker)
    const groupedTrains = {};
    //遍歷每個時刻表，照出符合條件的時刻表
    for (const timetable of data) {
        if (timetable.Direction == direction) {
            if(timetable.ServiceDay[dateToWeekday(date)]){
                let destination = timetable.DestinationStationName;
                let destinationId = timetable.DestinationStaionID;
                for (const train of timetable.Timetables){
                    const time = train.DepartureTime;
                    const hour = time.split(":")[0];
                    if (!groupedTrains[hour]) groupedTrains[hour] = [];
                    train.destination = destination;
                    train.destinationId = destinationId;
                    train.routeId = timetable.RouteID;
                    groupedTrains[hour].push(train);
                }
            }
        }
    }

    //sort by minutes
    for (const hour in groupedTrains) {
        groupedTrains[hour].sort((a, b) => {
            const minA = parseInt(a.DepartureTime.split(":")[1], 10);
            const minB = parseInt(b.DepartureTime.split(":")[1], 10);
            return minA - minB;
        });
    }
    
    return groupedTrains;
}

function dateToWeekday(dateString) {
    const date = new Date(dateString);
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return weekdays[date.getDay()];
}