// Process each list group
function makeButtonInteractive(item, listGroup, removeButton, activeItem) {
    item.addEventListener('click', function() {

        // Get all the buttons in the current list group
        var listGroupItems = listGroup.querySelectorAll('.list-group-item');

        // Remove the 'active' class from all buttons in the current list group
        listGroupItems.forEach(function(item) {
            item.classList.remove('active');
        });

        // Add the 'active' class to the clicked button
        this.classList.add('active');
        activeItem[0] = this;
        removeButton.style.display = 'block';
    });
}

// Save the state to sessionStorage
function saveState() {
    var orgs = Array.from(orgListGroup.children).map(function(item) {
        return item.textContent;
    });
    var tokens = Array.from(tokenListGroup.children).map(function(item) {
        return item.textContent;
    });
    sessionStorage.setItem('orgs', JSON.stringify(orgs));
    sessionStorage.setItem('tokens', JSON.stringify(tokens));
}

// Load the state from sessionStorage
function loadState() {
    var orgs = JSON.parse(sessionStorage.getItem('orgs')) || [];
    var tokens = JSON.parse(sessionStorage.getItem('tokens')) || [];

    orgs.forEach(function(org) {
        var newItem = document.createElement('button');
        newItem.type = 'button';
        newItem.classList.add('list-group-item', 'list-group-item-action');
        newItem.textContent = org;
        orgListGroup.appendChild(newItem);
        makeButtonInteractive(newItem, orgListGroup, removeOrgButton, activeOrgItem);
    });

    tokens.forEach(function(token) {
        var newItem = document.createElement('button');
        newItem.type = 'button';
        newItem.classList.add('list-group-item', 'list-group-item-action');
        newItem.textContent = token;
        tokenListGroup.appendChild(newItem);
        makeButtonInteractive(newItem, tokenListGroup, removeTokenButton, activeTokenItem);
    });
}

var listGroups = document.querySelectorAll('.list-group');

var orgInput = document.getElementById('orgInput');
var addOrgButton = document.getElementById('addOrgButton');
var orgListGroup = document.querySelector('#orgListGroup');
var activeOrgItem = [null];

// Add new organization to the list
addOrgButton.addEventListener('click', function() {
    var newItem = document.createElement('button');
    newItem.type = 'button';
    newItem.classList.add('list-group-item', 'list-group-item-action');
    newItem.textContent = orgInput.value;
    orgListGroup.appendChild(newItem);
    orgInput.value = '';

    makeButtonInteractive(newItem, orgListGroup, removeOrgButton, activeOrgItem);
    saveState();
});

var tokenInput = document.getElementById('tokenInput');
var addTokenButton = document.getElementById('addTokenButton');
var tokenListGroup = document.querySelector('#tokenListGroup');
var activeTokenItem = [null];

// Add new token to the list
addTokenButton.addEventListener('click', function() {
    var newItem = document.createElement('button');
    newItem.type = 'button';
    newItem.classList.add('list-group-item', 'list-group-item-action');

    // Set the text content to the first three characters of the input, followed by a string of asterisks
    newItem.textContent = tokenInput.value.substring(0, 3) + '*********************';

    tokenListGroup.appendChild(newItem);
    tokenInput.value = '';

    makeButtonInteractive(newItem, tokenListGroup, removeTokenButton, activeTokenItem);
    saveState();
});

// Remove the selected item
removeOrgButton.addEventListener('click', function() {
    // Remove the active item
    if (activeOrgItem[0]) {
        activeOrgItem[0].remove();
        activeOrgItem[0] = null;
        removeOrgButton.style.display = 'none';
    }
    saveState();
});

removeTokenButton.addEventListener('click', function() {
    // Remove the active item
    if (activeTokenItem[0]) {
        activeTokenItem[0].remove();
        activeTokenItem[0] = null;
        removeTokenButton.style.display = 'none';
    }
    saveState();
});

// direct the user to the index page
document.getElementById('saveButton').addEventListener('click', function() {
    window.location.href = './index.html';
});

// Load the state from sessionStorage
loadState();

// Clear the sessionStorage when pressing the logout button
document.getElementById('logoutButton').addEventListener('click', function() {
    sessionStorage.clear();
});