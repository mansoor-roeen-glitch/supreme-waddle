const chimer = new Audio('/assets/audios/notification-sound.mp3')

// clock display elements
const displaySeconds = document.querySelector('#timer-seconds')
const displayMinutes = document.querySelector('#timer-minutes')
const displayProgressBar = document.getElementById('progress-bar')
const displayDescription = document.querySelector('#app-status-desc')

// button elements
const startStopButton = document.querySelector('#primary-button')
const modeButtons = document.querySelectorAll('.mode-button')

// variables
var workCount = 0
var intervalCount = 0
var minutes, seconds
var interval, timeout
var started = false
var mode = 'pomodoro'
let modes = {
  pomodoro: 1500,
  shortBreak: 300,
  longBreak: 900,
}
var timer = modes[mode]

// initialize 
function init () {
  modeButtons.forEach((entry) => {
     newEventListener({
      trigger: 'click',
      instance: entry, 
      register: true, // register new or update
      initialCallback: false,
      callback: manualModeSwitch
    })
  }) 

  newEventListener({
    trigger: 'click',
    instance: startStopButton,
    register: true,
    initialCallback: false,
    callback: switchState
  })
}

function setTimer () {
  let timerInMs = timer * 1000
  interval = setInterval(tick, 1000)

  timeout = setTimeout(resetInterval, timerInMs + 1000)
}
 
function tick () {
  reassignVariables({timer, started})
  updateDom()

  if (timer <= 0) {timerOver()}
  timer = timer - 1
}

function timerOver () {
  notify()

  if (mode === 'pomodoro') {
    intervalCount = intervalCount + 1
    workCount = workCount + 1
    displayDescription.textContent = `You have completed ${intervalCount} work cycles`
  }

  resetInterval()
  autoModeSwitch()
  updateModeButtons()
}

function notify () {
  chimer.play()
}

function updateModeButtons () {
  modeButtons.forEach(entry => {
    let entryMode = entry.getAttribute('data-mode')
    if (entry.classList.contains('mode')) {entry.classList.remove('mode')}
    if (entryMode === mode) {entry.classList.add('mode') }
  })
}

function updateStartStopButton () {
  if (started) {
    startStopButton.textContent = 'Stop the timer'
  } else {
    startStopButton.textContent = 'Start the timer'
  }
}

function updateDom () {
  displayMinutes.textContent = minutes
  displaySeconds.textContent = seconds
  displayProgressBar.style.width = `${(timer/modes[mode]) * 100}%`
}

function autoModeSwitch () {
  let newMode = mode

  if (mode === 'pomodoro') {
    if (workCount === 4) {
      workCount = 0
      newMode = 'longBreak'
    } else {newMode = 'shortBreak'}
  } else {newMode = 'pomodoro'}

  mode = newMode
  reassignVariables({timer: modes[mode], started: true})
  updateModeButtons()
  setTimer()
}

function manualModeSwitch (instance) {
  let newMode = instance.getAttribute('data-mode')
  mode = newMode
  
  resetInterval()
  reassignVariables({timer: modes[mode], started: false})
  updateModeButtons()
  setTimer()
} 

function switchState () {
  started = !started
  resetInterval()  
  reassignVariables({timer, started})
  updateStartStopButton()

  if (started === true) {
    setTimer()
  }
}

function resetInterval () {
  clearTimeout(timeout)
  clearInterval(interval)
}

function reassignVariables (props) {
  timer = props.timer 
  let mins = ('0' + (Math.floor(props.timer / 60))).slice(-2) // seconds to minutes
  let secs = ('0' + (props.timer - mins * 60)).slice(-2) // seconds left: ;

  minutes = mins
  seconds = secs 
  started = props.started || started
}

function newEventListener ({trigger, instance, callback, register, initialCallback}) {
  if (!register) {instance.removeEventListener(trigger, initialCallback)}
  instance.addEventListener(trigger, () => {callback(instance)})
}

window.onload = () => {
  init()
}