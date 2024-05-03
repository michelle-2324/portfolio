function checkLogin(username, password) {
    // call api to check login
    const predefinedUsername = 'admin';
    const predefinedPassword = 'password';

    if (username === predefinedUsername && password === predefinedPassword) {
        return true;
    } else {
        return false;
    }
}

function login () {
    const username = document.getElementById('userid').value;
    const password = document.getElementById('password').value;

    // may do encryption here
    if (checkLogin(username, password)) {
        alert('Login success');
    } else {
        alert('Login failed');
    }

    window.location.href = 'setting.html';
}