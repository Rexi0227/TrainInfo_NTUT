/**
 * reconstructTrainRun.js
 *
 * 輸入： timetable (array from timetable.json), travelTimesData (array from TRTC.json)
 * 輸出： 一個物件，包含從起點上下推估的完整列車時刻表
 *
 * 使用範例見底部。
 */

// --- helpers ---
function hhmmToSeconds(hhmm) {
  // "HH:MM" -> seconds since 00:00
  const [h, m] = hhmm.split(':').map(Number);
  return h * 3600 + m * 60;
}
function secondsToHHMM(sec) {
  sec = ((sec % 86400) + 86400) % 86400;
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
}
function withinTolerance(a, b, tolSeconds) {
  return Math.abs(a - b) <= tolSeconds;
}

// --- core function ---
/**
 * reconstructTrain(routeId, direction, stationId, departureTimeOrSequence, opts)
 *
 * routeId: string (例如 "BL-1")
 * direction: number (0 或 1，與 timetable.json 的 Direction 欄位一致)
 * stationId: string (例如 "BL12")
 * departureTimeOrSequence: { time: "HH:MM" } 或 { sequence: 42 }
 * opts: { timetableArray, travelTimesArray, toleranceSeconds }
 *
 * 回傳物件 { routeId, direction, originStationId, originEntry, stops: [...] }
 */
function reconstructTrain(routeId, direction, stationId, departureTimeOrSequence, opts) {
  const { timetableArray, travelTimesArray, toleranceSeconds = 60, weekday } = opts;
  const stationMap = new Map();
  for (const rec of timetableArray) {
    if (rec.RouteID !== routeId) continue;
    if (rec.Direction != direction) continue;

    // ✅ 這邊直接判斷整組 rec 的 ServiceDay
    if (weekday && rec.ServiceDay && rec.ServiceDay[weekday] !== true) {
      continue; // 這組不是今天跑的班次，跳過
    }
    
    const sid = rec.StationID;

    const list = (rec.Timetables || []).map(r => ({
      arrivalSec: hhmmToSeconds(r.ArrivalTime),
      departureSec: hhmmToSeconds(r.DepartureTime),
      sequence: r.Sequence,
      raw: r
    }));

    //console.log(`📍 ${sid} (${rec.Direction}) 使用 ServiceDay:`, rec.ServiceDay);

    // ⚡ 合併進同一個車站陣列
    if (!stationMap.has(sid)) {
      stationMap.set(sid, []);
    }
    stationMap.get(sid).push(...list);
  }

  const travelRec = travelTimesArray.find(r => r.RouteID === routeId);
  if (!travelRec) throw new Error('找不到對應 RouteID 的 travelTimes。');
  const travelTimes = travelRec.TravelTimes;

  const orderedStations = [];
  for (let i = 0; i < travelTimes.length; i++) {
    const seg = travelTimes[i];
    if (i === 0) orderedStations.push(seg.FromStationID);
    orderedStations.push(seg.ToStationID);
  }
  if(direction == 0){
    orderedStations.reverse();
    travelTimes.reverse();
    for (const seg of travelTimes) {
      const tmp = seg.FromStationID;
      seg.FromStationID = seg.ToStationID;
      seg.ToStationID = tmp;
    }
  }
  

  console.log(orderedStations)

  const originIndex = orderedStations.indexOf(stationId);
  if (originIndex === -1) throw new Error('所選 StationID 不在該 Route 的站序中。');
  console.log(stationMap)
  const stationEntries = stationMap.get(stationId) || [];
  let originEntry = null;
  if (departureTimeOrSequence && typeof departureTimeOrSequence === 'object' && 'time' in departureTimeOrSequence) {
    const targetSec = hhmmToSeconds(departureTimeOrSequence.time);
    originEntry = stationEntries.find(e => e.departureSec === targetSec) ||
                  stationEntries.find(e => withinTolerance(e.departureSec, targetSec, toleranceSeconds));
  } else if (departureTimeOrSequence && typeof departureTimeOrSequence === 'object' && 'sequence' in departureTimeOrSequence) {
    originEntry = stationEntries.find(e => e.sequence === departureTimeOrSequence.sequence);
  } else if (typeof departureTimeOrSequence === 'number') {
    // 容錯：直接給數字時，視為 sequence
    originEntry = stationEntries.find(e => e.sequence === departureTimeOrSequence);
  }
  if (!originEntry) throw new Error('找不到對應的班次於指定站。');

  console.log(`✅ 起始站 ${stationId}, 班次 sequence=${originEntry.sequence}, 到=${secondsToHHMM(originEntry.arrivalSec)}, 發=${secondsToHHMM(originEntry.departureSec)}`);

  const stops = new Array(orderedStations.length).fill(null).map(() => null);
  stops[originIndex] = {
    stationId,
    arrivalSec: originEntry.arrivalSec,
    departureSec: originEntry.departureSec,
    sequence: originEntry.sequence,
    isOriginal: true
  };

// --- 向後推 ---
let prevDepartureSec = originEntry.departureSec;
let guessedOnce = false; // ⚡ 新增旗標，允許補一次
for (let idx = originIndex + 1; idx < orderedStations.length; idx++) {
  const prevStation = orderedStations[idx - 1];
  const curStation = orderedStations[idx];
  const seg = travelTimes.find(s => s.FromStationID === prevStation && s.ToStationID === curStation);
  if (!seg) {
    console.log(`⛔ 沒有 ${prevStation}→${curStation} 的行車時間，停止向後。`);
    break;
  }
  const expectedArrival = prevDepartureSec + seg.RunTime;
  const curEntries = stationMap.get(curStation) || [];
  const candidates = curEntries.filter(e =>
    withinTolerance(e.arrivalSec, expectedArrival, toleranceSeconds)
  );
  const match = candidates.length > 0
    ? candidates.reduce((a, b) =>
        Math.abs(b.arrivalSec - expectedArrival) < Math.abs(a.arrivalSec - expectedArrival) ? b : a
      )
    : null;

  if (match) {
    console.log(
      `➡️ 從 ${prevStation} 出發 ${secondsToHHMM(prevDepartureSec)}，RunTime=${seg.RunTime}s，` +
      `預期 ${curStation} 到達=${secondsToHHMM(expectedArrival)}，找到=${secondsToHHMM(match.arrivalSec)}`
    );
    stops[idx] = {
      stationId: curStation,
      arrivalSec: match.arrivalSec,
      departureSec: match.departureSec,
      sequence: match.sequence,
      isOriginal: false,
      guessed: false
    };
    prevDepartureSec = match.departureSec;
  } else {
    if (!guessedOnce) {
      // ⚡ 第一次缺站 → 用預估補上
      console.log(
        `⚠️ ${curStation} 沒有符合班次，預期=${secondsToHHMM(expectedArrival)}，` +
        `👉 用預估值補上`
      );
      stops[idx] = {
        stationId: curStation,
        arrivalSec: expectedArrival,
        departureSec: expectedArrival,
        sequence: -1,
        isOriginal: false,
        guessed: true
      };
      prevDepartureSec = expectedArrival;
      guessedOnce = true;
      continue; // 繼續往後推
    }

    // ⚠️ 已經補過一次 → 停止
    if (curEntries.length > 0) {
      const closest = curEntries.reduce((a, b) =>
        Math.abs(b.arrivalSec - expectedArrival) < Math.abs(a.arrivalSec - expectedArrival) ? b : a
      );
      console.log(
        `❌ ${curStation} 沒有符合班次，預期=${secondsToHHMM(expectedArrival)}，` +
        `最接近=${secondsToHHMM(closest.arrivalSec)} (差距=${Math.abs(closest.arrivalSec - expectedArrival)}s)`
      );
    } else {
      console.log(`❌ ${curStation} 沒有任何班次資料`);
    }
    break; // 結束向後推算
  }
}


// --- 向前推 ---
let nextArrivalSec = originEntry.arrivalSec;
for (let idx = originIndex - 1; idx >= 0; idx--) {
  const prevStation = orderedStations[idx];
  const nextStation = orderedStations[idx + 1];
  const seg = travelTimes.find(s => s.FromStationID === prevStation && s.ToStationID === nextStation);
  if (!seg) {
    console.log(`⛔ 沒有 ${prevStation}→${nextStation} 的行車時間，停止向前。`);
    break;
  }
  const expectedDeparturePrev = nextArrivalSec - seg.RunTime;
  const prevEntries = stationMap.get(prevStation) || [];
  const candidates = prevEntries.filter(e =>
    withinTolerance(e.departureSec, expectedDeparturePrev, toleranceSeconds)
  );
  const match = candidates.length > 0
    ? candidates.reduce((a, b) =>
        Math.abs(b.departureSec - expectedDeparturePrev) < Math.abs(a.departureSec - expectedDeparturePrev) ? b : a
      )
    : null;

  if (match) {
    console.log(`⬅️ 從 ${nextStation} 到達 ${secondsToHHMM(nextArrivalSec)}，RunTime=${seg.RunTime}s，預期 ${prevStation} 出發=${secondsToHHMM(expectedDeparturePrev)}，找到=${secondsToHHMM(match.departureSec)}`);
    stops[idx] = {
      stationId: prevStation,
      arrivalSec: match.arrivalSec,
      departureSec: match.departureSec,
      sequence: match.sequence,
      isOriginal: false
    };
    nextArrivalSec = match.arrivalSec;
  } else {
    // 找不到 → 額外輸出「最接近的」
    if (prevEntries.length > 0) {
      const closest = prevEntries.reduce((a, b) =>
        Math.abs(b.departureSec - expectedDeparturePrev) < Math.abs(a.departureSec - expectedDeparturePrev) ? b : a
      );
      console.log(`❌ ${prevStation} 沒有符合班次，預期=${secondsToHHMM(expectedDeparturePrev)}，最接近=${secondsToHHMM(closest.departureSec)} (差距=${Math.abs(closest.departureSec - expectedDeparturePrev)}s)`);
    } else {
      console.log(`❌ ${prevStation} 沒有任何班次資料`);
    }
    break; // 結束向前推算
  }
}


  
  const stopsFiltered = [];
  for (let i = 0; i < orderedStations.length; i++) {
    const s = stops[i];
    if (!s) continue;
    stopsFiltered.push({
      stationId: orderedStations[i],
      arrivalTime: secondsToHHMM(s.arrivalSec),
      departureTime: secondsToHHMM(s.departureSec),
      sequence: s.sequence,
      isOriginal: s.isOriginal
    });
  }

  return {
    routeId,
    direction,
    origin: {
      stationId,
      arrivalTime: secondsToHHMM(originEntry.arrivalSec),
      departureTime: secondsToHHMM(originEntry.departureSec),
      sequence: originEntry.sequence
    },
    stops: stopsFiltered
  };
}


// --- 範例使用方法 ---
// 假設你把 timetable.json 抓進來到一個變數 timetableData（array），TRTC.json 放在 travelTimesData（array）
// 範例：從 BL-1、Direction 0、站 BL12（台北車站），選 08:08 發車那班（假設在檔案中存在）
/*
const result = reconstructTrain('BL-1', 0, 'BL12', { time: '08:08' }, {
  timetableArray: timetableData,
  travelTimesArray: travelTimesData,
  toleranceSeconds: 60
});
console.log(JSON.stringify(result, null, 2));
*/

async function stationID2Name(stationID){
  const response = await fetch("json/stations.json");
  const stations = await response.json();
  for(const station of stations.stations){
    //console.log(station)
    for(const line of station.lines){
      if(line.stationID == stationID){return line.stationNameInLine}
    }
  }
  return "";
}


