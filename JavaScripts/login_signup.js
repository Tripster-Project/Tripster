var displayName;
var email;
var emailVerified;
var photoURL;
var isAnonymous;
var uid;
var providerData;

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
            firebase.auth().onAuthStateChanged(function(user) {
                if (user) {
                    displayName = user.displayName;
                    email = user.email;
                    emailVerified = user.emailVerified;
                    photoURL = user.photoURL;
                    isAnonymous = user.isAnonymous;
                    uid = user.uid;
                    providerData = user.providerData;
                    // ...
                    console.log("signed in successfully");
                } else {
                    // User is signed out.
                    // ...
                }
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
        first_name: '',
        last_name: '',
        username: '',
        email: '',
        password: '',
        super_user: 0,
        token: ''
    },

    methods: {
        signUp(email, password) {
            // add proxy url to allow calls from local system, will need to be taken out later
            firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                console.log(error);
                // ...
              });
        }
    },


    template: `
        <div class="login-box-container row justify-content-center">
            <div class="login-box col-lg-5">
                <h2 class="row justify-content-center">Create your profile</h2>

                <div class="input-group">
                    <label>Username</label>
                    <input type="text" name="username" class="user-input" autocomplete="off" v-model="username">
                </div>
                <div class="input-group">
                    <label>Email</label>
                    <input type="text" name="username" class="user-input" autocomplete="off" v-model="email">
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
                    <button type="submit" class="btn" name="login_user" v-on:click="signUp(email, password)">Create Account</button>
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