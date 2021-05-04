let coinsForChart = [];
let coinsStorage;
let coinsInLocal;
const localStorageKey = "storage";
let checkInterval;
let buffer = "<div class='loader'></div>";
onload = loadCoins();

function loadCoins() {
    $("#coins").append(buffer);
    $.get('https://api.coingecko.com/api/v3/coins', function (data, status) {
        $("#coins").find(".loader").remove();
        coinsStorage = data;
        initData();
        for (let index = 0; index < data.length; index++) {
            newMemo = creatNewCoinMemo(data[index]);
            addResultToScreen(newMemo);
        }


        disableChart();
        expendBlock();
        saveToggle();
        initChartData();
        reToggle();
    });
}

function initChartData() {
    localStorage.setItem('coinsForChart', '[]');
}
function disableChart() {
    if (checkInterval) {
        clearInterval(checkInterval);
    }
    $("#report-container").hide();
}
function addResultToScreen(coin) {
    let coinsContainer = $("#coins");
    coinsContainer.append(coin);
}
function creatNewCoinMemo(coinData) {
    // console.log(coinData.image)
    let toggleButton = "<label class='switch' ><input class= 'live-toggle' type='checkbox' id ='" + coinData.symbol + "' ><span class='slider'></span></label>";
    let coinImage = "<img src=" + coinData.image.thumb + " class = 'coinImage' >"
    let moreInfoButtom = "<button class='readMore btn-success'> More Info </button> ";
    let coinContainer = $("<div class = 'col-md-3 no-gutters' ></div >");
    let paragraph = $("<div id = " + coinData.id + " class ='card'></div>")
        .html(toggleButton + "<br>" + coinData.name + " <br> " + coinData.symbol + " <br> " + coinImage + "<br>" + moreInfoButtom);
    coinContainer.append(paragraph);
    return coinContainer;

}
function initData() {
    if (localStorage.getItem(localStorageKey) === null) {
        coinsInLocal = [];
    }
    else {
        coinsInLocal = JSON.parse(localStorage.getItem(localStorageKey));
    }
    deleteFromStorageTimer()
    let rowContainer = $("<div class='row no-gutters'></div>");
    $(".coins-container").append(rowContainer);

}

function saveToggle() {
    $(".live-toggle").on('click', function (e) {
        let curCheckBox = $(e.target);
        let checkedBox = $(curCheckBox).attr('id');
        // console.log(curCheckBox);
        addCoinForChart(checkedBox);

    });

}

function filterCoins() {
    // $("#coins").empty();
    // let filterTerm = $("#filter-term").val();
    // console.log(filterTerm);
    $("#coins").empty();
    const filterTerm = $('#filter-term').val();
    document.getElementById('filter-term').value = "";
    // console.log(fil)
    if (filterTerm.trim().length === 0) {
        for (let index = 0; index < COUNT_TO_SHOW; index++) {
            let coin = creatNewCoinMemo(coinsStorage[index]);
            addResultToScreen(coin);
            expendBlock();
        }
    } else {
        window.onscroll = null;
        const filteredCoins = coinsStorage.filter(function (coinData) {
            // alert("There isn't any coin")    
            return coinData.symbol.indexOf(filterTerm) !== -1
                || coinData.name.indexOf(filterTerm) !== -1;
        });
        // console.log(filteredCoins);
        filteredCoins.forEach(function (coinData) {
            let coin = creatNewCoinMemo(coinData);
            addResultToScreen(coin);
            expendBlock();

        });
    }
}

// save in local storage
function saveInLocal(usd, euro, shekels, id) {

    let note = {
        "date": Date.now(),
        "id": id,
        "usd": usd,
        "euro": euro,
        "shekels": shekels
    }
    coinsInLocal.push(note);
    localStorage.setItem(localStorageKey, JSON.stringify(coinsInLocal));
    setTimeout('deleteFromLocal()', 120000);
}
// delete from local storage
function deleteFromLocal() {
    coinsInLocal.shift();
    localStorage.setItem(localStorageKey, JSON.stringify(coinsInLocal));

}
function deleteFromStorageTimer() {
    for (let index2 = 0; index2 < coinsInLocal.length; index2++) {
        var time = 120000 - (Date.now() - coinsInLocal[index2].date);
        if (time < 0) {
            time = 0;
        }
        setTimeout('deleteFromLocal()', time);
    }
}
// expend block function
function expendBlock() {
    $('.readMore').on('click', function (e) {
        let block = $(e.target);
        let id = block.parent().attr('id');
        $("#" + id + " .readMore").remove();
        // console.log(id);
        // let buffer = "<div class='loader'></div>";
        let currentDict = getDataForId(id);
        let timeCheck = true;
        if (currentDict != null) {
            timeCheck = (Date.now() - currentDict.date) > 120000;
        }
        let showLess = "<button class ='btn-success' onclick= 'lessInfo(\"" + id + "\");'>Show Less</button>"
        if (currentDict == null || timeCheck) {
            $("#" + id).append(buffer);
            $.get("https://api.coingecko.com/api/v3/coins/" + id, function (coinData) {
                $("#" + id).find(".loader").remove();
                let coinDollar = coinData.market_data.current_price.usd;
                let coinEuro = coinData.market_data.current_price.eur;
                let coinIls = coinData.market_data.current_price.ils;
                saveInLocal(coinDollar, coinEuro, coinIls, id);
                $("#" + id + "").append($("<p id= 'par-" + id + "' ></p>").html("Dollar : " + coinDollar + "<br>Euro: "
                    + coinEuro + "<br> ILS: " + coinIls + "<br>" + showLess));
            });
        } else {
            $("#" + id + "").append($("<p id= 'par-" + id + "' ></p>").html("<br>Dollar : " + currentDict.usd
                + "<br>Euro: " + currentDict.euro + "<br> ILS: " + currentDict.shekels + "<br>" + showLess));
        }
    });
}

function getDataForId(id) {
    for (let i = 0; i < coinsInLocal.length; i++) {
        if (coinsInLocal[i].id == id) {
            return coinsInLocal[i];
        }

    }
    return null;
}

function lessInfo(id) {
    $("#" + id).find("#par-" + id).remove();
    let moreInfoButton = "<button class='readMore btn-success'> More Info </button> "
    $("#" + id).append(moreInfoButton);
    expendBlock();

}

function addCoinForChart(coinId) {
    coinsForChart.indexOf(coinId) === -1 ?
        coinsForChart.push(coinId) : coinsForChart.splice(coinsForChart.indexOf(coinId), 1);
    // console.log(coinsForChart);
}
function toggleDataSeries(e) {
    if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
        e.dataSeries.visible = false;
    } else {
        e.dataSeries.visible = true;
    }
    e.chart.render();
}

function showLiveReports() {

    if (coinsForChart.length == 0) {
        alert("please choose coin")
    } else if (coinsForChart.length > 5) {
        modalOpening(coinsForChart);
    }
    else {
        $("#headline").hide();
        $("#coins").empty();
        $(".aboutMe").hide();
        $("#report-container").show();
        $("#coins").append(buffer);
        let symbols = coinsForChart.join(',');
        var options = {
            exportEnabled: true,
            animationEnabled: false,
            title: {
                text: `${symbols.toUpperCase()} to USD`
            },
            // subtitles: [{
            //     text: "Click Legend to Hide or Unhide Data Series"
            // }],
            axisX: {
                title: "Time"
            },
            axisY: {
                title: "Coin Value",
                titleFontColor: "#4F81BC",
                lineColor: "#4F81BC",
                labelFontColor: "#4F81BC",
                tickColor: "#4F81BC",
                includeZero: false
            },
            toolTip: {
                shared: true
            },
            legend: {
                cursor: "pointer",
                itemclick: toggleDataSeries
            },
            data: []
        };

        const coinTemp = {
            type: "spline",
            name: "",
            showInLegend: true,
            xValueFormatString: "hh:mm:ss TT",
            yValueFormatString: "#,##0 Units"
        }
        coinsForChart.forEach((item) => {
            let currentCoin = { ...coinTemp };
            currentCoin.name = item;
            options.data.push({ ...currentCoin });
        });
        var chart = new CanvasJS.Chart("report-container", options);
        checkInteral = setInterval(function () {
            $.get(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${symbols}&tsyms=USD`, function (items, status) {
                $("#coins").find(".loader").remove();
                options.data.map((item) => {
                    if (!item.dataPoints) {
                        item.dataPoints = [];
                    }
                    items[item.name.toUpperCase()] && item.dataPoints.push({ x: new Date(), y: items[item.name.toUpperCase()].USD });
                });

                chart.render();
            });
        }, 2000);



    }
}
function showHomePage() {
    $("#headline").show();
    $("#report-container").empty();
    $(".aboutMe").hide();
    loadCoins();


}
function showAboutPage() {
    $("#headline").show();
    $("#coins").empty();
    $(".aboutMe").show();
    $("#report-container").empty().hide();
}

function reToggle() {
    // console.log(coinsForChart);
    coinsForChart.forEach(coin => {
        // console.log($('#' + coin))
        $('#' + coin).prop("checked", true);
    }
    );
}
function modalOpening(coins) {
    insertCoinsToModal();
    $("#warning-modal").show();
    $("#coins").css("opacity", 0.4);

}
function insertCoinsToModal() {
    // console.log(coinsForChart);
    coinsForChart.forEach(coin => {
        let cointemplate = "<div class='coinToRemove'>" + coin + "   <br><button class='btn-danger' onclick='removeFromSelected(\"" + coin.toString() + "\")'>Press to remove</button></div>";
        $("#modal-body").append(cointemplate);
    })


}
function removeFromSelected(coin) {
    console.log(coin);
    coinsForChart.splice(coinsForChart.indexOf(coin), 1);
    if (coinsForChart.length == 5) {
        $("#warning-modal").hide();
        $("#coins").css("opacity", 0.9);
    } else {
        $('#modal-body').empty();
        insertCoinsToModal();
    }
    removeCheckToggle();
    // console.log(coin);
    console.log(coinsForChart);
}
function removeCheckToggle() {
    coinsStorage.forEach(coin => {
        $('#' + coin.symbol).prop("checked", false);
    })
    reToggle();
}