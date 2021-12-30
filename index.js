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
    for (let i = 1; i < tbody.rows.length; i++) activities.push(tbody.rows.item(i).cells.item(0).innerText);
    return activities;
  }

  function get_roles() {
    const roles = [];
    const first_row = tbody.rows.item(0);
    for (let i = 1; i < first_row.cells.length; i++) roles.push(first_row.cells.item(i).innerText);
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
    tbody.innerHTML = "<tr><th>Permissions</th></tr>";
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

  load_quick_save_state();
});
