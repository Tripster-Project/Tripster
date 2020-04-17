var displayName;
var email;
var emailVerified;
var photoURL;
var isAnonymous;
var uid;
var providerData;

function initApp() {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      console.log("Signed in user!")
      console.log(user);

      //this is going to run too many times bc sign out issue
      fetch("https://tripster-d8fe5.firebaseio.com/users.json", {
                       body: JSON.stringify({
                           "displayName": user.displayName,
                           "email": user.email,
                           "emailVerified": user.emailVerified,
                           "photoURL": user.photoURL,
                           "isAnonymous": user.isAnonymous,
                           "uid": user.uid,
                           "providerData": user.providerData,
                       }),
                       method: "POST",
                       headers: {
                           "Content-Type": "application/json",
                       },

                   });
    } else {
      console.log("No user!")
    }
  });
}

window.onload = function() {
  initApp();
};

let login = new Vue({
    el: "#login",
    data: {
        email: '',
        password: '',
        token: '',
        user_id: ''
    },

    methods: {
        login(email, password) {
            firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                console.log(error);
                // ...
            });

        },
        logout() {
            firebase.auth().signOut().then(function() {
                // Sign-out successful.
                console.log("sign out successful");
              }).catch(function(error) {
                // An error happened.
                console.log("sign out error");
              });
        }
    },
    mounted() {

    },

    template: `
        <div class="login-box-container row justify-content-center">
            <div class="login-box col-lg-5">
                <h2 class="row justify-content-center">Login</h2>
                <div class="input-group">
                  	<label>Email</label>
                  	<input type="text" name="email" class="user-input" autocomplete="off" v-model="email">
                </div>

                <div class="input-group">
                  	<label>Password</label>
                  	<input type="password" name="password" class="user-input" v-model="password">
                </div>

                <div class="input-group">
                  	<button type="submit" class="btn" name="login_user" v-on:click="login(email, password)">Login</button>
                </div>

                <div class="extra-links row justify-content-center">
                    <p>Not yet a member?
                        <a href="Registration.html">Sign up</a>
                    </p>
                </div>
                <div class="extra-links row justify-content-center">
                	<p>Forgot your password?
                        <a href="reset_password.html">Click here to reset it</a>.
                    </p>
                </div>
                <div class="input-group">
                  	<button type="submit" class="btn" name="login_user" v-on:click="logout()">Logout</button>
                </div>
            </div>
        </div>
    `
});

let signUp = new Vue({
    el: "#signUp",
    data: {
        displayName: '',
        username: '',
        email: '',
        password: '',
        super_user: 0,
        token: ''
    },

    methods: {
        signUp(email, password, displayName) {
            // add proxy url to allow calls from local system, will need to be taken out later

            firebase.auth().createUserWithEmailAndPassword(email,password).then(function(user){
              if (user)
              {

              console.log("created account successfully");
              window.location = "UserProfile.html";
                //Here if you want you can sign in the user

              }
                  else {
                  console.log("error in create account");
                  alert("Error in account creation");
                }
              });
            }



    },


    template: `
        <div class="login-box-container row justify-content-center">
            <div class="login-box col-lg-5">
                <h2 class="row justify-content-center">Create your profile</h2>

                <div class="input-group">
                    <label>Display Name</label>
                    <input type="text" name="displayName" class="user-input" autocomplete="off" v-model="displayName">
                </div>
                <div class="input-group">
                    <label>Email</label>
                    <input type="text" name="email" class="user-input" autocomplete="off" v-model="email">
                </div>

                <div class="input-group">
                    <label>Password</label>
                    <input type="password" name="password" class="user-input" v-model="password">
                </div>

                <div class="input-group">
                    <label>Confirm Password</label>
                    <input type="password" name="password" class="user-input">
                </div>

                <div class="input-group">
                    <button type="submit" class="btn" name="login_user" v-on:click="signUp(email, password, displayName)">Create Account</button>
                </div>

                <div class="extra-links row justify-content-center">
                    <p>Already a member?
                        <a href="Login.html">Sign In</a>
                    </p>
                </div>
            </div>
        </div>
    `
});
