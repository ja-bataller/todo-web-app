// LISTEN TO AUTH CHANGES - FIREBASE
auth.onAuthStateChanged(user => {
    if(user) {
        console.log("User logged-in:", user);
        setupUI(user);

          // GET DATA - FIREBASE
          db.collection(user.uid).onSnapshot(snapshot => {
            console.log(snapshot.docs);
            setupTask(snapshot.docs);
            setupUI(user);
        }, err => {
            console.log(err.message);
        })

    } else {
        console.log("User logged-out", user);

        setupUI();
        setupGuides([]);
    }
})
// -----------------------------------------------------------------------------------------------------

// LOG-IN- FIREBASE 
const loginForm = document.querySelector("#login-form");

if (loginForm) {

    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();

        // GET SIGN-IN DATA
        const email = loginForm.loginEmail.value;
        const password = loginForm.loginPassword.value;

        console.log(email);
        console.log(password);

        // LOG-IN USER - FIREBASE
        auth.signInWithEmailAndPassword(email, password).then(cred => {
            console.log("Signed-in")
            console.log(cred);
            loginForm.reset()
            // window.location.replace( "main.html" )
            location = "main.html";
            return
        })
    })
}

// -----------------------------------------------------------------------------------------------------

// SIGN-UP - FIREBASE 
const signupForm = document.querySelector("#signup-form");

if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
        e.preventDefault();

        // GET SIGN-UP DATA
        const email = signupForm.signupEmail.value;
        const password = signupForm.signupPassword.value;
        const confirmPassword = signupForm.signupConfirmPassword.value;


        if (password == confirmPassword) {
            // SIGN-UP USER - FIREBASE
            auth.createUserWithEmailAndPassword(email, password).then(cred => {
                return db.collection('users').doc(cred.user.uid).set({
                    name: signupForm.signupName.value
                }).then(() => {
                    console.log(cred);
                    signupForm.reset();
                    location = "main.html"
                })   
                
            })
        } else {
            console.log("SIGN UP UN-SUCCESSFUL")

            // IZITOAST ERROR POP-UP
            iziToast.error({
                title: "Password doesn't match.",
                position: "topCenter",
                timeout: 3000,
            });
            
            // CLEAR PASSWORD & CONFIRM PASSWORD INPUT FIELD
            document.querySelector("#signupPassword").value = "";
            document.querySelector("#signupConfirmPassword").value = "";
        }
    
    })
}
// -----------------------------------------------------------------------------------------------------

// SIGN-OUT FIREBASE 
const logout = document.querySelector("#logout");

if (logout) {
    logout.addEventListener("click", (e) => {
        e.preventDefault();

        // SIGN-OUT USER - FIREBASE
        auth.signOut().then(() => {
            location = "index.html"
        });
    })
}

// -----------------------------------------------------------------------------------------------------

// ADDING TASK FIREBASE
const addTaskForm = document.querySelector('#addTaskForm');

let date = new Date();
let time = date.getTime();
let counter = time;

addTaskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const task = addTaskForm.task.value;
    // console.log(todos);
    let id = counter += 1;
    addTaskForm.reset();
    auth.onAuthStateChanged(user => {
        if (user) {
            db.collection(user.uid).doc('_' + id).set({
                id: '_' + id,
                task
            }).then(() => {
                console.log('Task Added');
            }).catch(err => {
                console.log(err.message);
            })
        }
        else {
            // console.log('user is not signed in to add todos');
        }
    })
})

// -----------------------------------------------------------------------------------------------------

// DISPLAY CURRENT USER'S NAME
const accountDetails = document.querySelector("#userInfo");

const setupUI = (user) => {
  if (user) {
    db.collection('users').doc(user.uid).get().then(doc => {
      const html = `
      <div> ${doc.data().name} </div>
     `;
     accountDetails.innerHTML = html;
    })
  } else {
    accountDetails.innerHTML = '';
  }
}

// -----------------------------------------------------------------------------------------------------

// SETUP TASK
const taskCard = document.querySelector("#taskCard");
const setupTask = (data) => {

  if (data.length) {
      let html = '';

      data.forEach(doc => {
        let task = doc.data();
        let li = 
        `
          <div class="centerTask mb-3">
                <h5>${task.task}<a class="trashBtn deleteBtn" type="button" data-id="${task.id}"><i class="fas fa-trash fa-1x "></i></a> <a class="editBtn pr-3" type="button" data-toggle="modal" data-target="#exampleModalCenter"><i class="fas fa-edit"></i></a></h5> 
          </div>
        `;

          html += li
          taskCard.innerHTML= html;

      })
      
        // DELETE TASK FIREBASE

        const deleteTask = document.querySelector('.deleteBtn');

        if (deleteTask) {
            deleteTask.addEventListener('click', () => {
                console.log("pass")
                let id = deleteTask.getAttribute('data-id');
                auth.onAuthStateChanged(user => {
                    if (user) {
                        db.collection(user.uid).doc(id).delete();
                    }
                })
            })
        }

    } else {
        taskCard.innerHTML = '<h5 class="centerTask">No task  listed </h5>'
    }

  
}

// -----------------------------------------------------------------------------------------------------

