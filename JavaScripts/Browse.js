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


      ////////////////

      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          console.log(user);

          firebase.database().ref('/allTrips/').once('value').then(function(snapshot) {
            snapshot.forEach(function(childSnapshot) {


              var value = childSnapshot.val();
         //**if (messageData.sanitized) return true;**
            var message = childSnapshot.val().finalRouteName;

            console.log(value);
            console.log(message);
            console.log("adding info to browse page...");
            const element = document.getElementById('card1');
            element.innerHTML = message;
          });



console.log("done");
            console.log(finalRouteName);
          //  var tripName = snapshot.val().tripName;
            // ...

            console.log("found the info from the trip: ");
            console.log(finalRouteName);
            console.log(tripName);

          }).then(function(){
            console.log("profile acknowledged...")
          });

          const createaccountEl = document.getElementById('createaccountbutton');
          const signinEl = document.getElementById('signinbutton');
          const logoutEl = document.getElementById('logoutbutton');

          createaccountEl.style.visibility = "hidden";
          signinEl.style.visibility = "hidden";
          logoutEl.style.visibility = "visible";

        }
        else
        {
          console.log("no user found");
        }
      });

      console.log("loading browse page...");

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
