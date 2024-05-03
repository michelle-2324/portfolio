$(document).ready(function() {
var params = new URLSearchParams(window.location.search);
var groupName = params.get('group');

// for buttons
function redirectToPage(pageName) {
  window.location.href = pageName + '.html?group=' + encodeURIComponent(groupName);
}

document.getElementById('memberButton').addEventListener('click', function() {
  sessionStorage.setItem('groupName', groupName);
  redirectToPage('members');
});

document.getElementById('aiButton').addEventListener('click', function() {
  redirectToPage('ai_assistant');
});

document.getElementById('dbButton').addEventListener('click', function() {
  redirectToPage('dashboard');
});

window.addEventListener('load', function() {
  if (!groupName) {
    groupName = sessionStorage.getItem('groupName');
    redirectToPage('members');
  }
});

window.addEventListener('load', function() {
var params = new URLSearchParams(window.location.search);
var groupName = params.get('group');

if (!groupName) {
    groupName = sessionStorage.getItem('groupName');
    window.location.href = 'members.html?group=' + encodeURIComponent(groupName);
}
});

// get data from json file
$.getJSON(`./${groupName}_data.json`, function(data) {
    let leaderboard = {};
    let allMembers = new Set(data.collaborators);
    let groupName = data.group_name;

    document.getElementById('groupName').textContent = groupName;
    
    // calculate the score for each contributor
    for (let date of data.dates) {
        for (let contributorName in date.contributors) {
            let contributor = date.contributors[contributorName];

            allMembers.delete(contributorName);

            if (!leaderboard[contributorName]) {
                leaderboard[contributorName] = {
                    name: contributorName,
                    commits: 0,
                    pull_requests: 0,
                    issues: 0,
                    comments: 0,
                    events: 0,
                    score: 0
                };
            }

            // create a score for each contributor
            leaderboard[contributorName].commits += contributor.commits;
            leaderboard[contributorName].pull_requests += contributor.pull_requests;
            leaderboard[contributorName].issues += contributor.issues;
            leaderboard[contributorName].comments += contributor.comments;
            leaderboard[contributorName].events += contributor.commits + contributor.pull_requests + contributor.issues + contributor.comments;
            leaderboard[contributorName].score += contributor.metrics;
        }
    }

    // add members who did not contribute to the leaderboard
    for (let member of allMembers) {
        leaderboard[member] = {
            name: member,
            commits: 0,
            pull_requests: 0,
            issues: 0,
            comments: 0,
            events: 0,
            score: 0,
            remarks: '<span style="color: red;">Free Rider</span>'
        };
    }
    
    // function for refreshing the leaderboard
    function renderLeaderboard() {
      let leaderboardArray = Object.values(leaderboard);
      leaderboardArray.sort((a, b) => b.score - a.score);

      let table = $('<table class="table table-striped">');
      table.append('<tr><th>Rank</th><th>Name</th><th>Commits</th><th>Pull Requests</th><th>Issues</th><th>Comments</th><th>Total Events</th><th>Score</th><th>Remarks</th></tr>');
      for (let i = 0; i < leaderboardArray.length; i++) {
      let rank = i + 1;
      let name = leaderboardArray[i].name;
      let commits = leaderboardArray[i].commits;
      let pull_requests = leaderboardArray[i].pull_requests;
      let issues = leaderboardArray[i].issues;
      let comments = leaderboardArray[i].comments;
      let events = leaderboardArray[i].events;
      let score = leaderboardArray[i].score;
      let remarks = leaderboardArray[i].remarks || '';


      let lightness = Math.floor(70 + 30 * i / leaderboardArray.length);

      table.append(`<tr style="background-color: hsl(200, 80%, ${lightness}%);"><td>${rank}</td><td>${name}</td><td>${commits}</td><td>${pull_requests}</td><td>${issues}</td><td>${comments}</td><td>${events}</td><td>${score}</td><td>${remarks}</td></tr>`);
      }

      $('#leaderboard').html(table);
      }

    document.getElementById('datePicker').addEventListener('change', function() {
      let dueDate = new Date(this.value);

      for (let member in leaderboard) {
        if (leaderboard[member].remarks === '<span style="color: orange;">Deadline Fighter</span>') {
          delete leaderboard[member].remarks;
      }
    }

        if (isNaN(dueDate.getTime())) {
        return;
        }

        for (let member in leaderboard) {
        let activitiesBeforeDueDate = 0;
        let activitiesOnDueDate = 0;

        for (let date of data.dates) {
            if (new Date(date.date) < dueDate) {
                for (let contributorName in date.contributors) {
                    if (contributorName === member) {
                        let contributor = date.contributors[contributorName];
                        activitiesBeforeDueDate += contributor.commits + contributor.pull_requests + contributor.issues + contributor.comments;
                    }
                }
            } else if (new Date(date.date).getTime() === dueDate.getTime()) {
                for (let contributorName in date.contributors) {
                    if (contributorName === member) {
                        let contributor = date.contributors[contributorName];
                        activitiesOnDueDate += contributor.commits + contributor.pull_requests + contributor.issues + contributor.comments;
                    }
                }
            }
        }

        if (activitiesOnDueDate / (activitiesBeforeDueDate + activitiesOnDueDate) >= 0.6) {
            leaderboard[member].remarks = '<span style="color: orange;">Deadline Fighter</span>';
        }
        }

        // refresh leaderboard
        renderLeaderboard();

      for (let member in leaderboard) {
        let activitiesBeforeDueDate = 0;
        let activitiesOnDueDate = 0;

        for (let date of data.dates) {
          if (new Date(date.date) < dueDate) {
            for (let contributorName in date.contributors) {
              if (contributorName === member) {
                let contributor = date.contributors[contributorName];
                activitiesBeforeDueDate += contributor.commits + contributor.pull_requests + contributor.issues + contributor.comments;
              }
            }
          } else if (new Date(date.date).getTime() === dueDate.getTime()) {
            for (let contributorName in date.contributors) {
              if (contributorName === member) {
                let contributor = date.contributors[contributorName];
                activitiesOnDueDate += contributor.commits + contributor.pull_requests + contributor.issues + contributor.comments;
              }
            }
          }
        }

        if (activitiesOnDueDate / (activitiesBeforeDueDate + activitiesOnDueDate) >= 0.6) {
          leaderboard[member].remarks = '<span style="color: orange;">Deadline Fighter</span>';
        }
      }

      renderLeaderboard();
    });


    // Transform the leaderboard object into an array and sort it by score
    let leaderboardArray = Object.values(leaderboard);
    leaderboardArray.sort((a, b) => b.score - a.score);

    // Create a table for the leaderboard
    let table = $('<table class="table table-striped">');
    table.append('<tr><th>Rank</th><th>Name</th><th>Commits</th><th>Pull Requests</th><th>Issues</th><th>Comments</th><th>Total Events</th><th>Score</th><th>Remarks</th></tr>');
    for (let i = 0; i < leaderboardArray.length; i++) {
        let rank = i + 1;
        let name = leaderboardArray[i].name;
        let commits = leaderboardArray[i].commits;
        let pull_requests = leaderboardArray[i].pull_requests;
        let issues = leaderboardArray[i].issues;
        let comments = leaderboardArray[i].comments;
        let events = leaderboardArray[i].events;
        let score = leaderboardArray[i].score;
        let remarks = leaderboardArray[i].remarks || '';

        // calculate the lightness of the background color based on the rank, the lower the rank, the lighter the color
        let lightness = Math.floor(70 + 30 * i / leaderboardArray.length);

        table.append(`<tr style="background-color: hsl(200, 80%, ${lightness}%);"><td>${rank}</td><td>${name}</td><td>${commits}</td><td>${pull_requests}</td><td>${issues}</td><td>${comments}</td><td>${events}</td><td>${score}</td><td>${remarks}</td></tr>`);
    }

    // Display the leaderboard
    $('#leaderboard').html(table);

    renderLeaderboard();

    // Create a chart for the member activity over time
    let members = data.collaborators;
    let memberActivity = {};

        for (let member of members) {
        memberActivity[member] = {};
    }

    // create a dictionary to store the activity of each member on each date
    for (let date of data.dates) {
        for (let member in date.contributors) {
            let activity = date.contributors[member].commits + date.contributors[member].pull_requests + date.contributors[member].issues + date.contributors[member].comments;
            memberActivity[member][date.date] = activity;
        }
    }

    // create an array of dates for the x-axis of the chart
    let currentDate = new Date();
    let startDate = new Date();
    startDate.setDate(currentDate.getDate() - 30);
    let dates = [];
    for (let d = startDate; d <= currentDate; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d).toISOString().slice(0,10));
    }

    // create a dataset for each member
    let colors = ['red', 'blue', 'green', 'purple', 'orange', 'black', 'pink', 'brown', 'gray', 'cyan'];
    let colorIndex = 0;

    let datasets = [];
    for (let member in memberActivity) {
    let data = dates.map(date => memberActivity[member][date] || null);
    let color = colors[colorIndex++ % colors.length]; 
    datasets.push({
      label: member,
      data: data,
      fill: false,
      borderColor: color,
      pointBackgroundColor: color,
      pointBorderColor: color,
      pointRadius: 5,
      pointHitRadius: 10
      });
    }

    // create a chart
    var ctx = document.getElementById('myChart').getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'line',
        data: {
    labels: dates,
    datasets: datasets.map(dataset => ({
        ...dataset,
        showLine: false // disable the line connecting the data points
    }))
  },
  options: {
    responsive: false,
    title: {
      display: true,
      text: 'Member Activity Over Time'
    },
    scales: {
      xAxes: [{
        display: true,
        scaleLabel: {
          display: true,
          labelString: 'Date'
        }
      }],
      yAxes: [{
        display: true,
        scaleLabel: {
          display: true,
          labelString: 'Activity'
        }
      }]
    }
  }
});
});
});