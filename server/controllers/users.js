const users = require('../models').users;

module.exports = {
  create(req, res)
  {
    return users
      .create({
        firstname: 'John',
        lastname: 'Whatever',
        email: 'Whatever',
        password: 'Whatever',
      })
      .then(users => res.status(201).send(users))
      .catch(error => res.status(400).send(error));
  },

  list(req,res)
  {
    return users
    .findAll()
    .then(users=> res.status(200).send(users))
    .catch(error => res.status(400).send(error))
  },

  retrieve(req, res)
  {
  return users
    .findOne({where:{email: req.params.userEmail}})
    .then(users =>
    {
      console.log(req.params.userEmail);
      if (!users)
      {
        return res.status(404).send({message: 'user Not Found',});
      }
      return res.status(200).send(users);
    })
    .catch(error => res.status(400).send(error));
  },

  update(req, res) {
  return users
    .findOne({where:{id: req.params.userEmail}})
    .then(users =>
    {
      if (!users)
      {
        return res.status(404).send({
          message: 'user Not Found',
        });
      }
      return users
        .update({
          firstname: req.body.firstName || users.firstname,
          lastname: req.body.lastName || users.lastname,
          email: req.body.userName || users.username,
        })
        .then(() => res.status(200).send(users))  // Send back the updated todo.
        .catch((error) => res.status(400).send(error));
    })
    .catch((error) => res.status(400).send(error));
  },

  destroy(req, res) {
  return users
    .findOne({where:{id: req.params.userEmail}})
    .then(users => {
      if (!users) {
        return res.status(400).send({
          message: 'user Not Found',
        });
      }
      return users
        .destroy()
        .then(() => res.status(204).send({message: 'user successfully deleted.'}))
        .catch(error => res.status(400).send(error));
    })
    .catch(error => res.status(400).send(error));
},
};