// LISTEN TO AUTH CHANGES - FIREBASE
auth.onAuthStateChanged(user => {
    if(user) {
        console.log("User logged-in");
        setupUI(user);

          // REAL TIME - GET DATA FROM FIREBASE
        db.collection("tasks").where("uid", "==", user.uid).orderBy("createdOn", "desc").onSnapshot(snapshot => {
            let changes = snapshot.docChanges();
            changes.forEach(change => {
                if (change.type == 'added') {
                   renderTask(change.doc);
                } else if (change.type == 'removed') {
                    let li = taskCard.querySelector(`[data-id="${change.doc.id}"]`);
                    taskCard.removeChild(li);
                    iziToast.error({
                        title: "Deleted",
                        iconUrl: 'assets/img/trash-solid.svg',
                        message: 'You task has been deleted.',
                        position: "topCenter",
                        timeout: 3000,
                    });
                } else if (change.type == "modified") {
                    // let li = taskCard.querySelector(`[data-id="${change.doc.id}"]`);
                    // li.firstChild.textContent = change.doc.data().task;
                    iziToast.info({
                        title: "Updated",
                        iconUrl: 'assets/img/edit-regular.svg',
                        message: 'You task has been updated.',
                        position: "topCenter",
                        timeout: 2000,
                    });
                    setTimeout(function(){ 
                        window.location.reload();
                    }, 2000);
                    
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

// LOAD TASK FIREBASE
const taskCard = document.querySelector("#taskCard");

function renderTask(doc) {
    let li = document.createElement("li");
    let taskTitle = document.createElement("span");
    let taskDescription = document.createElement("span");
    let del = document.createElement("div");
    let edit = document.createElement("div");
    let br = document.createElement("div");
    let divider = document.createElement("div");
    

    // li.classList.add("list-group-item")
    li.classList.add("card-body")
    li.classList.add("pt-4")
    li.classList.add("pb-4")
    li.classList.add("taskCard")

    taskTitle.classList.add("taskTitleStyle");
    taskDescription.classList.add("taskDescriptionStyle");

    del.classList.add("trashBtn");
    del.classList.add("ml-3");
    edit.classList.add("editBtn");
    edit.classList.add("ml-3")
   
    li.setAttribute('data-id', doc.id);
    del.setAttribute('data-id', doc.id);
    edit.setAttribute('data-id', doc.id);
    
    taskTitle.textContent= doc.data().title;
    taskDescription.textContent= doc.data().description;

    edit.innerHTML= `<i class="fas fa-pen fa-2x"></i>`;
    divider.innerHTML= `<hr class="task">`;
    
    br.innerHTML= `<br>`;
    
    li.appendChild(taskTitle);
    li.appendChild(del);
    li.appendChild(edit);
    li.appendChild(divider);
    li.appendChild(taskDescription);
    

    // taskCard.insertBefore(li, taskCard.childNodes[0]);
    taskCard.appendChild(li);
    taskCard.appendChild(br);

// -----------------------------------------------------------------------------------------------------



// -----------------------------------------------------------------------------------------------------

    // DELETE DATA FROM DATABASE
    del.addEventListener("click", (e) => {
        e.stopPropagation();
    
        let id = del.getAttribute('data-id');

        auth.onAuthStateChanged(user => {
            if (user) {
                db.collection(user.uid).doc(id).delete();
                console.log("Task Deleted")

                // iziToast.error({
                //     title: "Deleted",
                //     message: 'You task has been deleted.',
                //     position: "topCenter",
                //     timeout: 3000,
                // });
            }
        })
       
    });

// -----------------------------------------------------------------------------------------------------

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
// ADDING TASK FIREBASE
let addTaskBtn = document.querySelector('#addTaskBtn');
let inputTitle = document.querySelector('#inputTitle');
let inputDescription = document.querySelector('#inputDescription');

let date = new Date();
let time = date.getTime();
let counter = time;

addTaskBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const title = inputTitle.value;
    const description = inputDescription.value;
    let author;

    console.log(title);
    console.log(description);
    
    let id = counter += 1;
    // addTaskForm.reset();
    auth.onAuthStateChanged(async user => {
        if (user) {
            await db.collection('users').doc(user.uid).get().then(doc => {
                author = doc.data().name;
                console.log(author);
            })
            await db.collection("tasks").add({
                "uid": user.uid,
                "author": author,
                "title": title,
                "description": description,
                "createdOn": firebase.firestore.Timestamp.now(),
                "created": firebase.firestore.Timestamp.now(),
              }).then(() => {
                console.log('Task Added');
                window.location.href ="home.html";
                
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