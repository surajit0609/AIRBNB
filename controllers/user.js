
const User=require("../models/user")

module.exports.RenderSignUpForm=(req, res) => {
  res.render("users/signUp", { error: null });
}

module.exports.SignUp=async (req, res) => {
     try {
    const { username, email, password } = req.body;
    const newUser = new User({ email, username });
   
      const registeredUser = await User.register(newUser, password);
      req.login(registeredUser,(err)=>{
        if(err){
          return next(err)
        }
        req.flash("success", "Welcome to Wanderlust!");
      res.redirect("/listings");
      })
    
    } catch (err) {
      // Re-render signup with error message
      res.render("users/signUp", { error: err.message });
    }
  }

module.exports.RenderLoginForm=(req, res) => {
  res.render("users/login", { error: null });
}

module.exports.Login=(req, res) => {
    req.flash('success', 'Welcome to Wanderlust!');
   let redirecturl=res.locals.redirectUrl || "/listings"
    res.redirect(redirecturl ); // corrected path
  }

  module.exports.LogOut=(req, res, next) => {
    req.logout((err) => {
        if (err) {
          return  next(err);
        }
        req.flash("success", "you are logged out!");
        res.redirect("/listings");
    })
}