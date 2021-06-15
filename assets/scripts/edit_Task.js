// LISTEN TO AUTH CHANGES - FIREBASE
auth.onAuthStateChanged(user => {
    if(user) {
        console.log("User logged-in");

          // REAL TIME - GET DATA FROM FIREBASE
        db.collection("tasks").where("uid", "==", user.uid).orderBy("createdOn", "desc").onSnapshot(snapshot => {
            let changes = snapshot.docChanges();
            changes.forEach(change => {
                if (change.type == 'removed') {
                    iziToast.error({
                        title: "Deleted",
                        iconUrl: 'assets/img/trash-solid.svg',
                        message: 'You task has been deleted.',
                        position: "topCenter",
                        timeout: 2000,
                    });

                    $("#deleteModal").modal("hide");

                    setTimeout(function(){
                        window.location.href ="home.html";
                    }, 2000);
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
                        window.location.href ="home.html";
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

function renderEdit() {
    let receivedTaskTitle = sessionStorage.getItem("taskTitle");
    let receivedTaskDescription = sessionStorage.getItem("taskDescription");
    document.querySelector("#editTitle").defaultValue = receivedTaskTitle;
    document.querySelector("#editDescription").defaultValue = receivedTaskDescription;
}
// -----------------------------------------------------------------------------------------------------

let editTaskBtn = document.querySelector('#editTaskBtn');
let editTitle = document.querySelector('#editTitle');
let editDescription = document.querySelector('#editDescription');

if (editTaskBtn) {
    editTaskBtn.addEventListener('click', (e) => {
        e.preventDefault();
    
        const title = editTitle.value;
        const description = editDescription.value;
    
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
                document.getElementById("editTaskBtn").style.display = "none";
                document.getElementById("editTaskBtnSpinner").style.display = "block";
                if (user) {
                    let receivedTaskId = sessionStorage.getItem("taskId");
                    await db.collection("tasks").doc(receivedTaskId).update({
                        "title": title,
                        "description": description,
                      }).then(() => {
                        console.log('Task Update');
                        
                    }).catch(err => {
                        console.log(err.message);
                        iziToast.error({
                            title: "Error",
                            message: err.message,
                            position: "topCenter",
                            timeout: 3000,
                        });
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
                return;
            })
        }
    
    })
}


// -----------------------------------------------------------------------------------------------------

const deleteIcon = document.querySelector("#deleteIcon");
// DELETE DATA FROM DATABASE
if (deleteIcon) {
    deleteIcon.addEventListener("click", (e) => {
        e.preventDefault();

        console.log("pass");
        $("#deleteModal").modal("show");

        const deleteBtn = document.querySelector(".deleteBtn");

        deleteBtn.addEventListener("click", (e) => {
            let receivedTaskId = sessionStorage.getItem("taskId");
            document.querySelector('#editTaskBtn').disabled = true;
    
            auth.onAuthStateChanged(user => {
                if (user) {
                    db.collection("tasks").doc(receivedTaskId).delete();
                    $("#logoutModal").modal("hide");
                    console.log("Task Deleted")        
                }
            })
        })
    }); 
}