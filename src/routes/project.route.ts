const RouterProject = require('express').Router()
const UserControllerProject = require('../controllers/user.controller')

RouterProject.get('/member', UserControllerProject.getProjectMember)

RouterProject.post('/member', UserControllerProject.addProjectMember)

RouterProject.delete('/member', UserControllerProject.deleteProjectMember)

RouterProject.post('/comment', UserControllerProject.createProjectComment)

RouterProject.get('/ticket', UserControllerProject.getProjectTickets)

RouterProject.get('/', UserControllerProject.getUserProjects)

RouterProject.post('/', UserControllerProject.createProject)

RouterProject.put('/', UserControllerProject.alterProject)

RouterProject.delete('/', UserControllerProject.deleteProject)

module.exports = RouterProject
