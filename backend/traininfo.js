const NodeCache = require('node-cache');
const qs = require('querystring');
const express = require('express');
const router = express.Router();

const CLIENT_ID = 'mcred0227-2ca8fe67-c5ae-4f14';
const CLIENT_SECRET = '6010b9b2-596c-45c4-8087-16e992dfe5ed';

const cache = new NodeCache({ stdTTL: 60 }); // 60秒缓存

function handleMySQLDisconnect_timetable() {
  conn_timetable = mysql.createConnection({
    host: 'localhost',
    user: 'ws',
    password: '',
    database:'tr_timetables',
    port: 3306,
    multipleStatements: true
  });
  conn_timetable.connect((err) => {
    if (err) {
      console.error('Failed to connect to MySQL tr_timetables DB , retrying. ERROR code:', err);
      setTimeout(handleMySQLDisconnect_timetable, 2000); // 2 seconds delay before attempting to reconnect
    } else {
      console.log('Connect to MySQL account DB');
    }
  });

  conn_timetable.on('error', (err) => {
    console.error('Disconnected from MySQL tr_timetables DB,reconnecting. ERROR code:', err);

    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        handleMySQLDisconnect_timetable(); // Reconnect on connection lost
    } else {
      throw err;
    }
  });
}

// 取得 access token 的函式
async function getAccessToken() {
  const tokenUrl = 'https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token';

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: qs.stringify({
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  });

  const data = await response.json();
  return data.access_token;
}

/*----------取得該日時刻表並存入資料庫----------*/
async function getDailyTimetableToDB(TrainDate){
  try {
    const token = await getAccessToken();
    const apiUrl = `https://tdx.transportdata.tw/api/basic/v2/Rail/TRA/DailyTrainInfo/TrainDate/${TrainDate}?%24format=JSON`;
    

    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
  } catch (err) {
    console.error('錯誤發生：', err);
  }
}

/*----------取得指定車站指定日期時刻表----------*/
router.get('/TRA/DailyTimetable/Station', async (req, res) => {
    const StationID = req.query.StationID;
    const TrainDate = req.query.TrainDate;

    const cacheKey = `TRA/DailyTimetable/Station/${StationID}/${TrainDate}`;

    const cacheData = cache.get(cacheKey);
    if (cacheData) {
      console.log('Cache hit:', cacheKey);
      return res.json(cacheData);
    }

    try {
      const token = await getAccessToken();
      const apiUrl = `https://tdx.transportdata.tw/api/basic/v2/Rail/TRA/DailyTimetable/Station/${StationID}/${TrainDate}?%24format=JSON`;
  
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      const data = await response.json();
      cache.set(cacheKey, data,86400);  // 快取
      res.json(data);
    } catch (err) {
      console.error('錯誤發生：', err);
      res.status(500).send('取得資料失敗');
    }
});
/*----------取得指定車次時刻表----------*/
router.get('/TRA/GeneralTimetable/TrainNo', async (req, res) => {
    const TrainNo = req.query.TrainNo;

    const cacheKey = `TRA/GeneralTimetable/TrainNo/${TrainNo}`;

    const cacheData = cache.get(cacheKey);
    if (cacheData) {
      console.log('Cache hit:', cacheKey);
      return res.json(cacheData);
    }
    try {
      const token = await getAccessToken();
      const apiUrl = `https://tdx.transportdata.tw/api/basic/v2/Rail/TRA/GeneralTimetable/TrainNo/${TrainNo}?%24format=JSON`;
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      cache.set(cacheKey, data,86400);  // 快取
      res.json(data);
    }catch (err) {
      console.error('錯誤發生：', err);
      res.status(500).send('取得資料失敗');
    }
});
/*----------取得所有列車動態----------*/
router.get('/TRA/TrainLiveBoard', async (req, res) => {
    try {
      const token = await getAccessToken();
      const apiUrl = `https://tdx.transportdata.tw/api/basic/v3/Rail/TRA/TrainLiveBoard?%24format=JSON`;

      const cacheKey = `TRA/TrainLiveBoard?%24format=JSON`;

      const cacheData = cache.get(cacheKey);
      if (cacheData) {
        console.log('Cache hit:', cacheKey);
        return res.json(cacheData);
      }
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      cache.set(cacheKey, data,60);
      res.json(data);
    }catch (err) {
      console.error('錯誤發生：', err);
      res.status(500).send('取得資料失敗');
    }
})
/*----------取得指定列車動態----------*/
router.get('/TRA/TrainLiveBoard/TrainNo', async (req, res) => {
    try {
      const TrainNo = req.query.TrainNo;
      const token = await getAccessToken();
      const apiUrl = `https://tdx.transportdata.tw/api/basic/v3/Rail/TRA/TrainLiveBoard/TrainNo/${TrainNo}`;

      const cacheKey = `TRA/TrainLiveBoard/TrainNo/${TrainNo}`;

      const cacheData = cache.get(cacheKey);
      if (cacheData) {
        console.log('Cache hit:', cacheKey);
        return res.json(cacheData);
      }
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      cache.set(cacheKey, data,60);
      res.json(data);
    }catch (err) {
      console.error('錯誤發生：', err);
      res.status(500).send('取得資料失敗');
    }
})

/*----------取得指定日期起訖站間列車班次列表----------*/
router.get('/TRA/DailyTrainTimetable/OD', async (req, res) => {
    try {
      const OriginStation = req.query.OriginStation;
      const DestinationStation = req.query.DestinationStation;
      const TrainDate = req.query.TrainDate;
      const token = await getAccessToken();
      const apiUrl = `https://tdx.transportdata.tw/api/basic/v3/Rail/TRA/DailyTrainTimetable/OD/${OriginStation}/to/${DestinationStation}/${TrainDate}`;

      const cacheKey = `TRA/DailyTrainTimetable/OD/${OriginStation}/to/${DestinationStation}/${TrainDate}`;

      const cacheData = cache.get(cacheKey);
      if (cacheData) {
        console.log('Cache hit:', cacheKey);
        return res.json(cacheData);
      }
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      cache.set(cacheKey, data,60);
      res.json(data);
    }catch (err) {
      console.error('錯誤發生：', err);
      res.status(500).send('取得資料失敗');
    }
})

/*----------取得高鐵指定車站指定日期時刻表----------*/
router.get('/THSR/DailyTimetable/Station', async (req, res) => {
    const StationID = req.query.StationID;
    const TrainDate = req.query.TrainDate;

    const cacheKey = `/THSR/DailyTimetable/Station/${StationID}/${TrainDate}`;

    const cacheData = cache.get(cacheKey);
    if (cacheData) {
      console.log('Cache hit:', cacheKey);
      return res.json(cacheData);
    }

    try {
      const token = await getAccessToken();
      const apiUrl = `https://tdx.transportdata.tw/api/basic/v2/Rail/THSR/DailyTimetable/Station/${StationID}/${TrainDate}?%24format=JSON`;
  
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      const data = await response.json();
      cache.set(cacheKey, data,86400);  // 快取
      res.json(data);
    } catch (err) {
      console.error('錯誤發生：', err);
      res.status(500).send('取得資料失敗');
    }
});

/*----------取得高鐵指定車次時刻表----------*/
router.get('/THSR/GeneralTimetable/TrainNo', async (req, res) => {
    const TrainNo = req.query.TrainNo;

    const cacheKey = `/THSR/GeneralTimetable/TrainNo/${TrainNo}`;

    const cacheData = cache.get(cacheKey);
    if (cacheData) {
      console.log('Cache hit:', cacheKey);
      return res.json(cacheData);
    }

    try {
      const token = await getAccessToken();
      const apiUrl = `https://tdx.transportdata.tw/api/basic/v2/Rail/THSR/GeneralTimetable/TrainNo/${TrainNo}?%24format=JSON`;
  
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      const data = await response.json();
      cache.set(cacheKey, data,86400);  // 快取
      res.json(data);
    } catch (err) {
      console.error('錯誤發生：', err);
      res.status(500).send('取得資料失敗');
    }
});

/*----------取得北捷指定車站時刻表----------*/
router.get('/Metro/StationTimeTable/TRTC', async (req, res) => {
    const StationID = req.query.StationID;

    const cacheKey = `Metro/StationTimeTable/TRTC/${StationID}`;

    const cacheData = cache.get(cacheKey);
    if (cacheData) {
      console.log('Cache hit:', cacheKey);
      return res.json(cacheData);
    }

    try {
      const token = await getAccessToken();
      const apiUrl = `https://tdx.transportdata.tw/api/basic/v2/Rail/Metro/StationTimeTable/TRTC?%24format=JSON&%24filter=contains(StationID,'${StationID}')`;
  
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      const data = await response.json();
      cache.set(cacheKey, data,86400);  // 快取
      res.json(data);
    } catch (err) {
      console.error('錯誤發生：', err);
      res.status(500).send('取得資料失敗');
    }
});
module.exports = router;
