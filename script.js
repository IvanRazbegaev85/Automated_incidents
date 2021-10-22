const incidentsTable = document.getElementById("customers");
const nodeOneBtn = document.getElementById("node-one");
const nodeTwoBtn = document.getElementById("node-two");
const nodeThreeBtn = document.getElementById("node-three");
const allNodesBtn = document.getElementById("all-nodes");
const incidentsBtn = document.querySelector(".dropbtn");
const resetBtn = document.getElementById("cancelbtn");
let tableContent = document.querySelectorAll("td");
let incidentThreshold = document.querySelector("#response_time");
let dateFrom = document.querySelector("#date-time-start");
let dateTo = document.querySelector("#date-time-end");

const parseIncidents = {
    dataArray: [],
    incidents: [],
    url: "https://influxapi.egamings.com/query?q=",
    influxQueryNode1:'',
    influxQueryNode2:'',
    influxQueryNode3:'',

    getInfluxShit: function (query){
        // Отправляем запрос, получаем данные из инфлюкс и складываем в dataArray
        fetch(query).then( (response) => {
            return response.json();
        }).then((data) => {
            data.results[0].series[0].values.forEach(value => {
                this.dataArray.push(value);
            });
            // Запускаем обработку инцидентов
            this.getIncidents();
            // Далее - рендерим полученные данные
            render.renderTable();
            // Обнуляем массивы, чтобы не было накопления данных и их задвоения/троения
            this.incidents =[];
            this.dataArray =[];
        }).catch((e) => {
            console.log("Something went wrong. Use console.dir to look for result of request", e);
        });
    },
    nodeIncidents: function (node = "all") {

        dateFrom = document.querySelector("#date-time-start");
        dateTo = document.querySelector("#date-time-end");
        const dateToUTC = `${new Date(Date.parse(`${dateTo.value}:00Z`) - 10800000).toISOString().slice(0,-5)}Z`;
        const dateFromUTC = `${new Date(Date.parse(`${dateFrom.value}:00Z`) - 10800000).toISOString().slice(0,-5)}Z`;

        this.influxQueryNode1 = `SELECT host, last(mr_req_time_in_system) as "time without sub_time" FROM "telegraf". "autogen"."grafana_mr_requests" WHERE host='site2-deac-loggingdb1-4' AND time >= '${dateFromUTC}' AND time < '${dateToUTC}' GROUP BY (time(60s))`;
        this.influxQueryNode2 = `SELECT host, last(mr_req_time_in_system2) as "time without sub_time" FROM "telegraf". "autogen"."grafana_mr_requests" WHERE host='site2-deac-loggingdb2-4' AND time >= '${dateFromUTC}' AND time < '${dateToUTC}' GROUP BY (time(60s))`;
        this.influxQueryNode3 = `SELECT host, last(mr_req_time_in_system3) as "time without sub_time" FROM "telegraf". "autogen"."grafana_mr_requests" WHERE host='site1-telia-loggingdb3-4' AND time >= '${dateFromUTC}' AND time < '${dateToUTC}' GROUP BY (time(60s))`;

        // В зависимости от node формируем разные запросы и передаем их аргументом в getInfluxShit
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
        incidentThreshold = document.querySelector("#response_time");
        const incidentTime = incidentThreshold.value/1000;
        // Перебираем dataArray и сравниваем с порогом инцидентов IncidentTime
        this.dataArray.forEach((value, index) => {
            if (+this.dataArray[index][2] > +incidentTime){
                let node ='';
                if (this.dataArray[index][1] === 'site2-deac-loggingdb1-4'){
                    node = "1ая нода"
                } else if (this.dataArray[index][1] === 'site2-deac-loggingdb2-4') {
                    node = "2ая нода";
                } else {node = "3яя нода"};
                // Полученные инциденты складываем в массив incidents
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
                '<td>' + value.resp_time.toFixed(3) + '</td>' +
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
 */
incident.init();