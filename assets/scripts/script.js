// LISTEN TO AUTH CHANGES - FIREBASE
auth.onAuthStateChanged(user => {
    if(user) {
        console.log("User logged-in:", user);
        setupUI(user);

          // REAL TIME - GET DATA FROM FIREBASE
        db.collection(user.uid).onSnapshot(snapshot => {
            let changes = snapshot.docChanges();
            changes.forEach(change => {
                if (change.type == 'added') {
                    renderTask(change.doc);
                } else if (change.type == 'removed') {
                    let li = taskCard.querySelector(`[data-id="${change.doc.id}"]`);
                    taskCard.removeChild(li);
                } else if (change.type == "modified") {
                    console.log("Modified city: ", change.doc.data());
                }
            })
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
            console.log('user is not signed in to add todos');
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

// RENDER TASK FIREBASE
const taskCard = document.querySelector("#taskCard");

function renderTask(doc) {
    let li = document.createElement("li");
    let taskName = document.createElement("span");
    let del = document.createElement("div");
    let edit = document.createElement("div");
    
    li.classList.add("centerTask")
    li.classList.add("mb-3")
    taskName.classList.add("taskStyle");
    del.classList.add("trashBtn");
    del.classList.add("ml-3");
    edit.classList.add("editBtn");
   
    li.setAttribute('data-id', doc.id);
    del.setAttribute('data-id', doc.id);
    edit.setAttribute('data-id', doc.id);

    taskName.textContent= doc.data().task;

    del.innerHTML= `<i class="fas fa-trash fa-2x"></i>`;
    edit.innerHTML= `<i class="fas fa-edit  fa-2x"></i>`;
    
    li.appendChild(taskName);
    li.appendChild(del);
    li.appendChild(edit);

    taskCard.appendChild(li);

    // DELETE DATA FROM DATABASE
    del.addEventListener("click", (e) => {
        e.stopPropagation();
    
        let id = del.getAttribute('data-id');

        auth.onAuthStateChanged(user => {
            if (user) {
                db.collection(user.uid).doc(id).delete();
                console.log("Task deleted")
            }
        })
       
    });

    const inputNewTask = document.querySelector(".inputNewTask");
    
    // UPDATE DATA - FIREBASE
    edit.addEventListener("click", (e) => {
        e.stopPropagation();
        
        let id = edit.getAttribute('data-id');
        
        console.log(id);

        $("#editTaskModal").modal("show");

        const updateTask = document.querySelector(".updateTask");

        updateTask.addEventListener("click", (e) => {
            e.preventDefault();

            let newTask = inputNewTask.value;
            console.log(newTask);

            auth.onAuthStateChanged(user => {
                if (user) {
                    db.collection(user.uid).doc(id).update({
                        task: newTask
                    });
                    console.log("Task updated")
                    $("#editTaskModal").modal("hide");
                    setTimeout(function(){ location.reload(); }, 1000);
         
                }
            })
        });  
    });
}
// -----------------------------------------------------------------------------------------------------

