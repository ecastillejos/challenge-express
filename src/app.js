var express = require("express");
var server = express();
var bodyParser = require("body-parser");

var model = {
  clients: {},
  reset: function () {
    this.clients = {};
  },
  addAppointment: function (client, date) {
    //    let clientDate = {date};
    if (!this.clients[client]) {
      this.clients[client] = [];
    }
    this.clients[client].push({ ...date, status: "pending" });
    return { ...date, status: "pending" };
  },
  attend: function (name, date) {
    const index = this.clients[name].find((e) => e.date === date);
    index.status = "attended";
    return index;
  },
  expire: function (name, date) {
    const index = this.clients[name].find((e) => e.date === date);
    index.status = "expired";
    return index;
  },
  cancel: function (name, date) {
    const index = this.clients[name].find((e) => e.date === date);
    index.status = "cancelled";
    return index;
  },
  erase: function (name, dateOrStatus) {
    var newArray = [];
    this.clients[name] = this.clients[name].filter((e) => {
      if (dateOrStatus === e.date || dateOrStatus === e.status) {
        newArray.push(e);
      }
      return e.date !== dateOrStatus && e.status !== dateOrStatus;
    });
    return newArray;
  },
  getAppointments: function (client, status) {
    if (status) {
      return this.clients[client].filter((e) => e.status === status);
    } else {
      return this.clients[client];
    }
  },
  getClients: function () {
    return Object.keys(this.clients);
    // retorna un array con los nombres de las props en el objeto, en este caso, de los clientes
  },
};

server.use(bodyParser.json());

server.get("/api", function (req, res) {
  res.json(model.clients);
});

server.get("/api/Appointments/clients", (req, res) => {
  res.status(200).send(model.getClients());
});

server.post("/api/Appointments", function (req, res) {
  const client = req.body.client;
  const appointment = req.body.appointment;
  if (!client) {
    return res.status(400).send("the body must have a client property");
  }
  if (typeof client !== "string") {
    return res.status(400).send("client must be a string");
  }

  return res.json(model.addAppointment(client, appointment));
});

server.get("/api/Appointments/:name", function (req, res) {
  const name = req.params.name;
  const date = req.query.date;
  const option = req.query.option;
  // console.log(date);

  if (!model.clients[name]) {
    return res.status(400).send("the client does not exist");
  }

  const searchDate = model.clients[name].find((e) => e.date === date);

  if (!searchDate) {
    return res
      .status(400)
      .send("the client does not have a appointment for that date");
  }

  if (option !== "attend" && option !== "expire" && option !== "cancel") {
    return res.status(400).send("the option must be attend, expire or cancel");
  }

  res.status(200).send(model[option](name, date));

  //  res.send("hola");
});

server.get("/api/Appointments/:name/erase", (req, res) => {
  const name = req.params.name;
  const dateOrStatus = req.query.date;
  if (!model.clients[name]) {
    return res.status(400).send("the client does not exist");
  }

  res.status(200).send(model.erase(name, dateOrStatus));
});

server.get("/api/Appointments/getAppointments/:name", (req, res) => {
  const name = req.params.name;
  const status = req.query.status;

  res.status(200).send(model.getAppointments(name, status));
});

module.exports = { model, server };
