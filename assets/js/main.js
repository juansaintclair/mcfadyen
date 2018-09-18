//@ts-check
(function () {
    'use strict';

    var currentPage = 1;
    var pageSize = 5;
    var employees = [];
    var filteredEmployees = [];
    var isFiltering = false;

    var minimalLengthToStartSearch = 2,
        employeesUrl = './assets/dataset/people-collection.json';

    var inputEmploy = document.querySelector("#inputEmploy");

    /* Private Functions */
    function _showTipBox(employee) {
        var tipBox = document.querySelector("#tipBox");

        tipBox.classList.toggle('hidden', _checkEmployInputLength(employee) || employee.length === 0);
    }

    function _checkEmployInputLength(employee) {
        return (employee.length > minimalLengthToStartSearch);
    }

    function _getEmployeesList(startEmployeeSerch) {
        var searchTerm = document.getElementById('inputEmploy').value.toLowerCase();

        filteredEmployees = employees.filter(function (employee) {
            var fields = Object.keys(employee);

            return fields.some(function (field) {
                var value = (employee[field] || "").toString();
                return value && _clearField(value).indexOf(searchTerm) >= 0;
            })
        });

        _createEmployeesTable()
    }

    function _clearField(value) {
        return value.toLowerCase().replace('.', '').replace(',', '');
    }

    function _createEmployeesTable() {
        if (isFiltering) {
            _clearRows();
            _loadRows(filteredEmployees);
        } else {
            var currentPosition = (currentPage - 1) * pageSize;
            var until = (pageSize * (currentPage));
            var page = employees.slice(currentPosition, until);

            _loadRows(page);
        }
    }

    function _clearRows() {
        document.querySelectorAll('tbody > tr').forEach(function (row) {
            row.parentElement.removeChild(row);
        })
    }

    function _loadRows(rows) {
        var tableRef = document.querySelector('#employeesTable tbody');

        rows.forEach(function (employee) {
            _insertEmployRow(tableRef, employee)
        })
    }

    function _createImgEl(img, name, imgSize) {
        var imgAttrib = document.createElement("img");

        imgAttrib.setAttribute('src', img);
        imgAttrib.setAttribute('width', imgSize);
        imgAttrib.setAttribute('alt', 'Picture of ' + name);
        imgAttrib.classList.add('img-responsive');

        return imgAttrib;
    }

    function _insertEmployRow(tableRef, employee) {
        var newRow = tableRef.insertRow(tableRef.rows.length),
            fields = ['picture', 'name', 'age', 'isActive', 'email', 'phone', 'company', 'balance'];

        fields.forEach(function (field, index) {
            var cell = newRow.insertCell(index);
            var text = (field !== 'picture') ? document.createTextNode(employee[field]) : _createImgEl(employee.picture, employee.name, '32px');

            cell.appendChild(text);
        });

        newRow.addEventListener('click', function () {
            _openEmployeeInfo(employee);
        });
    }

    function _openEmployeeInfo(employee) {

        location.href = "#chosen-employee";

        var modalIds = ['name', 'gender', 'phone', 'company', 'address', 'about'];

        var employeeNameModal = document.querySelector('#employeeNameModal');
        employeeNameModal.innerHTML = employee.name;

        modalIds.forEach(function (id) {
            var selectedId = document.querySelector('#' + id);
            selectedId.innerHTML = employee[id];
        });

        var registered = document.querySelector('#registered');
        var employeeRegisteredDate = employee.registered.split(' ')
        var registeredDate = new Date(employeeRegisteredDate[0]).toString();
        registered.innerHTML = registeredDate;

        var iframeGMaps = document.querySelector('#iframeGMaps');
        iframeGMaps.innerHTML = '';
        iframeGMaps.appendChild(_setGMapsIframe(employee))

        var selectedEmployeeImg = document.querySelector('#selectedEmployeeImg');
        selectedEmployeeImg.innerHTML = '';
        selectedEmployeeImg.appendChild(_createImgEl(employee.picture, employee.name, '100%'));
    }

    function _setGMapsIframe(employee) {
        var gMaps = document.createElement("iframe"),
            mapsString = 'https://maps.google.com/maps?width=100%&height=600&hl=en&coord=' + employee.longitude + ',' + employee.latitude + '&q=+()&ie=UTF8&t=&z=9&iwloc=B&output=embed';

        gMaps.setAttribute('src', mapsString);
        gMaps.setAttribute('width', '100%');
        gMaps.setAttribute('height', '300px');
        gMaps.setAttribute('frameborder', '0');
        gMaps.setAttribute('scrolling', 'no');

        return gMaps;
    }

    function _sortEmployees(a, b) {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
    }

    /* Public Functions */
    function checkEmployee() {
        var inputValue = inputEmploy.value;
        var clearScreen = isFiltering;
        isFiltering = _checkEmployInputLength(inputValue);

        _showTipBox(inputValue);
        if (isFiltering) {
            _getEmployeesList();
        } else {
            filteredEmployees = [];
            currentPage = 1;
        }

        if (clearScreen) {
            _clearRows();
            _getEmployeesList();
        }
    }

    function getEmployees() {
        var newXHR = new XMLHttpRequest();

        newXHR.open('GET', employeesUrl);
        newXHR.addEventListener('load', successGetEmployees);
        newXHR.send();
    }

    function successGetEmployees() {
        employees = JSON.parse(this.responseText)
            .sort(function (a, b) {
                return _sortEmployees(a, b);
            });

        _createEmployeesTable();
    }

    function _showMoreClick() {
        currentPage++;
        _createEmployeesTable()

        var recordsShown = currentPage * pageSize;

        if (recordsShown >= employees.length) {
            document.getElementById('buttonShowMore').setAttribute('disabled', 'disabled');
        }
    }

    /* Event Listeners */
    document.addEventListener("DOMContentLoaded", getEmployees);
    document.getElementById('buttonShowMore').addEventListener('click', _showMoreClick);
    inputEmploy.addEventListener('input', checkEmployee)

})();