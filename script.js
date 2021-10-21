const incidentsTable = document.getElementById("customers");
const nodeOneBtn = document.getElementById("node-one");
const nodeTwoBtn = document.getElementById("node-two");
const nodeThreeBtn = document.getElementById("node-three");
const allNodesBtn = document.getElementById("all-nodes");
const incidentsBtn = document.querySelector(".dropbtn");
const resetBtn = document.getElementById("cancelbtn");
let tableContent = document.querySelectorAll("td");

const parseIncidents = {
    dataArray: [],
    incidents: [],
    url: "https://influxapi.egamings.com/query?q=",
    influxQueryNode1:`SELECT host, last(mr_req_time_in_system) as "time without sub_time" FROM "telegraf". "autogen"."grafana_mr_requests" WHERE host='site2-deac-loggingdb1-4' AND time >= (now()-24h) AND time < (now()) GROUP BY (time(60s))`,
    influxQueryNode2:`SELECT host, last(mr_req_time_in_system2) as "time without sub_time" FROM "telegraf". "autogen"."grafana_mr_requests" WHERE host='site2-deac-loggingdb2-4' AND time >= (now()-24h) AND time < (now()) GROUP BY (time(60s))`,
    influxQueryNode3:`SELECT host, last(mr_req_time_in_system3) as "time without sub_time" FROM "telegraf". "autogen"."grafana_mr_requests" WHERE host='site1-telia-loggingdb3-4' AND time >= (now()-24h) AND time < (now()) GROUP BY (time(60s))`,

    getInfluxShit: function (query){

        fetch(query).then( (response) => {
            return response.json();
        }).then((data) => {
            data.results[0].series[0].values.forEach(value => {
                this.dataArray.push(value);
            });
            console.log(this.dataArray)
            setTimeout(() => this.getIncidents(),0);
            setTimeout(() => render.renderTable(),0);
            setTimeout(() => this.incidents =[],0);
            setTimeout(() => this.dataArray =[],0);
        }).catch((e) => {
            console.log("Something went wrong. Use console.dir to look for result of request", e);
        });
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
    getIncidents: function (){
        const incidentTime = 0.15;
        this.dataArray.forEach((value, index) => {
            if (+this.dataArray[index][2] > +incidentTime){
                let node ='';
                if (this.dataArray[index][1] === 'site2-deac-loggingdb1-4'){
                    node = "1ая нода"
                } else if (this.dataArray[index][1] === 'site2-deac-loggingdb2-4') {
                    node = "2ая нода";
                } else {node = "3яя нода"};

                this.incidents.push({
                    time: this.dataArray[index][0],
                    host: node,
                    resp_time:this.dataArray[index][2],
                    pinup: false
                });
            }
        })
    },
}

const render ={
    renderTable: function () {
        parseIncidents.incidents.forEach(value => {
            let tr = document.createElement("tr");
            tr.innerHTML =
                '<td>' + new Date(value.time).toLocaleString("ru") + '</td>' +
                '<td>' + value.host + '</td>' +
                '<td>' + value.resp_time.toFixed(2) + '</td>' +
                '<td>' + value.pinup.toString() + '</td>';
            incidentsTable.append(tr);
        })
    },
    resetTable: function () {
        tableContent = document.querySelectorAll("td");
        parseIncidents.incidents = [];
        parseIncidents.dataArray = [];
        tableContent.forEach(value => value.remove());
        incidentsBtn.style.display = 'block';
        resetBtn.style.display = 'none';
    }
}

const incident ={

    init: function () {

        nodeOneBtn.addEventListener('click',  () => {
            this.start(1);
            incidentsBtn.style.display = 'none';
            resetBtn.style.display = 'block';
        });
        nodeTwoBtn.addEventListener('click', () => {
            this.start(2);
            incidentsBtn.style.display = 'none';
            resetBtn.style.display = 'block';
        });
        nodeThreeBtn.addEventListener('click', () => {
            this.start(3);
            incidentsBtn.style.display = 'none';
            resetBtn.style.display = 'block';
        });
        allNodesBtn.addEventListener('click',  () => {
            this.start();
            incidentsBtn.style.display = 'none';
            resetBtn.style.display = 'block';
        });
        resetBtn.addEventListener('click', render.resetTable);
    },

    start: function (node = 'all') {
        parseIncidents.nodeIncidents(node);
        render.renderTable();
    },
}
/*
TODO Добавить текстовый инпут на страницу, передавать его в цикл перебора значений в dataArray как сравнение с resp_time,
TODO получить данные из прометиуса по пинапу и править флаг "pinup"
TODO Обработчик кнопки "reset" + метод сброса в рендере
 */
incident.init();