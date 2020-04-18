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
          console.log(user);

          var userId = firebase.auth().currentUser.uid;
          return firebase.database().ref('/users/' + userId).once('value').then(function(snapshot) {
            var dbemail = snapshot.val().email;
            var dbpassword = snapshot.val().password;
            var dbdisplayname = snapshot.val().displayName;
            // ...

            console.log("found the info from user: ");
            console.log(dbemail);
            console.log(dbpassword);
            console.log(dbdisplayname);



          });




            // ...
            console.log("signed in successful from userprofile page");
        } else {

          console.log("user is signed out on userprofiel page");
            // User is signed out.
            // ...
        }
    });

  var user = firebase.auth().currentUser;


if (user) {
  // User is signed in.
  alert("user is in there");
} else {
  // No user is signed in.
  alert("not in there but ur function called");
}

}());
