import bot from './assets/bot-modified.png'
import user from './assets/profile-ico.png'
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getDatabase, ref, push, set,update } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";


// Check if the user is already logged in
// if (localStorage.getItem("loggedInUser")) {
//     // Show alert
//     console.log("Logged In")
//     alert("You are Logged In 🎉");
// } else {
//     // Redirect to the Login page
//     window.location.href = "login.html";
// }

const form = document.querySelector('form')
const chatContainer = document.querySelector('#chat_container')

let loadInterval

function loader(element) {
    element.textContent = ''

    loadInterval = setInterval(() => {
        element.textContent += '.';

        if (element.textContent === '....') {
            element.textContent = '';
        }
    }, 300);
}

function typeText(element, text) {
    let index = 0

    let interval = setInterval(() => {
        if (index < text.length) {
            element.innerHTML += text.charAt(index)
            index++
        } else {
            clearInterval(interval)
        }
    }, 20)
}

function generateUniqueId() {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    return `id-${timestamp}-${hexadecimalString}`;
}


function chatStripe(isAi, value, uniqueId) {
    return (
        `
        <div class="wrapper ${isAi && 'ai'}">
            <div class="chat">
                <div class="profile">
                    <img 
                      src=${isAi ? bot : user} 
                      alt="${isAi ? 'bot' : 'user'}" 
                    />
                </div>
                <div class="message" data-id="${uniqueId}">${value} </div>
            </div>
        </div>
    `
    )
}


const handleSubmit = async (e) => {
    e.preventDefault()

    const data = new FormData(form)
    const chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
    // Separate even and odd indices
    const evenIndexMessages = [];
    const oddIndexMessages = [];
    for (let i = 0; i < chatHistory.length; i++) {
        if (i % 2 === 0) {
            evenIndexMessages.push(chatHistory[i]);
        } else {
            oddIndexMessages.push(chatHistory[i]);
        }
    }

    // Concatenate even and odd index messages in desired order
    const sortedMessages = [];
    for (let i = 0; i < oddIndexMessages.length; i++) {
        sortedMessages.push(oddIndexMessages[i]);
        sortedMessages.push(evenIndexMessages[i]);
    }
    // console.log(sortedMessages)
    let pre = [];
    for (let i = 0; i < sortedMessages.length; i++) {
        const isAi = sortedMessages[i].isAi;
        const message = sortedMessages[i].message;
        pre += (isAi, message);
    }
    // console.log(pre)

    const userMessage = data.get('prompt');
    chatContainer.innerHTML += chatStripe(false, userMessage);

    form.reset()

    const uniqueId = generateUniqueId()
    chatContainer.innerHTML += chatStripe(true, " ", uniqueId)

    chatContainer.scrollTop = chatContainer.scrollHeight;

    const messageDiv = document.querySelector(`[data-id="${uniqueId}"]`);

    loader(messageDiv)

    const response = await fetch('https://chatset-nmvc.onrender.com', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt: pre + ' ' + userMessage
        })
    })

    clearInterval(loadInterval)
    messageDiv.innerHTML = " "

    if (response.ok) {
        const data = await response.json();
        const parsedData = data.bot.trim();

        typeText(messageDiv, parsedData)

        // Save chat message in local storage
        const chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
        chatHistory.push({ isAi: true, message: parsedData });
        chatHistory.push({ isAi: false, message: userMessage });
        localStorage.setItem('chatHistory', JSON.stringify(chatHistory));

        // Firebase 
        const firebaseConfig = {
            // Your web app's Firebase configuration
            apiKey: "AIzaSyBSqUa2M19g-dYVufhnRvip0Okgt0etBQg",
            authDomain: "scrtchapp.firebaseapp.com",
            databaseURL: "https://scrtchapp.firebaseio.com",
            projectId: "scrtchapp",
            storageBucket: "scrtchapp.appspot.com",
            messagingSenderId: "813564143232",
            appId: "1:813564143232:web:a70c583acb872490b36865"
        };

        const app = initializeApp(firebaseConfig);
        const db = getDatabase(app);

        // Push chat history to Firebase Realtime Database
        const chatRef = ref(db, 'chats');
        push(chatRef, chatHistory);

        // // Save chat message in local storage
        // const chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
        // chatHistory.push({ isAi: true, message: parsedData });
        // chatHistory.push({ isAi: false, message: userMessage });
        // localStorage.setItem('chatHistory', JSON.stringify(chatHistory));

        // // Firebase 
        // const firebaseConfig = {
        //     // Your web app's Firebase configuration
        //     apiKey: "AIzaSyBSqUa2M19g-dYVufhnRvip0Okgt0etBQg",
        //     authDomain: "scrtchapp.firebaseapp.com",
        //     databaseURL: "https://scrtchapp.firebaseio.com",
        //     projectId: "scrtchapp",
        //     storageBucket: "scrtchapp.appspot.com",
        //     messagingSenderId: "813564143232",
        //     appId: "1:813564143232:web:a70c583acb872490b36865"
        // };

        // const app = initializeApp(firebaseConfig);
        // const db = getDatabase(app);

        // // Get the current user's email address and username from local storage
        // const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        // const userEmail = loggedInUser.email;
        // const key = userEmail.replace(/[@.]/g, "");
        // const userName = loggedInUser.name.split(' ')[0];

        // // Construct the key using the username and email address
        // const chatHistoryRefKey = `${userName}_${key}`;

        // // Push chat history to Firebase Realtime Database
        // const chatHistoryRef = ref(db, `chats/${chatHistoryRefKey}`);
        // // push(chatHistoryRef, chatHistory);

        // // Only push the new chat messages to Firebase Realtime Database
        // const lastMessageIndex = chatHistory.length - 1;
        // if (lastMessageIndex >= 0 && chatHistory[lastMessageIndex].isAi === false) {
        //     const newChatMessages = chatHistory.slice(lastMessageIndex - 1);
        //     newChatMessages.forEach(chatMessage => {
        //         push(chatHistoryRef, chatMessage);
        //     });
        // }


    } else {
        const err = await response.text()

        messageDiv.innerHTML = "Something went wrong! Try clearing chat! 🔁"
        // alert(err)
    }
}

const chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];

// Separate even and odd indices
const evenIndexMessages = [];
const oddIndexMessages = [];
for (let i = 0; i < chatHistory.length; i++) {
    if (i % 2 === 0) {
        evenIndexMessages.push(chatHistory[i]);
    } else {
        oddIndexMessages.push(chatHistory[i]);
    }
}

// Concatenate even and odd index messages in desired order
const sortedMessages = [];
for (let i = 0; i < oddIndexMessages.length; i++) {
    sortedMessages.push(oddIndexMessages[i]);
    sortedMessages.push(evenIndexMessages[i]);
}

// Add messages to chat container
for (let i = 0; i < sortedMessages.length; i++) {
    const isAi = sortedMessages[i].isAi;
    const message = sortedMessages[i].message;
    chatContainer.innerHTML += chatStripe(isAi, message);
}

const clearButton = document.getElementById('clear-button');

const popupDialog = document.getElementById('popup-dialog');
const confirmClear = document.getElementById('confirm-clear');
const cancelClear = document.getElementById('cancel-clear');

clearButton.addEventListener('click', () => {
    popupDialog.style.display = 'block';
});

confirmClear.addEventListener('click', () => {
    localStorage.removeItem('chatHistory');
    chatContainer.innerHTML = '';
    popupDialog.style.display = 'none';
});

cancelClear.addEventListener('click', () => {
    popupDialog.style.display = 'none';
});



form.addEventListener('submit', handleSubmit)
form.addEventListener('keyup', (e) => {
    if (e.keyCode === 13 && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
    }
});


const loading = document.getElementById("loading");

loading.style.display = "block";

setTimeout(function () {
    loading.style.display = "none";
}, 2500);

// Check if the browser supports the Web Speech API
if ('webkitSpeechRecognition' in window) {
    const recognition = new webkitSpeechRecognition();
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    // Get the microphone button and add an event listener
    const microphoneButton = document.getElementById('microphone-button');
    microphoneButton.addEventListener('click', () => {
        microphoneButton.disabled = true;
        recognition.start();
    });

    recognition.addEventListener('result', (e) => {
        const transcript = Array.from(e.results)
            .map((result) => result[0])
            .map((result) => result.transcript)
            .join('');

        // Update the textarea with the transcript
        document.getElementById('prompt').value = transcript;
    });

    recognition.addEventListener('end', () => {
        microphoneButton.disabled = false;
    });

    recognition.addEventListener('error', (e) => {
        console.log(e.error)
        microphoneButton.disabled = false;
    });
}

const surpriseMeButton = document.getElementById('surprise-me-button');
surpriseMeButton.addEventListener('click', () => {
    const prompts = [
        'What is the meaning of life?',
        'Tell me about Islam',
        'Why did the tomato turn red? Because it saw the salad dressing!',
        'What is the difference between let, var and const in JavaScript?',
        'Name the first President of India?',
        'If a train travels at a speed of 60km/h and you want to calculate how long it will take to travel a distance of 120km, what will be the formula?',
        'What is the capital of Australia?',
        'What is the square root of 144?',
        'Who is the first Indian to win the Nobel Prize?',
        'What are the advantages of using Python over other programming languages?',
        'What is the highest mountain peak in India?',
        'What is the population of India?',
        'Best places to visit in India for Muslims',
        'What is the official language of India?',
        'What is the currency of India?',
        'What is the national animal of India?',
        'What is the national bird of India?',
        'What is the average age of the sun?',
        'What is the chemical symbol for gold?',
        'How many planets are in our solar system?',
        'What is the largest mammal in the world?',
        'What is the capital of China?',
        'What is the capital of Russia?',
        'What is the largest planet in our solar system?',
        'What is the smallest country in the world?',
        'What is the largest mammal in the world?',
        'What is the national flower of India?',
        'What is the highest waterfall in the world?',
        'What is the longest river in the world?',
        'What is the largest ocean in the world?',
        'What is the tallest mammal in the world?',
        'What is the biggest country in the world?',
        'What is the most spoken language in the world?',
        'What is the largest city in the world?',
        'What is the fastest land animal in the world?',
        'What is the largest desert in the world?',
        'What is the deepest point in the ocean?',
        'What is the highest mountain in the world?',
        'What is the largest country in Africa?',
        'What is the smallest planet in our solar system?',
        'What is the longest river in Africa?',
        'What is the tallest building in the world?',
        'What is the longest animal in the world?',
        'What is the largest animal in the world?',
        'What is the largest dinosaur that ever existed?',
        'What is the largest country in Europe?',
        'What is the largest country in Asia?',
        'What is the largest country in North America?',
        'What is the largest country in South America?',
        'What is the largest country in Oceania?',
        'What is the Five Pillars of Islam?',
        'Who are the caliphs in Islamic history?',
    ];

    // Generate a random number between 0 and the number of prompts
    const randomNumber = Math.floor(Math.random() * prompts.length);
    const textArea = document.querySelector('.inputBox');
    textArea.innerHTML = prompts[randomNumber];

});