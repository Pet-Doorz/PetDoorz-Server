const request = require('supertest')
const { encrypt } = require('../helpers/password')
const midtransClient = require("midtrans-client")
const getChatHistory = require('../helpers/thirdPartyRequest')
const authenticationCustomer = require('../middlewares/authenticationCustomer')
const app = require('../app')
const { jwtSign } = require('../helpers/jwt')
const { Customer, Booking, Review, sequelize } = require('../models')

beforeAll(async () => {
    await sequelize.queryInterface.bulkInsert('Customers', [{
        email: 'test@mail.com',
        password: encrypt('qwerty'),
        fullName: 'Test Silalahi',
        phoneNumber: '08972828282',
        createdAt: new Date(),
        updatedAt: new Date()
    }]);
})


afterAll(async () => {
    await sequelize.queryInterface.bulkDelete('Customers', null, {
        truncate: true, restartIdentity: true, cascade: true
    });
})

describe('POST /customers', () => {
    test('Register success!', async () => {
        const bodyReq = {
            email: 'register@mail.com',
            password: 'register',
            fullName: 'register test',
            phoneNumber: '08080808'
        }

        const response = await request(app).post('/customers').send(bodyReq)
        expect(response.status).toBe(201)
        expect(response.body).toHaveProperty('status', 'Created')
        expect(response.body).toHaveProperty('message', 'New Customer has been added')
    })

    test('Register fail, no email', async () => {
        const bodyReq = {
            password: 'register',
            fullName: 'register test',
            phoneNumber: ' 08080808'
        }
    
        const response  = await request(app).post('/customers').send(bodyReq)
        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('message', 'Email is required')
    })

    test('Register fail, no password', async () => {
        const bodyReq = {
            email: 'register@mail.com',
            fullName: 'register test',
            phoneNumber: ' 08080808'
        }
    
        const response  = await request(app).post('/customers').send(bodyReq)
        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('message', 'Password is required')
    })

    test('Register fail, no fullName', async () => {
        const bodyReq = {
            email: 'register@mail.com',
            password: 'register',
            phoneNumber: ' 08080808'
        }
    
        const response  = await request(app).post('/customers').send(bodyReq)
        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('message', 'Full name is required')
    })

    test('Register fail, no phoneNumber', async () => {
        const bodyReq = {
            email: 'register@mail.com',
            password: 'register',
            fullName: 'register name'
        }
    
        const response  = await request(app).post('/customers').send(bodyReq)
        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('message', 'Phone number is required')
    })

    test('Register fail, empty string email', async () => {
        const bodyReq = {
            email: '',
            password: 'register',
            fullName: 'register name',
            phoneNumber: '080808'
        }
    
        const response  = await request(app).post('/customers').send(bodyReq)
        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('message', 'Email is required')
    })

    test('Register fail, empty string password', async () => {
        const bodyReq = {
            email: 'register@mail.com',
            password: '',
            fullName: 'register name',
            phoneNumber: '080808'
        }
    
        const response  = await request(app).post('/customers').send(bodyReq)
        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('message', 'Password is required')
    })

    test('Register fail, empty string fullName', async () => {
        const bodyReq = {
            email: 'register@mail.com',
            password: 'register',
            fullName: '',
            phoneNumber: '080808'
        }
    
        const response  = await request(app).post('/customers').send(bodyReq)
        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('message', 'Full name is required')
    })

    test('Register fail, empty string phoneNumber', async () => {
        const bodyReq = {
            email: 'register@mail.com',
            password: 'register',
            fullName: 'register',
            phoneNumber: ''
        }
    
        const response  = await request(app).post('/customers').send(bodyReq)
        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('message', 'Phone number is required')
    })
})