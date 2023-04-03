const socketUrl = "wss://stream.binance.com:9443/ws/!ticker@arr";
const tableBody = document.getElementById("table-body");
let dolar = 1;
const tbody = document.querySelector("tbody");
let trLength = tbody.querySelectorAll("tr").length;
let a = 1;
const socket = new WebSocket(socketUrl);
const searchInput = document.getElementById("search-input");
const table = document.getElementById("crypto-table");
const rows = table.getElementsByTagName("tr");
var closeBtn = document.getElementById("ad-close");

const createRow = (symbol, price) => {
  const row = document.createElement("tr");
  const symbolCell = document.createElement("td");
  const priceCell = document.createElement("td");
  symbolCell.innerText = symbol.slice(0, -4);
  priceCell.innerText = formatMoney(price);
  priceCell.style = "background-color: #17170d";
  row.appendChild(symbolCell);
  row.appendChild(priceCell);
  tableBody.appendChild(row);
  return { row, priceCell };
};

const updateRow = (priceCell, newPrice) => {
  newPrice = formatMoney(newPrice);
  if (newPrice > priceCell.innerText) {
    priceCell.classList.remove("red");
    priceCell.classList.add("green");
  } else if (newPrice < priceCell.innerText) {
    priceCell.classList.remove("green");
    priceCell.classList.add("red");
  } else {
    priceCell.classList.remove("green");
    priceCell.classList.remove("red");
  }
  priceCell.innerText = newPrice;
};

const handleTicker = (ticker) => {
  const { s: symbol, c: price } = ticker;
  if (symbol.endsWith("USDT")) {
    const cellId = symbol.toLowerCase();
    const row = document.getElementById(cellId);
    if (row) {
      updateRow(row.priceCell, price);
    } else {
      const { row, priceCell } = createRow(symbol, price);
      row.id = cellId;
      row.priceCell = priceCell;
    }
  }
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (a == 1) {
    tableBody.innerHTML = "";
    document.querySelector("table").style = " margin-bottom: 50px;";
    var adContainer = document.getElementById("ad-container");
    adContainer.style.display = "block";
    getusdt();
    a = 0;
  }

  data.forEach(handleTicker);
};

function formatMoney(amount) {
  amount = dolar * amount;
  const options = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 8,
  };
  const numString = amount.toFixed(8);
  const decimalIndex = numString.indexOf(".");
  let mantissaDigits = options.maximumFractionDigits;

  if (decimalIndex !== -1) {
    const wholeDigits = decimalIndex;
    mantissaDigits = numString.length - 1 - wholeDigits;
  }

  options.minimumFractionDigits = Math.min(2, mantissaDigits);
  options.maximumFractionDigits = mantissaDigits;

  return parseFloat(amount)
    .toLocaleString("tr-TR", options)
    .replace("₺", "")
    .replace(" ", "");
}

const nameHeader = document.querySelector("#crypto-table th:first-child");
nameHeader.addEventListener("click", () => {
  sortTable(0);
});

function sortTable(columnName) {
  const table = document.getElementById("crypto-table");
  const rows = Array.from(table.getElementsByTagName("tr")).slice(1); // Tablonun ilk satırını başlık olarak kabul ediyoruz.

  const data = rows.map((row) => {
    const columns = Array.from(row.getElementsByTagName("td"));
    const rowData = {};
    columns.forEach((column, index) => {
      rowData[index] = column.innerText;
    });
    return rowData;
  });

  data.sort((a, b) => {
    if (a[columnName] < b[columnName]) {
      return -1;
    }
    if (a[columnName] > b[columnName]) {
      return 1;
    }
    return 0;
  });

  rows.forEach((row, index) => {
    const columns = Array.from(row.getElementsByTagName("td"));
    columns.forEach((column, columnIndex) => {
      column.innerText = data[index][columnIndex];
    });
  });
}

function filterTable() {
  const filter = searchInput.value.toLowerCase();
  const rows = document.getElementsByTagName("tr");

  for (let i = 1; i < rows.length; i++) {
    const cells = rows[i].getElementsByTagName("td");
    let shouldHide = true;

    for (let j = 0; j < cells.length; j++) {
      const cellText = cells[j].textContent.toLowerCase();

      if (cellText.indexOf(filter) > -1) {
        shouldHide = false;
        break;
      }
    }

    rows[i].style.display = shouldHide ? "none" : "";
  }
}
searchInput.addEventListener("keyup", filterTable);
function hideAd() {
  var adContainer = document.getElementById("ad-container");
  adContainer.style.display = "none";
  var tablex = (document.querySelector("table").style = " margin-bottom: 0px;");
}
closeBtn.addEventListener("click", function () {
  hideAd();
});

function getusdt() {
  fetch("https://api.genelpara.com/embed/doviz.json")
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error("Network response was not ok.");
    })
    .then((data) => {
      dolar = data["USD"].alis;
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
      console.clear();
    });
}
setInterval(() => {
  getusdt();
}, 1000);

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.target === tbody && mutation.type === "childList") {
      trLength = tbody.querySelectorAll("tr").length;
      filterTable();
      document.getElementById("info").innerHTML = trLength;
    }
  });
});
observer.observe(tbody, { childList: true });
