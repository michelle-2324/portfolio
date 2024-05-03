let chart;

// Get the selected groups from the URL parameters
const urlParams = new URLSearchParams(window.location.search);
const selectedGroups = decodeURIComponent(urlParams.get('groups')).split(',');

// Define colors for each group
function generateColors(numColors) {
    let colors = [];
    for (let i = 0; i < numColors; i++) {
        let hue = Math.floor(360 * i / numColors);
        colors.push(`hsla(${hue}, 100%, 75%, 0.2)`);
    }
    return colors;
}

let groupColors = generateColors(selectedGroups.length);

// Function to load JSON data
async function loadJson(filename) {
    const response = await fetch(filename);
    return await response.json();
}

// Function to calculate the total activities of a group
function calculateTotalActivities(group) {
    return group.issues.length + group.comments.length + group.commits.length + group.pull_requests.length;
}

// Function to calculate the activities by events of a group
function calculateActivitiesByEvents(group) {
    return [group.issues.length, group.comments.length, group.commits.length, group.pull_requests.length];
}

// Function to create the chart
async function createChart() {
    // Load the JSON data for each group and calculate the total activities
    const groups = await Promise.all(selectedGroups.map(groupName => loadJson(`./${groupName}_data.json`)));

    const comparisonType = document.getElementById('comparisonType').value;
    let labels;
    let datasets;
    let title;

    if (comparisonType === 'total') {
        labels = selectedGroups;
        datasets = [{
            label: 'Total Activities',
            data: groups.map(calculateTotalActivities),
            backgroundColor: groupColors,
            borderColor: groupColors.map(color => color.replace('0.2', '1')),
            borderWidth: 1
        }];
        title = `${selectedGroups.join(' vs ')} by Total Activities`;
    } else { // comparisonType === 'byEvents'
        labels = ['Issues', 'Comments', 'Commits', 'Pull Requests'];
        datasets = groups.map((group, index) => ({
            label: selectedGroups[index],
            data: calculateActivitiesByEvents(group),
            backgroundColor: groupColors[index],
            borderColor: groupColors[index].replace('0.2', '1'),
            borderWidth: 1
        }));
        title = `${selectedGroups.join(' vs ')} by Event Types`;
    }

    // Destroy the old chart if it exists
    if (chart) {
        chart.destroy();
    }

    // Create the new chart
    const ctx = document.getElementById('comparisonChart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                datalabels: {
                    color: '#000',
                    display: true,
                    anchor: 'end',
                    align: 'top',
                    formatter: Math.round,
                    font: {
                        weight: 'bold'
                    }
                },
                title: {
                    display: true,
                    text: title
                }
            }
        }
    });
}

// Create the initial chart
createChart();

// Create the leaderboard for the selected groups
async function generateLeaderboard() {
    // Fetch the data for all selected groups
    let groupDataPromises = selectedGroups.map((groupName, index) => {
        return loadJson(`./${groupName}_data.json`).then(data => {
            return {
                data: data,
                color: groupColors[index % groupColors.length]
            };
        });
    });
    let groupDataList = await Promise.all(groupDataPromises);

    // Calculate the total score for each group
    let groupScores = groupDataList.map((groupData, index) => {
        let totalScore = groupData.data.dates.reduce((sum, date) => sum + date.total_metrics, 0);
        return { group: selectedGroups[index], score: totalScore, color: groupData.color };
    });

    // Sort the groups by score in descending order
    groupScores.sort((a, b) => b.score - a.score);

    // Now groupScores is a leaderboard with groups sorted by their total score
    console.log(groupScores);

    let leaderboardDiv = document.getElementById('leaderboard');
    leaderboardDiv.innerHTML = `
        <table class="table">
            <thead>
                <tr>
                    <th scope="col">#</th>
                    <th scope="col">Group</th>
                    <th scope="col">Score</th>
                </tr>
            </thead>
            <tbody>
                ${groupScores.map((group, index) => `
                    <tr style="background-color: ${group.color};">
                        <th scope="row">${index + 1}</th>
                        <td>${group.group}</td>
                        <td>${group.score}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Generate the leaderboard
generateLeaderboard();

// Create the student leaderboard for the selected groups
async function generateStudentLeaderboard() {
    let leaderboard = {};

    for (let i = 0; i < selectedGroups.length; i++) {
        let groupName = selectedGroups[i];
        let data = await loadJson(`./${groupName}_data.json`);

        for (let date of data.dates) {
            for (let contributorName in date.contributors) {
                let contributor = date.contributors[contributorName];

                if (!leaderboard[contributorName]) {
                    leaderboard[contributorName] = {
                        name: contributorName,
                        group: groupName,
                        color: groupColors[i % groupColors.length],
                        score: 0
                    };
                }

                leaderboard[contributorName].score += contributor.metrics;
            }
        }
        // Add students who did not contribute to the leaderboard
        for (let studentName of data.collaborators) {
            if (!leaderboard[studentName]) {
                leaderboard[studentName] = {
                    name: studentName,
                    group: groupName,
                    color: groupColors[i % groupColors.length],
                    score: 0
                };
            }
        }
    }

    // Convert the leaderboard object to an array and sort it by score
    let leaderboardArray = Object.values(leaderboard);
    leaderboardArray.sort((a, b) => b.score - a.score);

    // Now leaderboardArray is a leaderboard with students sorted by their total score
    console.log(leaderboardArray);

    let leaderboardDiv = document.getElementById('studentleaderboard');
    leaderboardDiv.innerHTML = `
        <table class="table">
            <thead>
                <tr>
                    <th scope="col">#</th>
                    <th scope="col">Student</th>
                    <th scope="col">Group</th>
                    <th scope="col">Score</th>
                </tr>
            </thead>
            <tbody>
                ${leaderboardArray.map((student, index) => `
                    <tr style="background-color: ${student.color};">
                        <th scope="row">${index + 1}</th>
                        <td>${student.name}</td>
                        <td>${student.group}</td>
                        <td>${student.score}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Generate the student leaderboard
generateStudentLeaderboard();