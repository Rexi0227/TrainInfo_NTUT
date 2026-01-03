export class tripUI{
    constructor(){
        this.resultBox = document.getElementById("searchResults");
    }
    openOverlay() {
        document.getElementById("overlay").style.display = "flex";

        // 清空內容
        document.getElementById("startStation").value = "";
        document.getElementById("lineList").innerHTML = "";
        document.getElementById("trainList").innerHTML = "";
        document.getElementById("selectDest").style.display = "none";
        document.getElementById("stopList").innerHTML = "";
        document.getElementById("searchResults").innerHTML = "";

        // 預設日期為今天
        const dateInput = document.getElementById("selectDate");
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        dateInput.value = `${yyyy}-${mm}-${dd}`;
    }

    closeOverlay() {
        document.getElementById("overlay").style.display = "none";
    }

    showStationList(stations, input, onSelected){
        if (stations.length === 0) {
            this.resultBox.style.display = "none";
            return;
        }
        stations.forEach(station => {
            console.log(station);
            const nameToShow = station.stationName.includes(keyword) ? station.stationName : station.stationNameTHSR;
            const div = document.createElement("div");
            div.textContent = nameToShow;
            div.className = "search-item";
            div.addEventListener("click", () => {
                resultBox.style.display = "none";
                onSelected(station);
            })
            this.resultBox.appendChild(div);
        });
            
        this.resultBox.style.display = "block";
        // 點其他地方時隱藏下拉選單
        document.addEventListener("click", (event) => {
            if (!input.contains(event.target) && !resultBox.contains(event.target)) {
                resultBox.style.display = "none";
            }
        });
    }
    showLineList(station, onSelected){
        const lineList = document.getElementById("lineList");
        lineList.innerHTML = "";

        station.lines.forEach((line, index) => {
            const lineDiv = document.createElement("div");
            lineDiv.classList.add("line");
            lineDiv.style.animationDelay = `${index * 0.2}s`;

            lineDiv.innerHTML = `
                                <div style="width: 5%; background-color: ${line.lineColor}; border-top-left-radius: 10px; border-bottom-left-radius: 10px;"></div>
                                <div style="width: 95%; display: flex">
                                    <h3 class="lineTitle">${line.lineName}</h3>
                                    <div class="lineDirection">
                                        ${line.lineDescription}
                                    </div>
                                </div>
            `;
            lineDiv.addEventListener("click", () => onSelected(line));
            lineList.appendChild(lineDiv);
        });

    }
}
