function userLogin(event) {
    
    const configObject = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: event.target[0].value
        })
      }

    // Create a new Player on the back-end
    fetch('http://localhost:3000//players', configObject)
      .then(res => res.json())
      .then(playerObject => {

        console.log(playerObject)

        // Hide the Login Form Div
        const loginFormDiv = document.getElementById('login-form-div');
        loginFormDiv.style.display = "none";

      })

}

document.addEventListener('DOMContentLoaded', event => {

    const playerLoginForm = document.getElementById('login-form');

    playerLoginForm.addEventListener('submit', event => {
        event.preventDefault();
        userLogin(event);

    })

})