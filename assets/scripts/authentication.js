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
            document.getElementById("logInBtn").style.display = "none";
            document.getElementById("logInBtnSpinner").style.display = "block";
            console.log("Signed-in")
            // loginForm.reset()
            // window.location.replace( "main.html" )
            location = "home.html";
            return
        }).catch( e => {
            iziToast.error({
                title: "Error",
                message: e.message,
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
                document.getElementById("signUpBtn").style.display = "none";
                document.getElementById("signUpBtnSpinner").style.display = "block";
                return db.collection('users').doc(cred.user.uid).set({
                    name: signupForm.signupName.value,
                    uid: cred.user.uid
                }).then(() => {
                    // console.log(cred);
                    // signupForm.reset();
                    location = "home.html"
                })   
                
            }).catch(e => {

                // IZITOAST ERROR POP-UP
                iziToast.error({
                    title: e.message,
                    position: "topCenter",
                    timeout: 3000,
                });
                signupForm.reset();
                return
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
            sessionStorage.clear();
            // SIGN-OUT USER - FIREBASE
            auth.signOut().then(() => {
                location = "index.html"
            });
            $("#logoutModal").modal("hide");
        })
        
    })
}

// -----------------------------------------------------------------------------------------------------