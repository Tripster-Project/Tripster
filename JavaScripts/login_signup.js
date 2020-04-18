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
			var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

        
            if (!this.email) {
               alert('Email is required');
              document.getElementById("email").className = "user-input-error";
              document.getElementById("email").placeholder = "Email is required";
              return;
            } else if(!this.email.match(mailformat)) {
                alert('Email is invalid');
                document.getElementById("email").className = "user-input-error";
                document.getElementById("email").placeholder = "Please enter valid email"; 
                document.getElementById("email").value = "";  
                
            } else {
                document.getElementById("email").className = "user-input";

            }
            
        if(!this.password){
                alert("Password is required");
                document.getElementById("password").className = "user-input-error";
                document.getElementById("password").placeholder = "Password is required";

                return;
            } else if(this.password.length < 6) {
                alert("Password is should be more than 6 characters");
                document.getElementById("password").className = "user-input-error";
                document.getElementById("password").placeholder = "Password is invalid";
                return;
            }else {
                document.getElementById("email").className = "user-input";
                document.getElementById("password").className = "user-input";
            }

			
			
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
		  
		  var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

            if(!this.displayName) {
                document.getElementById("displayName").className = "user-input-error";
                document.getElementById("displayName").placeholder = "Enter the displayName";
            } else {
                document.getElementById("displayName").className = "user-input";
            }

            if (!this.email) {
               document.getElementById("email").className = "user-input-error";
               document.getElementById("email").placeholder = "Email is required";
             } else if(!this.email.match(mailformat)) {
                 document.getElementById("email").className = "user-input-error";
                 document.getElementById("email").placeholder = "Please enter valid email"; 
                 document.getElementById("email").value = "";  
             } else {
                 document.getElementById("email").className = "user-input";
             }
             
         if(!this.password){
                 document.getElementById("password").className = "user-input-error";
                 document.getElementById("password").placeholder = "Password is required";
             } else if(this.password.length < 6) {
                 alert("Password is should be more than 6 characters");
                 document.getElementById("password").className = "user-input-error";
                 document.getElementById("password").placeholder = "Password is invalid";
                 return;
             }else {
                 document.getElementById("password").className = "user-input";
                 document.getElementById("password").className = "user-input";
             }

        if (!this.confirmPassword) {
            document.getElementById("confirmPassword").className = "user-input-error";
            document.getElementById("confirmPassword").placeholder = "Please confirm your password";
            return;
        } else  if (this.confirmPassword !== this.password){
            alert("Password doesn't match with confirm password");
            document.getElementById("confirmPassword").className = "user-input-error";
            document.getElementById("confirmPassword").placeholder = "Password doesn't Match";
            return;
        } else {
            document.getElementById("confirmPassword").className = "user-input";
            document.getElementById("password").className = "user-input";
            
        }
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
                    <input type="text" id="displayName" name="displayName" class="user-input" autocomplete="off" v-model="displayName">
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
