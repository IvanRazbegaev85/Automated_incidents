
const incident ={
    dataArray: {},
    button: document.querySelector("button"),
    url: "https://influxapi.egamings.com/query?q=",
    influxQueryNode1:`SELECT host, last(mr_req_time_in_system) as "time without sub_time" FROM "telegraf". "autogen"."grafana_mr_requests" WHERE host='site2-deac-loggingdb1-4' AND time >= (now()-24h) AND time < (now()) GROUP BY (time(60s))`,
    influxQueryNode2:`SELECT host, last(mr_req_time_in_system2) as "time without sub_time" FROM "telegraf". "autogen"."grafana_mr_requests" WHERE host='site2-deac-loggingdb2-4' AND time >= (now()-24h) AND time < (now()) GROUP BY (time(60s))`,
    influxQueryNode3:`SELECT host, last(mr_req_time_in_system3) as "time without sub_time" FROM "telegraf". "autogen"."grafana_mr_requests" WHERE host='site1-telia-loggingdb3-4' AND time >= (now()-24h) AND time < (now()) GROUP BY (time(60s))`,
    incidents: [],

    init: function () {
        this.incidents = [];
        this.button.addEventListener("click",incident.start);
    },

    start: function () {
        incident.getInfluxShit();
    },

    getInfluxShit: function (){
        fetch(incident.url+incident.influxQueryNode1).then( function(response) {
            return response.json();
        }).then(function(data) {
            incident.dataArray = data.results[0].series[0];
            incident.getIncidents();
            incident.showResults();
        }).catch(function() {
            console.log("Booo");
        });
    },

    getIncidents: function (){
        const incidentTime = 0.15;
        for (let i = 0; i < incident.dataArray.values.length; i++){
            if (+incident.dataArray.values[i][2] > +incidentTime){
                incident.incidents.push({time: incident.dataArray.values[i][0], host: incident.dataArray.values[i][1], resp_time:incident.dataArray.values[i][2]});
            } else continue;
        }
        console.dir(incident.incidents);
    },

    showResults: function (){

    }

}

incident.init();