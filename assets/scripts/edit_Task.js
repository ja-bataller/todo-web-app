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

function renderEdit() {
    let receivedTaskTitle = sessionStorage.getItem("taskTitle");
    let receivedTaskDescription = sessionStorage.getItem("taskDescription");
    document.querySelector("#editTitle").defaultValue = receivedTaskTitle;
    document.querySelector("#editDescription").defaultValue = receivedTaskDescription;
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
    
            auth.onAuthStateChanged(user => {
                if (user) {
                    db.collection("tasks").doc(receivedTaskId).delete();
                    console.log("Task Deleted")
        
                    // iziToast.error({
                    //     title: "Deleted",
                    //     iconUrl: 'assets/img/trash-solid.svg',
                    //     message: 'You task has been deleted.',
                    //     position: "topCenter",
                    //     timeout: 3000,
                    // });

                    // setTimeout(function(){
                    //     window.location.href ="home.html";
                    // }, 2000);
                    
                }
            })
        })
    }); 
}