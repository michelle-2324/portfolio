const urlParams = new URLSearchParams(window.location.search);
const groupName = decodeURIComponent(urlParams.get('group'));

// for buttons
  function redirectToPage(pageName) {
    window.location.href = pageName + '.html?group=' + encodeURIComponent(groupName);
  }

  document.getElementById('memberButton').addEventListener('click', function() {
    redirectToPage('members');
  });

  document.getElementById('aiButton').addEventListener('click', function() {
    redirectToPage('ai_assistant');
  });

  document.getElementById('dbButton').addEventListener('click', function() {
    sessionStorage.setItem('groupName', groupName);
    redirectToPage('dashboard');
  });

  window.addEventListener('load', function() {
    if (!groupName) {
      groupName = sessionStorage.getItem('groupName');
      redirectToPage('dashboard');
    }
  });

window.addEventListener('load', function() {
var params = new URLSearchParams(window.location.search);
var groupName = params.get('group');

if (!groupName) {
    groupName = sessionStorage.getItem('groupName');
    window.location.href = 'dashboard.html?group=' + encodeURIComponent(groupName);
}
});

// for dashboard content
fetch('../' + groupName + '_data.json')
  .then(response => response.json())
  .then(data => {

    let groupName = data.group_name;
    
    // first row metrics
    let totalActivities = data.issues.length + data.comments.length + data.commits.length + data.pull_requests.length;
    let totalScore = data.dates.reduce((sum, date) => sum + date.total_metrics, 0);
    let averageScore = totalScore / data.collaborators.length
    
    document.getElementById('groupName').textContent = groupName;
    document.getElementById('activityNumber').innerText = totalActivities;
    document.getElementById('scoreNumber').innerText = totalScore;
    document.getElementById('averageNumber').innerText = averageScore.toFixed(2);
  
    // create bar chart
    let dates = Array.from({length: 30}, (_, i) => {
      let d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().slice(0, 10);
    }).reverse();

    let datasets = {};
    for (let date of dates) {
      let dataDate = data.dates.find(d => d.date === date);
      if (dataDate) {
        for (let event in dataDate.events) {
          if (!datasets[event]) {
            datasets[event] = Array(30).fill(0);
          }
          datasets[event][dates.indexOf(date)] = dataDate.events[event];
        }
      }
    }
        
    let colorMap = {
      'comments': '#AFF5FF',
      'issues': '#67C6E3',
      'commits': '#378CE7',
      'pull_requests': '#5356FF'
    };
    let chartData = Object.keys(datasets).map((event) => {
      return {
        label: event,
        data: datasets[event],
        backgroundColor: colorMap[event],
      };
    });

    new Chart(document.getElementById('barChart'), {
        type: 'bar',
        data: {
            labels: dates,
            datasets: chartData,
        },
        options: {
            title: {
                display: true,
                text: 'Activities in the past 30 days'
            },
            scales: {
              x: {
                type: 'time', 
                time: {
                  unit: 'day'
                },
                stacked: true,
              },
              y: {
                stacked: true,
              },
            },
        },
    });

    // create line chart
    let totalMetrics = Array(30).fill(0);
    let allDates = dates;
    let cumulativeMetrics = 0;
    for (let date of allDates) {
      let dataDate = data.dates.find(d => d.date === date);
      if (dataDate) {
        cumulativeMetrics += Number(dataDate.total_metrics);
      }
      totalMetrics[allDates.indexOf(date)] = cumulativeMetrics;
    }

    new Chart(document.getElementById('lineChart'), {
      type: 'line',
      data: {
        labels: allDates,
        datasets: [{
          label: 'Cumulative Metrics',
          data: totalMetrics,
          borderColor: '#67C6E3',
          pointBackgroundColor: '#378CE7', 
          backgroundColor: 'rgba(55, 140, 231, 0.5)', 
          fill: true,  
        }]
      },
      options: {
        title: {
          display: true,
          text: 'Cumulative Metrics in the past 30 days'
        },
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'day'
            }
          },
          y: {
            beginAtZero: true
          }
        }
      }
    });

    // create pie charts 1
    let totalAdditions = 0;
    let totalDeletions = 0;

    for (let commit of data.commits) {
      totalAdditions += commit.stats.additions;
      totalDeletions += commit.stats.deletions;
    }

    new Chart(document.getElementById('pieChart1'), {
      type: 'pie',
      data: {
        labels: ['Additions', 'Deletions'],
        datasets: [{
          data: [totalAdditions, totalDeletions],
          backgroundColor: ['#67D9E3', '#E39A66'],
        }]
      },
      options: {
        responsive: true,
        title: {
          display: true,
          text: 'Proportion of Additions and Deletions'
        }
      }
    });

    // create pie charts 2
    let openIssues = 0;
    let closedIssues = 0;

    for (let issue of data.issues) {
      if (issue.state === 'open') {
        openIssues++;
      } else if (issue.state === 'closed') {
        closedIssues++;
      }
    }

    new Chart(document.getElementById('pieChart2'), {
      type: 'pie',
      data: {
        labels: ['Open', 'Closed'],
        datasets: [{
          data: [openIssues, closedIssues],
          backgroundColor: ['#67D9E3', '#E39A66'],
        }]
      },
      options: {
        responsive: true,
        title: {
          display: true,
          text: 'Proportion of Open and Closed Issues'
        }
      }
    });

    // create pie charts 3
    let openPullRequests = 0;
    let closedPullRequests = 0;

    for (let pullRequest of data.pull_requests) {
      if (pullRequest.state === 'open') {
        openPullRequests++;
      } else if (pullRequest.state === 'closed') {
        closedPullRequests++;
      }
    }

    new Chart(document.getElementById('pieChart3'), {
      type: 'pie',
      data: {
        labels: ['Open', 'Closed'],
        datasets: [{
          data: [openPullRequests, closedPullRequests],
          backgroundColor: ['#67D9E3', '#E39A66'],
        }]
      },
      options: {
        responsive: true,
        title: {
          display: true,
          text: 'Proportion of Open and Closed Pull Requests'
        }
      }
    });

    // create milestone table
    var milestones = data['milestones'];

    var html = '<table>';
    html += '<colgroup>';
    html += '<col style="width:20%">';
    html += '<col style="width:40%">';
    html += '<col style="width:20%">';
    html += '<col style="width:20%">';
    html += '</colgroup>';
    html += '<tr><th>Title</th><th>Progress</th><th>State</th><th>Due on</th></tr>';

    for (var i = 0; i < milestones.length; i++) {
    var milestone = milestones[i];

    var title = milestone['title'];
    var open_issues = milestone['open_issues'];
    var closed_issues = milestone['closed_issues'];
    var state = milestone['state'];
    var due_on = milestone['due_on'];

    var progress = (open_issues + closed_issues === 0) ? 0 : closed_issues / (open_issues + closed_issues);

    var stateColor = state === 'open' ? 'red' : 'green';

    html += '<tr>';
    html += '<td>' + title + '</td>';
    html += '<td><progress value="' + progress + '" max="1"></progress> ' + (progress * 100).toFixed(2) + '%</td>';
    html += '<td style="color:' + stateColor + ';">' + state + '</td>';
    html += '<td style="color:blue;">' + (due_on ? due_on : 'null') + '</td>';
    html += '</tr>';
    }

    html += '</table>';
    document.getElementById('milestoneList').innerHTML = html;

    // fetch data
    fetch('../' + groupName + '_data.json')
    .then(response => response.json())
    .then(data => {

    // calculate total score
    var totalScore = data.dates.reduce((total, currentDate) => total + currentDate.total_metrics, 0);

    // record the most and least active student
    var allContributors = data.dates.flatMap(date => Object.entries(date.contributors).map(([name, data]) => ({ name, ...data })));
    var mostActiveStudent = allContributors.reduce((max, current) => max.metrics > current.metrics ? max : current);
    var leastActiveStudent = allContributors.reduce((min, current) => min.metrics < current.metrics ? min : current);

    // record free riders
    var contributorNames = allContributors.map(contributor => contributor.name);
    var freeRiders = data.collaborators.filter(student => !contributorNames.includes(student));

    // record the most and least common event
    var eventCounts = data.dates.reduce((counts, currentDate) => {
      for (var event in currentDate.events) {
        if (!counts[event]) {
          counts[event] = 0;
        }
        counts[event] += currentDate.events[event];
      }
      return counts;
    }, {});
    var mostCommonEvent = Object.keys(eventCounts).reduce((max, current) => eventCounts[max] > eventCounts[current] ? max : current);
    var leastCommonEvent = Object.keys(eventCounts).reduce((min, current) => eventCounts[min] < eventCounts[current] ? min : current);

    // determine activity level
    var activityLevel;
    if (totalScore >= 70) {
      activityLevel = 'high';
    } else if (totalScore >= 35) {
      activityLevel = 'medium';
    } else {
      activityLevel = 'low';
    }

    // generate report content
    var reportContent = data.group_name + ' demonstrates ' + activityLevel + ' activity in the project. ';
    reportContent += 'The most active student is ' + mostActiveStudent.name + ' with a total score of ' + mostActiveStudent.metrics + '. ';
    reportContent += 'The least active student is ' + leastActiveStudent.name + ' with a total score of ' + leastActiveStudent.metrics + '. ';
    freeRiders.forEach(freeRider => {
      reportContent += freeRider + ' is considered as a free rider. ';
    });
    reportContent += 'The group makes ' + mostCommonEvent + ' the most, which has ' + eventCounts[mostCommonEvent] + ' times, ';
    reportContent += 'and makes ' + leastCommonEvent + ' the least, which has ' + eventCounts[leastCommonEvent] + ' times.';

    // display report content
    document.getElementById('reportContent').textContent = reportContent;
    });
  });

loadGroupData(groupName);