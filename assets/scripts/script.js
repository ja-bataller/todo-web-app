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
                        timeout: 2000,
                    });
                } else if (change.type == "modified") {
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
    let taskDateTime = document.createElement("span");
    let edit = document.createElement("div");
    let br = document.createElement("div");
    let divider = document.createElement("div");

    let date = doc.data().createdOn.toDate().toLocaleString()
    
    // li.classList.add("list-group-item")
    li.classList.add("pt-4")
    li.classList.add("pb-4")
    li.classList.add("pl-4")
    li.classList.add("pr-4")
    
    li.classList.add("taskCard")

    taskTitle.classList.add("taskTitleStyle");
    taskDescription.classList.add("taskDescriptionStyle");
    taskDateTime.classList.add("taskDateTimeStyle");

    edit.classList.add("editBtn");

    li.setAttribute('data-id', doc.id);
    edit.setAttribute('data-id', doc.id);
    
    taskTitle.textContent= doc.data().title;
    taskDescription.textContent= doc.data().description;
    taskDateTime.textContent= date;

    edit.innerHTML= `<i class="fas fa-pen fa-2x"></i>`;
    divider.innerHTML= `<hr class="task">`;
    
    br.innerHTML= `<br>`;
    
    li.appendChild(taskTitle);
    li.appendChild(edit);
    li.appendChild(divider);
    li.appendChild(taskDateTime);
    li.appendChild(taskDescription);
    

    // taskCard.insertBefore(li, taskCard.childNodes[0]);
    taskCard.appendChild(li);
    taskCard.appendChild(br);

// -----------------------------------------------------------------------------------------------------
// GO TO EDIT TASK PAGE
    let taskId = edit.getAttribute('data-id');
    let getTitle = taskTitle.innerText;
    let getDescription = taskDescription.innerText;

    
    edit.addEventListener("click", (e) => {
        e.stopPropagation();

        console.log("go to update page");
        console.log(taskId);
        sessionStorage.setItem("taskId", taskId);
        sessionStorage.setItem("taskTitle", getTitle);
        sessionStorage.setItem("taskDescription", getDescription);
        window.location.href ="edit_task.html";
        
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

if (addTaskBtn) {
    addTaskBtn.addEventListener('click', (e) => {
        e.preventDefault();

        const title = inputTitle.value;
        const description = inputDescription.value;
        let author;
    
        console.log(title);
        console.log(description);
        
        if (title == "" || description == "") {
            iziToast.error({
                title: "Error",
                message: 'Please fill up all fields.',
                position: "topCenter",
                timeout: 3000,
            });
            return;
        } else {
            auth.onAuthStateChanged(async user => {
                if (user) {
                    document.getElementById("addTaskBtn").style.display = "none";
                    document.getElementById("addTaskBtnSpinner").style.display = "block";
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
        }
    
    })
}

// -----------------------------------------------------------------------------------------------------
