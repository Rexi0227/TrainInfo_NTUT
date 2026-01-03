export class tripListModel{
    
    constructor(id){
        this.id = id;
        this.tripList = [];
    }
    addTrip(trip){
        this.tripList.push(trip);
    }
    setId(){
        if(!this.id){
            this.id = Date.now().toString();
        }
    }
    save(){

    }
}
export class tripModel{
    constructor(){
        this.startStation = null;
        this.endStation = null;
        this.departureTime = "";
        this.arrivalTime = "";
        this.train = "";
    }
}