
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

        nodeOneBtn.addEventListener('click',  () => {
            this.start(1);
        });
        nodeTwoBtn.addEventListener('click', () => {
            this.start(2);
        });
        nodeThreeBtn.addEventListener('click', () => {
            this.start(3);
        });
        allNodesBtn.addEventListener('click',  () => {
            this.start();
        });
    },

    start: function (node = 'all') {
        this.nodeIncidents(node);
    },

    getInfluxShit: function (query){

        fetch(query).then( (response) => {
            return response.json();
        }).then((data) => {
            this.dataArray = data.results[0].series[0];
            this.getIncidents();
        }).catch(() => {
            console.log("Something went wrong. Use console.dir to look for result of request");
        });
    },

    getIncidents: function (){
        const incidentTime = 0.15;
        for (let i = 0; i < this.dataArray.values.length; i++){
            if (+this.dataArray.values[i][2] > +incidentTime){
                this.incidents.push({time: this.dataArray.values[i][0],
                    host: this.dataArray.values[i][1],
                    resp_time:this.dataArray.values[i][2],
                    pinup: false
                });
            } else continue;
        }
        console.dir(incident.incidents);
    },
    nodeIncidents: function (node = "all") {
        switch (true) {
            case node == 1:
                this.getInfluxShit(this.url+this.influxQueryNode1);
                this.incidents = [];
                break;
            case node == 2:
                this.getInfluxShit(this.url+this.influxQueryNode2);
                this.incidents = [];
                break;
            case node == 3:
                this.getInfluxShit(this.url+this.influxQueryNode3);
                this.incidents = [];
                break;
            default:
                this.getInfluxShit(this.url+this.influxQueryNode1);
                this.getInfluxShit(this.url+this.influxQueryNode2);
                this.getInfluxShit(this.url+this.influxQueryNode3);
                this.incidents = [];
        }
    },
    showResults: function (){

    }

}

incident.init();