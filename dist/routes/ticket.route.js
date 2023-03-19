"use strict";
const RouterTicket = require('express').Router();
const UserControllerTicket = require('../controllers/user.controller');
const uploadFile = require('../middleware/uploadFile');
RouterTicket.get('/personel', UserControllerTicket.getUserTickets);
RouterTicket.get('/project', UserControllerTicket.getProjectTickets);
RouterTicket.get('/attachment', UserControllerTicket.getTicketAttachment);
RouterTicket.post('/attachment', uploadFile.single('file'), UserControllerTicket.uploadTicketAttachment);
RouterTicket.post('/comment', UserControllerTicket.createTicketComment);
//get single ticket infomation
RouterTicket.get('/', UserControllerTicket.getTicket);
RouterTicket.post('/', UserControllerTicket.createTicket);
RouterTicket.put('/', UserControllerTicket.alterTicket);
RouterTicket.delete('/', UserControllerTicket.deleteTicket);
module.exports = RouterTicket;
