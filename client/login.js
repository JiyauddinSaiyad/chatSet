const loginText = document.querySelector(".title-text .login");
const loginForm = document.querySelector("form.login");
const loginBtn = document.querySelector("label.login");
const signupBtn = document.querySelector("label.signup");
const signupLink = document.querySelector("form .signup-link a");
signupBtn.onclick = (() => {
    loginForm.style.marginLeft = "-50%";
    loginText.style.marginLeft = "-50%";
});
loginBtn.onclick = (() => {
    loginForm.style.marginLeft = "0%";
    loginText.style.marginLeft = "0%";
});
signupLink.onclick = (() => {
    signupBtn.click();
    return false;
});

function registerUser(email, password, name) {
    // Check if the user already exists in the database
    const usersRef = firebase.database().ref("users");
    usersRef.orderByChild("email").equalTo(email).once("value", snapshot => {
        if (snapshot.exists()) {
            alert("User already registered");
        } else {
            // Create the user in the database
            const newUserRef = usersRef.child(email.replace(".", ","));
            newUserRef.set({
                name: name,
                password: password
            });

            alert("User signed up successfully!");

            // Save the user's email and password to local storage
            localStorage.setItem("registeredUser", JSON.stringify({
                email: email,
                password: password
            }));
        }
    });
}


// function signup() {
//     let name = document.getElementById("Sname").value;
//     let email = document.getElementById("Semail").value;
//     let password = document.getElementById("Spassword").value;

//     let users = localStorage.getItem("users") ? JSON.parse(localStorage.getItem("users")) : [];

//     // Check if the email already exists
//     let userExists = users.find(user => user.email === email);
//     if (userExists) {
//         alert("User already exists with this email");
//         return;
//     }

//     // Add the new user to the list
//     users.push({ name, email, password });
//     localStorage.setItem("users", JSON.stringify(users));

//     alert("User signed up successfully!");
// }

function loginUser(email, password) {
    // Check if the user exists in the database
    const usersRef = firebase.database().ref("users");
    usersRef.child(email.replace(".", ",")).once("value", snapshot => {
        if (snapshot.exists()) {
            const user = snapshot.val();
            if (user.password === password) {
                // Save the logged-in user to local storage
                localStorage.setItem("loggedInUser", JSON.stringify({
                    email: email,
                    name: user.name
                }));
                // Redirect to the home page
                window.location.href = "index.html";
            } else {
                alert("Incorrect password");
            }
        } else {
            alert("User does not exist");
        }
    });
}

// function login() {
//     let email = document.getElementById("email").value;
//     let password = document.getElementById("password").value;

//     let users = localStorage.getItem("users") ? JSON.parse(localStorage.getItem("users")) : [];

//     // Check if the email and password match
//     let user = users.find(user => user.email === email && user.password === password);
//     if (!user) {
//         alert("Incorrect email or password");
//         return;
//     }

//     // Save the logged-in user to local storage
//     localStorage.setItem("loggedInUser", JSON.stringify(user));

//     alert("Logged in successfully!");
//     console.log("➡️   ~ file: login.js:59 ~ login ~ alert:", alert);
//     window.location.href = "index.html";
// }

// Check if the user is already logged in
if (localStorage.getItem("loggedInUser")) {
    // Redirect to the index page
    window.location.href = "index.html";
}

