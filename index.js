async function loadJson(filename) {
const response = await fetch(filename);
return await response.json();
}

// Load and display groups
async function loadAndDisplayGroups() {
const group1 = await loadJson('../project-group1_data.json');
const group2 = await loadJson('../project-group2_data.json');
const group3 = await loadJson('../project-group3_data.json');
let groups = [group1, group2, group3];

// Create sort and filter options
const sortOption = document.getElementById('sortOption').value;
const sortOrder = document.getElementById('sortOrder').value;
const filterOption = document.getElementById('filterOption').value;

if (filterOption === 'freeRider') {
    groups = groups.filter(group => {
        const collaborators = new Set(group.collaborators);

        for (const date of group.dates) {
            for (const contributor in date.contributors) {
                collaborators.delete(contributor);
            }
        }

        return collaborators.size > 0;
    });
}

groups.sort((a, b) => {
    let comparison = 0;
    if (sortOption === 'total') {
        comparison = (b.commits.length + b.issues.length + b.pull_requests.length) - (a.commits.length + a.issues.length + a.pull_requests.length);
    } else if (sortOption === 'issues') {
        comparison = b.issues.length - a.issues.length;
    } else if (sortOption === 'comments') {
        comparison = b.comments.length - a.comments.length;
    } else if (sortOption === 'commits') {
        comparison = b.commits.length - a.commits.length;
    }
    return sortOrder === 'desc' ? comparison : -comparison;
});

const content = document.getElementById('content');
content.innerHTML = ''; 

let row; // Declare row outside the loop
for (let i = 0; i < groups.length; i++) {
    const group = groups[i];

    // Create a new row for every 3 cards
    if (i % 3 === 0) {
        row = document.createElement('div');
        row.className = 'row';
        content.appendChild(row);
    }

    const col = document.createElement('div');
    col.className = 'col-sm-6 col-md-4 col-lg-4';

    const card = document.createElement('div');
    card.className = 'card box-shadow';

    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';

    const groupName = document.createElement('h5');
    groupName.className = 'group';
    groupName.textContent = `Group: ${group.group_name}`;
    cardBody.appendChild(groupName);

    const collaborators = document.createElement('ul');
    collaborators.textContent = `Collaborators: ${group.collaborators ? group.collaborators.join(', ') : ''}`;
    cardBody.appendChild(collaborators);

    const viewDetails = document.createElement('a');
    viewDetails.href = `dashboard.html?group=${encodeURIComponent(group.group_name)}`; 
    viewDetails.className = 'btn btn-primary mr-2';
    viewDetails.textContent = 'View Details';
    cardBody.appendChild(viewDetails);

    const selectButton = document.createElement('button');
    selectButton.className = 'btn btn-primary selectButton ml-2';
    selectButton.textContent = 'Select';
    selectButton.addEventListener('click', function() {
        const index = selectedGroups.indexOf(group.group_name);
        if (index > -1) {
            // If the group is already selected, unselect it
            selectedGroups.splice(index, 1);
            this.textContent = 'Select';
            this.style.backgroundColor='#007bff';
        } else {
            // Otherwise, select the group
            selectedGroups.push(group.group_name);
            this.textContent = 'Unselect';
            this .style.backgroundColor='red';
        }
    });
    cardBody.appendChild(selectButton);

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'd-flex justify-content-center gap-2 mt-auto';
    buttonContainer.appendChild(viewDetails);
    buttonContainer.appendChild(selectButton);
    cardBody.appendChild(buttonContainer);

    card.appendChild(cardBody);
    col.appendChild(card);
    content.appendChild(col);
    row.appendChild(col);
}
}

document.getElementById('sortOption').addEventListener('change', loadAndDisplayGroups);
document.getElementById('sortOrder').addEventListener('change', loadAndDisplayGroups);
document.getElementById('filterOption').addEventListener('change', loadAndDisplayGroups);
const selectedGroups = [];
document.getElementById('compareButton').addEventListener('click', () => {
if (selectedGroups.length >= 2) {
    window.location.href = `compare.html?groups=${encodeURIComponent(selectedGroups.join(','))}`;
} else {
    alert('Please select at least two groups to compare.');
}
});
document.getElementById('searchBox').addEventListener('input', function() {
const searchTerm = this.value.toLowerCase();
const groups = document.getElementsByClassName('group');
for (const group of groups) {
const groupName = group.textContent.toLowerCase();
const collaborators = group.nextElementSibling.textContent.toLowerCase();
if (groupName.includes(searchTerm) || collaborators.includes(searchTerm)) {
    group.parentElement.parentElement.style.display = '';
} else {
    group.parentElement.parentElement.style.display = 'none';
}
}
});
loadAndDisplayGroups();