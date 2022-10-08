// Firebase config
import { initializeApp } from 'firebase/app'
import {
    getFirestore, collection, doc, getDoc, getDocs,
    addDoc, setDoc
} from 'firebase/firestore'

const firebaseConfig = {
    apiKey: "AIzaSyBmWOpuEm0B_acwIdVuGmrCsAsXHDhMh_U",
    authDomain: "sympoh-attendance-2870b.firebaseapp.com",
    projectId: "sympoh-attendance-2870b",
    storageBucket: "sympoh-attendance-2870b.appspot.com",
    messagingSenderId: "517037441328",
    appId: "1:517037441328:web:c1de8f8dcd5e1bfc6788f5"
  };

initializeApp(firebaseConfig)

// Constants
const attendanceForm = document.querySelector('#attendanceForm'),
      seshStatusForm = document.querySelector('#seshStatus'),
      cycleStartInput = document.querySelector('#startDate'),
      cycleEndInput = document.querySelector('#endDate'),
      db = getFirestore();


// Sign In form functionality
attendanceForm.addEventListener('submit', (e) => {
    e.preventDefault()

    var name = attendanceForm.sympNames.value.trim().toLowerCase()
    var date = new Date(attendanceForm.sympDate.value)
    logSesh(name, date)
})

async function logSesh(name, date) {
    await setDoc(doc(db, 'symps', name), {
        placeholder: 'placeholder'
    })

    var colRef = collection(db, `symps/${name}/sesh-dates`)
    await addDoc(colRef, {
        date: date
    })

    let firstName = capitalize(name.split(/\s/)[0]),
        msg = `Thanks for signing in, ${firstName}!`,
        msgArea = document.querySelector('#signInMsg');

    msgArea.innerHTML = msg; 
    attendanceForm.reset(); 
    submitAnimation('.attendance-container', 'dodgerblue')
}


// Sesh Status form functionality
seshStatusForm.addEventListener('submit', (e) => {
    e.preventDefault()

    var name = seshStatusForm.statusNames.value,
        cycleStart = new Date(seshStatusForm.startDate.value).getTime() / 1000,
        cycleEnd = new Date(seshStatusForm.endDate.value).getTime() / 1000;        

    calcStatus(name, cycleStart, cycleEnd)    
    submitAnimation('.status-container', 'rgb(255, 163, 238)')
})

async function calcStatus(name, cycleStart, cycleEnd) {
    var colRef = collection(db, `symps/${name}/sesh-dates`),
        dateDocs = await getDocs(colRef),
        dates = [];

    dateDocs.forEach(doc => dates.push(doc.data()))
    dates = dates.map(date => date.date.seconds).sort((a, b) => b - a)
    
    let seshCounter = 0;
    for(let x = 0; x < dates.length; x++) {
        if (dates[x] < cycleStart || dates[x] > cycleEnd) continue;
        seshCounter++
    }

    let msg1 = (seshCounter == 1) ? `You've attended 1 sesh this cycle.` : `You've attended ${seshCounter} seshes this cycle.`,
        msg2 = (seshCounter < 3) ? `Please attend ${3 - seshCounter} more!` : `Thanks for complying with the sesh policy!`,
        msgArea = document.querySelector("#statusMsg");

    msgArea.innerHTML = `${msg1}<br>${msg2}`
}

async function autofillNames() {
    var colRef = collection(db, 'symps'),
        docs = await getDocs(colRef),
        names = [];

    docs.forEach(doc => names.push(doc.id))
    names.forEach(name => {
        let firstLast = name.split(/\s/);
        let str = ""
        for (let x = 0; x < firstLast.length; x++) {
            let name = capitalize(firstLast[x])
            str += `${name} `
        }

        var el = `<option value="${name}">${str.trim()}</option>`
        var select = document.querySelector('#statusNames')
        select.innerHTML += el
    })
}


// Functions
function submitAnimation(box, color) {
    var box = document.querySelector(`${box}`)
    box.style.boxShadow = `0.2em 0.3em 0.5em ${color}`
    setTimeout(function() {
        box.style.boxShadow = "1em 1em 1em rgb(20,20,20)"
    }, 250)
}

function capitalize(word) {
    let first = word[0].toUpperCase();
    let rest = word.slice(1);
    return `${first}${rest}`
}

cycleStartInput.addEventListener('change', function() {
    let startDate = new Date(cycleStartInput.value)
    let endDate = new Date();
    endDate.setTime(startDate.getTime() + 1209600000)
    cycleEndInput.value = endDate.toISOString().slice(0, 10)
})

document.addEventListener("DOMContentLoaded", function() {
    autofillNames()
})