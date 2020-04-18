var displayName;
var email;
var emailVerified;
var photoURL;
var isAnonymous;
var uid;
var providerData;

(function initApp() {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      console.log("Signed in user!")
      console.log(user);

      //this is going to run too many times bc sign out issue

    } else {
      console.log("No user!")
    }
  });
}());



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
            firebase.auth().signInWithEmailAndPassword(email, password)
            .then(function(user){
              console.log("signed in from login page");
              console.log(user);

              alert("pause");
              window.location = "UserProfile.html";

            })

            .catch(function(error) {

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
                      <input type="email" name="email" id="email" class="user-input" autocomplete="off" v-model="email" v-validate="'required|email'">

                </div>

                <div class="input-group">
                  	<label>Password</label>
                  	<input type="password" name="password" id="password" class="user-input" v-model="password">
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
		confirmPassword: '',
        super_user: 0,
        token: ''
    },

    methods: {
        signUp(email, password, displayName) {
          displayName = document.getElementById("displayName").value;
          alert(displayName);
          alert(email);
            // add proxy url to allow calls from local system, will need to be taken out later

            firebase.auth().createUserWithEmailAndPassword(email,password).then(function(user){
              if (user)
              {
              console.log("created account successfully");

              console.log("display name is " + displayName);
              //write info to db


              var userID = firebase.auth().currentUser.uid;
            //  var userId = firebase.auth().currentUser.uid;
            firebase.database().ref('users/' + userID).set({
              displayName: displayName,
              email: email,
              password: password,
              profile_picture : "something"
            }).then(function(){
              console.log(user);
              alert("pasuer");
              window.location = "UserProfile.html";
            });
          //    window.location = "UserProfile.html";
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
                    <input type="text" id="displayName" name="displayName" class="user-input" autocomplete="off" v-model="username">
                </div>
                <div class="input-group">
                    <label>Email</label>
                    <input type="text" id="email" name="email" class="user-input" autocomplete="off" v-model="email">
                </div>

                <div class="input-group">
                    <label>Password</label>
                    <input type="password" id="password" name="password" class="user-input" v-model="password">
                </div>

                <div class="input-group">
                    <label>Confirm Password</label>
                    <input type="password" id="confirmPassword" name="password" class="user-input" v-model="confirmPassword">
                </div>

                <div class="input-group">
                    <button type="submit" class="btn" name="login_user" v-on:click="signUp(email, confirmPassword, displayName)">Create Account</button>
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
