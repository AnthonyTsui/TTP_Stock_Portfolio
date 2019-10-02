const userstocks = require('../models').userstocks;

const bodyParser = require('body-parser');


module.exports = {
  create(req, res)
  {
    return userstocks
      .create({
        email: req.body.useremail,
        symbol: req.body.stocksymbol,
        amount: req.body.stockamount,
      })
      .then(userstocks => res.status(201).send(userstocks))
      .catch(error => res.status(400).send(error));
  },

  list(req,res)
  {
    return userstocks
    .findAll()
    .then(userstocks=>{
      //let data = ['test','bigtest']
      //res.status(200).send(data)
      res.status(200).send(userstocks)
    })
    .catch(error => res.status(400).send(error))
  },

  retrieve(req, res)
  {
  return userstocks
    .findAll({where:{
              email: req.body.useremail,
            }})
    .then(userstocks =>
    {
      if (!userstocks)
      {
        return res.status(404).send({message: 'user Not Found',});
      }

      var allstocks = []
      userstocks.forEach(function(res) {
        //var parsed = JSON.parse(res);
        allstocks.push([res["email"],res["symbol"],res["amount"]])
      })
      return res.status(200).send(allstocks);
    })
    .catch(error => res.status(400).send(error));
  },

  retrieveSpecific(req, res)
  {
  return userstocks
    .findAll({where:{email: req.body.useremail,
                  symbol: req.body.stocksymbol,
                }})
    .then(userstocks =>
    {
      if (!userstocks)
      {
        return res.status(404).send(undefined);
      }

      var allstocks = []
      userstocks.forEach(function(res){
        allstocks.push([res["email"],res["symbol"],res["amount"]])
      })
      return res.status(200).send(userstocks);
    })
    .catch(error => res.status(400).send(error));
  },

  update(req, res) {
  return userstocks
    .findOne({where:{email: req.body.useremail,
                     symbol: req.body.stocksymbol,
                    }})
    .then(userstocks =>
    {
      if (!userstocks)
      {
        return res.status(404).send({
          message: 'user Not Found',
        });
      }
      return userstocks
        .update({
          amount: parseInt(userstocks.amount, 10) + parseInt(req.body.stockamount,10)
        })
        .then(() => res.status(200).send(userstocks))  // Send back the updated todo.
        .catch((error) => res.status(400).send(error));
    })
    .catch((error) => res.status(400).send(error));
  },

  destroy(req, res) {
  return userstocks
    .findOne({where:{id: req.params.userEmail}})
    .then(userstocks => {
      if (!userstocks) {
        return res.status(400).send({
          message: 'user Not Found',
        });
      }
      return userstocks
        .destroy()
        .then(() => res.status(204).send({message: 'user successfully deleted.'}))
        .catch(error => res.status(400).send(error));
    })
    .catch(error => res.status(400).send(error));
},
};