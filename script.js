
const incident ={
    dataArray: {},
    url: "https://influxapi.egamings.com/query?q=",
    influxQueryNode1:`SELECT host, last(mr_req_time_in_system) as "time without sub_time" FROM "telegraf". "autogen"."grafana_mr_requests" WHERE host='site2-deac-loggingdb1-4' AND time >= (now()-24h) AND time < (now()) GROUP BY (time(60s))`,
    influxQueryNode2:`SELECT host, last(mr_req_time_in_system2) as "time without sub_time" FROM "telegraf". "autogen"."grafana_mr_requests" WHERE host='site2-deac-loggingdb2-4' AND time >= (now()-24h) AND time < (now()) GROUP BY (time(60s))`,
    influxQueryNode3:`SELECT host, last(mr_req_time_in_system3) as "time without sub_time" FROM "telegraf". "autogen"."grafana_mr_requests" WHERE host='site1-telia-loggingdb3-4' AND time >= (now()-24h) AND time < (now()) GROUP BY (time(60s))`,
    incidents: [],

    init: function () {
        const nodeOneBtn = document.getElementById("node-one");
        const nodeTwoBtn = document.getElementById("node-two");
        const nodeThreeBtn = document.getElementById("node-three");
        const allNodesBtn = document.getElementById("all-nodes");

        nodeOneBtn.addEventListener('click', function () {
            incident.start(1);
        });
        nodeTwoBtn.addEventListener('click', function () {
            incident.start(2);
        });
        nodeThreeBtn.addEventListener('click', function () {
            incident.start(3);
        });
        allNodesBtn.addEventListener('click', function () {
            incident.start();
        });
    },

    start: function (node = 'all') {
        incident.nodeIncidents(node);
    },

    getInfluxShit: function (query){

        fetch(query).then( function(response) {
            return response.json();
        }).then(function(data) {
            incident.dataArray = data.results[0].series[0];
            incident.getIncidents();
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
    nodeIncidents: function (node = "all") {
        switch (true) {
            case node == 1:
                incident.getInfluxShit(incident.url+incident.influxQueryNode1);
                break;
            case node == 2:
                incident.getInfluxShit(incident.url+incident.influxQueryNode2);
                break;
            case node == 3:
                incident.getInfluxShit(incident.url+incident.influxQueryNode3);
                break;
            default:
                incident.getInfluxShit(incident.url+incident.influxQueryNode1);
                incident.getInfluxShit(incident.url+incident.influxQueryNode2);
                incident.getInfluxShit(incident.url+incident.influxQueryNode3);
        }
    },
    showResults: function (){

    }

}

incident.init();