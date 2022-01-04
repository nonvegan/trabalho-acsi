const Toast = Swal.mixin({
  toast: true,
  position: "bottom-end",
  showConfirmButton: false,
  timer: 3000,
});

function downloadObjectAsJson(exportObj, exportName) {
  var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
  var downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", exportName);
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

window.addEventListener("load", (evt) => {
  const dummy_state = {
    activities: ["Activity 1", "Activity 2", "Activity 3"],
    roles: ["Role 1", "Role 2", "Role 3"],
    matrix: [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ],
  };

  const tabela = document.getElementById("tabela");
  const tbody = tabela.querySelector("tbody");

  const get_role_count = () => tbody.firstElementChild.cells.length - 1;
  const get_activity_count = () => tbody.rows.length - 1;

  function get_activities() {
    const activities = [];
    for (let i = 1; i < tbody.rows.length; i++) activities.push(tbody.rows.item(i).cells.item(0).innerText.trim());
    return activities;
  }

  function get_roles() {
    const roles = [];
    const first_row = tbody.rows.item(0);
    for (let i = 1; i < first_row.cells.length; i++) roles.push(first_row.cells.item(i).innerText.trim());
    return roles;
  }

  function get_matrix() {
    const matrix = [];
    for (let i = 1; i < tbody.rows.length; i++) {
      const sub_matrix = [];
      for (let j = 1; j < tbody.rows.item(i).cells.length; j++) sub_matrix.push(tbody.rows.item(i).cells.item(j).firstElementChild.checked);
      matrix.push(sub_matrix);
    }
    return matrix;
  }

  function get_state() {
    return { activities: get_activities(), roles: get_roles(), matrix: get_matrix() };
  }

  function is_valid_state(state) {
    if (state && state.activities && state.roles && state.matrix) {
      if (state.activities.length == state.matrix.length) {
        if (state.matrix.every((sub_matrix) => sub_matrix.length === state.roles.length)) return true;
      }
    }
    return false;
  }

  function quick_save_state() {
    const state = get_state();
    if (is_valid_state(state)) {
      localStorage.setItem("state", JSON.stringify(state));
    }
  }

  function add_input_quick_save_callback(node) {
    node.addEventListener("input", (evt) => {
      quick_save_state();
      console.log("quick-saving");
    });
  }

  function load_quick_save_state() {
    const state = JSON.parse(localStorage.getItem("state"));
    if (is_valid_state(state)) {
      load_table(state);
    } else {
      load_table(dummy_state);
    }
  }

  function reset_table() {
    tbody.innerHTML = "<tr><th>Activities / Roles</th></tr>";
  }

  function load_table(state) {
    state.roles.forEach((role) => {
      const new_cell = document.createElement("th");
      new_cell.innerText = role;
      new_cell.className = "special";
      new_cell.contentEditable = true;
      add_input_quick_save_callback(new_cell);
      new_cell.addEventListener("keypress", (evt) => {
        switch (evt.key) {
          case "Enter":
            evt.preventDefault();
            new_cell.contentEditable = false;
            new_cell.contentEditable = true;
            new_cell.blur();
            break;
        }
      });
      tbody.rows.item(0).appendChild(new_cell);
    });

    state.activities.forEach((activity, index) => {
      const new_row = document.createElement("tr");
      const new_cell = document.createElement("td");
      new_cell.innerText = activity;
      new_cell.contentEditable = true;
      add_input_quick_save_callback(new_cell);
      new_cell.addEventListener("keypress", (evt) => {
        switch (evt.key) {
          case "Enter":
            evt.preventDefault();
            new_cell.contentEditable = false;
            new_cell.contentEditable = true;
            new_cell.blur();
            break;
        }
      });
      new_row.appendChild(new_cell);
      state.matrix[index].forEach((status) => {
        const new_cell = document.createElement("td");
        const new_checkbox = document.createElement("input");
        new_checkbox.type = "checkbox";
        new_checkbox.checked = status;
        add_input_quick_save_callback(new_checkbox);
        new_cell.appendChild(new_checkbox);
        new_row.appendChild(new_cell);
      });
      tbody.appendChild(new_row);
    });
  }

  document.getElementById("adicionar-act").addEventListener("click", (evt) => {
    const new_row = document.createElement("tr");
    const new_cell = document.createElement("td");
    new_cell.innerText = "New Activity";
    new_cell.contentEditable = true;
    new_cell.addEventListener("keypress", (evt) => {
      switch (evt.key) {
        case "Enter":
          evt.preventDefault();
          new_cell.contentEditable = false;
          new_cell.contentEditable = true;
          new_cell.blur();
          break;
      }
    });
    add_input_quick_save_callback(new_cell);
    new_row.appendChild(new_cell);
    for (let i = 0; i < get_role_count(); i++) {
      const new_cell = document.createElement("td");
      const new_checkbox = document.createElement("input");
      new_checkbox.type = "checkbox";
      add_input_quick_save_callback(new_checkbox);
      new_cell.appendChild(new_checkbox);
      new_row.appendChild(new_cell);
    }
    tbody.appendChild(new_row);
    quick_save_state();
  });

  document.getElementById("remover-act").addEventListener("click", (evt) => {
    if (get_activity_count() > 0) {
      tabela.deleteRow(get_activity_count());
      quick_save_state();
    }
  });

  document.getElementById("adicionar-role").addEventListener("click", (evt) => {
    const new_cell = document.createElement("th");
    new_cell.innerText = "New Role";
    new_cell.className = "special";
    new_cell.contentEditable = true;
    new_cell.addEventListener("keypress", (evt) => {
      switch (evt.key) {
        case "Enter":
          evt.preventDefault();
          new_cell.contentEditable = false;
          new_cell.contentEditable = true;
          new_cell.blur();
          break;
      }
    });
    add_input_quick_save_callback(new_cell);
    tbody.rows.item(0).appendChild(new_cell);
    for (let i = 1; i <= get_activity_count(); i++) {
      const new_cell = document.createElement("td");
      const new_checkbox = document.createElement("input");
      new_checkbox.type = "checkbox";
      add_input_quick_save_callback(new_checkbox);
      new_cell.appendChild(new_checkbox);
      tbody.rows.item(i).appendChild(new_cell);
    }
    quick_save_state();
  });

  document.getElementById("remover-role").addEventListener("click", (evt) => {
    if (get_role_count() > 0) {
      for (let row of tbody.rows) row.removeChild(row.lastElementChild);
      quick_save_state();
    }
  });

  document.getElementById("save").addEventListener("click", (evt) => {
    const state = get_state();
    downloadObjectAsJson(state, "matrix.json");
  });

  document.getElementById("new").addEventListener("click", (evt) => {
    reset_table();
    load_table(dummy_state);
    quick_save_state();
  });

  document.getElementById("load").addEventListener("click", (evt) => {
    const error_popup = () =>
      Toast.fire({
        icon: "error",
        title: "Failed to load file",
      });

    var inputNode = document.createElement("input");
    inputNode.type = "file";
    inputNode.addEventListener("change", (evt) => {
      var file = evt.target.files[0];
      var reader = new FileReader();
      reader.readAsText(file, "UTF-8");
      reader.addEventListener("load", (evt) => {
        try {
          const state = JSON.parse(evt.target.result);
          if (is_valid_state(state)) {
            reset_table();
            load_table(state);
            quick_save_state();
            Toast.fire({
              icon: "success",
              title: "File Loaded successfully",
            });
          } else {
            error_popup();
          }
        } catch (error) {
          error_popup();
        }
      });
    });
    document.body.appendChild(inputNode);
    inputNode.click();
    inputNode.remove();
  });

  document.getElementById("export").addEventListener("click", (evt) => {
    var doc = new jspdf.jsPDF({
      orientation: "landscape",
    });
    var centeredText = function (text, y) {
      var textWidth = (doc.getStringUnitWidth(text) * doc.internal.getFontSize()) / doc.internal.scaleFactor;
      var textOffset = (doc.internal.pageSize.width - textWidth) / 2;
      doc.text(textOffset, y, text);
    };
    doc.setFontSize(25);
    centeredText("Roles and Permission matrix", 15);
    doc.setFontSize(10);

    const state = get_state();

    const base64_ticked_img =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAIAAAC0Ujn1AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAK0SURBVEhL1ZbNTxNBGIdnu1va3bZKKAlwMRGNFCghHoB4MeLNm9EEqEQh/g+CQEtSoaapCZ6MMZIYo8bEo3c1kWpbk/YqRdub1BbQljb0Q7bju7tTul22H4Am+hzand9Mnr59Z3az1M0319EfB6Mi/UtDBn+Bf1yNybeCo6kx4otFDF9q9iOoMcrwKZah07tpVffh1Vv5xOUTVx5eeOoccG3k4hgr7YdUb+USI51jNssEXPe09HrOLW3klfYq6io7I7GZjYP3mmWS9AGj7hbrvaH7iUq7mhqjAi6k8j92+V2SyIB6R0/ZJC+FKCGCD4ws5l7P0FIG+l6y71NjlOZTXcfPPDj/WM/ocvwOyUWg3tFSvcQrIV72mK2oatWi19rcZx+402boeDT8hKXZPftmLm47PW6zTMK6Cm8Jx6fZJka/NyVTE691fnCRJAgtX3zGMvosvyPs20nbWNcNMVbzBmbCP1d1lG5vsqzOF7N9zf3zgy4yLrE8/JzG6GrnyHg31KuOwz8TTq2aGKP8R8mTD3qfKaReXXotpQfC4Z8Nb3820aayV/7koyhokca3/l4Y1Dx5CuyB20pviXJDjE3H3KFF37pXWNSYHbxryTVVL1BWw6yZbXeHnL7YiupSBXOBqS/g1Vb0V47shAhtQWauwx1c8Me8JKqCPTD9NRkxgrc6FWpAqJ1ruxuE2j+QaB9z/inBy3BkXAWlGoANbRVqd378vkIiGeCNbEcMDCv8x5qoqEWw0Pfgghf6LmPOdyuSinA01Ft/N9TVws1K4VZ9uyfk8sbEEwn99U9HtqMcw4mzUlYL+uxEP7msRLJzjOHdt7cI8S+jL6LJqIExiHcAWVMDrCnWeQ8RzjfGOT7PULSW1kphfRp5D4H6oEx4QmlphkQNU0cto4EuVNK4+sD8j2qEfgNx/Aq5cSyoXAAAAABJRU5ErkJggg==";
    const base64_unticked_img =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAIAAAC0Ujn1AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAANaSURBVEhL1ZZLTxNRFIDvmenQmbaUUmox6sKtMfEV98aVIiEuxIS4QJGXNS6NvBLdGSIiG+NfIFGRN26IEo0xujExgRAjakxIMZZH6budmeu50wthXmzUGD8odM6595tzTmcmhe9NDcGMSCghQP4sAv//F/hXalr+wWHZwFj51x13tWEFzRBb7CxBiK4ZS3jMzq5VF/Kql0AhTzSdRwyYLZvVFIlk0lQ3pXbiosZqMil6+FD1s/GKsVFVzZKSWi4d/wrJVXr6VOjpiDw8rG9uUE0z9lhxUlPKvMePBoeGMK34FGV0UtNyoDK7kEwU685V9/ViSq7do4w8oZtJojrYbWpWb5aeOFI1OCjyAPH5FWUM7XlIxEv1DZGebiPDOlCiUWV0REsn7bWb1ZToah5OHgvdf7B9A5XfYO3+xyOk+XJN1y0jwABglciRiG9sHIp57JYnDKxV02JBajiPb+z3phQKVsVi/GALMBZK4ZBaGwHzp21VC/5g4XZfYeWH/aKyzY6DvvTAPSH+k4jlEXLM67ECCqIvmGm8UIzHedAdnAZ6UwP9dHJG8AUsnVpLwfHpgiiFwunGi4XlZdeLFmF9wWb/XTrxHKqq7RN06JLZQZSqw6mzdaVclkdtaECSjx7S8UkIhe1exGmAWA5QbW3dG+uQFB8P2sCdcms7hMNULRgdWLGpcX5A9UTCc+VS4PoNpzNzsFCv1ytPT1N82qtFu920t5yla6sVLc2BjphTlyZwgYyX/NQMlYCqJYvdpAZKdXwYNTX62zvsXqemGcw+MUVEtpuHDCwdY7ok7T/gWC/eyLn4Cj8wg3bdW4Gb+bGBWQ1ElAPFgaHU6znLZYeHm729ufoz2cVPPLQF+tY7YkIqu+stgwCINRH1Zm96bnbbjm+SPT3Cm3fivoP5lubcwiJPGKmN9k74vERkLN2ETW0A0ajWfSfzchaHgEVtdHULb99DsJKyE+/NtbXk5hdwGWultROWvkDAb5+hy5cF4yFG1xLC1Ra68JF8mCf+SlyASzADlKippPdam/bilf71m4DXvtOH4/49BCPoyeeIKIHkYffoNuUT57Pg8YJHNKV24DwQBj6LAUD2QYXZi2Acd8r+XbyIu7rcxtbLChox7O5FdlP/Jv+jmpBfmCxivtyL1nMAAAAASUVORK5CYII=";

    doc.autoTable({
      head: [["Activities / Roles", ...state.roles]],
      startY: 22.5,
      styles: { halign: "center", valign: "middle" },
      theme: "grid",
      headStyles: { fillColor: [41, 128, 186], textColor: [255, 255, 255], lineColor: [0, 0, 0],  },
      columnStyles: { 0: { fontStyle: "bold", fillColor: [41, 128, 186], textColor: [255, 255, 255] } },
      body: state.activities.map((x) => [x]),
      didDrawCell: (data) => {
        if (data.section === "body" && data.column.index > 0) {
          doc.addImage(
            state.matrix[data.row.index][data.column.index - 1] ? base64_ticked_img : base64_unticked_img,
            "PNG",
            data.cell.x + data.cell.width / 2 - 1.75,
            data.cell.y + data.cell.height / 3 - 1.75,
            6,
            6
          );
        }
      },
    });
    doc.save("matrix.pdf");
  });

  load_quick_save_state();
});
