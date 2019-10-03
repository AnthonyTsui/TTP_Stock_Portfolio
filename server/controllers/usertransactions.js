const usertransactions = require('../models').usertransactions;

module.exports = {
  create(req, res)
  {
    return usertransactions
      .create({
        email: req.body.useremail,
        symbol: req.body.stocksymbol,
        amount: req.body.stockamount,
        price: req.body.stockprice,
      })
      .then(usertransactions => res.status(201).send(usertransactions))
      .catch(error => res.status(400).send(error));
  },

  list(req,res)
  {
    return usertransactions
    .findAll()
    .then(usertransactions=>{
      //let data = ['test','bigtest']
      //res.status(200).send(data)
      res.status(200).send(usertransactions)
    })
    .catch(error => res.status(400).send(error))
  },

  retrieve(req, res)
  {
  return usertransactions
    .findAll({where:{email: req.body.useremail}})
    .then(usertransactions =>
    {
      //console.log("Received email is " + req.body.useremail);
      //console.log("Stored email is " + usertransactions.email);
      //console.log("Store symbol is " + usertransactions.symbol);

      if (!usertransactions)
      {
        return res.status(404).send({message: 'user Not Found',});
      }

      var alltransactions = []
      usertransactions.forEach(function(res) {
        //var parsed = JSON.parse(res);
        alltransactions.push([res["email"],res["symbol"],res["amount"],res["price"]])
      })
      return res.status(200).send(alltransactions);



      return res.status(200).send(usertransactions);
    })
    .catch(error => res.status(400).send(error));
  },

  update(req, res) {
  return usertransactions
    .findOne({where:{email: req.body.useremail}})
    .then(usertransactions =>
    {
      console.log("Received email is " + req.body.useremail);
      console.log("Stored email is " + usertransactions.email);
      console.log("Balance is " + usertransactions.balance);

      if (!usertransactions)
      {
        return res.status(404).send({
          message: 'user Not Found',
        });
      }
      return usertransactions
        .update({
          balance: parseFloat(usertransactions.balance) - parseFloat(req.body.totalprice)
          //balance: 1000.00
          
        })
        .then(() => res.status(200).send(usertransactions))  // Send back the updated todo.
        .catch((error) => res.status(400).send(error));
    })
    .catch((error) => res.status(400).send(error));
  },

  destroy(req, res) {
  return usertransactions
    .findOne({where:{id: req.params.userEmail}})
    .then(usertransactions => {
      if (!usertransactions) {
        return res.status(400).send({
          message: 'user Not Found',
        });
      }
      return usertransactions
        .destroy()
        .then(() => res.status(204).send({message: 'user successfully deleted.'}))
        .catch(error => res.status(400).send(error));
    })
    .catch(error => res.status(400).send(error));
},
};