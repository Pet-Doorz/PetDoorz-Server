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

    test('Register fail, invalid email format', async () => {
        const bodyReq = {
            email: 'register',
            password: 'register',
            fullName: 'register',
            phoneNumber: '080808'
        }
    
        const response  = await request(app).post('/customers').send(bodyReq)
        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('message', 'Invalid email format')
    })

    test('Register fail, email already used', async () => {
        const bodyReq = {
            email: 'user1@mail.com',
            password: 'register',
            fullName: 'register',
            phoneNumber: '080808'
        }

        await Customer.create(bodyReq)
    
        const response  = await request(app).post('/customers').send(bodyReq)
        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('message', 'Email must be unique')
    })
})

describe('ENDPOINT /customers/login', () => {
    test('Login success!', async () => {
        const bodyReq = {
            email: 'register@mail.com',
            password: 'register'
        }

        const response = await request(app).post('/customers/login').send(bodyReq)
        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('access_token', expect.any(String))
    })

    test('Login fail, no email', async () => {
        const bodyReq = {
            password: 'register'
        }

        const response = await request(app).post('/customers/login').send(bodyReq)
        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('message', 'Email is required')
    })

    test('Login fail, no password', async () => {
        const bodyReq = {
            email: 'register@mail.com'
        }

        const response = await request(app).post('/customers/login').send(bodyReq)
        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('message', 'Password is required')
    })

    test('Login fail, email is empty string', async () => {
        const bodyReq = {
            email: '',
            password: 'register'
        }

        const response = await request(app).post('/customers/login').send(bodyReq)
        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('message', 'Email is required')
    })

    test('Login fail, password is empty string', async () => {
        const bodyReq = {
            email: 'register@mail.com',
            password: ''
        }

        const response = await request(app).post('/customers/login').send(bodyReq)
        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('message', 'Password is required')
    })

    test('Login fail, invalid email', async () => {
        const bodyReq = {
            email: 'register1@mail.com',
            password: 'register'
        }

        const response = await request(app).post('/customers/login').send(bodyReq)
        expect(response.status).toBe(401)
        expect(response.body).toHaveProperty('message', 'Invalid email/password')
    })

    test('Login fail, invalid password', async () => {
        const bodyReq = {
            email: 'register1@mail.com',
            password: 'registertest'
        }

        const response = await request(app).post('/customers/login').send(bodyReq)
        expect(response.status).toBe(401)
        expect(response.body).toHaveProperty('message', 'Invalid email/password')
    })
})