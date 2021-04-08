// LISTEN TO AUTH CHANGES - FIREBASE
auth.onAuthStateChanged(user => {
    if(user) {
        console.log("User logged-in");
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
                    let li = taskCard.querySelector(`[data-id="${change.doc.id}"]`);
                    li.firstChild.textContent = change.doc.data().task;
                }
            })
        })

    } else {
        console.log("User logged-out", user);
        setupUI();
        renderTask([]);
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

        // LOG-IN USER - FIREBASE
        auth.signInWithEmailAndPassword(email, password).then(cred => {
            console.log("Signed-in")
            loginForm.reset()
            // window.location.replace( "main.html" )
            location = "main.html";
            return
        }).catch( e => {
            iziToast.error({
                title: "Unauthorzed Access",
                message: 'This user is not registered.',
                position: "topCenter",
                timeout: 3000,
            });
            loginForm.reset();
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
                
            }).catch(e => {

                // IZITOAST ERROR POP-UP
                iziToast.error({
                    title: e.message,
                    position: "topCenter",
                    timeout: 3000,
                });
                signupForm.reset();
            })
        } else {
            console.log("Password doesn't match.")

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
        
        $("#logoutModal").modal("show");

        const logOutBtn = document.querySelector(".logOutBtn");

        logOutBtn.addEventListener("click", (e) => {
            // SIGN-OUT USER - FIREBASE
            auth.signOut().then(() => {
                location = "index.html"
            });
            $("#logoutModal").modal("hide");
        })
        
    })
}

// -----------------------------------------------------------------------------------------------------

// ADDING TASK FIREBASE
const addTaskForm = document.querySelector('#addTaskForm');

let date = new Date();
let time = date.getTime();
let counter = time;

if (addTaskForm) {
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
                iziToast.error({
                    title: "Unauthorzed Access",
                    message: 'Please log-in to add tasks.',
                    position: "topCenter",
                    timeout: 3000,
                });
            }
        })
    })
}

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
    

    li.classList.add("list-group-item")
    li.classList.add("mt-4")
    li.classList.add("mb-2")
    taskName.classList.add("taskStyle");
    del.classList.add("trashBtn");
    del.classList.add("ml-3");
    edit.classList.add("editBtn");
    edit.classList.add("ml-3")
   
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
                console.log("Task Deleted")
            }
        })
       
    });

    // UPDATE DATA - FIREBASE
    edit.addEventListener("click", (e) => {
        e.stopPropagation();
        
        $("#editTaskModal").modal("show");

        const closeEditTask = document.querySelector(".closeEditTask");

        closeEditTask.addEventListener("click", (e) => {
            e.preventDefault();
            location.reload()
        })

        

        const updateTask = document.querySelector(".updateTask");

        updateTask.addEventListener("click", (e) => {
            e.preventDefault();

            let inputNewTask = document.querySelector(".inputNewTask");
            let newTask = inputNewTask.value;

            if (newTask != "") {
                let id = edit.getAttribute('data-id');

                auth.onAuthStateChanged(user => {
                    if (user) {
                        db.collection(user.uid).doc(id).update({
                            task: newTask
                        });
                        console.log("Task Updated")
    
                        document.querySelector(".inputNewTask").value = "";
                        $("#editTaskModal").modal("hide");
                        return
                    }
                })
            } else {
                iziToast.error({
                    title: "Please input a task.",
                    position: "topCenter",
                    timeout: 3000,
                });
            }
        });  
    });
}
// -----------------------------------------------------------------------------------------------------