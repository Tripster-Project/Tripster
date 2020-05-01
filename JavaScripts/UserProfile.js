(function(){



      // Firebase configuration
      var firebaseConfig = {
          apiKey: "AIzaSyByQptxJk7d9BloZov-dXvRyyXPrM5gbKs",
          authDomain: "tripster-d8fe5.firebaseapp.com",
          databaseURL: "https://tripster-d8fe5.firebaseio.com",
          projectId: "tripster-d8fe5",
          storageBucket: "tripster-d8fe5.appspot.com",
          messagingSenderId: "211617557492",
          appId: "1:211617557492:web:db96d3e71391dea702a7a1",
          measurementId: "G-DD58MBZL68"
      };
      // Initialize Firebase
      firebase.initializeApp(firebaseConfig);
      firebase.analytics();

      var database = firebase.database();
      var ref = database.ref('users');
      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            $(".hide-user").hide();
        } else {
            $(".hide-no-user").hide();
        }
      });


      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          console.log(user);

          var userId = firebase.auth().currentUser.uid;
           firebase.database().ref('/users/' + userId).once('value').then(function(snapshot) {
            var dbemail = snapshot.val().email;
            var dbpassword = snapshot.val().password;
            var dbdisplayname = snapshot.val().displayName;
            var dbaboutme = snapshot.val().aboutMe;
            var dbplaces = snapshot.val().placesGo;
            var dblocation = snapshot.val().location;

            // ...

            console.log("found the info from user: ");
            console.log(dbemail);
            console.log(dbpassword);
            console.log(dbdisplayname);
            console.log(dbaboutme);
            console.log(dbplaces);
            console.log(dblocation);

            const aboutmeText = document.getElementById("aboutmeText");
            const placesText = document.getElementById("placesText");
            const locationText = document.getElementById("locationText");
            const backgroundimage = document.getElementById('backgroundimage');
            const userName = document.getElementById('userName');

            userName.innerHTML = dbdisplayname;
            aboutmeText.innerHTML= dbaboutme;
            placesText.innerHTML = dbplaces;
            locationText.innerHTML = dblocation;


          }).then(function(){




          // Create a root reference
          var storageRef = firebase.storage().ref();

          // Points to 'images'
          var nameofProfImage = document.getElementById('userName').innerHTML;
          nameofProfImage += 'profileimage';

          console.log(nameofProfImage);
          var imagesRef = storageRef.child(nameofProfImage);
          storageRef.child(nameofProfImage).getDownloadURL().then(function(url) {
            // `url` is the download URL for 'images/stars.jpg'

              // This can be downloaded directly:
              var xhr = new XMLHttpRequest();
              xhr.responseType = 'blob';
              xhr.onload = function(event) {
                var blob = xhr.response;
              };


              // Or inserted into an <img> element:
              var img = document.getElementById('profileimage');
              img.src = url;
            }).catch(function(error) {
              // Handle any errors
              console.log(error);
            });

            var nameofBackgroundImage = document.getElementById('userName').innerHTML;
            nameofBackgroundImage += 'backgroundimage';
            storageRef.child(nameofBackgroundImage).getDownloadURL().then(function(url) {
              // `url` is the download URL for 'images/stars.jpg'

                // This can be downloaded directly:
                var xhr = new XMLHttpRequest();
                xhr.responseType = 'blob';
                xhr.onload = function(event) {
                  var blob = xhr.response;
                };


                // Or inserted into an <img> element:
                var img = document.getElementById('backgroundimage');
                img.src = url;
              }).catch(function(error) {
                // Handle any errors
                console.log(error);
              });



            // ...
            console.log("signed in successful from userprofile page");
          });
            //now get rid of login signup logout stuff
            const signupEl = document.getElementById("signinbutton");
            const createaccountEl = document.getElementById("createaccountbutton");
            signupEl.style.visibility = "hidden";
            createaccountEl.style.visibility = "hidden";

        } else {

          console.log("user is signed out on userprofiel page");
            // User is signed out.
            // ...
        }
    });


}());

function logout(){

  firebase.auth().signOut()
  .then(function() {
    alert("logged out");
    // Sign-out successful.
  })
  .catch(function(error) {
    alert("error in logout");
    // An error happened
  });
}

function onEditProfileClick(){

  window.location = "EditUserProfile.html";
}
