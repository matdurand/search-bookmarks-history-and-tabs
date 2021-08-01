//////////////////////////////////////////
// INITIALIZE                           //
//////////////////////////////////////////

import { emptyUserOptions, getUserOptions, setUserOptions } from "./options.js"

// Trigger initialization
initOptions().catch((err) => {
  console.error(err)
})

async function initOptions() {
  const userOptions = await getUserOptions()
  console.log(userOptions)
  
  document.getElementById('user-config').value = JSON.stringify(userOptions, null, 2)
  document.getElementById('edit-options-reset').addEventListener('click', resetOptions)
  document.getElementById('edit-options-save').addEventListener('click', saveOptions)
}

async function saveOptions() {
  const userOptionsString = document.getElementById('user-config').value
  try {
    const userOptions = JSON5.parse(userOptionsString)
    await setUserOptions(userOptions)
    window.location.href = './index.html#search/'
  } catch (e) {
    console.error(e)
    document.getElementById('error-message').style = ''
    document.getElementById('error-message').innerText = 'Invalid JSON. Could not save user options.'
  }
}

async function resetOptions() {
  document.getElementById('user-config').value = JSON.stringify(emptyUserOptions, null, 2)
}
