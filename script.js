const incidentsTable = document.getElementById("customers");
const nodeOneBtn = document.getElementById("node-one");
const nodeTwoBtn = document.getElementById("node-two");
const nodeThreeBtn = document.getElementById("node-three");
const allNodesBtn = document.getElementById("all-nodes");

const incident ={
    dataArray: {},
    url: "https://influxapi.egamings.com/query?q=",
    influxQueryNode1:`SELECT host, last(mr_req_time_in_system) as "time without sub_time" FROM "telegraf". "autogen"."grafana_mr_requests" WHERE host='site2-deac-loggingdb1-4' AND time >= (now()-24h) AND time < (now()) GROUP BY (time(60s))`,
    influxQueryNode2:`SELECT host, last(mr_req_time_in_system2) as "time without sub_time" FROM "telegraf". "autogen"."grafana_mr_requests" WHERE host='site2-deac-loggingdb2-4' AND time >= (now()-24h) AND time < (now()) GROUP BY (time(60s))`,
    influxQueryNode3:`SELECT host, last(mr_req_time_in_system3) as "time without sub_time" FROM "telegraf". "autogen"."grafana_mr_requests" WHERE host='site1-telia-loggingdb3-4' AND time >= (now()-24h) AND time < (now()) GROUP BY (time(60s))`,
    incidents: [],

    init: function () {

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
        this.renderTable();
        this.incidents =[];
    },

    getInfluxShit: function (query){

        fetch(query).then( (response) => {
            return response.json();
        }).then((data) => {
            // this.dataArray = data.results[0].series[0];
            let newArray = JSON.stringify(data.results[0].series[0].values);
            console.log(newArray);
            setTimeout(() => this.getIncidents(),0);
            this.logger()
        }).catch((e) => {
            console.log("Something went wrong. Use console.dir to look for result of request", e);
        });
    },

    getIncidents: function (){
        const incidentTime = 0.15;
        for (let i = 0; i < this.dataArray.values.length; i++){
            if (+this.dataArray.values[i][2] > +incidentTime){
                this.incidents.push({
                    time: this.dataArray.values[i][0],
                    host: this.dataArray.values[i][1],
                    resp_time:this.dataArray.values[i][2],
                    pinup: false
                });
            }
        }
    },
    nodeIncidents: function (node = "all") {
        switch (true) {
            case node == 1:
                this.getInfluxShit(this.url+this.influxQueryNode1);
                break;
            case node == 2:
                this.getInfluxShit(this.url+this.influxQueryNode2);
                break;
            case node == 3:
                this.getInfluxShit(this.url+this.influxQueryNode3);
                break;
            default:
                this.getInfluxShit(this.url+this.influxQueryNode1);
                this.getInfluxShit(this.url+this.influxQueryNode2);
                this.getInfluxShit(this.url+this.influxQueryNode3);
                break;
        }
    },
    logger: function (){
        console.log(this.incidents)
    },

    renderTable: function () {
      //TODO Создание таблицы на основе HTML элементов
        this.incidents.forEach(value => {
            let tr = document.createElement("tr");
            tr.innerHTML =
            '<td>' + value.time.toLocaleString("ru") + '</td>' +
            '<td>' + value.host + '</td>' +
            '<td>' + value.resp_time.toFixed(2) + '</td>' +
            '<td>' + value.pinup.toString() + '</td>';
            incidentsTable.append(tr);
        })
    },
}

incident.init();