const request = require('supertest')
const { encrypt } = require('../helpers/password')
const app = require('../app')
const { Customer, sequelize } = require('../models')
let access_token;
let false_access_token = 'masHardimdanMasPatra'

beforeAll(async () => {
    await sequelize.queryInterface.bulkInsert('Customers', [{
        email: 'test@mail.com',
        password: encrypt('qwerty'),
        fullName: 'Test Silalahi',
        phoneNumber: '08972828282',
        createdAt: new Date(),
        updatedAt: new Date()
    }]);

    const response = await request(app).post('/customers/login').send({email: 'test@mail.com', password: 'qwerty'})
    access_token = response.body.access_token
})


afterAll(async () => {
    await sequelize.queryInterface.bulkDelete('Customers', null, {
        truncate: true, restartIdentity: true, cascade: true
    });
})


describe('ENDPOINT /customers', () => {

    describe('POST /', () => {
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
    
    describe('POST /login', () => {
        test('Login success!', async () => {
            const bodyReq = {
                email: 'test@mail.com',
                password: 'qwerty'
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

    describe('GET /', () => {
        test('Fetch customer detail success!', async () => {
            const response = await request(app).get('/customers').set({access_token})
            expect(response.status).toBe(200)
            expect(response.body).toHaveProperty('id', expect.any(Number))
            expect(response.body).toHaveProperty('email', expect.any(String)) 
            expect(response.body).toHaveProperty('fullName', expect.any(String)) 
            expect(response.body).toHaveProperty('phoneNumber', expect.any(String)) 
            expect(response.body).toHaveProperty('balance', expect.any(Number)) 
            expect(response.body).toHaveProperty('Bookings', expect.any(Array)) 
            expect(response.body).toHaveProperty('Reviews', expect.any(Array)) 
        })

        test('Fail fetch customer, wrong access_token', async () => {
            const response = await request(app).get('/customers').set({false_access_token})
            expect(response.status).toBe(401)
            expect(response.body).toHaveProperty('message', 'Invalid token')
        })

        test('Fail fetch customer, no access_token || no customer', async () => {
            const response = await request(app).get('/customers')
            expect(response.status).toBe(401)
            expect(response.body).toHaveProperty('message', 'Invalid token')
        })
    })

    describe('PUT /', () => {
        test('Edit customer data success!', async () => {
            const bodyReq = {
                fullName: 'Test Situmorang',
                password: 'qwerty',
                phoneNumber: '08123456'
            }

            const response = await request(app).put('/customers').send(bodyReq).set({access_token})
            expect(response.status).toBe(200)
            expect(response.body).toHaveProperty('message', expect.any(String))
        })

        test('Fail edit customer data, wrong access_token', async () => {
            const bodyReq = {
                fullName: 'Test Situmorang',
                password: 'qwerty',
                phoneNumber: '08123456'
            }

            const response = await request(app).put('/customers').send(bodyReq).set({false_access_token})
            expect(response.status).toBe(401)
            expect(response.body).toHaveProperty('message', 'Invalid token')
        })

        test('Fail edit customer data, no access_token || no customer', async () => {
            const bodyReq = {
                fullName: 'Test Situmorang',
                password: 'qwerty',
                phoneNumber: '08123456'
            }

            const response = await request(app).put('/customers').send(bodyReq)
            expect(response.status).toBe(401)
            expect(response.body).toHaveProperty('message', 'Invalid token')
        })
    })

    describe('GET /chats/:userId', () => {
        test('Fetch chat histories success!', async () => {
            const response = await request(app).get('/customers/chats/1').set({access_token})
            expect(response.status).toBe(200)
            expect(response.body).toHaveProperty('data', expect.any(Array))
        })

        test('Fail fetch chat histories, invalid access_token', async () => {
            const response = await request(app).get('/customers/chats/1').set({false_access_token})
            expect(response.status).toBe(401)
            expect(response.body).toHaveProperty('message', 'Invalid token')
        })

        test('Fail fetch chat histories, no access_token', async () => {
            const response = await request(app).get('/customers/chats/1')
            expect(response.status).toBe(401)
            expect(response.body).toHaveProperty('message', 'Invalid token')
        })
    })

    describe('POST /generate-midtrans-token', () => {
        test('Payment Midtrans success!', async () => {
            const bodyReq = {
                total: 20000
            }

            const response = await request(app).post('/customers/generate-midtrans-token').send(bodyReq).set({access_token})
            expect(response.status).toBe(201)
            expect(response.body).toHaveProperty('token', expect.any(String))
            expect(response.body).toHaveProperty('redirect_url', expect.any(String))
        })

        test('Payment fail, invalid token', async () => {
            const bodyReq = {
                total: 20000
            }

            const response = await request(app).post('/customers/generate-midtrans-token').send(bodyReq).set({false_access_token})
            expect(response.status).toBe(401)
            expect(response.body).toHaveProperty('message', 'Invalid token')
        })

        test('Payment fail, no token || no customer', async () => {
            const bodyReq = {
                total: 20000
            }

            const response = await request(app).post('/customers/generate-midtrans-token').send(bodyReq)
            expect(response.status).toBe(401)
            expect(response.body).toHaveProperty('message', 'Invalid token')
        })
    })

    describe('GET /imageKit', () => {
        test('Success get imageKit!', async () => {
            const response = await request(app).get('/customers/imageKit')
            expect(response.status).toBe(200)
        })
    })

    describe('GET /:id', () => {
        test('Success get customer data by id!', async () => {
            const response = await request(app).get('/customers/1')
            expect(response.status).toBe(200)
            expect(response.body).toHaveProperty('id', expect.any(Number))
            expect(response.body).toHaveProperty('email', expect.any(String)) 
            expect(response.body).toHaveProperty('fullName', expect.any(String)) 
            expect(response.body).toHaveProperty('phoneNumber', expect.any(String)) 
            expect(response.body).toHaveProperty('balance', expect.any(Number)) 
            expect(response.body).toHaveProperty('Bookings', expect.any(Array)) 
            expect(response.body).toHaveProperty('Reviews', expect.any(Array))
        })
    })

    describe('PUT /:id', () => {
        test('Success edit customer data by id!', async () => {
            const bodyReq = {
                fullName: 'Test Situmorang',
                password: 'qwerty',
                phoneNumber: '08123456'
            }

            const response = await request(app).put('/customers/1').send(bodyReq)
            expect(response.status).toBe(200)
            expect(response.body).toHaveProperty('message', expect.any(String))
        })
    })
})