function authenticate(req, res, next) {
    if (!req.session || !req.session.user) {
      req.flash('info', 'you need to login first.');
      res.redirect('/users/login');
      return;
    }

    next();
  }
  
  module.exports = authenticate;