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
      ////////////////

      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          console.log(user);




        }
        else
        {
          console.log("no user found");
        }
      });

      console.log("loading browse page...");
      var count = 1;
      var userinfo = [];
                firebase.database().ref('/allTrips/').once('value').then(function(snapshot) {
                  snapshot.forEach(function(childSnapshot) {


                    var value = childSnapshot.val();
                  //**if (messageData.sanitized) return true;**
                  var message = childSnapshot.val().finalRouteName;
                  userinfo.push(childSnapshot.val().userID);



                  var cardname = "card";
                          cardname += count;
                          console.log(cardname);
                          count++;

                  console.log(value);
                  console.log(message);
                  console.log("adding info to browse page...");
                  const element = document.getElementById(cardname);
                  element.innerHTML = message;
                });



      console.log("done");
                //  var tripName = snapshot.val().tripName;
                  // ...

                  console.log("found the info from the trip: ");

                }).then(function(){
                  console.log("profile acknowledged...")
                  console.log(userinfo);
                  var usercount = 1;
                  for (let i in userinfo)
                  {
                    firebase.database().ref('/users/' + userinfo[i]).once('value').then(function(usersnapshot){

                      var usernametodisplay = usersnapshot.val().displayName;
                      console.log(usernametodisplay);
                      console.log(usersnapshot);
                      var usercardname = "usercard";
                          usercardname +=usercount;
                          console.log(usercardname);
                          const cardelement = document.getElementById(usercardname);
                          cardelement.innerHTML = usernametodisplay;
                          usercount++;

                    });
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
